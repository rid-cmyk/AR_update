"use client";

import { useEffect, useState } from "react";
import { Card, Avatar, Typography, Button, message, Tabs, Form, Input, Upload, Modal } from "antd";
import { EditOutlined, SaveOutlined, UserOutlined, UploadOutlined, LogoutOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface UserProfile {
  id: number;
  namaLengkap: string;
  username: string;
  foto?: string;
  noTlp?: string;
  role: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProfileContentProps {
  profile: UserProfile | null;
  onProfileUpdate: () => void;
}

export default function ProfileContent({ profile, onProfileUpdate }: ProfileContentProps) {
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        namaLengkap: profile.namaLengkap,
        username: profile.username,
        noTlp: profile.noTlp,
      });
    }
  }, [profile, form]);

  const handleUpdateProfile = async (values: any) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Profile updated successfully");
        setEditing(false);
        onProfileUpdate(); // Refresh profile data
      } else {
        const error = await res.json();
        message.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        message.success("Foto profil berhasil diupload!");
        onProfileUpdate(); // Refresh profile data to show new avatar
      } else {
        const error = await res.json();
        message.error(error.error || "Gagal mengupload foto profil");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error("Gagal mengupload foto profil");
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Konfirmasi Logout',
      icon: <ExclamationCircleOutlined />,
      content: 'Apakah Anda yakin ingin keluar dari aplikasi?',
      okText: 'Ya, Logout',
      cancelText: 'Batal',
      onOk: () => {
        // Redirect to logout page which handles the proper logout flow
        router.push("/logout");
      },
    });
  };

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Profile not found
      </div>
    );
  }

  return (
    <div style={{
      padding: "24px 0",
      maxWidth: 1400,
      margin: "0 auto",
      background: "linear-gradient(135deg, #001529 0%, #003a70 50%, #0052a3 100%)",
      minHeight: "100vh",
      borderRadius: "20px 20px 0 0",
      marginTop: -24,
      paddingTop: 48
    }}>
      <Card
        style={{
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          background: "rgba(255,255,255,0.98)",
          border: "none",
          backdropFilter: "blur(20px)",
          margin: "0 16px"
        }}
        styles={{ 
          body: {
            background: "transparent",
            padding: "40px 32px"
          }
        }}
      >
        <Tabs
          defaultActiveKey="view"
          size="large"
          tabBarStyle={{
            borderBottom: "2px solid rgba(102, 126, 234, 0.1)",
            paddingBottom: 8,
            marginBottom: 24
          }}
          tabBarGutter={32}
        >
          <TabPane
            tab={
              <span style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#667eea",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                👁️ Lihat Profil
              </span>
            }
            key="view"
          >
            <div style={{ textAlign: "center", marginBottom: 50 }}>
              <div style={{
                position: "relative",
                display: "inline-block",
                marginBottom: 32
              }}>
                <Avatar
                  size={160}
                  src={profile.foto}
                  icon={!profile.foto ? <UserOutlined /> : undefined}
                  style={{
                    border: "8px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 16px 50px rgba(102, 126, 234, 0.4)",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontSize: 56,
                  }}
                />
                <div style={{
                  position: "absolute",
                  bottom: -10,
                  right: -10,
                  background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(82, 196, 26, 0.4)",
                  border: "4px solid rgba(255,255,255,0.95)"
                }}>
                  <span style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>✓</span>
                </div>
              </div>

              <Title level={1} style={{
                marginTop: 0,
                marginBottom: 12,
                color: "#1a1a1a",
                fontSize: 36,
                fontWeight: 800,
                textShadow: "0 3px 6px rgba(0,0,0,0.15)",
                letterSpacing: "-0.5px"
              }}>
                {profile.namaLengkap}
              </Title>

              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "10px 24px",
                borderRadius: 30,
                display: "inline-block",
                marginBottom: 32,
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.3)"
              }}>
                <Text style={{
                  fontSize: 18,
                  color: "white",
                  fontWeight: 700,
                  textShadow: "0 1px 3px rgba(0,0,0,0.3)"
                }}>
                  @{profile.username} • {profile.role.name.charAt(0).toUpperCase() + profile.role.name.slice(1)}
                </Text>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: 32,
              marginTop: 40
            }}>
              <Card
                style={{
                  borderRadius: 20,
                  border: "none",
                  boxShadow: "0 12px 35px rgba(102, 126, 234, 0.15)",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.95) 100%)",
                  minHeight: 320,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                styles={{ body: { padding: 32 } }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 16px 45px rgba(102, 126, 234, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.15)";
                }}
              >
                <Title level={3} style={{
                  color: "#667eea",
                  marginBottom: 24,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 20
                }}>
                  👤 Informasi Personal
                </Title>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(102, 126, 234, 0.1)"
                  }}>
                    <Text strong style={{ color: "#666", fontSize: 15 }}>Nama Lengkap:</Text>
                    <Text style={{ color: "#1a1a1a", fontWeight: 600, fontSize: 15 }}>{profile.namaLengkap}</Text>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(102, 126, 234, 0.1)"
                  }}>
                    <Text strong style={{ color: "#666", fontSize: 15 }}>Username:</Text>
                    <Text style={{ color: "#1a1a1a", fontWeight: 600, fontSize: 15 }}>@{profile.username}</Text>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(102, 126, 234, 0.1)"
                  }}>
                    <Text strong style={{ color: "#666", fontSize: 15 }}>Role:</Text>
                    <Text style={{
                      color: "#667eea",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                      padding: "6px 16px",
                      borderRadius: 16,
                      fontSize: 13,
                      border: "1px solid rgba(102, 126, 234, 0.2)"
                    }}>
                      {profile.role.name.charAt(0).toUpperCase() + profile.role.name.slice(1)}
                    </Text>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0"
                  }}>
                    <Text strong style={{ color: "#666", fontSize: 15 }}>No. Telepon:</Text>
                    <Text style={{ color: "#1a1a1a", fontWeight: 600, fontSize: 15 }}>{profile.noTlp || "-"}</Text>
                  </div>
                </div>
              </Card>

              <Card
                style={{
                  borderRadius: 20,
                  border: "none",
                  boxShadow: "0 12px 35px rgba(102, 126, 234, 0.15)",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.95) 100%)",
                  minHeight: 320,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                styles={{ body: { padding: 32 } }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 16px 45px rgba(102, 126, 234, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.15)";
                }}
              >
                <Title level={3} style={{
                  color: "#667eea",
                  marginBottom: 24,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 20
                }}>
                  📊 Aktivitas Akun
                </Title>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(102, 126, 234, 0.1)"
                  }}>
                    <Text strong style={{ color: "#666", fontSize: 15 }}>Bergabung Sejak:</Text>
                    <Text style={{ color: "#1a1a1a", fontWeight: 600, fontSize: 15 }}>
                      {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(102, 126, 234, 0.1)"
                  }}>
                    <Text strong style={{ color: "#666", fontSize: 15 }}>Terakhir Update:</Text>
                    <Text style={{ color: "#1a1a1a", fontWeight: 600, fontSize: 15 }}>
                      {new Date(profile.updatedAt).toLocaleDateString('id-ID', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0"
                  }}>
                    <Text strong style={{ color: "#666", fontSize: 15 }}>Status Akun:</Text>
                    <div style={{
                      background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                      color: "white",
                      padding: "6px 16px",
                      borderRadius: 16,
                      fontSize: 13,
                      fontWeight: 700,
                      boxShadow: "0 4px 12px rgba(82, 196, 26, 0.2)"
                    }}>
                      ✓ Aktif
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#667eea",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                ✏️ Edit Profil
              </span>
            }
            key="edit"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              style={{ maxWidth: 600, margin: "0 auto" }}
            >
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{
                  position: "relative",
                  display: "inline-block",
                  marginBottom: 24
                }}>
                  <Avatar
                    size={140}
                    src={profile.foto}
                    icon={!profile.foto ? <UserOutlined /> : undefined}
                    style={{
                      border: "6px solid rgba(255,255,255,0.95)",
                      boxShadow: "0 12px 40px rgba(102, 126, 234, 0.4)",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontSize: 52,
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: -10,
                    right: -10,
                    background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    borderRadius: "50%",
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px rgba(82, 196, 26, 0.4)",
                    border: "4px solid rgba(255,255,255,0.95)",
                    cursor: "pointer",
                    transition: "transform 0.2s ease"
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const isImage = file.type.startsWith('image/');
                        if (!isImage) {
                          message.error('File harus berupa gambar!');
                          return;
                        }
                        const isLt5M = file.size / 1024 / 1024 < 5;
                        if (!isLt5M) {
                          message.error('Ukuran file maksimal 5MB!');
                          return;
                        }
                        handleAvatarUpload(file);
                      }
                    };
                    input.click();
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  >
                    <UploadOutlined style={{ color: "white", fontSize: 18 }} />
                  </div>
                </div>
                <div style={{
                  background: "linear-gradient(135deg, #001529 0%, #003a70 100%)",
                  padding: "8px 20px",
                  borderRadius: 25,
                  display: "inline-block",
                  marginBottom: 24,
                  boxShadow: "0 6px 20px rgba(0, 53, 105, 0.3)"
                }}>
                  <Text style={{
                    fontSize: 16,
                    color: "white",
                    fontWeight: 700,
                    textShadow: "0 1px 3px rgba(0,0,0,0.3)"
                  }}>
                    📸 Klik ikon kamera untuk ubah foto profil
                  </Text>
                </div>
              </div>

              <Form.Item
                name="namaLengkap"
                label="Nama Lengkap"
                rules={[{ required: true, message: "Nama lengkap wajib diisi" }]}
              >
                <Input size="large" placeholder="Masukkan nama lengkap Anda" />
              </Form.Item>

              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Username wajib diisi" }]}
              >
                <Input size="large" placeholder="Masukkan username Anda" />
              </Form.Item>

              <Form.Item
                name="noTlp"
                label="No. Telepon"
              >
                <Input size="large" placeholder="Masukkan nomor telepon (opsional)" />
              </Form.Item>

              <Form.Item style={{ textAlign: "center", marginTop: 40 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  style={{
                    marginRight: 16,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: "bold",
                    fontSize: 16,
                    padding: "12px 32px",
                    height: "auto",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
                  }}
                >
                  💾 Simpan Perubahan
                </Button>
                <Button
                  onClick={() => setEditing(false)}
                  size="large"
                  style={{
                    borderRadius: 12,
                    fontWeight: "bold",
                    fontSize: 16,
                    padding: "12px 32px",
                    height: "auto",
                    border: "2px solid #d9d9d9",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#667eea";
                    e.currentTarget.style.color = "#667eea";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#d9d9d9";
                    e.currentTarget.style.color = "rgba(0, 0, 0, 0.85)";
                  }}
                >
                  ❌ Batal
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>

        {/* Logout Button */}
        <div style={{
          textAlign: "center",
          marginTop: 50,
          paddingTop: 40,
          borderTop: "3px solid rgba(102, 126, 234, 0.15)",
          position: "relative"
        }}>
          <div style={{
            position: "absolute",
            top: -16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #001529 0%, #003a70 100%)",
            color: "white",
            padding: "6px 20px",
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(0, 53, 105, 0.4)",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)"
          }}>
            🚪 Keluar Aplikasi
          </div>

          <Button
            danger
            size="large"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
              border: "none",
              borderRadius: 20,
              fontWeight: "bold",
              boxShadow: "0 10px 30px rgba(255, 107, 107, 0.4)",
              padding: "18px 48px",
              fontSize: 18,
              height: "auto",
              transition: "all 0.3s ease",
              marginTop: 8
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 107, 107, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(255, 107, 107, 0.4)";
            }}
          >
            🚪 Logout dari Ar-Hapalan
          </Button>

          <Text type="secondary" style={{
            display: "block",
            marginTop: 16,
            fontSize: 14,
            color: "#999",
            fontWeight: 500
          }}>
            Anda akan diarahkan kembali ke halaman login
          </Text>
        </div>
      </Card>
    </div>
  );
}
