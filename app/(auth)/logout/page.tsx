"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin, message } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call logout API
        const response = await fetch("/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Clear local storage
          localStorage.removeItem('auth_token');

          // Show success message
          message.success("Logout berhasil!");

          // Redirect to login after a short delay
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } else {
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error("Logout error:", error);
        message.error("Terjadi kesalahan saat logout");

        // Force redirect to login even if logout fails
        setTimeout(() => {
          router.push("/login");
        }, 1500);
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
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <LogoutOutlined
          style={{
            fontSize: 64,
            color: "#fff",
            marginBottom: 16,
            opacity: 0.9,
          }}
        />
        <h1 style={{ color: "#fff", marginBottom: 8 }}>Logging Out...</h1>
        <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 16 }}>
          Please wait while we securely log you out
        </p>
      </div>

      <Spin
        size="large"
        style={{
          color: "#fff",
        }}
      />

      <div
        style={{
          marginTop: 32,
          padding: 20,
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: 12,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.9)" }}>
          🌙 Ar-Hapalan - Selamat tinggal!
        </p>
      </div>
    </div>
  );
}