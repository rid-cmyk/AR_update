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
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Judul",
      dataIndex: "judul",
      key: "judul",
      render: (text: string, record: Pengumuman) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {record.isi.length > 100 ? `${record.isi.substring(0, 100)}...` : record.isi}
          </div>
        </div>
      ),
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (tanggal: string) => dayjs(tanggal).format("DD/MM/YYYY"),
    },
    {
      title: "Target Audience",
      dataIndex: "targetAudience",
      key: "targetAudience",
      render: (target: string) => {
        const option = audienceOptions.find(opt => opt.value === target);
        return (
          <div style={{ 
            padding: '4px 8px', 
            borderRadius: '6px', 
            backgroundColor: option?.color + '15',
            border: `1px solid ${option?.color}30`,
            color: option?.color,
            fontWeight: 'bold',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            {option?.label || target}
          </div>
        );
      },
    },
    {
      title: "Dibuat Oleh",
      dataIndex: "creator",
      key: "creator",
      render: (creator: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{creator?.namaLengkap || "Unknown"}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{creator?.role?.name || ""}</div>
        </div>
      ),
    },
    {
      title: "Status Baca",
      dataIndex: "readCount",
      key: "readCount",
      render: (readCount: number, record: Pengumuman) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{readCount || 0}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>pembaca</div>
          {(record as any).readDetails && (record as any).readDetails.length > 0 && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                Modal.info({
                  title: `Detail Pembaca - ${record.judul}`,
                  width: 600,
                  content: (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {(record as any).readDetails.map((reader: any, index: number) => (
                        <div key={index} style={{ 
                          padding: '8px 12px', 
                          margin: '4px 0',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{reader.userName}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {reader.userRole}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {dayjs(reader.readAt).format("DD/MM/YYYY HH:mm")}
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                });
              }}
            >
              Lihat Detail
            </Button>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: Pengumuman) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this announcement?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ 
        padding: "32px", 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          marginBottom: '32px'
        }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            📢 Manajemen Pengumuman
          </h1>
          <p style={{ 
            margin: 0, 
            color: "#4a5568", 
            fontSize: '18px',
            fontWeight: '500'
          }}>
            Buat dan kelola pengumuman untuk berbagai grup pengguna
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} md={8}>
            <Card style={{
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                <NotificationOutlined style={{ fontSize: '32px', color: 'white', marginRight: 16 }} />
                <div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Total Pengumuman</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>
                    {pengumuman.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card style={{
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                <UserOutlined style={{ fontSize: '32px', color: 'white', marginRight: 16 }} />
                <div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Bulan Ini</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>
                    {Array.isArray(pengumuman) ? pengumuman.filter(p => dayjs(p.tanggal).isAfter(dayjs().startOf('month'))).length : 0}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card style={{
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              boxShadow: '0 10px 30px rgba(250, 112, 154, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                <CalendarOutlined style={{ fontSize: '32px', color: 'white', marginRight: 16 }} />
                <div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>Minggu Ini</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>
                    {Array.isArray(pengumuman) ? pengumuman.filter(p => dayjs(p.tanggal).isAfter(dayjs().startOf('week'))).length : 0}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card
          title={
            <span style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1a202c',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Daftar Pengumuman
            </span>
          }
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => openModal()}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                height: '40px',
                padding: '0 20px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)'
              }}
            >
              Tambah Pengumuman
            </Button>
          }
          style={{
            borderRadius: '16px',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Table
            dataSource={Array.isArray(pengumuman) ? pengumuman : []}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="middle"
            scroll={{ x: 800 }}
            style={{
              background: 'transparent'
            }}
          />
        </Card>

        {/* Modal */}
        <Modal
          title={
            <Space>
              <NotificationOutlined />
              {editingPengumuman ? "Edit Announcement" : "Add New Announcement"}
            </Space>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSave}
          okText="Save"
          width={700}
        >
          <Form form={form} layout="vertical" size="large">
            <Form.Item
              label="Judul Pengumuman"
              name="judul"
              rules={[{ required: true, message: "Please enter announcement title" }]}
            >
              <Input placeholder="Enter announcement title" />
            </Form.Item>
            <Form.Item
              label="Isi Pengumuman"
              name="isi"
              rules={[{ required: true, message: "Please enter announcement content" }]}
            >
              <Input.TextArea
                placeholder="Enter announcement content"
                rows={6}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>🎯 Target Audience</span>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        Pilih siapa yang akan menerima pengumuman ini
                      </div>
                    </div>
                  }
                  name="targetAudience"
                  rules={[{ required: true, message: "Silakan pilih target audience" }]}
                >
                  <Select 
                    placeholder="Pilih target audience untuk pengumuman"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    {audienceOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        <div style={{ padding: '8px 0' }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: option.color,
                            marginBottom: '4px'
                          }}>
                            {option.label}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            lineHeight: '1.4'
                          }}>
                            {option.description}
                          </div>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <div>
                      <span style={{ fontWeight: 'bold' }}>📅 Tanggal Kadaluarsa</span>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Opsional - Pengumuman akan hilang setelah tanggal ini
                      </div>
                    </div>
                  }
                  name="tanggalKadaluarsa"
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Pilih tanggal kadaluarsa"
                    style={{ width: '100%' }}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '8px',
                  marginTop: '32px'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#52c41a', marginBottom: '8px' }}>
                    💡 Tips Pengumuman Efektif:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#666' }}>
                    <li>Gunakan judul yang jelas dan menarik</li>
                    <li>Pilih target audience yang tepat</li>
                    <li>Tulis isi yang singkat dan informatif</li>
                    <li>Set tanggal kadaluarsa jika diperlukan</li>
                  </ul>
                </div>
              </Col>
            </Row>
            </Row>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}