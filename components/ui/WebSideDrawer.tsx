"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface WebSideDrawerProps {
  /**
   * Status apakah panel drawer terbuka atau ditutup
   */
  isOpen: boolean;
  /**
   * Callback yang dipanggil saat drawer ditutup (klik tombol X, tombol ESC, atau backdrop)
   */
  onClose: () => void;
  /**
   * Judul drawer yang ditampilkan di header
   */
  title: React.ReactNode;
  /**
   * Subjudul opsional untuk deskripsi singkat di bawah judul
   */
  subtitle?: string;
  /**
   * Konten utama yang akan ditaruh di area scrollable tengah
   */
  children: React.ReactNode;
  /**
   * Footer opsional (misal tombol aksi Simpan / Batal) yang bersifat sticky di bawah
   */
  footer?: React.ReactNode;
  /**
   * Ukuran lebar drawer:
   * - sm: 480px (form kecil / filter)
   * - md: 640px (form standar seperti Tambah User / Detail Hafalan)
   * - lg: 768px (form 2 kolom seperti Manajemen Halaqah)
   * - xl: 1024px (panel eksekutif lebar seperti Yayasan Detail Santri)
   * - full: 100vw (penuh layar)
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /**
   * Kelas tambahan untuk kontainer utama drawer
   */
  className?: string;
  /**
   * Kelas tambahan untuk area body content
   */
  bodyClassName?: string;
  /**
   * Apakah drawer disembunyikan di bawah breakpoint desktop (< 1024px). Default: true
   */
  hideOnMobile?: boolean;
  /**
   * Menonaktifkan createPortal (berguna untuk testing / SSR statis). Default: false
   */
  disablePortal?: boolean;
}

const sizeClassesMap: Record<string, string> = {
  sm: "w-full max-w-[480px]",
  md: "w-full max-w-[640px]",
  lg: "w-full max-w-[768px]",
  xl: "w-full max-w-[1024px]",
  full: "w-full max-w-full",
};

export const WebSideDrawer: React.FC<WebSideDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  className = "",
  bodyClassName = "",
  hideOnMobile = true,
  disablePortal = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Penanganan tombol ESC untuk menutup drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Mengunci scroll background pada body saat drawer terbuka
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if ((!disablePortal && !mounted) || !isOpen) return null;

  const sizeClass = sizeClassesMap[size] || sizeClassesMap.md;
  const visibilityClass = hideOnMobile ? "hidden lg:flex" : "flex";

  const drawerContent = (
    <div
      className={`fixed inset-0 z-50 ${visibilityClass} items-stretch justify-end`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="web-side-drawer-title"
    >
      {/* Backdrop overlay dengan efek blur */}
      <div
        data-testid="web-side-drawer-backdrop"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel Slide-Over dari kanan */}
      <div
        className={`relative z-10 flex h-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${sizeClass} ${className}`}
      >
        {/* Sticky Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 backdrop-blur">
          <div>
            <h2
              id="web-side-drawer-title"
              className="text-lg font-bold tracking-tight text-slate-800"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            data-testid="web-side-drawer-close-btn"
            onClick={onClose}
            aria-label="Tutup Panel"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div
          className={`flex-1 overflow-y-auto p-6 ${bodyClassName}`}
        >
          {children}
        </div>

        {/* Sticky Footer Action Bar */}
        {footer && (
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (disablePortal || typeof document === "undefined") {
    return drawerContent;
  }

  return createPortal(drawerContent, document.body);
};

export default WebSideDrawer;
