/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Layout, Button, message, Select, Dropdown, Avatar, Space } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Header } = Layout;
const { Option } = Select;

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
  role: {
    name: string;
  };
}

const HeaderBar: React.FC<HeaderBarProps> = ({ collapsed, setCollapsed, bgColor }) => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [cityName, setCityName] = useState<string>("Memuat...");
  const [activePrayer, setActivePrayer] = useState<string>("");
  const [cityCode, setCityCode] = useState<string>("1108");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  // 🌍 Ambil lokasi user lalu cocokkan ke MyQuran API untuk dapat cityCode
  useEffect(() => {
    if (!navigator.geolocation) {
      message.warning("Geolocation tidak didukung di browser ini");
      fetchPrayerTimes(cityCode);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://api.myquran.com/v2/sholat/coordinates/${latitude}/${longitude}`);
          const data = await res.json();
          if (data.status && data.data.id) {
            setCityCode(data.data.id);
            setCityName(data.data.lokasi);
          }
        } catch (err) {
          console.error("Gagal mendapatkan lokasi kota:", err);
          message.error("Gagal mendapatkan lokasi otomatis");
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        message.warning("Tidak dapat mengakses lokasi. Default: Jakarta");
        fetchPrayerTimes(cityCode);
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Ambil jadwal sholat dari MyQuran
  const fetchPrayerTimes = async (code: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${code}/${today}`);
      if (!res.ok) throw new Error("Gagal mengambil jadwal sholat");
      const data = await res.json();

      setCityName(data.data.lokasi);
      setTimes({
        Subuh: data.data.jadwal.subuh,
        Dzuhur: data.data.jadwal.dzuhur,
        Ashar: data.data.jadwal.ashar,
        Maghrib: data.data.jadwal.maghrib,
        Isya: data.data.jadwal.isya,
      });
    } catch (error) {
      console.error(error);
      message.error("Gagal mengambil jadwal sholat");
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
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // 🚪 Logout function
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      // Clear any local storage if needed
      localStorage.removeItem('auth_token');
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout API fails
      router.push("/login");
    }
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

  // Real-time clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get current date and time
  const getCurrentDateTime = () => {
    return {
      date: currentTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const { date, time } = getCurrentDateTime();

  return (
    <Header
      style={{
        padding: "0 24px",
        background: "linear-gradient(135deg, #001529 0%, #003a70 50%, #0052a3 100%)",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Tombol Sidebar */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: "18px",
          width: 56,
          height: 56,
          color: "#fff",
          borderRadius: 12,
          transition: "all 0.3s ease",
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      />

      {/* Logo */}
      <div style={{
        marginLeft: 20,
        fontWeight: 800,
        fontSize: 20,
        color: "#fff",
        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
        letterSpacing: "-0.5px"
      }}>
        🌙 Ar-Hapalan
      </div>


      {/* Running Text */}
      <div className="marquee-wrapper">
        <div className="marquee-text">{renderMarqueeText()}</div>
      </div>

      {/* User Profile Dropdown */}
      <div style={{ marginLeft: 'auto', marginRight: 0 }}>
        <Dropdown
          menu={{
            items: [
              {
                key: 'profile-edit',
                icon: <SettingOutlined />,
                label: '⚙️ Edit Profil',
                onClick: () => {
                  // Redirect based on user role
                  const role = user?.role?.name?.toLowerCase();
                  if (role === 'super admin') {
                    router.push('/super-admin/profil');
                  } else if (role === 'admin') {
                    router.push('/admin/profil');
                  } else if (role === 'guru') {
                    router.push('/guru/profil');
                  } else if (role === 'santri') {
                    router.push('/santri/profil');
                  } else if (role === 'orang tua') {
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
                label: '🚪 Logout',
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
              height: 52,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
            }}
          >
            <Avatar
              size={36}
              src={user?.foto}
              icon={!user?.foto ? <UserOutlined /> : undefined}
              style={{
                border: "2px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
              }}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.namaLengkap || 'Loading...'}
              </div>
              <div style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                textShadow: "0 1px 2px rgba(0,0,0,0.2)"
              }}>
                {user?.role.name ? user.role.name.charAt(0).toUpperCase() + user.role.name.slice(1) : ''}
              </div>
            </div>
          </Button>
        </Dropdown>
      </div>

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
          position: absolute;
          left: 200px;
          right: 220px;
          overflow: hidden;
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 5%,
            black 95%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 5%,
            black 95%,
            transparent 100%
          );
        }

        .marquee-text {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 30s linear infinite;
          font-size: 14px;
          font-weight: 600;
          color: "#fff";
          background: "rgba(255, 255, 255, 0.1)";
          padding: 6px 16px;
          border-radius: 20px;
          border: "1px solid rgba(255, 255, 255, 0.2)";
          backdrop-filter: "blur(10px)";
          box-shadow: "0 2px 8px rgba(0, 0, 0, 0.1)";
        }
      `}</style>
    </Header>
  );
};

export default HeaderBar;
