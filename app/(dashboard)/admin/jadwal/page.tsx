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
  TimePicker,
  Divider,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

interface Jadwal {
  id: number;
  hari: string;
  jamMulai: Date | string;
  jamSelesai: Date | string;
  halaqah: {
    id: number;
    namaHalaqah: string;
    guru?: {
      id: number;
      namaLengkap: string;
    };
    jumlahSantri?: number;
  };
}

interface Halaqah {
  id: number;
  namaHalaqah: string;
}

export default function AdminJadwalPage() {
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [halaqah, setHalaqah] = useState<Halaqah[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
  const [form] = Form.useForm();

  const hariOptions = [
    { value: "Senin", label: "Senin" },
    { value: "Selasa", label: "Selasa" },
    { value: "Rabu", label: "Rabu" },
    { value: "Kamis", label: "Kamis" },
    { value: "Jumat", label: "Jumat" },
    { value: "Sabtu", label: "Sabtu" },
    { value: "Minggu", label: "Minggu" },
  ];

  // Fetch data
  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/jadwal");
      if (!res.ok) throw new Error("Failed to fetch jadwal");
      const data = await res.json();
      setJadwal(data);
    } catch (error: any) {
      console.error("Error fetching jadwal:", error);
      message.error("Error fetching jadwal");
    } finally {
      setLoading(false);
    }
  };

  const fetchHalaqah = async () => {
    try {
      const res = await fetch("/api/halaqah");
      if (!res.ok) throw new Error("Failed to fetch halaqah");
      const data = await res.json();
      setHalaqah(data);
    } catch (error: any) {
      console.error("Error fetching halaqah:", error);
    }
  };

  useEffect(() => {
    fetchJadwal();
    fetchHalaqah();
  }, []);

  // CRUD operations
  const openModal = (jadwal?: Jadwal) => {
    if (jadwal) {
      setEditingJadwal(jadwal);
      form.setFieldsValue({
        halaqahId: jadwal.halaqah.id,
        hari: jadwal.hari,
        jamMulai: dayjs(jadwal.jamMulai),
        jamSelesai: dayjs(jadwal.jamSelesai),
      });
    } else {
      setEditingJadwal(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log("Jadwal form values:", values);

      // Convert time to string format
      const payload = {
        hari: values.hari,
        jamMulai: values.jamMulai.format("HH:mm:ss"),
        jamSelesai: values.jamSelesai.format("HH:mm:ss"),
        halaqahId: values.halaqahId
      };

      const url = editingJadwal ? `/api/jadwal/${editingJadwal.id}` : "/api/jadwal";
      const method = editingJadwal ? "PUT" : "POST";

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
        throw new Error(errorData.error || `Failed to save jadwal (${res.status})`);
      }

      const data = await res.json();
      console.log("Success response:", data);

      message.success(editingJadwal ? "Jadwal berhasil diperbarui" : "Jadwal berhasil ditambahkan");
      setIsModalOpen(false);
      form.resetFields();
      fetchJadwal();
    } catch (error: any) {
      console.error("Error saving jadwal:", error);
      message.error(error.message || "Error saving jadwal");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      console.log("Deleting jadwal with ID:", id);
      const res = await fetch(`/api/jadwal/${id}`, { method: "DELETE" });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to delete jadwal (${res.status})`);
      }

      const data = await res.json();
      console.log("Delete success response:", data);
      message.success(data.message || "Jadwal berhasil dihapus");

      fetchJadwal();
    } catch (error: any) {
      console.error("Error deleting jadwal:", error);
      message.error(error.message || "Error deleting jadwal");
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
      title: "Halaqah",
      dataIndex: "halaqah",
      key: "halaqah",
      render: (halaqah: any) => halaqah?.namaHalaqah || "Unknown",
    },
    {
      title: "Hari",
      dataIndex: "hari",
      key: "hari",
    },
    {
      title: "Waktu",
      key: "waktu",
      render: (_: unknown, record: Jadwal) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {dayjs(record.jamMulai).format("HH:mm")} - {dayjs(record.jamSelesai).format("HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "Guru",
      key: "guru",
      render: (_: unknown, record: Jadwal) => (
        <div>
          {record.halaqah.guru?.namaLengkap || "Belum ditentukan"}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: Jadwal) => (
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
            title="Are you sure you want to delete this schedule?"
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
          <h1>Schedule Management</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Manage halaqah schedules and timings
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Schedules</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {jadwal.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Active Halaqah</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {halaqah.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: '24px', color: '#722ed1', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>This Week</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {jadwal.filter(j => j.hari === dayjs().format('dddd')).length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card
          title="Schedule List"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Add Schedule
            </Button>
          }
        >
          <Table
            dataSource={jadwal}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 600 }}
          />
        </Card>

        {/* Modal */}
        <Modal
          title={
            <Space>
              <CalendarOutlined />
              {editingJadwal ? "Edit Schedule" : "Add New Schedule"}
            </Space>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSave}
          okText="Save"
          width={600}
        >
          <Form form={form} layout="vertical" size="large">
            <Form.Item
              label="Halaqah"
              name="halaqahId"
              rules={[{ required: true, message: "Please select halaqah" }]}
            >
              <Select placeholder="Select halaqah">
                {halaqah.map((h) => (
                  <Select.Option key={h.id} value={h.id}>
                    {h.namaHalaqah}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Hari"
              name="hari"
              rules={[{ required: true, message: "Please select day" }]}
            >
              <Select placeholder="Select day">
                {hariOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Jam Mulai"
                  name="jamMulai"
                  rules={[{ required: true, message: "Please select start time" }]}
                >
                  <TimePicker
                    format="HH:mm"
                    placeholder="Start time"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Jam Selesai"
                  name="jamSelesai"
                  rules={[{ required: true, message: "Please select end time" }]}
                >
                  <TimePicker
                    format="HH:mm"
                    placeholder="End time"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}