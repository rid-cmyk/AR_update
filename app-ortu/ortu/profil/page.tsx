"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Form, Input, Button, message, Avatar, Upload, Divider } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, CameraOutlined, SaveOutlined } from "@ant-design/icons";
import LayoutApp from "../../../components/LayoutApp";
import type { UploadProps } from 'antd';

interface UserProfile {
  id: number;
  namaLengkap: string;
  username: string;
  email?: string;
  noTlp?: string;
  alamat?: string;
  foto?: string;
}

export default function OrtuProfilPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      setUserData(data.user);

      // Set form values
      form.setFieldsValue({
        namaLengkap: data.user.namaLengkap,
        username: data.user.username,
        email: data.user.email || '',
        noTlp: data.user.noTlp || '',
        alamat: data.user.alamat || ''
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      message.error("Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/users/${userData?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!res.ok) throw new Error("Failed to update profile");

      message.success("Profil berhasil diperbarui");
      fetchUserProfile(); // Refresh data
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  // Upload props for avatar
  const uploadProps: UploadProps = {
    name: 'avatar',
    action: '/api/profile/upload-avatar',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success('Foto profil berhasil diperbarui');
        fetchUserProfile(); // Refresh data
      } else if (info.file.status === 'error') {
        message.error('Gagal mengupload foto profil');
      }
    },
    showUploadList: false,
    accept: 'image/*'
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0 }}>Profil</h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>
              Kelola informasi profil Anda
            </p>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Picture Section */}
          <Col xs={24} md={8}>
            <Card
              title="Foto Profil"
              bordered={false}
              style={{ textAlign: 'center' }}
            >
              <Avatar
                size={120}
                src={userData?.foto}
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Upload {...uploadProps}>
                <Button icon={<CameraOutlined />}>
                  Ubah Foto
                </Button>
              </Upload>
              <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Format: JPG, PNG, Max: 2MB
              </p>
            </Card>
          </Col>

          {/* Profile Information Form */}
          <Col xs={24} md={16}>
            <Card
              title="Informasi Pribadi"
              bordered={false}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                disabled={loading}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Nama Lengkap"
                      name="namaLengkap"
                      rules={[{ required: true, message: 'Nama lengkap wajib diisi' }]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Masukkan nama lengkap"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Username"
                      name="username"
                      rules={[{ required: true, message: 'Username wajib diisi' }]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Masukkan username"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { type: 'email', message: 'Format email tidak valid' }
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="Masukkan email"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Nomor Telepon"
                      name="noTlp"
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Masukkan nomor telepon"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Alamat"
                  name="alamat"
                >
                  <Input.TextArea
                    prefix={<HomeOutlined />}
                    placeholder="Masukkan alamat lengkap"
                    rows={3}
                  />
                </Form.Item>

                <Divider />

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving}
                    size="large"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Account Information */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card
              title="Informasi Akun"
              bordered={false}
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Role</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>Orang Tua</div>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>ID Pengguna</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>#{userData?.id}</div>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div style={{ padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Status Akun</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>Aktif</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}