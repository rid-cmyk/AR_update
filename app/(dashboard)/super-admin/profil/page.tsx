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
          <Col xs={24} lg={12}>
            <Card
              title="Informasi Profil"
              extra={
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => form.submit()}
                  loading={saving}
                >
                  Simpan Perubahan
                </Button>
              }
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={profile || {}}
              >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Form.Item name="foto">
                    <Upload {...uploadProps}>
                      {profile?.foto ? (
                        <img
                          src={profile.foto}
                          alt="Profile"
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <UserOutlined style={{ fontSize: 32, color: '#999' }} />
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    Klik untuk mengubah foto profil
                  </p>
                </div>

                <Divider />

                <Form.Item
                  label="Nama Lengkap"
                  name="namaLengkap"
                  rules={[{ required: true, message: "Nama lengkap wajib diisi" }]}
                >
                  <Input placeholder="Masukkan nama lengkap" />
                </Form.Item>

                <Form.Item
                  label="Username"
                  name="username"
                  rules={[{ required: true, message: "Username wajib diisi" }]}
                >
                  <Input placeholder="Masukkan username" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Email wajib diisi" },
                    { type: 'email', message: "Format email tidak valid" }
                  ]}
                >
                  <Input placeholder="Masukkan email" />
                </Form.Item>

                <Form.Item
                  label="Nomor Telepon"
                  name="noTlp"
                >
                  <Input placeholder="Masukkan nomor telepon" />
                </Form.Item>

                <Form.Item
                  label="Alamat"
                  name="alamat"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Masukkan alamat lengkap"
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Informasi Akun" style={{ marginBottom: 24 }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <strong>Role:</strong> <span style={{ color: '#d4380d' }}>Super Admin</span>
                </div>
                <div>
                  <strong>ID Pengguna:</strong> {profile?.id}
                </div>
                <div>
                  <strong>Terdaftar sejak:</strong> {profile ? new Date().toLocaleDateString('id-ID') : '-'}
                </div>
              </Space>
            </Card>

            <Card title="System Overview" bordered={false}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DatabaseOutlined style={{ color: "#52c41a", marginRight: 12, fontSize: '18px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Database Status</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#52c41a" }}>Healthy</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <UserOutlined style={{ color: "#1890ff", marginRight: 12, fontSize: '18px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Active Users</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#1890ff" }}>{dashboardStats?.totalUsers || 0}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <BookOutlined style={{ color: "#722ed1", marginRight: 12, fontSize: '18px' }} />
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Last Backup</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: "#722ed1" }}>Today</div>
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