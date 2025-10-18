"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Form,
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
  TimePicker,
  Tag,
  notification,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  SendOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";
import dayjs from "dayjs";

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
}

interface Jadwal {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  halaqah: {
    id: number;
    namaHalaqah: string;
    guru: {
      id: number;
      namaLengkap: string;
    };
  };
}

interface JadwalFormData {
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  halaqahId: number;
}

const HARI_OPTIONS = [
  { value: 'Senin', label: 'Senin' },
  { value: 'Selasa', label: 'Selasa' },
  { value: 'Rabu', label: 'Rabu' },
  { value: 'Kamis', label: 'Kamis' },
  { value: 'Jumat', label: 'Jumat' },
  { value: 'Sabtu', label: 'Sabtu' },
  { value: 'Minggu', label: 'Minggu' },
];

export default function JadwalPage() {
  const [form] = Form.useForm();
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [filteredHalaqah, setFilteredHalaqah] = useState<Halaqah[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [jadwalRes, usersRes, halaqahRes] = await Promise.all([
        fetch("/api/jadwal"),
        fetch("/api/users"),
        fetch("/api/halaqah"),
      ]);

      if (jadwalRes.ok) {
        const jadwalData = await jadwalRes.json();
        setJadwalList(jadwalData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const teachersList = usersData.filter((user: User) => 
          user.role.name.toLowerCase() === 'guru'
        );
        setTeachers(teachersList);
      }

      if (halaqahRes.ok) {
        const halaqahData = await halaqahRes.json();
        setHalaqahList(halaqahData);
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

  // Filter halaqah based on selected teacher
  const handleTeacherChange = (teacherId: number) => {
    setSelectedTeacher(teacherId);
    const filtered = halaqahList.filter(h => h.guru.id === teacherId);
    setFilteredHalaqah(filtered);
    form.setFieldValue('halaqahId', undefined);
  };

  // Handle form submission
  const handleSubmit = async (values: JadwalFormData) => {
    try {
      setLoading(true);
      
      // Format time values
      const formattedValues = {
        ...values,
        jamMulai: dayjs(values.jamMulai).format('HH:mm'),
        jamSelesai: dayjs(values.jamSelesai).format('HH:mm'),
      };

      const method = editingJadwal ? 'PUT' : 'POST';
      const url = editingJadwal 
        ? `/api/jadwal/${editingJadwal.id}` 
        : '/api/jadwal';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues),
      });

      if (response.ok) {
        message.success(
          editingJadwal 
            ? 'Jadwal berhasil diperbarui' 
            : 'Jadwal berhasil dibuat'
        );
        setModalVisible(false);
        setEditingJadwal(null);
        setSelectedTeacher(null);
        setFilteredHalaqah([]);
        form.resetFields();
        fetchData();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Gagal menyimpan jadwal');
      }
    } catch (error) {
      console.error('Error saving jadwal:', error);
      message.error('Terjadi kesalahan saat menyimpan jadwal');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jadwal/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Jadwal berhasil dihapus');
        fetchData();
      } else {
        message.error('Gagal menghapus jadwal');
      }
    } catch (error) {
      console.error('Error deleting jadwal:', error);
      message.error('Terjadi kesalahan saat menghapus jadwal');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (jadwal: Jadwal) => {
    setEditingJadwal(jadwal);
    setSelectedTeacher(jadwal.halaqah.guru.id);
    
    // Filter halaqah for the selected teacher
    const filtered = halaqahList.filter(h => h.guru.id === jadwal.halaqah.guru.id);
    setFilteredHalaqah(filtered);
    
    form.setFieldsValue({
      hari: jadwal.hari,
      jamMulai: dayjs(jadwal.jamMulai, 'HH:mm'),
      jamSelesai: dayjs(jadwal.jamSelesai, 'HH:mm'),
      halaqahId: jadwal.halaqah.id,
      teacherId: jadwal.halaqah.guru.id,
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingJadwal(null);
    setSelectedTeacher(null);
    setFilteredHalaqah([]);
    form.resetFields();
    setModalVisible(true);
  };

  // Send jadwal to teacher
  const handleSendToTeacher = async (jadwal: Jadwal) => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: jadwal.halaqah.guru.id,
          type: 'jadwal',
          pesan: `Jadwal baru untuk halaqah ${jadwal.halaqah.namaHalaqah} pada hari ${jadwal.hari} pukul ${jadwal.jamMulai}-${jadwal.jamSelesai}`,
          refId: jadwal.id,
        }),
      });

      if (response.ok) {
        notification.success({
          message: 'Jadwal Terkirim',
          description: `Jadwal berhasil dikirim ke ${jadwal.halaqah.guru.namaLengkap}`,
          placement: 'topRight',
        });
      } else {
        message.error('Gagal mengirim jadwal ke guru');
      }
    } catch (error) {
      console.error('Error sending jadwal:', error);
      message.error('Terjadi kesalahan saat mengirim jadwal');
    } finally {
      setLoading(false);
    }
  };

  // Get day color
  const getDayColor = (hari: string) => {
    const colors: { [key: string]: string } = {
      'Senin': 'blue',
      'Selasa': 'green',
      'Rabu': 'orange',
      'Kamis': 'red',
      'Jumat': 'purple',
      'Sabtu': 'cyan',
      'Minggu': 'magenta',
    };
    return colors[hari] || 'default';
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
      title: 'Hari',
      dataIndex: 'hari',
      key: 'hari',
      render: (hari: string) => (
        <Tag color={getDayColor(hari)}>{hari}</Tag>
      ),
    },
    {
      title: 'Waktu',
      key: 'waktu',
      render: (record: Jadwal) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {record.jamMulai} - {record.jamSelesai}
        </span>
      ),
    },
    {
      title: 'Halaqah',
      dataIndex: ['halaqah', 'namaHalaqah'],
      key: 'halaqah',
    },
    {
      title: 'Guru',
      dataIndex: ['halaqah', 'guru', 'namaLengkap'],
      key: 'guru',
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 200,
      render: (_: any, record: Jadwal) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={() => handleSendToTeacher(record)}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Kirim
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus Jadwal"
            description="Apakah Anda yakin ingin menghapus jadwal ini?"
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
              <CalendarOutlined style={{ marginRight: 12, color: '#667eea' }} />
              Manajemen Jadwal
            </Title>
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '4px',
              fontWeight: '500'
            }}>
              Atur jadwal halaqah dan kegiatan dengan mudah
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
              Tambah Jadwal
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
                <CalendarOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {jadwalList.length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Total Jadwal
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
                <TeamOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {[...new Set(jadwalList.map(j => j.halaqah.namaHalaqah))].length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Halaqah Aktif
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
                  {[...new Set(jadwalList.map(j => j.halaqah.guru.namaLengkap))].length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Guru Terjadwal
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
                <ClockCircleOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {jadwalList.filter(j => j.hari === new Date().toLocaleDateString('id-ID', { weekday: 'long' })).length}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Jadwal Hari Ini
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
            dataSource={jadwalList}
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
                `${range[0]}-${range[1]} dari ${total} jadwal`,
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
              <CalendarOutlined style={{ marginRight: 12, color: '#667eea', fontSize: '24px' }} />
              {editingJadwal ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingJadwal(null);
            setSelectedTeacher(null);
            setFilteredHalaqah([]);
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
            style={{
              background: 'transparent'
            }}
          >
            <Form.Item
              label="Pilih Guru"
              rules={[
                { required: true, message: 'Guru harus dipilih!' },
              ]}
            >
              <Select
                placeholder="Pilih guru terlebih dahulu"
                size="large"
                showSearch
                onChange={handleTeacherChange}
                value={selectedTeacher}
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

            <Form.Item
              label="Halaqah"
              name="halaqahId"
              rules={[
                { required: true, message: 'Halaqah harus dipilih!' },
              ]}
            >
              <Select
                placeholder="Pilih halaqah"
                size="large"
                disabled={!selectedTeacher}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {filteredHalaqah.map((halaqah) => (
                  <Option key={halaqah.id} value={halaqah.id}>
                    {halaqah.namaHalaqah}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Hari"
              name="hari"
              rules={[
                { required: true, message: 'Hari harus dipilih!' },
              ]}
            >
              <Select placeholder="Pilih hari" size="large">
                {HARI_OPTIONS.map((hari) => (
                  <Option key={hari.value} value={hari.value}>
                    {hari.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Jam Mulai"
                  name="jamMulai"
                  rules={[
                    { required: true, message: 'Jam mulai harus diisi!' },
                  ]}
                >
                  <TimePicker
                    format="HH:mm"
                    placeholder="Pilih jam mulai"
                    size="large"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Jam Selesai"
                  name="jamSelesai"
                  rules={[
                    { required: true, message: 'Jam selesai harus diisi!' },
                  ]}
                >
                  <TimePicker
                    format="HH:mm"
                    placeholder="Pilih jam selesai"
                    size="large"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ borderColor: 'rgba(102, 126, 234, 0.2)' }} />

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    setEditingJadwal(null);
                    setSelectedTeacher(null);
                    setFilteredHalaqah([]);
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
                  icon={editingJadwal ? <EditOutlined /> : <PlusOutlined />}
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
                  {editingJadwal ? 'Perbarui' : 'Simpan'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}