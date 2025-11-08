/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Input, Button, message, notification } from "antd";
import { LockOutlined, LoadingOutlined, UserOutlined, QuestionCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasscodeInput from "@/components/auth/PasscodeInput";
import CountdownTimer from "@/components/common/CountdownTimer";
import { 
  isLockedOut, 
  recordFailedAttempt, 
  recordSuccessfulLogin, 
  getAttemptCount,
  getLockoutMessage 
} from "@/lib/utils/rateLimiter";
import { useLockoutStatus } from "@/hooks/useLockoutStatus";
import "./login.css";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Use lockout status hook for cross-page synchronization
  const { 
    isLocked, 
    remainingTime: lockoutTime, 
    attempts: attemptCount, 
    message: lockoutMessage,
    refreshStatus 
  } = useLockoutStatus();

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

  // Update error message when lockout status changes
  useEffect(() => {
    if (isLocked && lockoutMessage) {
      setErrorMsg(lockoutMessage);
    } else if (!isLocked) {
      setErrorMsg("");
    }
  }, [isLocked, lockoutMessage]);

  // Handle lockout timer completion
  const handleLockoutComplete = () => {
    setErrorMsg("");
    refreshStatus(); // Refresh status from hook
  };

  //  Handle login process
  const handleLogin = async () => {
    // Check if user is locked out
    const identifier = 'login_attempt';
    const lockoutStatus = isLockedOut(identifier);
    
    if (lockoutStatus.locked) {
      setErrorMsg(getLockoutMessage(getAttemptCount(identifier), lockoutStatus.remainingTime));
      return;
    }

    if (!passcode) {
      notification.warning({
        message: 'Passcode Kosong',
        description: 'Silakan masukkan passcode terlebih dahulu untuk melanjutkan login.',
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        duration: 3,
        placement: 'topRight'
      });
      setErrorMsg("Masukkan passcode terlebih dahulu!");
      return;
    }

    if (passcode.length < 3) {
      notification.warning({
        message: 'Passcode Terlalu Pendek',
        description: 'Passcode harus minimal 3 karakter. Silakan periksa kembali.',
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        duration: 3,
        placement: 'topRight'
      });
      setErrorMsg("Passcode terlalu pendek");
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
        // Record failed attempt
        const failedAttempt = recordFailedAttempt(identifier);
        
        // Refresh lockout status after failed attempt
        setTimeout(() => refreshStatus(), 100);
        
        // Handle different error types with notification popup
        if (data.code === "PASSCODE_NOT_FOUND") {
          let description = 'Passcode yang Anda masukkan tidak terdaftar dalam sistem. Silakan periksa kembali atau hubungi admin untuk bantuan.';
          
          // Add attempt warning
          if (failedAttempt.attempts >= 5) {
            description += ` (Percobaan ke-${failedAttempt.attempts})`;
          }
          
          notification.error({
            message: 'Passcode Tidak Ditemukan',
            description,
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
            duration: 6,
            placement: 'topRight',
            style: {
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }
          });
          
          if (!failedAttempt.isLocked) {
            setErrorMsg('Passcode tidak ditemukan');
          }
        } else {
          let description = data.message || data.error || "Terjadi kesalahan saat login. Silakan coba lagi.";
          
          // Add attempt warning
          if (failedAttempt.attempts >= 5) {
            description += ` (Percobaan ke-${failedAttempt.attempts})`;
          }
          
          notification.error({
            message: 'Login Gagal',
            description,
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
            duration: 4,
            placement: 'topRight'
          });
          
          if (!failedAttempt.isLocked) {
            setErrorMsg(data.message || data.error || "Login gagal");
          }
        }
        setLoading(false);
        return;
      }

      // Record successful login (reset attempts)
      recordSuccessfulLogin(identifier);
      refreshStatus(); // Refresh status after successful login

      // Store complete user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Login successful, redirecting user with role:', data.user.role);

      // Show success notification
      notification.success({
        message: 'Login Berhasil!',
        description: `Selamat datang, ${data.user.namaLengkap}! Anda akan diarahkan ke dashboard ${data.user.role}.`,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 3,
        placement: 'topRight',
        style: {
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      });

      // Let middleware handle the redirection by redirecting to home page
      // The middleware will check the JWT token and redirect to appropriate dashboard
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error("Login connection error:", error);
      notification.error({
        message: 'Kesalahan Koneksi',
        description: 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda dan coba lagi.',
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 5,
        placement: 'topRight'
      });
      setErrorMsg("Kesalahan koneksi ke server");
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

        {/* 🔒 Lockout Timer */}
        <AnimatePresence>
          {isLocked && lockoutTime > 0 && (
            <motion.div
              key="lockout"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CountdownTimer
                initialSeconds={lockoutTime}
                onComplete={handleLockoutComplete}
                message="Akun terkunci sementara"
                showProgress={true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ⚠️ Error Message */}
        <AnimatePresence>
          {errorMsg && !isLocked && (
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

        {/* 📊 Attempt Counter */}
        <AnimatePresence>
          {attemptCount > 0 && attemptCount < 10 && !isLocked && (
            <motion.div
              key="attempts"
              className="attempt-counter"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              style={{
                textAlign: 'center',
                padding: '8px 12px',
                background: attemptCount >= 7 ? 'rgba(255, 77, 79, 0.1)' : 'rgba(250, 173, 20, 0.1)',
                border: `1px solid ${attemptCount >= 7 ? 'rgba(255, 77, 79, 0.3)' : 'rgba(250, 173, 20, 0.3)'}`,
                borderRadius: '6px',
                marginBottom: '12px',
                fontSize: '12px',
                color: attemptCount >= 7 ? '#ff4d4f' : '#faad14'
              }}
            >
              ⚠️ Percobaan login: {attemptCount}/10
              {attemptCount >= 7 && (
                <div style={{ marginTop: '4px', fontSize: '11px' }}>
                  {10 - attemptCount} percobaan lagi sebelum akun dikunci
                </div>
              )}
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
          disabled={isLocked}
        />

        <Button
          type="primary"
          size="large"
          block
          className="login-button"
          loading={loading}
          icon={loading ? <LoadingOutlined /> : undefined}
          onClick={handleLogin}
          disabled={isLocked || loading}
        >
          {isLocked ? "Akun Terkunci" : loading ? "Memproses..." : "Masuk"}
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

      {/* ✨ Islamic Header */}
      <div className="header">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
    </div>
  );
}
