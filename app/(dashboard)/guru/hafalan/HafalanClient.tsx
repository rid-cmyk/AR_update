"use client";

import { useEffect, useState } from "react";
import { useHafalanGuru } from "@/hooks";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  Space,
  Tag,
  message,
  Card,
  Row,
  Col,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  BookOutlined,
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import HafalanSummaryCards from "@/components/guru/hafalan/HafalanSummaryCards";
import HafalanStatisticsCards from "@/components/guru/hafalan/HafalanStatisticsCards";
import HafalanFiltersCard from "@/components/guru/hafalan/HafalanFiltersCard";
import dayjs from "dayjs";
import WebSideDrawer from "@/components/ui/WebSideDrawer";
import { useQuranSuratList } from "@/hooks/useQuranSuratList";
import { useTablePagination } from "@/hooks/useTablePagination";

const { Option } = Select;

interface Santri {
  id: number;
  namaLengkap: string;
  username: string;
}

interface Hafalan {
  id: number;
  santriId?: number | string;
  santri: Santri;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: "ziyadah" | "murojaah";
  tanggal: string;
}

interface HafalanClientProps {
  initialHafalanList: Hafalan[];
  initialSantriList: Santri[];
}

export default function HafalanClient({
  initialHafalanList,
  initialSantriList,
}: HafalanClientProps) {
  const {
    hafalanList, santriList, loading,
    isModalOpen, editingHafalan, filters, setFilters,
    fetchHafalan, saveHafalan, deleteHafalan,
    openModal, closeModal,
  } = useHafalanGuru({ initialHafalanList, initialSantriList });

  const [hasMounted, setHasMounted] = useState(false);
  const selectedDate = dayjs();
  const [form] = Form.useForm();
  const { suratList } = useQuranSuratList();
  const pagination = useTablePagination({ totalLabel: "hafalan" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Auto-fetch on filter change with debounce
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetchHafalan();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filters, isInitialLoad, fetchHafalan]);

  const handleSaveHafalan = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        santriId: values.santriId,
        surat: values.surat,
        ayatMulai: values.ayatMulai,
        ayatSelesai: values.ayatSelesai,
        status: values.jenis,
        tanggal: selectedDate.format('YYYY-MM-DD'),
        keterangan: values.keterangan || null
      };
      await saveHafalan(payload);
      form.resetFields();
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleOpenModal = (hafalan?: Hafalan) => {
    setHasMounted(true);
    if (hafalan) {
      form.setFieldsValue(hafalan);
    } else {
      form.resetFields();
    }
    openModal(hafalan);
  };

  const handleCloseModal = () => {
    closeModal();
    form.resetFields();
  };
  // Group hafalan by santri untuk summary
  const getHafalanSummaryBySantri = () => {
    const summary: Record<number, {
      santri: Santri;
      totalHafalan: number;
      ziyadahCount: number;
      murojaahCount: number;
      lastHafalan: Hafalan;
      hafalanList: Hafalan[];
    }> = {};

    hafalanList.forEach(hafalan => {
      // Check if santri data exists
      if (!hafalan.santri || !hafalan.santri.id) {
        return;
      }

      const santriId = hafalan.santri.id;
      if (!summary[santriId]) {
        summary[santriId] = {
          santri: hafalan.santri,
          totalHafalan: 0,
          ziyadahCount: 0,
          murojaahCount: 0,
          lastHafalan: hafalan,
          hafalanList: []
        };
      }
      
      summary[santriId].totalHafalan++;
      summary[santriId].hafalanList.push(hafalan);
      
      if (hafalan.status === 'ziyadah') {
        summary[santriId].ziyadahCount++;
      } else {
        summary[santriId].murojaahCount++;
      }
      
      // Update last hafalan if this one is more recent
      if (new Date(hafalan.tanggal) > new Date(summary[santriId].lastHafalan.tanggal)) {
        summary[santriId].lastHafalan = hafalan;
      }
    });

    return Object.values(summary);
  };

  const columns = [
    {
      title: "Nama Santri",
      key: "santri",
      render: (record: Hafalan) => {
        // Handle missing santri data
        if (!record.santri || !record.santri.namaLengkap) {
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                ?
              </div>
              <div>
                <div className="font-semibold text-gray-800">Data Santri Tidak Ditemukan</div>
                <div className="text-sm text-red-500">ID: {record.santriId || 'Unknown'}</div>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {record.santri.namaLengkap[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{record.santri.namaLengkap}</div>
              <div className="text-sm text-gray-500">@{record.santri.username || 'No username'}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Surat & Ayat",
      key: "surat",
      render: (record: Hafalan) => (
        <div>
          <div className="font-medium text-gray-800">{record.surat}</div>
          <div className="text-sm text-gray-500">Ayat {record.ayatMulai}–{record.ayatSelesai}</div>
        </div>
      ),
    },
    {
      title: "Jenis Hafalan",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag 
          color={status === 'ziyadah' ? 'green' : 'blue'}
          className="px-3 py-1 rounded-full font-medium"
        >
          {status === 'ziyadah' ? '📚 Ziyadah' : '🔄 Murojaah'}
        </Tag>
      ),
    },
    {
      title: "Tanggal Input",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (tanggal: string) => (
        <div className="text-sm">
          <div className="font-medium">{dayjs(tanggal).format('DD MMM YYYY')}</div>
          <div className="text-gray-500">{dayjs(tanggal).format('HH:mm')}</div>
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      render: (record: Hafalan) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined className="text-emerald-500" />}
            onClick={() => handleOpenModal(record)}
            className="text-blue-600 hover:bg-blue-50"
          />
          <Popconfirm
            title="Hapus data hafalan?"
            onConfirm={() => deleteHafalan(record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderContent = () => {
    if (!hasMounted) return null;
    return (
      <Form form={form} layout="vertical">
        <Form.Item
          label="Santri"
          name="santriId"
          rules={[{ required: true, message: "Pilih santri" }]}
        >
          <Select placeholder="Pilih Santri dari halaqah Anda">
            {santriList.map((santri) => (
              <Option key={santri.id} value={santri.id}>
                {santri.namaLengkap}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Surat"
          name="surat"
          rules={[{ required: true, message: "Pilih surat" }]}
        >
          <Select
            placeholder="Pilih Surat"
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {suratList.map((surat) => (
              <Option key={surat.nomor} value={surat.namaLatin}>
                {surat.nomor}. {surat.namaLatin} ({surat.jumlahAyat} ayat)
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Space>
          <Form.Item
            label="Ayat Mulai"
            name="ayatMulai"
            rules={[{ required: true, message: "Masukkan ayat mulai" }]}
          >
            <Input type="number" placeholder="Mulai" />
          </Form.Item>
          <Form.Item
            label="Ayat Selesai"
            name="ayatSelesai"
            rules={[{ required: true, message: "Masukkan ayat selesai" }]}
          >
            <Input type="number" placeholder="Selesai" />
          </Form.Item>
        </Space>
        <Form.Item
          label="Nilai"
          name="nilai"
          rules={[{ required: true, message: "Masukkan nilai" }]}
        >
          <Select placeholder="Pilih Nilai">
            <Option value="Mumtaz">Mumtaz</Option>
            <Option value="Jayyid Jiddan">Jayyid Jiddan</Option>
            <Option value="Jayyid">Jayyid</Option>
            <Option value="Maqbul">Maqbul</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Pilih status" }]}
        >
          <Select placeholder="Pilih Status">
            <Option value="ziyadah">Ziyadah</Option>
            <Option value="murojaah">Murojaah</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Keterangan (Opsional)"
          name="keterangan"
        >
          <Input.TextArea 
            placeholder="Catatan tambahan tentang hafalan ini..."
            rows={3}
          />
        </Form.Item>
      </Form>
    );
  };

  return (
    <>
      <style jsx>{`
        .custom-table .ant-table-thead > tr > th {
          background: #023047;
          color: white;
          font-weight: 600;
          border: none;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f0f9ff !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #e5e7eb;
          padding: 16px;
        }
      `}</style>
      <div style={{ padding: "24px 0" }}>
        {/* Header */}
        <AdminHeaderCard
          title="Data Hafalan Santri"
          subtitle="Kelola dan pantau progress hafalan santri di halaqah Anda"
          actions={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => handleOpenModal()}
              className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-md"
            >
              Setoran Baru
            </Button>
          }
        />

        {/* Statistics Cards */}
        <HafalanStatisticsCards hafalanList={hafalanList as any} />

        {/* Enhanced Filters */}
        <HafalanFiltersCard filters={filters} setFilters={setFilters} />

        {/* Summary Cards per Santri */}
        <HafalanSummaryCards
          summaries={getHafalanSummaryBySantri()}
        />
        {/* Table */}
        <Card title="📋 Detail Hafalan" className="shadow-md">
          <Table
            columns={columns}
            dataSource={hafalanList}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            className="custom-table"
          />
        </Card>

        {/* Mobile Modal (< 1024px) */}
        <Modal
          title={editingHafalan ? "Edit Hafalan" : "Tambah Hafalan"}
          open={isModalOpen}
          onCancel={handleCloseModal}
          onOk={handleSaveHafalan}
          okText="Simpan"
          className="lg:hidden"
        >
          {renderContent()}
        </Modal>

        {/* Desktop WebSideDrawer (>= 1024px) */}
        <WebSideDrawer
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingHafalan ? "Edit Penilaian Hafalan" : "Catat Setoran Hafalan Baru"}
          subtitle="Catat surat, rentang ayat, kualitas hafalan (Mumtaz/Jayyid/dll), dan catatan perbaikan"
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={handleCloseModal}>Batal</Button>
              <Button type="primary" onClick={handleSaveHafalan}>Simpan</Button>
            </div>
          }
        >
          {renderContent()}
        </WebSideDrawer>
      </div>
    </>
  );
}
