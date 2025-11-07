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
  Divider,
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
        console.warn('Hafalan without santri data:', hafalan);
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
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            className="text-blue-600 hover:bg-blue-50"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteHafalan(record.id)}
            className="text-red-600 hover:bg-red-50"
          />
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <style jsx>{`
        .custom-table .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">📖 Data Hafalan Santri</h1>
              <p className="text-blue-100 text-lg">Kelola dan pantau progress hafalan santri di halaqah Anda</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openModal()}
              size="large"
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white shadow-lg"
            >
              Tambah Hafalan
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-blue-600 mb-2">{hafalanList.length}</div>
              <div className="text-gray-600">Total Hafalan</div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {hafalanList.filter(h => h.status === 'ziyadah').length}
              </div>
              <div className="text-gray-600">Ziyadah</div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {hafalanList.filter(h => h.status === 'murojaah').length}
              </div>
              <div className="text-gray-600">Murojaah</div>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {new Set(hafalanList.filter(h => h.santri && h.santri.id).map(h => h.santri.id)).size}
              </div>
              <div className="text-gray-600">Santri Aktif</div>
            </Card>
          </Col>
        </Row>

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

        {/* Summary Cards per Santri */}
        {hafalanList.length > 0 && (
          <Card title="📊 Ringkasan Hafalan per Santri" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              {getHafalanSummaryBySantri().map((summary) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={summary.santri.id}>
                  <Card 
                    size="small" 
                    className="border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl font-bold text-white">
                          {summary.santri.namaLengkap[0]}
                        </span>
                      </div>
                      <div className="font-bold text-lg mb-2">{summary.santri.namaLengkap}</div>
                      <div className="text-sm opacity-90 mb-3">@{summary.santri.username}</div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-white/20 rounded-lg p-2">
                          <div className="text-xl font-bold">{summary.totalHafalan}</div>
                          <div className="text-xs opacity-90">Total</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <div className="text-xl font-bold">{summary.ziyadahCount}</div>
                          <div className="text-xs opacity-90">Ziyadah</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <div className="text-xl font-bold">{summary.murojaahCount}</div>
                          <div className="text-xs opacity-90">Murojaah</div>
                        </div>
                      </div>
                      
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-xs opacity-90 mb-1">Hafalan Terakhir:</div>
                        <div className="font-medium text-sm">
                          {summary.lastHafalan.surat} ({summary.lastHafalan.ayatMulai}-{summary.lastHafalan.ayatSelesai})
                        </div>
                        <div className="text-xs opacity-75">
                          {dayjs(summary.lastHafalan.tanggal).format('DD MMM YYYY')}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Table */}
        <Card title="📋 Detail Hafalan" className="shadow-md">
          <Table
            columns={columns}
            dataSource={hafalanList}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} hafalan`,
            }}
            className="custom-table"
          />
        </Card>

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