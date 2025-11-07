"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Table,
  Select,
  DatePicker,
  Divider,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  NotificationOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  tanggalKadaluarsa?: string;
  targetAudience: string;
  creator: {
    id: number;
    namaLengkap: string;
    role: {
      name: string;
    };
  };
  isRead?: boolean;
  readCount?: number;
  readDetails?: {
    userId: number;
    userName: string;
    userRole: string;
    readAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminPengumumanPage() {
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPengumuman, setEditingPengumuman] = useState<Pengumuman | null>(null);
  const [form] = Form.useForm();

  const audienceOptions = [
    { 
      value: "semua", 
      label: "🌐 Semua User", 
      description: "Pengumuman akan muncul di semua dashboard (Admin, Guru, Santri, Orang Tua, Yayasan)",
      color: "#1890ff"
    },
    { 
      value: "santri", 
      label: "🎓 Khusus Santri", 
      description: "Hanya muncul di dashboard santri",
      color: "#fa8c16"
    },
    { 
      value: "guru", 
      label: "👨‍🏫 Khusus Guru", 
      description: "Hanya muncul di dashboard guru",
      color: "#52c41a"
    },
    { 
      value: "ortu", 
      label: "👨‍👩‍👧‍👦 Khusus Orang Tua", 
      description: "Hanya muncul di dashboard orang tua",
      color: "#722ed1"
    },
    { 
      value: "yayasan", 
      label: "🏢 Khusus Yayasan", 
      description: "Hanya muncul di dashboard yayasan",
      color: "#fa8c16"
    },
    { 
      value: "admin", 
      label: "⚙️ Khusus Admin", 
      description: "Hanya muncul di dashboard admin",
      color: "#f5222d"
    },
  ];

  // Fetch data
  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pengumuman");
      if (!res.ok) throw new Error("Failed to fetch pengumuman");
      const data = await res.json();
      // Handle both paginated and direct array responses
      const pengumumanData = data.data || data;
      setPengumuman(Array.isArray(pengumumanData) ? pengumumanData : []);
    } catch (error: any) {
      console.error("Error fetching pengumuman:", error);
      message.error("Error fetching pengumuman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, []);

  // CRUD operations
  const openModal = (pengumuman?: Pengumuman) => {
    if (pengumuman) {
      setEditingPengumuman(pengumuman);
      form.setFieldsValue({
        judul: pengumuman.judul,
        isi: pengumuman.isi,
        targetAudience: pengumuman.targetAudience,
        tanggalKadaluarsa: pengumuman.tanggalKadaluarsa ? dayjs(pengumuman.tanggalKadaluarsa) : null,
      });
    } else {
      setEditingPengumuman(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log("Pengumuman form values:", values);

      // Prepare payload
      const payload = {
        judul: values.judul,
        isi: values.isi,
        targetAudience: values.targetAudience || 'semua',
        tanggalKadaluarsa: values.tanggalKadaluarsa ? values.tanggalKadaluarsa.toISOString() : null
      };

      const url = editingPengumuman ? `/api/pengumuman/${editingPengumuman.id}` : "/api/pengumuman";
      const method = editingPengumuman ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to save pengumuman (${res.status})`);
      }

      const data = await res.json();
      console.log("Success response:", data);

      message.success(editingPengumuman ? "Pengumuman berhasil diperbarui" : "Pengumuman berhasil ditambahkan");
      setIsModalOpen(false);
      form.resetFields();
      fetchPengumuman();
    } catch (error: any) {
      console.error("Error saving pengumuman:", error);
      message.error(error.message || "Error saving pengumuman");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      console.log("Deleting pengumuman with ID:", id);
      const res = await fetch(`/api/pengumuman/${id}`, { method: "DELETE" });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to delete pengumuman (${res.status})`);
      }

      const data = await res.json();
      console.log("Delete success response:", data);
      message.success(data.message || "Pengumuman berhasil dihapus");

      fetchPengumuman();
    } catch (error: any) {
      console.error("Error deleting pengumuman:", error);
      message.error(error.message || "Error deleting pengumuman");
    }
  };

  const columns = [
    {
      title: "Pengumuman",
      key: "pengumuman",
      render: (record: Pengumuman) => (
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            📢
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 text-lg mb-1">{record.judul}</div>
            <div className="text-sm text-gray-500 mb-2">
              {record.isi.length > 120 ? `${record.isi.substring(0, 120)}...` : record.isi}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">ID: {record.id}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{dayjs(record.tanggal).format("DD MMM YYYY")}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Target & Status",
      key: "target",
      render: (record: Pengumuman) => {
        const option = audienceOptions.find(opt => opt.value === record.targetAudience);
        return (
          <div>
            <div className="mb-2">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: option?.color + '15',
                  border: `1px solid ${option?.color}30`,
                  color: option?.color,
                }}
              >
                {option?.label || record.targetAudience}
              </span>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{record.readCount || 0}</div>
              <div className="text-xs text-gray-500">pembaca</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Pembuat",
      key: "creator",
      render: (record: Pengumuman) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {record.creator?.namaLengkap?.[0] || "?"}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{record.creator?.namaLengkap || "Unknown"}</div>
            <div className="text-sm text-gray-500">{record.creator?.role?.name || ""}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Kadaluarsa",
      key: "kadaluarsa",
      render: (record: Pengumuman) => {
        if (!record.tanggalKadaluarsa) {
          return (
            <div className="text-center">
              <div className="text-sm text-gray-500">Tidak ada</div>
              <div className="text-xs text-gray-400">batas waktu</div>
            </div>
          );
        }
        
        const isExpired = dayjs(record.tanggalKadaluarsa).isBefore(dayjs());
        const daysLeft = dayjs(record.tanggalKadaluarsa).diff(dayjs(), 'day');
        
        return (
          <div className="text-center">
            <div className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-800'}`}>
              {dayjs(record.tanggalKadaluarsa).format("DD MMM YYYY")}
            </div>
            <div className="text-xs mt-1">
              {isExpired ? (
                <span className="text-red-500">Sudah kadaluarsa</span>
              ) : daysLeft === 0 ? (
                <span className="text-orange-500">Hari ini</span>
              ) : (
                <span className="text-gray-500">{daysLeft} hari lagi</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Aksi",
      key: "actions",
      render: (record: Pengumuman) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            className="text-blue-600 hover:bg-blue-50"
          />
          <Popconfirm
            title="Yakin ingin menghapus pengumuman ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
            />
          </Popconfirm>
          {(record as any).readDetails && (record as any).readDetails.length > 0 && (
            <Button
              type="text"
              size="small"
              onClick={() => {
                Modal.info({
                  title: `Detail Pembaca - ${record.judul}`,
                  width: 600,
                  content: (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {(record as any).readDetails.map((reader: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 mb-2 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-semibold">{reader.userName}</div>
                            <div className="text-sm text-gray-500">{reader.userRole}</div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {dayjs(reader.readAt).format("DD/MM/YYYY HH:mm")}
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                });
              }}
              className="text-green-600 hover:bg-green-50"
            >
              👁️ Detail
            </Button>
          )}
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
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">📢 Manajemen Pengumuman</h1>
              <p className="text-purple-100 text-lg">Buat dan kelola pengumuman untuk berbagai grup pengguna</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openModal()}
              size="large"
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white shadow-lg"
            >
              Tambah Pengumuman
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-purple-600 mb-2">{pengumuman.length}</div>
              <div className="text-gray-600">Total Pengumuman</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Array.isArray(pengumuman) ? pengumuman.filter(p => dayjs(p.tanggal).isAfter(dayjs().startOf('month'))).length : 0}
              </div>
              <div className="text-gray-600">Bulan Ini</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {Array.isArray(pengumuman) ? pengumuman.filter(p => dayjs(p.tanggal).isAfter(dayjs().startOf('week'))).length : 0}
              </div>
              <div className="text-gray-600">Minggu Ini</div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card title="📋 Daftar Pengumuman" className="shadow-md">
          <Table
            dataSource={Array.isArray(pengumuman) ? pengumuman : []}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} pengumuman`,
            }}
            className="custom-table"
          />
        </Card>

        {/* Enhanced Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📢</span>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">
                  {editingPengumuman ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}
                </div>
                <div className="text-sm text-gray-500">
                  {editingPengumuman ? "Perbarui pengumuman yang sudah ada" : "Buat pengumuman baru untuk pengguna"}
                </div>
              </div>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSave}
          okText="💾 Simpan Pengumuman"
          cancelText="❌ Batal"
          width={800}
          className="custom-modal"
        >
          <Divider />
          <Form form={form} layout="vertical" className="space-y-4">
            <Form.Item
              label={
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  📝 Judul Pengumuman
                </span>
              }
              name="judul"
              rules={[{ required: true, message: "Masukkan judul pengumuman" }]}
            >
              <Input 
                placeholder="Contoh: Libur Hari Raya Idul Fitri"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
            
            <Form.Item
              label={
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  📄 Isi Pengumuman
                </span>
              }
              name="isi"
              rules={[{ required: true, message: "Masukkan isi pengumuman" }]}
            >
              <Input.TextArea
                placeholder="Tulis isi pengumuman yang jelas dan informatif..."
                rows={6}
                className="rounded-lg"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      🎯 Target Audience
                    </span>
                  }
                  name="targetAudience"
                  rules={[{ required: true, message: "Pilih target audience" }]}
                >
                  <Select 
                    placeholder="Pilih siapa yang akan menerima pengumuman"
                    size="large"
                    className="rounded-lg"
                  >
                    {audienceOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        <div className="py-2">
                          <div className="font-bold mb-1" style={{ color: option.color }}>
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500 leading-tight">
                            {option.description}
                          </div>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      📅 Tanggal Kadaluarsa
                    </span>
                  }
                  name="tanggalKadaluarsa"
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Pilih tanggal kadaluarsa (opsional)"
                    style={{ width: '100%' }}
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 text-lg">💡</div>
                <div>
                  <div className="font-medium text-blue-800 mb-1">Tips Pengumuman Efektif:</div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Gunakan judul yang jelas dan menarik perhatian</li>
                    <li>• Pilih target audience yang tepat sesuai konten</li>
                    <li>• Tulis isi yang singkat, padat, dan informatif</li>
                    <li>• Set tanggal kadaluarsa untuk pengumuman sementara</li>
                  </ul>
                </div>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}