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
  Divider,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";

interface Halaqah {
  id: number;
  namaHalaqah: string;
  deskripsi?: string;
  guruId?: number;
  guru?: {
    id: number;
    namaLengkap: string;
  };
  santri: Array<{
    id: number;
    santri: {
      id: number;
      namaLengkap: string;
    };
  }>;
  _count?: {
    santri: number;
  };
}

interface Guru {
  id: number;
  namaLengkap: string;
}

interface Santri {
  id: number;
  namaLengkap: string;
}

export default function AdminHalaqahPage() {
  const [halaqah, setHalaqah] = useState<Halaqah[]>([]);
  const [guru, setGuru] = useState<Guru[]>([]);
  const [santri, setSantri] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHalaqah, setEditingHalaqah] = useState<Halaqah | null>(null);
  const [form] = Form.useForm();

  // Fetch data
  const fetchHalaqah = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/halaqah");
      if (!res.ok) throw new Error("Failed to fetch halaqah");
      const data = await res.json();
      setHalaqah(data);
    } catch (error: any) {
      console.error("Error fetching halaqah:", error);
      message.error("Error fetching halaqah");
    } finally {
      setLoading(false);
    }
  };

  const fetchGuru = async () => {
    try {
      const res = await fetch("/api/admin/users?role=guru");
      if (!res.ok) throw new Error("Failed to fetch guru");
      const data = await res.json();
      setGuru(data);
    } catch (error: any) {
      console.error("Error fetching guru:", error);
    }
  };

  const fetchSantri = async (halaqahId?: number) => {
    try {
      let url;
      if (halaqahId) {
        // For editing: get santri available for this halaqah (including current members)
        url = `/api/admin/users/available?halaqahId=${halaqahId}`;
      } else {
        // For new halaqah: get santri not assigned to any halaqah
        url = "/api/admin/users?role=santri&excludeAssigned=true";
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch santri");
      const data = await res.json();
      setSantri(data);
    } catch (error: any) {
      console.error("Error fetching santri:", error);
    }
  };

  useEffect(() => {
    fetchHalaqah();
    fetchGuru();
    fetchSantri();
  }, []);

  // CRUD operations
  const openModal = (halaqah?: Halaqah) => {
    if (halaqah) {
      setEditingHalaqah(halaqah);
      // Fetch santri excluding current halaqah for editing
      fetchSantri(halaqah.id);
      form.setFieldsValue({
        ...halaqah,
        guruId: halaqah.guruId,
        santriIds: halaqah.santri?.map(hs => hs.santri?.id).filter(Boolean) || [],
      });
    } else {
      setEditingHalaqah(null);
      form.resetFields();
      // Fetch available santri for new halaqah
      fetchSantri();
      // Set default first 5 santri for new halaqah
      setTimeout(() => {
        const firstFiveSantri = santri.slice(0, 5).map(s => s.id);
        form.setFieldsValue({
          santriIds: firstFiveSantri,
        });
      }, 100);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log("Halaqah form values:", values);

      // Ensure santriIds is provided and not empty
      if (!values.santriIds || values.santriIds.length === 0) {
        message.error("Please select at least one santri");
        return;
      }

      const url = editingHalaqah ? `/api/halaqah/${editingHalaqah.id}` : "/api/halaqah";
      const method = editingHalaqah ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }

        // Handle specific error cases
        if (errorData.error === 'At least 5 santri must be selected') {
          message.error('Minimal 5 santri harus dipilih');
        } else if (errorData.error === 'Nama halaqah is required') {
          message.error('Nama halaqah wajib diisi');
        } else if (errorData.error) {
          message.error(errorData.error);
        } else {
          message.error(`Gagal menyimpan halaqah (${res.status})`);
        }

        // Log error details for debugging
        console.error("API Error Response:", {
          status: res.status,
          statusText: res.statusText,
          errorData: errorData,
          url: url,
          method: method
        });
        return;
      }

      const data = await res.json();
      console.log("Success response:", data);

      message.success(editingHalaqah ? "Halaqah berhasil diperbarui" : "Halaqah berhasil ditambahkan");
      setIsModalOpen(false);
      form.resetFields();
      // Refresh all data to ensure synchronization
      await Promise.all([
        fetchHalaqah(),
        fetchSantri() // Refresh available santri list
      ]);
    } catch (error: any) {
      console.error("Error saving halaqah:", error);
      // Provide more detailed error message
      const errorMessage = error?.message || "Error saving halaqah";
      message.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      console.log("Deleting halaqah with ID:", id);
      const res = await fetch(`/api/halaqah/${id}`, { method: "DELETE" });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to delete halaqah (${res.status})`);
      }

      const data = await res.json();
      console.log("Delete success response:", data);
      message.success(data.message || "Halaqah berhasil dihapus");

      // Refresh all data to ensure synchronization
      await Promise.all([
        fetchHalaqah(),
        fetchSantri() // Refresh available santri list
      ]);
    } catch (error: any) {
      console.error("Error deleting halaqah:", error);
      message.error(error.message || "Error deleting halaqah");
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
      title: "Nama Halaqah",
      dataIndex: "namaHalaqah",
      key: "namaHalaqah",
      render: (text: string, record: Halaqah) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.deskripsi && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.deskripsi}</div>
          )}
        </div>
      ),
    },
    {
      title: "Guru Pengampu",
      dataIndex: "guru",
      key: "guru",
      render: (guru: any) => guru?.namaLengkap || "Belum ditentukan",
    },
    {
      title: "Jumlah Santri",
      dataIndex: "santri",
      key: "santriCount",
      render: (santri: any[]) => santri?.length || 0,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: Halaqah) => (
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
            title="Are you sure you want to delete this halaqah?"
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
          <h1>Halaqah Management</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Manage halaqah groups and assign teachers
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Halaqah</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {halaqah.length}
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
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Guru</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {guru.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ fontSize: '24px', color: '#722ed1', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Santri</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {santri.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card
          title="Halaqah List"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Add Halaqah
            </Button>
          }
        >
          <Table
            dataSource={halaqah}
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
              <TeamOutlined />
              {editingHalaqah ? "Edit Halaqah" : "Add New Halaqah"}
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
              label="Nama Halaqah"
              name="namaHalaqah"
              rules={[{ required: true, message: "Please enter halaqah name" }]}
            >
              <Input placeholder="Enter halaqah name" />
            </Form.Item>
            <Form.Item label="Deskripsi" name="deskripsi">
              <Input.TextArea
                placeholder="Enter halaqah description (optional)"
                rows={3}
              />
            </Form.Item>
            <Form.Item label="Guru Pengampu" name="guruId">
              <Select placeholder="Select teacher (optional)">
                {guru.map((g) => (
                  <Select.Option key={g.id} value={g.id}>
                    {g.namaLengkap}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Pilih Santri (Minimal 5 santri)"
              name="santriIds"
              rules={[{ required: true, message: "Please select at least 5 santri" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select santri for halaqah"
                maxTagCount={5}
                maxTagTextLength={20}
                style={{ width: '100%' }}
                notFoundContent={
                  santri.length === 0
                    ? "Semua santri sudah terdaftar di halaqah lain"
                    : "Tidak ada santri tersedia"
                }
              >
                {santri.map((s) => (
                  <Select.Option key={s.id} value={s.id}>
                    {s.namaLengkap}
                  </Select.Option>
                ))}
              </Select>
              {santri.length === 0 && (
                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                  ⚠️ Semua santri sudah terdaftar di halaqah lain
                </div>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}