"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Space,
  Modal,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { Title } = Typography;
const { Option } = Select;

interface User {
  id: number;
  namaLengkap: string;
  username: string;
  role: {
    id: number;
    name: string;
  };
}

interface Halaqah {
  id: number;
  namaHalaqah: string;
  guru: {
    id: number;
    namaLengkap: string;
  };
  santri: User[];
  jumlahSantri: number;
}

interface HalaqahFormData {
  namaHalaqah: string;
  guruId: number;
  santriIds: number[];
  tahunAkademik: string;
  semester: 'S1' | 'S2';
}

export default function HalaqahPage() {
  const [form] = Form.useForm();
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHalaqah, setEditingHalaqah] = useState<Halaqah | null>(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [halaqahRes, usersRes] = await Promise.all([
        fetch("/api/halaqah"),
        fetch("/api/users"),
      ]);

      if (halaqahRes.ok) {
        const halaqahData = await halaqahRes.json();
        setHalaqahList(halaqahData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // Filter teachers and students based on role
        const teachersList = usersData.filter((user: User) => 
          user.role.name.toLowerCase() === 'guru'
        );
        const studentsList = usersData.filter((user: User) => 
          user.role.name.toLowerCase() === 'santri'
        );
        
        setTeachers(teachersList);
        setStudents(studentsList);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission
  const handleSubmit = async (values: HalaqahFormData) => {
    try {
      setLoading(true);
      const method = editingHalaqah ? 'PUT' : 'POST';
      const url = editingHalaqah 
        ? `/api/halaqah/${editingHalaqah.id}` 
        : '/api/halaqah';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(
          editingHalaqah 
            ? 'Halaqah berhasil diperbarui' 
            : 'Halaqah berhasil dibuat'
        );
        setModalVisible(false);
        setEditingHalaqah(null);
        form.resetFields();
        fetchData();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Gagal menyimpan halaqah');
      }
    } catch (error) {
      console.error('Error saving halaqah:', error);
      message.error('Terjadi kesalahan saat menyimpan halaqah');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/halaqah/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Halaqah berhasil dihapus');
        fetchData();
      } else {
        message.error('Gagal menghapus halaqah');
      }
    } catch (error) {
      console.error('Error deleting halaqah:', error);
      message.error('Terjadi kesalahan saat menghapus halaqah');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (halaqah: Halaqah) => {
    setEditingHalaqah(halaqah);
    form.setFieldsValue({
      namaHalaqah: halaqah.namaHalaqah,
      guruId: halaqah.guru.id,
      santriIds: halaqah.santri.map(s => s.id),
      tahunAkademik: new Date().getFullYear().toString(),
      semester: 'S1',
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingHalaqah(null);
    form.resetFields();
    form.setFieldsValue({
      tahunAkademik: new Date().getFullYear().toString(),
      semester: 'S1',
    });
    setModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Nama Halaqah',
      dataIndex: 'namaHalaqah',
      key: 'namaHalaqah',
    },
    {
      title: 'Guru',
      dataIndex: ['guru', 'namaLengkap'],
      key: 'guru',
    },
    {
      title: 'Jumlah Santri',
      dataIndex: 'jumlahSantri',
      key: 'jumlahSantri',
      render: (count: number) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          {count} Santri
        </span>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 150,
      render: (_: any, record: Halaqah) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus Halaqah"
            description="Apakah Anda yakin ingin menghapus halaqah ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              <TeamOutlined style={{ marginRight: 12, color: '#667eea' }} />
              Manajemen Halaqah
            </Title>
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '4px',
              fontWeight: '500'
            }}>
              Kelola halaqah, guru, dan santri dengan mudah
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              Tambah Halaqah
            </Button>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <TeamOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {halaqahList.length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Total Halaqah
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(245, 87, 108, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <UserOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {teachers.length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Total Guru
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(79, 172, 254, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <UserOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {students.length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Total Santri
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(67, 233, 123, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {halaqahList.reduce((total, halaqah) => total + (halaqah.jumlahSantri || 0), 0)}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Santri Aktif
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
          }}
          bodyStyle={{
            padding: '24px',
            background: 'transparent'
          }}
        >
          <Table
            columns={columns}
            dataSource={halaqahList}
            rowKey="id"
            loading={loading}
            style={{
              background: 'transparent'
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} halaqah`,
              style: {
                background: 'transparent',
                borderRadius: '8px',
                padding: '16px'
              }
            }}
          />
        </Card>

        {/* Modal Form */}
        <Modal
          title={
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '20px',
              fontWeight: '700',
              textAlign: 'center'
            }}>
              <TeamOutlined style={{ marginRight: 12, color: '#667eea', fontSize: '24px' }} />
              {editingHalaqah ? 'Edit Halaqah' : 'Tambah Halaqah Baru'}
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingHalaqah(null);
            form.resetFields();
          }}
          footer={null}
          width={700}
          style={{
            borderRadius: '20px',
            overflow: 'hidden'
          }}
          bodyStyle={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            borderRadius: '20px'
          }}
          centered
        >
          <Divider style={{ borderColor: 'rgba(102, 126, 234, 0.2)' }} />
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              tahunAkademik: new Date().getFullYear().toString(),
              semester: 'S1',
            }}
            style={{
              background: 'transparent'
            }}
          >
            <Form.Item
              label={<span style={{ color: '#333', fontWeight: '600', fontSize: '14px' }}>Nama Halaqah</span>}
              name="namaHalaqah"
              rules={[
                { required: true, message: 'Nama halaqah harus diisi!' },
                { min: 3, message: 'Nama halaqah minimal 3 karakter!' },
              ]}
            >
              <Input
                placeholder="Masukkan nama halaqah"
                size="large"
                style={{
                  borderRadius: '12px',
                  border: '2px solid #e8e8e8',
                  transition: 'all 0.3s ease',
                  fontSize: '14px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8e8e8';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Item>

            <Form.Item
              label="Guru Pengampu"
              name="guruId"
              rules={[
                { required: true, message: 'Guru harus dipilih!' },
              ]}
            >
              <Select
                placeholder="Pilih guru pengampu"
                size="large"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {teachers.map((teacher) => (
                  <Option key={teacher.id} value={teacher.id}>
                    {teacher.namaLengkap} ({teacher.username})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tahun Akademik"
                  name="tahunAkademik"
                  rules={[
                    { required: true, message: 'Tahun akademik harus diisi!' },
                  ]}
                >
                  <Input
                    placeholder="2024"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Semester"
                  name="semester"
                  rules={[
                    { required: true, message: 'Semester harus dipilih!' },
                  ]}
                >
                  <Select placeholder="Pilih semester" size="large">
                    <Option value="S1">Semester 1</Option>
                    <Option value="S2">Semester 2</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Santri"
              name="santriIds"
              rules={[
                { required: true, message: 'Minimal pilih 1 santri!' },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Pilih santri yang akan bergabung"
                size="large"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                maxTagCount="responsive"
              >
                {students.map((student) => (
                  <Option key={student.id} value={student.id}>
                    {student.namaLengkap} ({student.username})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider style={{ borderColor: 'rgba(102, 126, 234, 0.2)' }} />

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    setEditingHalaqah(null);
                    form.resetFields();
                  }}
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #e8e8e8',
                    height: '44px',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.color = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e8e8e8';
                    e.currentTarget.style.color = '#666';
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={editingHalaqah ? <EditOutlined /> : <PlusOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    height: '44px',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  {editingHalaqah ? 'Perbarui' : 'Simpan'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}