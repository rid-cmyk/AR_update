"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Space,
  Popconfirm,
  message,
  Table,
  Select,
  Switch,
  Typography,
  Tag,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  UserOutlined,
  BookOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";

interface GuruPermission {
  id: number;
  guruId: number;
  halaqahId: number;
  canAbsensi: boolean;
  canHafalan: boolean;
  canTarget: boolean;
  isActive: boolean;
  createdAt: string;
  guru: {
    id: number;
    namaLengkap: string;
    username: string;
  };
  halaqah: {
    id: number;
    namaHalaqah: string;
    guru: {
      namaLengkap: string;
    };
  };
}

interface Guru {
  id: number;
  namaLengkap: string;
  username: string;
}

interface Halaqah {
  id: number;
  namaHalaqah: string;
  guru: {
    namaLengkap: string;
  };
}

export default function GuruPermissionsPage() {
  const [permissions, setPermissions] = useState<GuruPermission[]>([]);
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [halaqahs, setHalaqahs] = useState<Halaqah[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<GuruPermission | null>(null);
  const [form] = Form.useForm();

  // Fetch data
  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/guru-permissions");
      if (!res.ok) throw new Error("Failed to fetch permissions");
      const data = await res.json();
      setPermissions(data.data || []);
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      message.error("Error fetching permissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchGurus = async () => {
    try {
      const res = await fetch("/api/admin/users?role=guru");
      if (!res.ok) throw new Error("Failed to fetch gurus");
      const data = await res.json();
      setGurus(data || []);
    } catch (error: any) {
      console.error("Error fetching gurus:", error);
    }
  };

  const fetchHalaqahs = async () => {
    try {
      const res = await fetch("/api/halaqah");
      if (!res.ok) throw new Error("Failed to fetch halaqahs");
      const data = await res.json();
      setHalaqahs(data || []);
    } catch (error: any) {
      console.error("Error fetching halaqahs:", error);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchGurus();
    fetchHalaqahs();
  }, []);

  // CRUD operations
  const openModal = (permission?: GuruPermission) => {
    if (permission) {
      setEditingPermission(permission);
      form.setFieldsValue({
        guruId: permission.guruId,
        halaqahId: permission.halaqahId,
        canAbsensi: permission.canAbsensi,
        canHafalan: permission.canHafalan,
        canTarget: permission.canTarget,
        isActive: permission.isActive,
      });
    } else {
      setEditingPermission(null);
      form.resetFields();
      form.setFieldsValue({
        canAbsensi: true,
        canHafalan: false,
        canTarget: false,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log("Permission form values:", values);

      const url = editingPermission 
        ? `/api/admin/guru-permissions/${editingPermission.id}` 
        : "/api/admin/guru-permissions";
      const method = editingPermission ? "PUT" : "POST";

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
        throw new Error(errorData.error || `Failed to save permission (${res.status})`);
      }

      const data = await res.json();
      console.log("Success response:", data);

      message.success(data.message || "Permission berhasil disimpan");
      setIsModalOpen(false);
      form.resetFields();
      fetchPermissions();
    } catch (error: any) {
      console.error("Error saving permission:", error);
      message.error(error.message || "Error saving permission");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/guru-permissions/${id}`, { 
        method: "DELETE" 
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: `Server error (${res.status})` };
        }
        throw new Error(errorData.error || `Failed to delete permission (${res.status})`);
      }

      const data = await res.json();
      message.success(data.message || "Permission berhasil dihapus");
      fetchPermissions();
    } catch (error: any) {
      console.error("Error deleting permission:", error);
      message.error(error.message || "Error deleting permission");
    }
  };

  const columns = [
    {
      title: "Guru",
      key: "guru",
      render: (_: unknown, record: GuruPermission) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.guru.namaLengkap}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>@{record.guru.username}</div>
        </div>
      ),
    },
    {
      title: "Halaqah",
      key: "halaqah",
      render: (_: unknown, record: GuruPermission) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.halaqah.namaHalaqah}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Guru: {record.halaqah.guru.namaLengkap}
          </div>
        </div>
      ),
    },
    {
      title: "Permissions",
      key: "permissions",
      render: (_: unknown, record: GuruPermission) => (
        <Space direction="vertical" size="small">
          <div>
            {record.canAbsensi && <Tag color="green">📝 Absensi</Tag>}
            {record.canHafalan && <Tag color="blue">📖 Hafalan</Tag>}
            {record.canTarget && <Tag color="orange">🎯 Target</Tag>}
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: GuruPermission) => (
        <Tag color={record.isActive ? 'success' : 'error'}>
          {record.isActive ? '🟢 Aktif' : '🔴 Nonaktif'}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: GuruPermission) => (
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
            title="Hapus Permission"
            description="Apakah Anda yakin ingin menghapus permission ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okType="danger"
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
          <h1>Guru Permissions Management</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Kelola akses guru ke halaqah lain untuk absensi, hafalan, dan target
          </p>
        </div>

        {/* Info Alert */}
        <Alert
          message="Tentang Guru Permissions"
          description={
            <div>
              <div>• <strong>Own Halaqah:</strong> Guru otomatis punya akses penuh ke halaqah yang dia ampu</div>
              <div>• <strong>Cross-Halaqah Permission:</strong> Guru bisa diberi akses ke halaqah lain dengan permission terbatas</div>
              <div>• <strong>Absensi:</strong> Bisa input absensi santri</div>
              <div>• <strong>Hafalan:</strong> Bisa input hafalan santri</div>
              <div>• <strong>Target:</strong> Bisa set target hafalan santri</div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <KeyOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Permissions</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {permissions.length}
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
                  <div style={{ fontSize: '14px', color: '#666' }}>Active Permissions</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {permissions.filter(p => p.isActive).length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BookOutlined style={{ fontSize: '24px', color: '#722ed1', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Unique Gurus</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {new Set(permissions.map(p => p.guruId)).size}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card
          title="Permissions List"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Add Permission
            </Button>
          }
        >
          <Table
            dataSource={permissions}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 800 }}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* Modal */}
        <Modal
          title={
            <Space>
              <KeyOutlined />
              {editingPermission ? "Edit Permission" : "Add New Permission"}
            </Space>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSave}
          okText="Save"
          width={600}
        >
          <Form form={form} layout="vertical" size="large">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Guru"
                  name="guruId"
                  rules={[{ required: true, message: "Please select guru" }]}
                >
                  <Select 
                    placeholder="Select guru"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {gurus.map((guru) => (
                      <Select.Option key={guru.id} value={guru.id}>
                        {guru.namaLengkap} (@{guru.username})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Halaqah"
                  name="halaqahId"
                  rules={[{ required: true, message: "Please select halaqah" }]}
                >
                  <Select 
                    placeholder="Select halaqah"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {halaqahs.map((halaqah) => (
                      <Select.Option key={halaqah.id} value={halaqah.id}>
                        <div>
                          <div>{halaqah.namaHalaqah}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Guru: {halaqah.guru?.namaLengkap}
                          </div>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div style={{ 
              padding: '16px', 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <Typography.Text strong style={{ color: '#52c41a' }}>
                🔑 Permissions
              </Typography.Text>
              <br />
              <Typography.Text style={{ fontSize: '12px' }}>
                Pilih akses yang akan diberikan kepada guru untuk halaqah ini
              </Typography.Text>

              <Row gutter={16} style={{ marginTop: '12px' }}>
                <Col span={8}>
                  <Form.Item
                    label="Absensi"
                    name="canAbsensi"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="✅" 
                      unCheckedChildren="❌"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Hafalan"
                    name="canHafalan"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="✅" 
                      unCheckedChildren="❌"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Target"
                    name="canTarget"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="✅" 
                      unCheckedChildren="❌"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Form.Item
              label="Status"
              name="isActive"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="🟢 Aktif" 
                unCheckedChildren="🔴 Nonaktif"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}