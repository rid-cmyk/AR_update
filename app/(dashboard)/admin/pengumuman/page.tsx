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
  targetAudience: string;
  createdBy: number;
  creator?: {
    id: number;
    namaLengkap: string;
  };
}

export default function AdminPengumumanPage() {
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPengumuman, setEditingPengumuman] = useState<Pengumuman | null>(null);
  const [form] = Form.useForm();

  const audienceOptions = [
    { value: "semua", label: "All Users" },
    { value: "santri", label: "Santri Only" },
    { value: "guru", label: "Guru Only" },
    { value: "ortu", label: "Orang Tua Only" },
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
        ...pengumuman,
        tanggal: dayjs(pengumuman.tanggal),
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

      // Convert date to string format and map targetAudience
      const payload = {
        ...values,
        tanggal: values.tanggal.format("YYYY-MM-DD"),
        targetAudience: values.targetAudience || 'semua'
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
      title: "Target",
      dataIndex: "targetAudience",
      key: "targetAudience",
      render: (target: string) => {
        const option = audienceOptions.find(opt => opt.value === target);
        return option?.label || target;
      },
    },
    {
      title: "Dibuat Oleh",
      dataIndex: "creator",
      key: "creator",
      render: (creator: any) => creator?.namaLengkap || "Unknown",
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
      <div style={{ padding: "24px 0" }}>
        <div style={{ marginBottom: 24 }}>
          <h1>Announcement Management</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Create and manage announcements for different user groups
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <NotificationOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Announcements</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {pengumuman.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <UserOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>This Month</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {Array.isArray(pengumuman) ? pengumuman.filter(p => dayjs(p.tanggal).isAfter(dayjs().startOf('month'))).length : 0}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ fontSize: '24px', color: '#722ed1', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>This Week</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {Array.isArray(pengumuman) ? pengumuman.filter(p => dayjs(p.tanggal).isAfter(dayjs().startOf('week'))).length : 0}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card
          title="Announcement List"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Add Announcement
            </Button>
          }
        >
          <Table
            dataSource={Array.isArray(pengumuman) ? pengumuman : []}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 800 }}
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
              <Col span={12}>
                <Form.Item
                  label="Tanggal"
                  name="tanggal"
                  rules={[{ required: true, message: "Please select date" }]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Select date"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Target Audience"
                  name="targetAudience"
                  rules={[{ required: true, message: "Please select target audience" }]}
                >
                  <Select placeholder="Select target audience">
                    {audienceOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}