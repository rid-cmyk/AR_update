/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Layout, Button, message, Select, Dropdown, Avatar, Space, Badge, Modal, List, Typography, notification } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, SettingOutlined, BellOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import ForgotPasscodeNotifications from "@/components/notifications/ForgotPasscodeNotifications";

const { Header } = Layout;
const { Option } = Select;
const { Text } = Typography;

interface HeaderBarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  bgColor: string;
}

interface PrayerTimes {
  Subuh: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
}

interface UserProfile {
  id: number;
  namaLengkap: string;
  username: string;
  foto?: string;
  role: string; // Changed from object to string since API returns role name directly
}

const HeaderBar: React.FC<HeaderBarProps> = ({ collapsed, setCollapsed, bgColor }) => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [cityName, setCityName] = useState<string>("Memuat...");
  const [activePrayer, setActivePrayer] = useState<string>("");
  const [cityCode, setCityCode] = useState<string>("1108");
  const [user, setUser] = useState<UserProfile | null>(null);

  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [latestAnnouncements, setLatestAnnouncements] = useState<any[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const router = useRouter();

  // 🌍 Ambil lokasi user lalu cocokkan ke MyQuran API untuk dapat cityCode
  useEffect(() => {
    // Skip geolocation API if it's causing issues - use default
    const SKIP_GEOLOCATION = false; // Set to true to disable geolocation

    if (SKIP_GEOLOCATION || !navigator.geolocation) {
      console.warn("Geolocation dilewati atau tidak didukung, menggunakan default Jakarta");
      setCityCode(cityCode);
      setCityName("Jakarta");
      fetchPrayerTimes(cityCode);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // Further reduce to 3 seconds

          const res = await fetch(`https://api.myquran.com/v2/sholat/coordinates/${latitude}/${longitude}`, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();

          // Handle different possible response formats
          if (data.status && data.data && data.data.id) {
            setCityCode(data.data.id);
            setCityName(data.data.lokasi);
          } else if (data.data && data.data.id) {
            // Alternative format without status
            setCityCode(data.data.id);
            setCityName(data.data.lokasi || data.data.name);
          } else if (data.id) {
            // Direct format
            setCityCode(data.id);
            setCityName(data.lokasi || data.name);
          } else {
            console.warn('Unexpected API response format, using default');
            throw new Error('Invalid API response format');
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            console.warn("Geolocation API timeout, using default location");
          } else {
            console.warn("Geolocation API error, using default location:", err instanceof Error ? err.message : 'Unknown error');
          }
          // Set default city info
          setCityCode(cityCode);
          setCityName("Jakarta");
          // Fallback to default city code without showing error to user
          fetchPrayerTimes(cityCode);
        }
      },
      (err) => {
        console.warn("Geolocation permission denied or error, using default:", err.message);
        // Set default and fetch prayer times
        setCityCode(cityCode);
        setCityName("Jakarta");
        fetchPrayerTimes(cityCode);
      },
      {
        timeout: 5000, // 5 second timeout for geolocation
        enableHighAccuracy: false, // Faster, less accurate
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Ambil jadwal sholat dari MyQuran dengan fallback
  const fetchPrayerTimes = async (code: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${code}/${today}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.status && data.data && data.data.jadwal) {
        setCityName(data.data.lokasi || "Jakarta");
        setTimes({
          Subuh: data.data.jadwal.subuh,
          Dzuhur: data.data.jadwal.dzuhur,
          Ashar: data.data.jadwal.ashar,
          Maghrib: data.data.jadwal.maghrib,
          Isya: data.data.jadwal.isya,
        });
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error("Error fetching prayer times:", error);

      // Fallback to default prayer times for Jakarta
      const fallbackTimes = {
        Subuh: "04:30",
        Dzuhur: "12:00",
        Ashar: "15:15",
        Maghrib: "18:00",
        Isya: "19:15",
      };

      setCityName("Jakarta (Default)");
      setTimes(fallbackTimes);

      // Only show error message if it's a network error, not timeout
      if (error instanceof Error && !error.message.includes('aborted')) {
        console.warn("Menggunakan jadwal sholat default untuk Jakarta");
      }
    }
  };

  // 📌 Fetch ulang kalau cityCode berubah (misalnya lokasi berhasil didapat)
  useEffect(() => {
    if (cityCode) fetchPrayerTimes(cityCode);
  }, [cityCode]);

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

  // 🔔 Fetch notification count (skip for super-admin)
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch("/api/notifications/count", {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          setNotificationCount(data.count || 0);
        } else {
          console.warn("Failed to fetch notification count: HTTP", res.status);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Failed to fetch notification count:", error);
        }
      }
    };

    if (user && user.role && user.role.toLowerCase() !== 'super-admin') {
      fetchNotificationCount();
      // Refresh notification count every 30 seconds
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);



  // 📢 Fetch latest announcements (for non-super-admin users)
  useEffect(() => {
    const fetchLatestAnnouncements = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch("/api/pengumuman/latest", {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          setLatestAnnouncements(data.announcements || []);
        } else {
          console.warn("Failed to fetch latest announcements: HTTP", res.status);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Failed to fetch latest announcements:", error);
        }
      }
    };

    if (user && user.role && user.role.toLowerCase() !== 'super-admin') {
      fetchLatestAnnouncements();
      // Refresh announcements every 60 seconds
      const interval = setInterval(fetchLatestAnnouncements, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
        const loadingNotification = notification.open({
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

  // ⏰ Fungsi bantu konversi ke timestamp
  const toTimestamp = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0).getTime();
  };

  // 🔔 Cek otomatis waktu adzan
  useEffect(() => {
    if (!times) return;
    const checkPrayerTimes = () => {
      const now = Date.now();
      const tolerance = 30000;
      for (const [name, time] of Object.entries(times)) {
        if (Math.abs(now - toTimestamp(time)) <= tolerance) {
          playStaticAdzan(name);
        }
      }
    };
    const interval = setInterval(checkPrayerTimes, 15000);
    return () => clearInterval(interval);
  }, [times]);

  // 🔊 Mainkan file adzan statis
  const playStaticAdzan = (prayerName: string) => {
    const audioFile = prayerName === "Subuh" ? "/mp3/subuh.mp3" : "/mp3/adzan.mp3";
    const audio = new Audio(audioFile);
    audio.play().catch((err) => console.error("Gagal memutar adzan:", err));
    message.success(`🕌 Waktu ${prayerName} — Memutar adzan`);
  };

  // ✨ Deteksi waktu aktif
  useEffect(() => {
    if (!times) return;
    const getMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();

    const prayerOrder = [
      { name: "Subuh", time: getMinutes(times.Subuh) },
      { name: "Dzuhur", time: getMinutes(times.Dzuhur) },
      { name: "Ashar", time: getMinutes(times.Ashar) },
      { name: "Maghrib", time: getMinutes(times.Maghrib) },
      { name: "Isya", time: getMinutes(times.Isya) },
    ];

    let active = "Isya";
    for (let i = 0; i < prayerOrder.length - 1; i++) {
      if (current >= prayerOrder[i].time && current < prayerOrder[i + 1].time) {
        active = prayerOrder[i].name;
        break;
      }
    }
    setActivePrayer(active);
  }, [times]);

  // 🕌 Highlight Style
  const highlightStyle = (label: string, time: string) => {
    const isActive = label === activePrayer;
    return (
      <span
        style={{
          display: "inline-block",
          padding: "8px 12px 5px",
          margin: "0 4px",
          background: isActive ? "rgba(255, 255, 255, 0.25)" : "transparent",
          border: isActive ? "1px solid rgba(255, 255, 255, 0.3)" : "none",
          color: isActive ? "#115620" : "#333",
          fontWeight: isActive ? 600 : 400,
          backdropFilter: isActive ? "blur(10px)" : "none",
          borderTopLeftRadius: "50%",
          borderTopRightRadius: "50%",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
          transition: "all 0.3s ease",
        }}
      >
        {label} {time}
      </span>
    );
  };

  // 🕌 Running Text
  const renderMarqueeText = () => {
    if (!times) return "⏳ Memuat jadwal sholat...";
    return (
      <>
        🕌 Jadwal Sholat {cityName} •{" "}
        {highlightStyle("Subuh", times.Subuh)} •{" "}
        {highlightStyle("Dzuhur", times.Dzuhur)} •{" "}
        {highlightStyle("Ashar", times.Ashar)} •{" "}
        {highlightStyle("Maghrib", times.Maghrib)} •{" "}
        {highlightStyle("Isya", times.Isya)} •
      </>
    );
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
        gap: 12
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "rgba(255, 255, 255, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          fontSize: 20
        }}>
          🌙
        </div>
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

      {/* Running Text - Center */}
      <div className="marquee-wrapper" style={{
        position: "absolute",
        left: "280px",
        right: "320px",
        overflow: "hidden",
        maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)"
      }}>
        <div className="marquee-text" style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          animation: "marquee 35s linear infinite",
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          background: "rgba(255, 255, 255, 0.12)",
          padding: "8px 20px",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          {renderMarqueeText()}
        </div>
      </div>

      {/* Right side container for notification and profile */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>


        {/* Forgot Passcode Notifications - Only for super-admin */}
        <ForgotPasscodeNotifications userRole={user?.role || ''} />

        {/* Announcement Notification Button - For non-super-admin users */}
        {user?.role?.toLowerCase() !== 'super-admin' && (
          <Badge count={latestAnnouncements.length} size="small" style={{
            boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)"
          }}>
            <Button
              type="text"
              icon={<BellOutlined />}
              onClick={() => setShowAnnouncementModal(true)}
              style={{
                fontSize: "16px",
                width: 44,
                height: 44,
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
          </Badge>
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



      {/* Latest Announcements Modal - For non-super-admin users */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellOutlined style={{ color: '#1890ff' }} />
            <span>Pengumuman Terbaru</span>
          </div>
        }
        open={showAnnouncementModal}
        onCancel={() => setShowAnnouncementModal(false)}
        footer={null}
        width={700}
      >
        {latestAnnouncements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <BellOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>Tidak ada pengumuman baru</div>
          </div>
        ) : (
          <List
            dataSource={latestAnnouncements}
            renderItem={(announcement) => (
              <List.Item
                style={{
                  padding: '16px',
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  marginBottom: 8,
                  background: '#fafafa'
                }}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Typography.Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                      {announcement.judul}
                    </Typography.Text>
                    <div style={{
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 500,
                      background: '#52c41a',
                      color: 'white'
                    }}>
                      BARU
                    </div>
                  </div>

                  <div style={{
                    color: '#666',
                    marginBottom: 12,
                    lineHeight: 1.5,
                    maxHeight: 60,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {announcement.isi.length > 150
                      ? `${announcement.isi.substring(0, 150)}...`
                      : announcement.isi
                    }
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      Oleh: <Typography.Text strong>{announcement.createdBy}</Typography.Text> ({announcement.creatorRole})
                    </div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      {new Date(announcement.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, marginTop: 8 }}
                    onClick={() => {
                      // Redirect to full announcement page based on user role
                      const role = user?.role?.toLowerCase();
                      if (role === 'santri') {
                        router.push('/santri/notifikasi');
                      } else if (role === 'guru') {
                        router.push('/guru/notifikasi');
                      } else if (role === 'admin') {
                        router.push('/admin/notifikasi');
                      } else if (role === 'ortu' || role === 'orang_tua') {
                        router.push('/ortu/notifikasi');
                      } else if (role === 'yayasan') {
                        router.push('/yayasan/notifikasi');
                      }
                      setShowAnnouncementModal(false);
                    }}
                  >
                    Lihat Selengkapnya →
                  </Button>
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-200%);
          }
        }

        .marquee-wrapper {
          height: 40px;
          display: flex;
          align-items: center;
        }

        .marquee-text {
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-direction: normal;
          animation-fill-mode: none;
        }

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
