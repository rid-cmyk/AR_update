"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  Space,
  Tag,
  FloatButton,
  message,
  Typography,
  Card,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  BookOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

const { Option } = Select;

interface Halaqah {
  id: number;
  namaHalaqah: string;
  jumlahSantri: number;
  santri: Array<{
    id: number;
    namaLengkap: string;
    username: string;
  }>;
}

interface Santri {
  id: number;
  namaLengkap: string;
  username: string;
}

interface Hafalan {
  id: number;
  santri: Santri;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: "ziyadah" | "murojaah";
  tanggal: string;
}

export default function DataHafalanPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [hafalanList, setHafalanList] = useState<Hafalan[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHafalan, setEditingHafalan] = useState<Hafalan | null>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [filters, setFilters] = useState({
    santriName: '',
    surat: '',
    status: ''
  });

  const [form] = Form.useForm();

  const [suratList, setSuratList] = useState<Array<{nomor: number, nama: string, namaLatin: string, jumlahAyat: number}>>([]);

  // Fetch halaqah milik guru dari dashboard API guru
  const fetchHalaqah = async () => {
    try {
      const res = await fetch("/api/guru/dashboard");
      if (res.ok) {
        const data = await res.json();
        setHalaqahList(data.halaqah || []);
        // Combine all santri from all halaqah
        const allSantri: Santri[] = [];
        (data.halaqah || []).forEach((halaqah: Halaqah) => {
          if (halaqah.santri) {
            halaqah.santri.forEach(santri => {
              if (!allSantri.find(s => s.id === santri.id)) {
                allSantri.push(santri);
              }
            });
          }
        });
        setSantriList(allSantri);
      }
    } catch (error) {
      console.error("Error fetching halaqah:", error);
    }
  };

  // Fetch hafalan dengan filtering
  const fetchHafalan = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.santriName) params.append('santriName', filters.santriName);
      if (filters.surat) params.append('surat', filters.surat);
      if (filters.status) params.append('status', filters.status);
      
      const res = await fetch(`/api/guru/hafalan?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHafalanList(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching hafalan:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get santri list for modal form - all santri taught by guru
  const getModalSantriList = () => {
    return santriList;
  };

  // Fetch surat list from Quran API
  const fetchSuratList = async () => {
    try {
      const response = await fetch('/api/quran');
      if (response.ok) {
        const data = await response.json();
        if (data.code === 200 && data.data) {
          setSuratList(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching surat list:', error);
    }
  };

  useEffect(() => {
    fetchHalaqah();
    fetchSuratList();
  }, []);

  useEffect(() => {
    fetchHafalan();
  }, [filters]);

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

      const url = editingHafalan ? `/api/guru/hafalan/${editingHafalan.id}` : "/api/guru/hafalan";
      const method = editingHafalan ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        message.success(data.message || (editingHafalan ? "Hafalan berhasil diperbarui" : "Hafalan berhasil ditambahkan"));
        setIsModalOpen(false);
        form.resetFields();
        fetchHafalan();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || "Gagal menyimpan hafalan");
      }
    } catch (error) {
      console.error("Error saving hafalan:", error);
      message.error("Terjadi kesalahan saat menyimpan hafalan");
    }
  };

  const handleDeleteHafalan = async (id: number) => {
    try {
      const res = await fetch(`/api/guru/hafalan/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        message.success(data.message || "Hafalan berhasil dihapus");
        fetchHafalan();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || "Gagal menghapus hafalan");
      }
    } catch (error) {
      console.error("Error deleting hafalan:", error);
      message.error("Terjadi kesalahan saat menghapus hafalan");
    }
  };

  const openModal = (hafalan?: Hafalan) => {
    if (hafalan) {
      setEditingHafalan(hafalan);
      form.setFieldsValue(hafalan);
    } else {
      setEditingHafalan(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "Santri",
      dataIndex: ["santri", "namaLengkap"],
      key: "santri",
    },
    {
      title: "Surat",
      dataIndex: "surat",
      key: "surat",
    },
    {
      title: "Ayat (Mulai–Selesai)",
      key: "ayat",
      render: (record: Hafalan) => `${record.ayatMulai}–${record.ayatSelesai}`,
    },
    {
      title: "Jenis",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === 'ziyadah' ? 'green' : 'blue'}>
          {status === 'ziyadah' ? 'Ziyadah' : 'Murojaah'}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Aksi",
      key: "actions",
      render: (record: Hafalan) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteHafalan(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Data Hafalan</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Tambah Hafalan
          </Button>
        </div>

        {/* Enhanced Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Cari nama santri..."
                prefix={<UserOutlined />}
                value={filters.santriName}
                onChange={(e) => setFilters(prev => ({ ...prev, santriName: e.target.value }))}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <Input
                placeholder="Cari surat..."
                prefix={<BookOutlined />}
                value={filters.surat}
                onChange={(e) => setFilters(prev => ({ ...prev, surat: e.target.value }))}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="Filter status"
                style={{ width: '100%' }}
                value={filters.status || undefined}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
                allowClear
              >
                <Option value="ziyadah">Ziyadah</Option>
                <Option value="murojaah">Murojaah</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={hafalanList}
          rowKey="id"
          loading={loading}
        />

        {/* Modal */}
        <Modal
          title={editingHafalan ? "Edit Hafalan" : "Tambah Hafalan"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSaveHafalan}
          okText="Simpan"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Santri"
              name="santriId"
              rules={[{ required: true, message: "Pilih santri" }]}
            >
              <Select placeholder="Pilih Santri dari halaqah Anda">
                {getModalSantriList().map((santri) => (
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
                <Input type="number" min={1} />
              </Form.Item>
              <Form.Item
                label="Ayat Selesai"
                name="ayatSelesai"
                rules={[{ required: true, message: "Masukkan ayat selesai" }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Space>
            <Form.Item
              label="Status Hafalan"
              name="jenis"
              rules={[{ required: true, message: "Pilih status hafalan" }]}
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
        </Modal>


      </div>
    </LayoutApp>
  );
}