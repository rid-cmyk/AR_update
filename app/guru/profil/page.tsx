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
  Space,
  Divider,
  Typography,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UploadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";
import type { UploadProps } from 'antd';

const { Title } = Typography;

interface UserProfile {
  id: number;
  namaLengkap: string;
  username: string;
  noTlp?: string;
  foto?: string;
  role?: {
    name: string;
  };
}

export default function ProfilPage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        form.setFieldsValue({
          namaLengkap: data.user.namaLengkap,
          username: data.user.username,
          noTlp: data.user.noTlp || ''
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${profile?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!res.ok) throw new Error("Failed to update profile");

      message.success("Profil berhasil diperbarui");
      fetchProfile(); // Refresh data
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (values: any) => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Password berhasil diubah");
        passwordForm.resetFields();
      } else {
        const error = await res.json();
        message.error(error.message || "Gagal mengubah password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      message.error("Error mengubah password");
    } finally {
      setLoading(false);
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
        fetchProfile(); // Refresh data
      } else if (info.file.status === 'error') {
        message.error('Gagal mengupload foto profil');
      }
    },
    showUploadList: false,
    accept: 'image/*'
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <Title level={2}>Profil & Pengaturan</Title>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Profile Card */}
          <Card title="Informasi Profil" loading={loading}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Upload {...uploadProps}>
                <Avatar
                  size={100}
                  src={profile?.foto}
                  icon={<UserOutlined />}
                  style={{ cursor: "pointer" }}
                />
                <div style={{ marginTop: 8 }}>
                  <UploadOutlined /> Ubah Foto
                </div>
              </Upload>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
            >
              <Form.Item
                label="Nama Lengkap"
                name="namaLengkap"
                rules={[{ required: true, message: "Nama lengkap wajib diisi" }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: "Username wajib diisi" }]}
              >
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>


              <Form.Item
                label="No. Telepon"
                name="noTlp"
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  block
                >
                  Simpan Perubahan
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Security Card */}
          <Card title="Keamanan Akun">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Form.Item
                label="Password Lama"
                name="oldPassword"
                rules={[{ required: true, message: "Password lama wajib diisi" }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                label="Password Baru"
                name="newPassword"
                rules={[
                  { required: true, message: "Password baru wajib diisi" },
                  { min: 6, message: "Password minimal 6 karakter" }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                label="Konfirmasi Password Baru"
                name="confirmPassword"
                rules={[
                  { required: true, message: "Konfirmasi password wajib diisi" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Password tidak cocok'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<LockOutlined />}
                  loading={loading}
                  block
                >
                  Ubah Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

        {/* System Info */}
        <Card title="Informasi Sistem" style={{ marginTop: 24 }}>
          <Space direction="vertical">
            <div>
              <strong>Versi Aplikasi:</strong> 1.0.0
            </div>
            <div>
              <strong>Terakhir Login:</strong> {new Date().toLocaleString('id-ID')}
            </div>
            <div>
              <strong>Status Akun:</strong> <span style={{ color: "#52c41a" }}>Aktif</span>
            </div>
          </Space>
        </Card>
      </div>
    </LayoutApp>
  );
}