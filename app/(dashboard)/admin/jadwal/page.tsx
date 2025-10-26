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
  const openModal = (jadwal?: any) => {
    if (jadwal) {
      setEditingJadwal(jadwal);
      const formValues: any = {
        halaqahId: jadwal.halaqah.id,
        hari: jadwal.hari,
        jamMulai: dayjs(jadwal.jamMulai),
        jamSelesai: dayjs(jadwal.jamSelesai),
        isTemplate: jadwal.isTemplate ?? true,
        isActive: jadwal.isActive ?? true
      };

      // Add date fields if available
      if (jadwal.tanggalMulai) {
        formValues.tanggalMulai = dayjs(jadwal.tanggalMulai);
      }
      if (jadwal.tanggalSelesai) {
        formValues.tanggalSelesai = dayjs(jadwal.tanggalSelesai);
      }

      // For specific date mode
      if (!jadwal.isTemplate && jadwal.tanggalMulai) {
        formValues.tanggalSpesifik = dayjs(jadwal.tanggalMulai);
      }

      form.setFieldsValue(formValues);
    } else {
      setEditingJadwal(null);
      form.resetFields();
      // Set default values for new jadwal
      form.setFieldsValue({
        isTemplate: true,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log("Jadwal form values:", values);

      // Convert time to string format with validation
      const payload: any = {
        hari: values.hari,
        jamMulai: values.jamMulai ? values.jamMulai.format("HH:mm:ss") : "08:00:00",
        jamSelesai: values.jamSelesai ? values.jamSelesai.format("HH:mm:ss") : "10:00:00",
        halaqahId: parseInt(values.halaqahId),
        isTemplate: Boolean(values.isTemplate ?? true),
        isActive: Boolean(values.isActive ?? true)
      };

      console.log("Payload being sent:", payload);

      // Add date fields based on mode (optional)
      try {
        if (values.isTemplate !== false) {
          // Template mode - add optional date range
          if (values.tanggalMulai && values.tanggalMulai.isValid()) {
            payload.tanggalMulai = values.tanggalMulai.format("YYYY-MM-DD");
          }
          if (values.tanggalSelesai && values.tanggalSelesai.isValid()) {
            payload.tanggalSelesai = values.tanggalSelesai.format("YYYY-MM-DD");
          }
        } else {
          // Specific date mode
          payload.isTemplate = false;
          if (values.tanggalSpesifik && values.tanggalSpesifik.isValid()) {
            payload.tanggalMulai = values.tanggalSpesifik.format("YYYY-MM-DD");
            payload.tanggalSelesai = values.tanggalSpesifik.format("YYYY-MM-DD");
          }
        }
      } catch (dateError) {
        console.warn("Date processing error:", dateError);
        // Continue without dates if there's an error
      }

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
          const responseText = await res.text();
          try {
            errorData = JSON.parse(responseText);
          } catch (jsonError) {
            errorData = { error: `Server error (${res.status}): ${responseText}` };
          }
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }
        
        console.error('API Error Details:', errorData);
        throw new Error(errorData.error || errorData.details || `Failed to save jadwal (${res.status})`);
      }

      const data = await res.json();
      console.log("Success response:", data);

      const successMessage = editingJadwal 
        ? "Jadwal berhasil diperbarui" 
        : values.isTemplate 
          ? "Template jadwal berhasil dibuat! Jadwal akan berulang setiap minggu."
          : "Jadwal spesifik berhasil dibuat!";

      message.success(successMessage);
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

  // Toggle status jadwal
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/jadwal/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to toggle status (${res.status})`);
      }

      const data = await res.json();
      message.success(data.message);
      fetchJadwal();
    } catch (error: any) {
      console.error("Error toggling status:", error);
      message.error(error.message || "Error toggling status");
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
      title: "Mode & Status",
      key: "status",
      render: (_: unknown, record: any) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            {record.isTemplate ? (
              <Typography.Text style={{ fontSize: '12px', color: '#1890ff' }}>
                📅 Template
              </Typography.Text>
            ) : (
              <Typography.Text style={{ fontSize: '12px', color: '#fa8c16' }}>
                📆 Spesifik
              </Typography.Text>
            )}
          </div>
          <div>
            {record.isActive ? (
              <Typography.Text style={{ fontSize: '12px', color: '#52c41a' }}>
                🟢 Aktif
              </Typography.Text>
            ) : (
              <Typography.Text style={{ fontSize: '12px', color: '#ff4d4f' }}>
                🔴 Nonaktif
              </Typography.Text>
            )}
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
      width: 200,
      render: (_: unknown, record: any) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
              size="small"
            >
              Edit
            </Button>
            <Button
              type="text"
              onClick={() => handleToggleStatus(record.id, record.isActive)}
              size="small"
              style={{ 
                color: record.isActive ? '#ff4d4f' : '#52c41a'
              }}
            >
              {record.isActive ? '🔴 Nonaktifkan' : '🟢 Aktifkan'}
            </Button>
          </Space>
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
              label="Mode Jadwal"
              name="isTemplate"
              initialValue={true}
            >
              <Select>
                <Select.Option value={true}>
                  📅 Template Mode (Berulang Mingguan)
                </Select.Option>
                <Select.Option value={false}>
                  📆 Specific Date Mode (Tanggal Tertentu)
                </Select.Option>
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

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.isTemplate !== currentValues.isTemplate
              }
            >
              {({ getFieldValue }) => {
                const isTemplate = getFieldValue('isTemplate');
                return isTemplate ? (
                  <div style={{ 
                    padding: '16px', 
                    background: '#f6ffed', 
                    border: '1px solid #b7eb8f', 
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }}>
                    <Typography.Text strong style={{ color: '#52c41a' }}>
                      📅 Template Mode
                    </Typography.Text>
                    <br />
                    <Typography.Text style={{ fontSize: '12px' }}>
                      Jadwal akan berulang setiap minggu secara otomatis. 
                      Anda bisa mengatur periode berlaku di bawah (opsional).
                    </Typography.Text>
                    
                    <Row gutter={16} style={{ marginTop: '12px' }}>
                      <Col span={12}>
                        <Form.Item
                          label="Tanggal Mulai Berlaku (Opsional)"
                          name="tanggalMulai"
                        >
                          <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder="Pilih tanggal mulai"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Tanggal Selesai Berlaku (Opsional)"
                          name="tanggalSelesai"
                        >
                          <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder="Pilih tanggal selesai"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '16px', 
                    background: '#fff7e6', 
                    border: '1px solid #ffd591', 
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }}>
                    <Typography.Text strong style={{ color: '#fa8c16' }}>
                      📆 Specific Date Mode
                    </Typography.Text>
                    <br />
                    <Typography.Text style={{ fontSize: '12px' }}>
                      Jadwal hanya berlaku untuk tanggal tertentu yang Anda pilih.
                    </Typography.Text>
                    
                    <Form.Item
                      label="Tanggal Spesifik"
                      name="tanggalSpesifik"
                      rules={[{ required: !isTemplate, message: "Please select specific date" }]}
                      style={{ marginTop: '12px', marginBottom: 0 }}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        placeholder="Pilih tanggal spesifik"
                      />
                    </Form.Item>
                  </div>
                );
              }}
            </Form.Item>

            <Form.Item
              label="Status"
              name="isActive"
              initialValue={true}
            >
              <Select>
                <Select.Option value={true}>🟢 Aktif</Select.Option>
                <Select.Option value={false}>🔴 Nonaktif</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}