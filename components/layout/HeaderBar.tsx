"use client";

import React from "react";
import { Layout, Button, message, Dropdown, Avatar, Modal, notification } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import ForgotPasscodeNotifications from "@/components/notifications/ForgotPasscodeNotifications";
import NotificationPopover from "@/components/notifications/NotificationPopover";
import styles from "./HeaderBar.module.css";

import { useAuth } from "@/hooks/use-auth";

const { Header } = Layout;

// Palette — kept in sync with Sidebar / QuickActions / ProfileContent
const NAVY = "#023047";
const TEAL = "#219ebc";
const GOLD = "#fb8500";
const WARN = "#ffb703";

const ROLE_PROFILE_PATH: Record<string, string> = {
  super_admin: "/super-admin/profil",
  admin: "/admin/profil",
  guru: "/guru/profil",
  santri: "/santri/profil",
  ortu: "/ortu/profil",
  yayasan: "/yayasan/profil",
};

const capitalize = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

interface HeaderBarProps {
  collapsed: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ collapsed }) => {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const user = authUser
    ? {
        id: authUser.id,
        namaLengkap: authUser.namaLengkap,
        username: authUser.username,
        foto: authUser.foto,
        role: typeof authUser.role === "object" ? authUser.role.name : authUser.role,
      }
    : null;

  const handleLogout = () => {
    Modal.confirm({
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "18px",
            fontWeight: 600,
            color: "#1f2937",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: GOLD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <LogoutOutlined style={{ fontSize: 18 }} />
          </div>
          Konfirmasi Logout
        </div>
      ),
      content: (
        <div style={{ padding: "16px 0", fontSize: 16, lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 12px 0", color: "#4b5563" }}>
            Apakah Anda yakin ingin keluar dari sistem?
          </p>
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 12,
              marginTop: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6b7280" }}>
              <UserOutlined style={{ color: TEAL }} />
              <span>
                <strong>User:</strong> {user?.namaLengkap || "Unknown"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              <SettingOutlined style={{ color: TEAL }} />
              <span>
                <strong>Role:</strong> {capitalize(user?.role) || "Unknown"}
              </span>
            </div>
          </div>
        </div>
      ),
      icon: null,
      okText: (
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 }}>
          <LogoutOutlined />
          Ya, Logout
        </span>
      ),
      cancelText: <span style={{ fontSize: 14, fontWeight: 600 }}>Batal</span>,
      okType: "danger",
      width: 480,
      centered: true,
      maskClosable: true,
      autoFocusButton: "cancel",
      style: { borderRadius: 16, overflow: "hidden" },
      styles: { body: { padding: 24, background: "#ffffff" } },
      onOk: async () => {
        notification.open({
          key: "logout-loading",
          message: "Sedang Logout...",
          description: "Mohon tunggu, kami sedang mengeluarkan Anda dengan aman.",
          icon: <LogoutOutlined style={{ color: TEAL }} />,
          duration: 0,
          placement: "topRight",
          style: { borderRadius: 12, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)" },
        });

        try {
          const response = await fetch("/api/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          notification.destroy("logout-loading");

          if (response.ok) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");

            notification.success({
              message: "Logout Berhasil!",
              description: `Terima kasih ${user?.namaLengkap || "User"}, Anda telah berhasil keluar dari sistem AR-Hafalan.`,
              icon: <CheckCircleOutlined style={{ color: TEAL }} />,
              duration: 4,
              placement: "topRight",
              style: { borderRadius: 12, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)" },
            });

            setTimeout(() => {
              router.push("/login");
            }, 1500);
          } else {
            throw new Error("Logout failed");
          }
        } catch (error) {
          console.error("Logout error:", error);

          notification.destroy("logout-loading");

          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");

          notification.warning({
            message: "Logout Paksa",
            description: "Terjadi kesalahan saat logout, namun Anda telah berhasil keluar dari sistem.",
            icon: <ExclamationCircleOutlined style={{ color: WARN }} />,
            duration: 4,
            placement: "topRight",
            style: { borderRadius: 12, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)" },
          });

          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      },
      onCancel: () => {
        message.info({
          content: "Logout dibatalkan",
          duration: 2,
          style: { borderRadius: 8 },
        });
      },
    });
  };

  const goToProfile = () => {
    const role = user?.role?.toLowerCase() || "";
    router.push(ROLE_PROFILE_PATH[role] || "/profile");
  };

  return (
    <Header className={styles.headerContainer}>
      {/* Logo & Brand */}
      <div style={{ marginLeft: 20, display: "flex", alignItems: "center" }}>
        <div className={styles.brandText}>
          PTD-ARRAHMAN
        </div>
      </div>

      {/* Right side container for notification and profile */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {/* Tombol Kembali ke Versi Mobile */}
        <Button
          type="text"
          onClick={() => {
            window.location.href = "/m?mobile=true";
          }}
          className={styles.mobileBtn}
        >
          <MobileOutlined /> Mode Mobile
        </Button>

        {/* Forgot Passcode Notifications - Only for super-admin */}
        <ForgotPasscodeNotifications userRole={user?.role || ""} />

        {/* Notification Popover - For non-super-admin users */}
        {user?.role?.toLowerCase() !== "super_admin" && <NotificationPopover />}

        {/* User Profile Dropdown */}
        <Dropdown
          menu={{
            items: [
              {
                key: "profile-info",
                label: (
                  <div style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ fontWeight: 600, color: TEAL }}>{user?.namaLengkap}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {capitalize(user?.role)} · {user?.username}
                    </div>
                  </div>
                ),
                disabled: true,
              },
              {
                key: "profile-edit",
                icon: <SettingOutlined />,
                label: "Edit Profil",
                onClick: goToProfile,
              },
              { type: "divider" },
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Logout",
                danger: true,
                onClick: handleLogout,
              },
            ],
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button type="text" className={styles.avatarBtn}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar
                size={32}
                src={user?.foto}
                icon={!user?.foto ? <UserOutlined /> : undefined}
                className={styles.avatarImage}
              />
              <div className={styles.avatarTextContainer}>
                <div className={styles.avatarName}>
                  {user?.namaLengkap || "Loading..."}
                </div>
                <div className={styles.avatarRole}>
                  {capitalize(user?.role)}
                </div>
              </div>
            </div>
          </Button>
        </Dropdown>
      </div>
    </Header>
  );
};

export default HeaderBar;