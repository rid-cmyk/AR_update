"use client";

import { useEffect, useState } from "react";
import { Card, Typography, Button, message, Tabs, Form, Modal } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import styles from "./ProfileContent.module.css";
import { UserProfile, ProfileContentProps, NAVY, TEAL_SOFT } from "./profileContentTypes";
import ProfileView from "./ProfileView";
import ProfileEdit from "./ProfileEdit";

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
          const response = await fetch("/api/auth/logout", {
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

  const tabLabel = (icon: React.ReactNode, text: string) => (
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
      {icon} {text}
    </span>
  );

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
              label: tabLabel(<EyeOutlined />, "Lihat Profil"),
              children: <ProfileView profile={profile} />,
            },
            {
              key: "edit",
              label: tabLabel(<EditOutlined />, "Edit Profil"),
              children: (
                <ProfileEdit
                  form={form}
                  profile={profile}
                  saving={saving}
                  onPickAvatarFile={pickAvatarFile}
                  onFinish={handleUpdateProfile}
                  onCancel={handleCancelEdit}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
