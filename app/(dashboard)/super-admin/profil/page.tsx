"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Form, Input, Button, message, Upload, Space, Divider, Statistic } from "antd";
import { UploadOutlined, SaveOutlined, UserOutlined, DatabaseOutlined, TeamOutlined, BookOutlined, CalendarOutlined } from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";

interface UserProfile {
  id: number;
  namaLengkap: string;
  username: string;
  foto?: string;
  alamat?: string;
  noTlp?: string;
  email?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalSantri: number;
  totalGuru: number;
  totalAdmin: number;
  totalOrtu: number;
  totalYayasan: number;
  hafalanRate: number;
  attendanceRate: number;
}

export default function SuperAdminProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Fetch user profile and dashboard stats
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/analytics/dashboard")
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.user);
        form.setFieldsValue(profileData.user);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setDashboardStats({
          totalUsers: statsData.overview?.totalUsers || 0,
          totalSantri: statsData.overview?.totalSantri || 0,
          totalGuru: statsData.overview?.totalGuru || 0,
          totalAdmin: statsData.overview?.totalAdmin || 0,
          totalOrtu: statsData.overview?.totalOrtu || 0,
          totalYayasan: statsData.overview?.totalYayasan || 0,
          hafalanRate: statsData.performance?.hafalanRate || 0,
          attendanceRate: statsData.performance?.attendanceRate || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      message.error("Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle save profile
  const handleSave = async (values: any) => {
    try {
      setSaving(true);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      message.success("Profil berhasil diperbarui");
      fetchProfile(); // Refresh data
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const uploadProps = {
    name: "file",
    action: "/api/upload",
    listType: "picture-card" as const,
    maxCount: 1,
    onChange(info: any) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} berhasil diupload`);
        form.setFieldsValue({ foto: info.file.response?.url || info.file.name });
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} gagal diupload`);
      }
    },
    onRemove() {
      form.setFieldsValue({ foto: undefined });
    },
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            👑 Edit Profil Super Admin
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Kelola informasi profil dan pantau sistem Anda
          </p>
        </div>

        {/* Dashboard Overview for Super Admin */}
        {dashboardStats && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: 'center', border: '2px solid #3f8600' }}>
                <Statistic
                  title="Total Users"
                  value={dashboardStats.totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#3f8600", fontSize: '20px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: 'center', border: '2px solid #1890ff' }}>
                <Statistic
                  title="Santri"
                  value={dashboardStats.totalSantri}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#1890ff", fontSize: '20px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: 'center', border: '2px solid #52c41a' }}>
                <Statistic
                  title="Hafalan Rate"
                  value={dashboardStats.hafalanRate}
                  suffix="%"
                  prefix={<BookOutlined />}
                  valueStyle={{ color: "#52c41a", fontSize: '20px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ textAlign: 'center', border: '2px solid #fa8c16' }}>
                <Statistic
                  title="Attendance"
                  value={dashboardStats.attendanceRate}
                  suffix="%"
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: "#fa8c16", fontSize: '20px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e8e8e8'
              }}
            >
              {/* Header Section */}
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                margin: '-24px -24px 24px -24px',
                padding: '24px',
                borderRadius: '12px 12px 0 0',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                  👑 Edit Profil Super Admin
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Kelola informasi profil dan akses sistem
                </div>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={profile || {}}
              >
                {/* Profile Photo Section */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: 32,
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  borderRadius: '8px',
                  border: '2px dashed #d9d9d9'
                }}>
                  <Form.Item name="foto" style={{ marginBottom: '12px' }}>
                    <Upload {...uploadProps}>
                      {profile?.foto ? (
                        <div style={{ position: 'relative' }}>
                          <img
                            src={profile.foto}
                            alt="Profile"
                            style={{
                              width: 120,
                              height: 120,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '4px solid #fff',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            right: '50%',
                            transform: 'translateX(50%)',
                            backgroundColor: '#1890ff',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px'
                          }}>
                            📷
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '4px solid #fff',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <UserOutlined style={{ fontSize: 32, color: '#999', marginBottom: '4px' }} />
                            <div style={{ fontSize: '10px', color: '#999' }}>Upload</div>
                          </div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    fontWeight: '500'
                  }}>
                    📸 Klik untuk mengubah foto profil
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#999',
                    marginTop: '4px'
                  }}>
                    Format: JPG, PNG (Max: 2MB)
                  </div>
                </div>

                {/* Form Fields */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          👤 Nama Lengkap
                        </span>
                      }
                      name="namaLengkap"
                      rules={[{ required: true, message: "Nama lengkap wajib diisi" }]}
                    >
                      <Input 
                        placeholder="Masukkan nama lengkap"
                        style={{ 
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '14px'
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          🔑 Username
                        </span>
                      }
                      name="username"
                      rules={[{ required: true, message: "Username wajib diisi" }]}
                    >
                      <Input 
                        placeholder="Masukkan username"
                        style={{ 
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '14px'
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          📧 Email
                        </span>
                      }
                      name="email"
                      rules={[
                        { required: true, message: "Email wajib diisi" },
                        { type: 'email', message: "Format email tidak valid" }
                      ]}
                    >
                      <Input 
                        placeholder="admin@example.com"
                        style={{ 
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '14px'
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          📱 Nomor Telepon
                        </span>
                      }
                      name="noTlp"
                    >
                      <Input 
                        placeholder="+62 812-3456-7890"
                        style={{ 
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '14px'
                        }}
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
                    style={{ 
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px'
                    }}
                  />
                </Form.Item>

                {/* Action Buttons */}
                <div style={{ 
                  marginTop: '32px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <Space size="middle">
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={() => form.submit()}
                      loading={saving}
                      size="large"
                      style={{
                        borderRadius: '8px',
                        padding: '8px 24px',
                        height: 'auto',
                        fontWeight: '600'
                      }}
                    >
                      💾 Simpan Perubahan
                    </Button>
                    <Button
                      onClick={() => {
                        form.resetFields();
                        form.setFieldsValue(profile || {});
                      }}
                      size="large"
                      style={{
                        borderRadius: '8px',
                        padding: '8px 24px',
                        height: 'auto'
                      }}
                    >
                      🔄 Reset Form
                    </Button>
                  </Space>
                  <div style={{ 
                    marginTop: '12px',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    💡 Pastikan semua informasi sudah benar sebelum menyimpan
                  </div>
                </div>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card 
              style={{ 
                marginBottom: 24,
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e8e8e8'
              }}
            >
              <div style={{ 
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                margin: '-24px -24px 20px -24px',
                padding: '20px',
                borderRadius: '12px 12px 0 0',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                  🔐 Informasi Akun
                </div>
              </div>

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#fff2e8',
                  borderRadius: '8px',
                  border: '1px solid #ffec3d'
                }}>
                  <span style={{ fontWeight: '600', color: '#333' }}>👑 Role:</span>
                  <span style={{ 
                    color: '#d4380d', 
                    fontWeight: 'bold',
                    backgroundColor: '#fff1f0',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    SUPER ADMIN
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f6ffed',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: '600', color: '#333' }}>🆔 ID Pengguna:</span>
                  <span style={{ fontWeight: 'bold', color: '#52c41a' }}>{profile?.id || '-'}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: '600', color: '#333' }}>📅 Terdaftar:</span>
                  <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {profile ? new Date().toLocaleDateString('id-ID') : '-'}
                  </span>
                </div>
              </Space>
            </Card>

            <Card 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e8e8e8'
              }}
            >
              <div style={{ 
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                margin: '-24px -24px 20px -24px',
                padding: '20px',
                borderRadius: '12px 12px 0 0',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                  📊 System Overview
                </div>
              </div>

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  padding: '12px',
                  backgroundColor: '#f6ffed',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <DatabaseOutlined style={{ color: "white", fontSize: '18px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Database Status</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#52c41a" }}>🟢 Healthy</div>
                  </div>
                </div>

                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <UserOutlined style={{ color: "white", fontSize: '18px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Active Users</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#1890ff" }}>
                      👥 {dashboardStats?.totalUsers || 0} Users
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  padding: '12px',
                  backgroundColor: '#f9f0ff',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#722ed1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <BookOutlined style={{ color: "white", fontSize: '18px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Last Backup</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#722ed1" }}>💾 Today</div>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}