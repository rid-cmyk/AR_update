"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin, message, Typography, notification } from "antd"; // ✅ Import langsung dari antd
import { LogoutOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Show initial logout message
        message.loading("Sedang logout...", 0.5);

        // Call logout API
        const response = await fetch("/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          // Clear local storage
          localStorage.removeItem('auth_token');

          // Show success notification
          notification.success({
            message: 'Logout Berhasil!',
            description: 'Terima kasih telah menggunakan sistem AR-Hafalan. Anda akan diarahkan ke halaman login.',
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
          }, 2500);
        } else {
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error("Logout error:", error);
        
        // Clear local storage anyway for security
        localStorage.removeItem('auth_token');
        
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
    };

    performLogout();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
        animation: "float 20s ease-in-out infinite",
        zIndex: 1
      }} />

      <div style={{
        position: "absolute",
        top: "10%",
        right: "10%",
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        zIndex: 1
      }} />

      <div style={{
        position: "absolute",
        bottom: "20%",
        left: "15%",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        zIndex: 1
      }} />

      {/* Main Content */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: 32,
        zIndex: 2,
        position: "relative"
      }}>
        <div style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px auto",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        }}>
          <LogoutOutlined
            style={{
              fontSize: 48,
              color: "#fff",
              opacity: 0.9,
            }}
          />
        </div>

        <Title level={1} style={{ 
          color: "#fff", 
          marginBottom: 16,
          fontSize: "32px",
          fontWeight: "700",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          Sedang Logout...
        </Title>

        <Text style={{ 
          color: "rgba(255, 255, 255, 0.9)", 
          fontSize: 18,
          display: "block",
          marginBottom: 8,
          textShadow: "0 1px 2px rgba(0,0,0,0.2)"
        }}>
          Mohon tunggu sebentar
        </Text>

        <Text style={{ 
          color: "rgba(255, 255, 255, 0.7)", 
          fontSize: 16,
          display: "block"
        }}>
          Kami sedang mengeluarkan Anda dengan aman
        </Text>
      </div>

      {/* Loading Spinner */}
      <div style={{
        marginBottom: 40,
        zIndex: 2,
        position: "relative"
      }}>
        <Spin
          size="large"
          style={{
            color: "#fff",
          }}
        />
      </div>

      {/* Footer Card */}
      <div
        style={{
          padding: "24px 32px",
          background: "rgba(255, 255, 255, 0.15)",
          borderRadius: 16,
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          zIndex: 2,
          position: "relative",
          maxWidth: "400px",
          margin: "0 20px"
        }}
      >
        <div style={{
          fontSize: "24px",
          marginBottom: "12px"
        }}>
          🌙
        </div>
        <Title level={4} style={{ 
          margin: 0, 
          color: "rgba(255, 255, 255, 0.95)",
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "8px"
        }}>
          Sistem AR-Hafalan v2.0
        </Title>
        <Text style={{ 
          margin: 0, 
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "14px"
        }}>
          Terima kasih telah menggunakan sistem kami
        </Text>
        <div style={{
          marginTop: "16px",
          padding: "8px 16px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: 20,
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.9)"
        }}>
          ✨ Selamat tinggal dan barakallahu fiikum
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}