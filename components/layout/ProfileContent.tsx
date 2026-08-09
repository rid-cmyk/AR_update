"use client";

import { useEffect, useState } from "react";
import { Card, Avatar, Typography, Button, message, Tabs, Form, Input, Modal } from "antd";
import {
  SaveOutlined,
  UserOutlined,
  UploadOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  IdcardOutlined,
  BarChartOutlined,
  CheckCircleFilled,
  CameraOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import styles from "./ProfileContent.module.css";

const { Title, Text } = Typography;

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

const NAVY = "#023047";
const TEAL = "#219ebc";
const TEAL_SOFT = "rgba(33, 158, 188, 0.15)";
const GOLD = "#fb8500";
const SLATE = "#64748b";
const INK = "#0f172a";

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`${styles.infoRow} ${last ? '' : styles.infoRowBorder}`}>
      <Text strong className={styles.infoLabel}>
        {label}
      </Text>
      {typeof value === "string" ? (
        <Text className={styles.infoValue}>
          {value}
        </Text>
      ) : (
        value
      )}
    </div>
  );
}

export default function ProfileContent({ profile, onProfileUpdate }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<"view" | "edit">("view");
  const [saving, setSaving] = useState(false);
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

  const handleUpdateProfile = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Profil berhasil diperbarui");
        onProfileUpdate();
        setActiveTab("view");
      } else {
        const error = await res.json();
        message.error(error.error || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      form.setFieldsValue({
        namaLengkap: profile.namaLengkap,
        username: profile.username,
        noTlp: profile.noTlp,
      });
    }
    setActiveTab("view");
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await res.json();
        message.success("Foto profil berhasil diupload!");
        onProfileUpdate();
      } else {
        const error = await res.json();
        message.error(error.error || "Gagal mengupload foto profil");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error("Gagal mengupload foto profil");
    }
  };

  const pickAvatarFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        message.error("File harus berupa gambar!");
        return;
      }
      if (file.size / 1024 / 1024 >= 5) {
        message.error("Ukuran file maksimal 5MB!");
        return;
      }
      handleAvatarUpload(file);
    };
    input.click();
  };

  const handleLogout = () => {
    Modal.confirm({
      title: "Konfirmasi Logout",
      icon: <ExclamationCircleOutlined />,
      content: "Apakah Anda yakin ingin keluar dari aplikasi?",
      okText: "Ya, Logout",
      cancelText: "Batal",
      onOk: async () => {
        try {
          const response = await fetch("/api/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            message.success("Logout berhasil");
            router.push("/login");
          } else {
            throw new Error("Logout failed");
          }
        } catch (error) {
          console.error("Logout error:", error);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          message.warning("Anda telah keluar dari sistem.");
          router.push("/login");
        }
      },
    });
  };

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>Profil tidak ditemukan</div>
    );
  }

  const roleName = profile.role.name.charAt(0).toUpperCase() + profile.role.name.slice(1);

  return (
    <div className={styles.profileContainer}>
      <Card
        className={styles.mainCard}
        styles={{ body: { background: "transparent", padding: "40px 32px" } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as "view" | "edit")}
          size="large"
          tabBarStyle={{
            borderBottom: `2px solid ${TEAL_SOFT}`,
            paddingBottom: 8,
            marginBottom: 24,
          }}
          tabBarGutter={32}
          items={[
            {
              key: "view",
              label: (
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: NAVY,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <EyeOutlined /> Lihat Profil
                </span>
              ),
              children: (
                <>
                  <div style={{ textAlign: "center", marginBottom: 50 }}>
                    <div className={styles.avatarWrapper}>
                      <Avatar
                        size={160}
                        src={profile.foto}
                        icon={!profile.foto ? <UserOutlined /> : undefined}
                        className={styles.avatarImage}
                      />
                      <div className={styles.verifiedBadge}>
                        <CheckCircleFilled style={{ color: "white", fontSize: 18 }} />
                      </div>
                    </div>

                    <Title level={2} className={styles.profileName}>
                      {profile.namaLengkap}
                    </Title>

                    <div className={styles.roleBadge}>
                      <Text className={styles.roleText}>
                        @{profile.username} · {roleName}
                      </Text>
                    </div>
                  </div>

                  <div className={styles.infoCardsGrid}>
                    <Card
                      className={styles.infoCard}
                      styles={{ body: { padding: 28 } }}
                    >
                      <Title level={4} className={styles.cardTitle}>
                        <IdcardOutlined /> Informasi Personal
                      </Title>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <InfoRow label="Nama Lengkap" value={profile.namaLengkap} />
                        <InfoRow label="Username" value={`@${profile.username}`} />
                        <InfoRow
                          label="Role"
                          value={
                            <Text className={styles.roleTag}>
                              {roleName}
                            </Text>
                          }
                        />
                        <InfoRow label="No. Telepon" value={profile.noTlp || "-"} last />
                      </div>
                    </Card>

                    <Card
                      className={styles.infoCard}
                      styles={{ body: { padding: 28 } }}
                    >
                      <Title level={4} className={styles.cardTitle}>
                        <BarChartOutlined /> Aktivitas Akun
                      </Title>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <InfoRow
                          label="Bergabung Sejak"
                          value={new Date(profile.createdAt).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        />
                        <InfoRow
                          label="Terakhir Update"
                          value={new Date(profile.updatedAt).toLocaleDateString("id-ID", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        />
                        <InfoRow
                          label="Status Akun"
                          value={
                            <div className={styles.statusActive}>
                              <CheckCircleFilled /> Aktif
                            </div>
                          }
                          last
                        />
                      </div>
                    </Card>
                  </div>
                </>
              ),
            },
            {
              key: "edit",
              label: (
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: NAVY,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <EditOutlined /> Edit Profil
                </span>
              ),
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                  style={{ maxWidth: 600, margin: "0 auto" }}
                >
                  <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div className={styles.editAvatarWrapper}>
                      <Avatar
                        size={140}
                        src={profile.foto}
                        icon={!profile.foto ? <UserOutlined /> : undefined}
                        className={styles.editAvatarImage}
                      />
                      <div
                        role="button"
                        aria-label="Ubah foto profil"
                        onClick={pickAvatarFile}
                        className={styles.avatarUploadBtn}
                      >
                        <UploadOutlined style={{ color: "white", fontSize: 18 }} />
                      </div>
                    </div>
                    <div>
                      <Text className={styles.uploadHint}>
                        <CameraOutlined /> Klik ikon untuk mengubah foto profil
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

                  <Form.Item name="noTlp" label="No. Telepon">
                    <Input size="large" placeholder="Masukkan nomor telepon (opsional)" />
                  </Form.Item>

                  <Form.Item style={{ textAlign: "center", marginTop: 32 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      size="large"
                      loading={saving}
                      className={styles.btnSave}
                    >
                      Simpan Perubahan
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      icon={<CloseOutlined />}
                      size="large"
                      className={styles.btnCancel}
                    >
                      Batal
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />

        {/* Logout */}
        {/* ProfileLogoutSection removed */}
      </Card>
    </div>
  );
}