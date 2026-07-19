"use client";

import React, { useEffect, useState } from "react";
import { Layout, Button, message, Dropdown, Avatar, Modal, notification } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, SettingOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import ForgotPasscodeNotifications from "@/components/notifications/ForgotPasscodeNotifications";
import NotificationPopover from "@/components/notifications/NotificationPopover";

const { Header } = Layout;

interface HeaderBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}


interface UserProfile {
  id: number;
  namaLengkap: string;
  username: string;
  foto?: string;
  role: string; // Changed from object to string since API returns role name directly
}

const HeaderBar: React.FC<HeaderBarProps> = ({ collapsed, setCollapsed }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Notifications now handled by NotificationPopover component
  const router = useRouter();


  // 👤 Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch("/api/auth/me", {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          console.warn("Failed to fetch user profile: HTTP", res.status);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Failed to fetch user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  // Notification count & announcements are now handled by NotificationPopover component

  // 🚪 Logout function with modern popup
  const handleLogout = () => {
    Modal.confirm({
      title: (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <LogoutOutlined style={{ fontSize: '18px' }} />
          </div>
          Konfirmasi Logout
        </div>
      ),
      content: (
        <div style={{
          padding: '16px 0',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          <p style={{
            margin: '0 0 12px 0',
            color: '#4b5563'
          }}>
            Apakah Anda yakin ingin keluar dari sistem?
          </p>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <UserOutlined style={{ color: '#3b82f6' }} />
              <span><strong>User:</strong> {user?.namaLengkap || 'Unknown'}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#6b7280',
              marginTop: '4px'
            }}>
              <SettingOutlined style={{ color: '#10b981' }} />
              <span><strong>Role:</strong> {user?.role || 'Unknown'}</span>
            </div>
          </div>
        </div>
      ),
      icon: null,
      okText: (
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <LogoutOutlined />
          Ya, Logout
        </span>
      ),
      cancelText: (
        <span style={{
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Batal
        </span>
      ),
      okType: 'danger',
      width: 480,
      centered: true,
      maskClosable: true,
      autoFocusButton: 'cancel',
      style: {
        borderRadius: '16px',
        overflow: 'hidden'
      },
      bodyStyle: {
        padding: '24px',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
      },
      onOk: async () => {
        // Show loading notification
        notification.open({
          key: 'logout-loading',
          message: 'Sedang Logout...',
          description: 'Mohon tunggu, kami sedang mengeluarkan Anda dengan aman.',
          icon: <LogoutOutlined style={{ color: '#1890ff' }} />,
          duration: 0, // Don't auto close
          placement: 'topRight',
          style: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        });

        try {
          // Call logout API
          const response = await fetch("/api/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            }
          });

          // Close loading notification
          notification.destroy('logout-loading');

          if (response.ok) {
            // Clear local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');

            // Show success notification
            notification.success({
              message: 'Logout Berhasil!',
              description: `Terima kasih ${user?.namaLengkap || 'User'}, Anda telah berhasil keluar dari sistem AR-Hafalan.`,
              icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              duration: 4,
              placement: 'topRight',
              style: {
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                background: 'linear-gradient(145deg, #f6ffed 0%, #d9f7be 100%)',
                border: '1px solid #b7eb8f'
              }
            });

            // Redirect to login after a short delay
            setTimeout(() => {
              router.push("/login");
            }, 1500);
          } else {
            throw new Error("Logout failed");
          }
        } catch (error) {
          console.error("Logout error:", error);

          // Close loading notification
          notification.destroy('logout-loading');

          // Clear local storage anyway for security
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');

          // Show error notification but still redirect
          notification.warning({
            message: 'Logout Paksa',
            description: 'Terjadi kesalahan saat logout, namun Anda telah berhasil keluar dari sistem.',
            icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
            duration: 4,
            placement: 'topRight',
            style: {
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            }
          });

          // Force redirect to login even if logout fails
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      },
      onCancel: () => {
        // Show cancel notification
        message.info({
          content: 'Logout dibatalkan',
          duration: 2,
          style: {
            borderRadius: '8px'
          }
        });
      }
    });
  };




  return (
    <Header
      style={{
        padding: "0 24px",
        background: "linear-gradient(135deg, #001529 0%, #002140 50%, #003a70 100%)",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        height: 64,
      }}
    >
      {/* Tombol Sidebar */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: "18px",
          width: 48,
          height: 48,
          color: "#fff",
          borderRadius: 12,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "rgba(255, 255, 255, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "scale(1.05) translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
          e.currentTarget.style.transform = "scale(1) translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
        }}
      />

      {/* Logo & Brand */}
      <div style={{
        marginLeft: 20,
        display: "flex",
        alignItems: "center",
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: 20,
          color: "#fff",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, #fff 0%, #e6f7ff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Ar-Hapalan
        </div>
      </div>


      {/* Right side container for notification and profile */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>


        {/* Forgot Passcode Notifications - Only for super-admin */}
        <ForgotPasscodeNotifications userRole={user?.role || ''} />

        {/* Notification Popover - For non-super-admin users */}
        {user?.role?.toLowerCase() !== 'super-admin' && (
          <NotificationPopover />
        )}



        {/* User Profile Dropdown - Enhanced Design */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'profile-info',
                label: (
                  <div style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ fontWeight: 600, color: "#1890ff" }}>
                      {user?.namaLengkap}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} • {user?.username}
                    </div>
                  </div>
                ),
                disabled: true
              },
              {
                key: 'profile-edit',
                icon: <SettingOutlined />,
                label: 'Edit Profil',
                onClick: () => {
                  const role = user?.role?.toLowerCase();
                  if (role === 'super-admin') {
                    router.push('/super-admin/profil');
                  } else if (role === 'admin') {
                    router.push('/admin/profil');
                  } else if (role === 'guru') {
                    router.push('/guru/profil');
                  } else if (role === 'santri') {
                    router.push('/santri/profil');
                  } else if (role === 'ortu') {
                    router.push('/ortu/profil');
                  } else if (role === 'yayasan') {
                    router.push('/yayasan/profil');
                  } else {
                    router.push('/profile');
                  }
                },
              },
              {
                type: 'divider',
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                danger: true,
                onClick: handleLogout,
              },
            ],
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button
            type="text"
            style={{
              height: 48,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderRadius: 14,
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
            }}
          >
            <Avatar
              size={32}
              src={user?.foto}
              icon={!user?.foto ? <UserOutlined /> : undefined}
              style={{
                border: "2px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
              }}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.namaLengkap || 'Loading...'}
              </div>
              <div style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500,
                textShadow: "0 1px 2px rgba(0,0,0,0.2)"
              }}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
              </div>
            </div>
          </Button>
        </Dropdown>
      </div>



      <style jsx>{`


        /* Enhanced scrollbar styling for modals */
        :global(.ant-modal-body) {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }

        :global(.ant-modal-body::-webkit-scrollbar) {
          width: 6px;
        }

        :global(.ant-modal-body::-webkit-scrollbar-track) {
          background: transparent;
        }

        :global(.ant-modal-body::-webkit-scrollbar-thumb) {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        :global(.ant-modal-body::-webkit-scrollbar-thumb:hover) {
          background-color: rgba(0, 0, 0, 0.3);
        }

        /* Enhanced dropdown styling */
        :global(.ant-dropdown) {
          backdrop-filter: blur(20px);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        :global(.ant-dropdown .ant-dropdown-menu) {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          padding: 8px;
        }

        :global(.ant-dropdown .ant-dropdown-menu-item) {
          border-radius: 8px;
          margin: 2px 0;
          transition: all 0.2s ease;
        }

        :global(.ant-dropdown .ant-dropdown-menu-item:hover) {
          background: rgba(24, 144, 255, 0.1);
        }
      `}</style>
    </Header>
  );
};

export default HeaderBar;
