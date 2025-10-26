"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  message,
  Row,
  Col,
  Divider,
  Table,
  Tag,
  Typography,
  Space,
  Spin
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  SaveOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  HeartOutlined,
  TeamOutlined,
  BookOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import type { UploadProps } from "antd";

const { Title, Text } = Typography;

interface UserProfile {
  id: number;
  username: string;
  namaLengkap: string;
  email: string;
  noTlp: string;
  alamat: string;
  foto: string;
  role: {
    name: string;
  };
}

interface Anak {
  id: number;
  namaLengkap: string;
  username: string;
  halaqah?: {
    namaHalaqah: string;
    guru: {
      namaLengkap: string;
    };
  };
}

export default function OrtuProfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [anakList, setAnakList] = useState<Anak[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        form.setFieldsValue({
          username: data.user.username,
          namaLengkap: data.user.namaLengkap,
          email: data.user.email,
          noTlp: data.user.noTlp,
          alamat: data.user.alamat,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnakList = async () => {
    try {
      const res = await fetch("/api/ortu/anak");
      if (res.ok) {
        const data = await res.json();
        setAnakList(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching anak list:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAnakList();
  }, []);

  const handleUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        const data = await res.json();
        message.success("Profil berhasil diperbarui");
        setProfile(data.user);
      } else {
        const errorData = await res.json();
        message.error(errorData.error || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Terjadi kesalahan saat memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'foto',
    action: '/api/upload/foto',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} berhasil diupload`);
        fetchProfile(); // Refresh profile to get new photo
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} gagal diupload`);
      }
    },
  };

  const anakColumns = [
    {
      title: "Nama",
      dataIndex: "namaLengkap",
      key: "namaLengkap",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (username: string) => `@${username}`,
    },
    {
      title: "Halaqah",
      key: "halaqah",
      render: (record: Anak) => {
        if (record.halaqah) {
          return (
            <div>
              <div style={{ fontWeight: 'bold' }}>{record.halaqah.namaHalaqah}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Guru: {record.halaqah.guru.namaLengkap}
              </div>
            </div>
          );
        }
        return <Tag color="default">Belum ada halaqah</Tag>;
      },
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1400px', margin: '0 auto' }}>
        {/* Beautiful Header */}
        <div style={{ 
          marginBottom: 32,
          background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            👤 Profil Orang Tua
          </div>
          <div style={{ 
            fontSize: '16px', 
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            💝 Kelola informasi profil dan pantau perkembangan buah hati tercinta
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Photo Section */}
          <Col xs={24} lg={8}>
            <Card style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e8e8e8',
              textAlign: 'center'
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                margin: '-24px -24px 20px -24px',
                padding: '20px',
                borderRadius: '12px 12px 0 0',
                color: 'white'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                  📸 Foto Profil
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  Kelola foto profil Anda
                </div>
              </div>

              <div style={{ padding: '20px 0' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 20px auto',
                  border: '4px solid #722ed1',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(114,46,209,0.3)'
                }}>
                  {profile?.foto ? (
                    <img
                      src={profile.foto}
                      alt="Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #f0f0f0 0%, #d9d9d9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <UserOutlined style={{ fontSize: '40px', color: '#999' }} />
                    </div>
                  )}
                </div>

                <Upload {...uploadProps} showUploadList={false}>
                  <Button 
                    icon={<UploadOutlined />}
                    style={{
                      borderRadius: '20px',
                      backgroundColor: '#722ed1',
                      borderColor: '#722ed1',
                      color: 'white'
                    }}
                  >
                    📷 Upload Foto
                  </Button>
                </Upload>
                
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  marginTop: '12px',
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px'
                }}>
                  Format: JPG, PNG<br />
                  Ukuran maksimal: 2MB
                </div>
              </div>
            </Card>
          </Col>

          {/* Profile Form */}
          <Col xs={24} lg={16}>
            <Card style={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e8e8e8'
            }} loading={loading}>
              <div style={{ 
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                margin: '-24px -24px 20px -24px',
                padding: '20px',
                borderRadius: '12px 12px 0 0',
                color: 'white'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                  📝 Informasi Profil
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Kelola informasi pribadi dan kontak Anda
                </div>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          👤 Username
                        </span>
                      }
                      name="username"
                      rules={[{ required: true, message: "Username harus diisi" }]}
                    >
                      <Input 
                        prefix={<UserOutlined />} 
                        disabled 
                        style={{ 
                          borderRadius: '8px',
                          backgroundColor: '#f5f5f5'
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          🏷️ Nama Lengkap
                        </span>
                      }
                      name="namaLengkap"
                      rules={[{ required: true, message: "Nama lengkap harus diisi" }]}
                    >
                      <Input 
                        prefix={<UserOutlined />}
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          📧 Email
                        </span>
                      }
                      name="email"
                      rules={[
                        { type: "email", message: "Format email tidak valid" }
                      ]}
                    >
                      <Input 
                        prefix={<MailOutlined />}
                        placeholder="contoh@email.com"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          📱 No. Telepon
                        </span>
                      }
                      name="noTlp"
                    >
                      <Input 
                        prefix={<PhoneOutlined />}
                        placeholder="+62 812-3456-7890"
                        style={{ borderRadius: '8px' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <span style={{ fontWeight: '600', color: '#333' }}>
                      🏠 Alamat
                    </span>
                  }
                  name="alamat"
                >
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Masukkan alamat lengkap..."
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <div style={{ 
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                    style={{
                      borderRadius: '20px',
                      padding: '8px 32px',
                      height: 'auto',
                      fontWeight: '600'
                    }}
                  >
                    💾 Simpan Perubahan
                  </Button>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666',
                    marginTop: '8px'
                  }}>
                    💡 Pastikan semua informasi sudah benar sebelum menyimpan
                  </div>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>

        {profile && (
          <Card title="Informasi Akun" style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Role:</strong> {profile.role.name}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>User ID:</strong> {profile.id}
            </div>
            <div>
              <strong>Username:</strong> @{profile.username}
            </div>
          </Card>
        )}

        {/* Anak List */}
        {anakList.length > 0 && (
          <>
            <Divider />
            <Card title="Daftar Anak">
              <Table
                columns={anakColumns}
                dataSource={anakList}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </>
        )}
      </div>
    </LayoutApp>
  );
}