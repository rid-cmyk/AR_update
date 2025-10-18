/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Input, Button } from "antd";
import { LockOutlined, LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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

  // Redirect based on role
  const redirectToDashboard = (role: string) => {
    // Store user data in localStorage for session management
    const userData = { role };
    localStorage.setItem('user', JSON.stringify(userData));

    if (role === 'super-admin') {
      router.push('/super-admin/dashboard');
    } else if (role === 'admin') {
      router.push('/admin/dashboard');
    } else if (role === 'guru') {
      router.push('/guru/dashboard');
    } else if (role === 'santri') {
      router.push('/santri/dashboard');
    } else if (role === 'ortu') {
      router.push('/ortu/dashboard');
    } else if (role === 'yayasan') {
      router.push('/yayasan/dashboard');
    } else if (role === 'santri') {
      router.push('/santri/dashboard');
    } else {
      router.push('/');
    }
  };

  // 🧠 Auto redirect if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        redirectToDashboard(userData.role);
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, [router]);

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
      redirectToDashboard(data.user.role);
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

        <Input
          maxLength={10}
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="••••••••••"
          prefix={<LockOutlined />}
          size="large"
          className="passcode-input"
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
      </motion.div>

      {/* ✨ Islamic Footer */}
      <div className="footer">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
    </div>
  );
}
