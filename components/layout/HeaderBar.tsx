/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Layout, Button, message, Select, Dropdown, Avatar, Space, Badge, Modal, List, Typography } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, SettingOutlined, BellOutlined, KeyOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

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
  const [resetPasswordRequests, setResetPasswordRequests] = useState<any[]>([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState<any[]>([]);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const router = useRouter();

  // 🌍 Ambil lokasi user lalu cocokkan ke MyQuran API untuk dapat cityCode
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation tidak didukung di browser ini");
      fetchPrayerTimes(cityCode);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
          if (data.status && data.data && data.data.id) {
            setCityCode(data.data.id);
            setCityName(data.data.lokasi);
          } else {
            throw new Error('Invalid API response format');
          }
        } catch (err) {
          console.error("Gagal mendapatkan lokasi kota:", err);
          // Fallback to default city code without showing error to user
          fetchPrayerTimes(cityCode);
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        // Fallback to default city code
        fetchPrayerTimes(cityCode);
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

  // 🔑 Fetch reset password requests (only for super-admin)
  useEffect(() => {
    const fetchResetPasswordRequests = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch("/api/admin/reset-password-requests", {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          setResetPasswordRequests(data.requests || []);
        } else {
          console.warn("Failed to fetch reset password requests: HTTP", res.status);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Failed to fetch reset password requests:", error);
        }
      }
    };

    if (user && user.role && user.role.toLowerCase() === 'super-admin') {
      fetchResetPasswordRequests();
      // Refresh reset password requests every 30 seconds
      const interval = setInterval(fetchResetPasswordRequests, 30000);
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

  // 🚪 Logout function
  const handleLogout = () => {
    // Redirect to logout page which handles the proper logout flow
    router.push("/logout");
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
        {/* Reset Password Notification - Only for super-admin */}
        {user?.role?.toLowerCase() === 'super-admin' && (
          <Badge count={resetPasswordRequests.length} size="small" style={{ 
            boxShadow: "0 2px 8px rgba(255, 0, 0, 0.3)" 
          }}>
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => setShowResetPasswordModal(true)}
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
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} • {user?.username}
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

      {/* Reset Password Requests Modal - Only for Super Admin */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyOutlined style={{ color: '#1890ff' }} />
            <span>Permintaan Reset Password</span>
          </div>
        }
        open={showResetPasswordModal}
        onCancel={() => setShowResetPasswordModal(false)}
        footer={null}
        width={600}
      >
        {resetPasswordRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            <KeyOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <div>Tidak ada permintaan reset password</div>
          </div>
        ) : (
          <List
            dataSource={resetPasswordRequests}
            renderItem={(request) => (
              <List.Item
                style={{
                  padding: '16px',
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  marginBottom: 8,
                  background: request.isRegistered ? '#f6ffed' : '#fff2e8'
                }}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {request.isRegistered ? request.namaLengkap : 'User Tidak Terdaftar'}
                      </Typography.Text>
                      <div style={{ color: '#666', marginTop: 4 }}>
                        Username: <Typography.Text code>{request.username}</Typography.Text>
                      </div>
                      {request.isRegistered && (
                        <div style={{ color: '#666', marginTop: 2 }}>
                          Role: <Typography.Text>{request.role}</Typography.Text>
                        </div>
                      )}
                      <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                        {new Date(request.createdAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 500,
                      background: request.isRegistered ? '#52c41a' : '#fa8c16',
                      color: 'white'
                    }}>
                      {request.isRegistered ? 'Terdaftar' : 'Tidak Terdaftar'}
                    </div>
                  </div>
                  {!request.isRegistered && (
                    <div style={{
                      marginTop: 12,
                      padding: 12,
                      background: '#fff7e6',
                      border: '1px solid #ffd591',
                      borderRadius: 6,
                      fontSize: 13
                    }}>
                      ⚠️ User dengan username ini tidak ditemukan dalam sistem
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>

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
