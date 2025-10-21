"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, message, Upload, Space, Divider } from "antd";
import { UploadOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
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

export default function GuruProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setProfile(data.user);
      form.setFieldsValue(data.user);
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
      <div style={{ padding: "24px", maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            👨‍🏫 Edit Profil Guru
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Kelola informasi profil Anda
          </p>
        </div>

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

        <Card title="Informasi Akun" style={{ marginTop: 24 }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <strong>Role:</strong> <span style={{ color: '#52c41a' }}>Guru</span>
            </div>
            <div>
              <strong>ID Pengguna:</strong> {profile?.id}
            </div>
            <div>
              <strong>Terdaftar sejak:</strong> {profile ? new Date().toLocaleDateString('id-ID') : '-'}
            </div>
          </Space>
        </Card>
      </div>
    </LayoutApp>
  );
}