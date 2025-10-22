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
  Tag
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  SaveOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import type { UploadProps } from "antd";

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
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Profil Orang Tua</h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Kelola informasi profil dan lihat data anak Anda
          </p>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Form */}
          <Col xs={24} lg={16}>
            <Card title="Informasi Profil" loading={loading}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Username"
                      name="username"
                      rules={[{ required: true, message: "Username harus diisi" }]}
                    >
                      <Input prefix={<UserOutlined />} disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Nama Lengkap"
                      name="namaLengkap"
                      rules={[{ required: true, message: "Nama lengkap harus diisi" }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { type: "email", message: "Format email tidak valid" }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="No. Telepon"
                      name="noTlp"
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Alamat"
                  name="alamat"
                >
                  <Input.TextArea 
                    rows={3} 
                    prefix={<HomeOutlined />}
                    placeholder="Masukkan alamat lengkap"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Simpan Perubahan
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Profile Photo */}
          <Col xs={24} lg={8}>
            <Card title="Foto Profil">
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={120}
                  src={profile?.foto}
                  icon={<UserOutlined />}
                  style={{ marginBottom: 16 }}
                />
                <div style={{ marginBottom: 16 }}>
                  <Upload {...uploadProps} showUploadList={false}>
                    <Button icon={<UploadOutlined />}>
                      Upload Foto
                    </Button>
                  </Upload>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Format: JPG, PNG (Max: 2MB)
                </div>
              </div>
            </Card>

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
          </Col>
        </Row>

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