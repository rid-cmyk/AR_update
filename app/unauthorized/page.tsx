"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "antd";
import { 
  LoginOutlined, 
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

export default function UnauthorizedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  // Check if user can go back safely
  useEffect(() => {
    // Check if there's history to go back to
    const hasHistory = window.history.length > 1;
    const referrer = document.referrer;
    
    // Only allow going back if there's history and referrer is from same origin
    const isSafeReferrer = referrer && (
      referrer.includes(window.location.origin) || 
      referrer.includes('localhost')
    );
    
    setCanGoBack(hasHistory && isSafeReferrer);
  }, []);

  // Handle navigation with better UX and safety checks
  const handleNavigation = useCallback((path: string) => {
    if (isRedirecting) return; // Prevent double clicks
    
    setIsRedirecting(true);
    
    try {
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = path;
    }
  }, [router, isRedirecting]);

  // Handle safe back navigation
  const handleGoBack = useCallback(() => {
    if (isRedirecting) return; // Prevent double clicks
    
    setIsRedirecting(true);
    
    if (canGoBack) {
      // Safe to go back
      router.back();
    } else {
      // Fallback to dashboard or login
      const fallbackPath = '/login';
      router.push(fallbackPath);
    }
  }, [router, canGoBack, isRedirecting]);

  // Countdown logic with better performance
  useEffect(() => {
    if (countdown <= 0) {
      handleNavigation('/login');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, handleNavigation]);

  // Keyboard shortcuts for better accessibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isRedirecting) return; // Prevent actions during redirect
      
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNavigation('/login');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleGoBack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNavigation, handleGoBack, isRedirecting]);

  const progressPercent = ((8 - countdown) / 8) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full">
        {/* Icon and main message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6 backdrop-blur-sm border border-red-500/30">
            <ExclamationCircleOutlined className="text-3xl text-red-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Akses Ditolak
          </h1>
          
          <p className="text-slate-300 text-lg leading-relaxed">
            Anda tidak memiliki izin untuk mengakses halaman ini
          </p>
        </div>

        {/* Countdown section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-300 font-medium">Redirect otomatis</span>
            <div className="flex items-center text-blue-400">
              <ClockCircleOutlined className="mr-2" />
              <span className="font-mono text-lg font-bold">{countdown}s</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={() => {
              console.log('Login button clicked, redirecting to /login');
              handleNavigation('/login');
            }}
            loading={isRedirecting}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 border-0 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isRedirecting ? 'Mengarahkan...' : 'Login Sekarang'}
          </Button>
          
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
            loading={isRedirecting}
            disabled={!canGoBack && !isRedirecting}
            className="w-full h-12 bg-white/10 border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={canGoBack ? "Kembali ke halaman sebelumnya" : "Tidak ada halaman sebelumnya, akan diarahkan ke login"}
          >
            {isRedirecting ? 'Mengarahkan...' : canGoBack ? 'Kembali' : 'Ke Login'}
          </Button>
        </div>

        {/* Footer info */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p className="mb-1">🔐 AR-Hafalan Security System</p>
          <p className="text-xs opacity-75">
            Tekan Enter untuk login • Esc untuk {canGoBack ? 'kembali' : 'ke login'}
          </p>
          {!canGoBack && (
            <p className="text-xs opacity-50 mt-1">
              ⚠️ Tidak ada halaman sebelumnya yang aman
            </p>
          )}
        </div>
      </div>

      <style jsx global>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}