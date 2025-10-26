/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Input, Button } from "antd";
import { LockOutlined, LoadingOutlined, UserOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasscodeInput from "@/components/auth/PasscodeInput";
import "./login.css";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const jadwalHafalan = [
    { hari: "Senin", waktu: "Ba’da Maghrib", materi: "Juz 1 (Al-Fatihah - Al-Baqarah 25)" },
    { hari: "Rabu", waktu: "Ba’da Isya", materi: "Juz 2 (Al-Baqarah 26 - 141)" },
    { hari: "Jumat", waktu: "Pagi", materi: "Muraja’ah bersama ustadz" },
  ];

  // Redirect based on role - DEPRECATED: middleware handles this now
  // Keeping for reference but not used
  const redirectToDashboard = (role: string) => {
    // Store user data in localStorage for session management
    const userData = { role };
    localStorage.setItem('user', JSON.stringify(userData));

    // Middleware will handle redirection, so we just redirect to home
    router.push('/');
  };

  // 🧠 Auto redirect if already logged in - DISABLED to prevent conflicts with middleware
  // The middleware will handle redirection based on JWT token
  useEffect(() => {
    // Check if we have a valid auth token (middleware will handle the rest)
    const hasToken = document.cookie.includes('auth_token');
    if (hasToken) {
      // Let middleware handle the redirection
      console.log('Auth token found, middleware will handle redirection');
    }
  }, []);

  // 🚨 Force redirect to login if accessing directly
  useEffect(() => {
    // Clear any existing session on login page load
    localStorage.removeItem('user');
    // Clear auth token cookie
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }, []);

  //  Handle login process
  const handleLogin = async () => {
    if (!passcode) {
      setErrorMsg("Masukkan passcode terlebih dahulu!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passCode: passcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Passcode salah, coba lagi.");
        setLoading(false);
        return;
      }

      // Store complete user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Login successful, redirecting user with role:', data.user.role);

      // Let middleware handle the redirection by redirecting to home page
      // The middleware will check the JWT token and redirect to appropriate dashboard
      window.location.href = '/';
    } catch (error) {
      setErrorMsg("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 🌍 Background */}
      <div className="planet" />
      <div className="stars" />
      <div className="stars2" />

      {/* 🕌 Jadwal Hafalan Button */}
      <div
        className="jadwal-button"
        onClick={() => setShowSchedule(!showSchedule)}
        title="Klik untuk lihat jadwal hafalan"
      >
        🕌
      </div>

      {/* 📜 Jadwal Popup */}
      <AnimatePresence>
        {showSchedule && (
          <motion.div
            className="jadwal-popup"
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <h3>📜 Jadwal Hafalan</h3>
            <ul>
              {jadwalHafalan.map((j, idx) => (
                <li key={idx}>
                  <strong>{j.hari}</strong> — {j.waktu}
                  <div className="materi">{j.materi}</div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✨ Glass Login Card */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="title">🌙 Ar-Hapalan</h2>
        <p className="subtitle">Masukkan 10-digit Passcode untuk masuk</p>

        {/* ⚠️ Error Message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              key="error"
              className="error-message"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <PasscodeInput
          value={passcode}
          onChange={setPasscode}
          placeholder="••••••••••"
          size="large"
          style={{ marginBottom: '10px' }}
          className="passcode-input"
          maxLength={10}
          autoComplete="current-password"
          aria-label="Masukkan passcode 10 digit untuk login"
          onPressEnter={handleLogin}
        />

        <Button
          type="primary"
          size="large"
          block
          className="login-button"
          loading={loading}
          icon={loading ? <LoadingOutlined /> : undefined}
          onClick={handleLogin}
        >
          {loading ? "Memproses..." : "Masuk"}
        </Button>

        {/* Link Lupa Passcode */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '15px',
          padding: '10px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Link 
            href="/forgot-passcode"
            style={{
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
            }}
          >
            <QuestionCircleOutlined />
            Lupa Passcode? Klik di sini
          </Link>
        </div>
      </motion.div>

      {/* ✨ Islamic Footer */}
      <div className="footer">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
    </div>
  );
}
