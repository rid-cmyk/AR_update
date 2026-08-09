"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import MobileFAB from "./MobileFAB";
import styles from "./FABChatGuru.module.css";

interface GuruInfo {
  guruId: number;
  namaGuru: string;
  noTlp: string | null;
  halaqahId: number;
  namaHalaqah: string;
  namaSantri?: string;
}

interface HalaqahOption {
  halaqahId: number;
  namaHalaqah: string;
  guruId: number;
  namaGuru: string;
  noTlp: string | null;
}

export default function FABChatGuru() {
  const pathname = usePathname();
  const [gurus, setGurus] = useState<GuruInfo[]>([]);
  const [halaqahList, setHalaqahList] = useState<HalaqahOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedHalaqah, setSelectedHalaqah] = useState<HalaqahOption | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobileQuery = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMobile = isMounted ? isMobileQuery : false;
  const isProfilePage = pathname.includes("/profil") || pathname.endsWith("/profile");
  const isOrtu = pathname.startsWith("/ortu");
  const isYayasan = pathname.startsWith("/yayasan");

  const fetchGuruData = useCallback(async () => {
    setLoading(true);
    try {
      if (isOrtu) {
        const res = await fetch("/api/ortu/guru-halaqah");
        if (res.ok) {
          const data = await res.json();
          setGurus(data.data || []);
        }
      } else if (isYayasan) {
        const res = await fetch("/api/yayasan/halaqah-guru");
        if (res.ok) {
          const data = await res.json();
          setHalaqahList(data.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch guru data:", err);
    } finally {
      setLoading(false);
    }
  }, [isOrtu, isYayasan]);

  useEffect(() => {
    if (isOrtu || isYayasan) {
      fetchGuruData();
    }
  }, [isOrtu, isYayasan, fetchGuruData]);

  const handleFABClick = () => {
    if (loading) return;

    if (isOrtu && gurus.length === 1) {
      const guru = gurus[0];
      if (!guru.noTlp) {
        alert("Nomor telepon guru belum tersedia");
        return;
      }
      openWhatsApp(guru.noTlp, guru.namaGuru, guru.namaSantri);
    } else if (isOrtu && gurus.length > 1) {
      setShowSheet(true);
    } else if (isYayasan && halaqahList.length > 0) {
      setShowSheet(true);
    }
  };

  const openWhatsApp = (phone: string, namaGuru: string, namaSantri?: string) => {
    const cleaned = phone.replace(/\D/g, "");
    const waNumber = cleaned.startsWith("62") ? cleaned : "62" + cleaned.replace(/^0/, "");

    let message = `Assalamualaikum Pak/Bu ${namaGuru},\n\nSaya ingin bertanya tentang hafalan anak`;
    if (namaSantri) {
      message += ` *${namaSantri}*`;
    }
    message += `.\n\nTerima kasih.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${waNumber}?text=${encoded}`, "_blank");
    setShowSheet(false);
    setSelectedHalaqah(null);
  };

  const handleSelectGuru = (guru: GuruInfo) => {
    if (!guru.noTlp) {
      alert("Nomor telepon guru belum tersedia");
      return;
    }
    openWhatsApp(guru.noTlp, guru.namaGuru, guru.namaSantri);
  };

  const handleSelectHalaqah = (h: HalaqahOption) => {
    setSelectedHalaqah(h);
    setShowConfirm(true);
  };

  const handleConfirmChat = () => {
    if (!selectedHalaqah) return;
    if (!selectedHalaqah.noTlp) {
      alert("Nomor telepon guru belum tersedia");
      return;
    }
    openWhatsApp(selectedHalaqah.noTlp, selectedHalaqah.namaGuru);
  };

  if (isProfilePage) return null;
  if (!isOrtu && !isYayasan) return null;
  if (!loading && isOrtu && gurus.length === 0) return null;
  if (!loading && isYayasan && halaqahList.length === 0) return null;

  return (
    <>
      <MobileFAB
        onClick={handleFABClick}
        color="#25d366"
        label="Chat Guru"
        bottom={isMobile ? 90 : 32}
        right={isMobile ? 20 : 32}
      />

      {showSheet && (
        <div
          className={styles.sheetOverlay}
          onClick={() => { setShowSheet(false); setSelectedHalaqah(null); setShowConfirm(false); }}
        >
          <div className={styles.sheetBackdrop} />
          <div
            onClick={(e) => e.stopPropagation()}
            className={styles.sheetContent}
          >
            <div className={styles.sheetHandle} />
            <div className={styles.sheetTitle}>
              {isOrtu ? "Pilih Guru Halaqah" : "Pilih Halaqah"}
            </div>
            <div className={styles.sheetSubtitle}>
              {isOrtu
                ? "Anak Anda terdaftar di halaqah berikut"
                : "Pilih halaqah yang ingin Anda tanyakan"}
            </div>

            {isOrtu && gurus.map((guru, idx) => (
              <div
                key={`${guru.halaqahId}-${idx}`}
                onClick={() => handleSelectGuru(guru)}
                className={idx < gurus.length - 1 ? styles.guruItem : styles.guruItemLast}
              >
                <div className={styles.guruAvatar}>
                  {guru.namaGuru.charAt(0).toUpperCase()}
                </div>
                <div className={styles.guruInfo}>
                  <div className={styles.guruName}>
                    {guru.namaGuru}
                  </div>
                  <div className={styles.guruDetail}>
                    {guru.namaHalaqah}
                    {guru.namaSantri && ` • ${guru.namaSantri}`}
                  </div>
                </div>
                <div className={styles.chevronIcon}>›</div>
              </div>
            ))}

            {isYayasan && halaqahList.map((h, idx) => (
              <div
                key={h.halaqahId}
                onClick={() => handleSelectHalaqah(h)}
                className={idx < halaqahList.length - 1 ? styles.guruItem : styles.guruItemLast}
              >
                <div className={styles.guruAvatarYayasan}>
                  {h.namaHalaqah.charAt(0).toUpperCase()}
                </div>
                <div className={styles.guruInfo}>
                  <div className={styles.guruName}>
                    {h.namaHalaqah}
                  </div>
                  <div className={styles.guruDetail}>
                    Guru: {h.namaGuru}
                  </div>
                </div>
                <div className={styles.chevronIconYayasan}>›</div>
              </div>
            ))}

            {!loading && ((isOrtu && gurus.length === 0) || (isYayasan && halaqahList.length === 0)) && (
              <div className={styles.emptyText}>
                Tidak ada data halaqah
              </div>
            )}
          </div>
        </div>
      )}

      {showConfirm && selectedHalaqah && (
        <div
          className={styles.confirmOverlay}
          onClick={() => setShowConfirm(false)}
        >
          <div className={styles.confirmBackdrop} />
          <div
            onClick={(e) => e.stopPropagation()}
            className={styles.confirmContent}
          >
            <div className={styles.confirmIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div className={styles.confirmTitle}>
              Chat via WhatsApp?
            </div>
            <div className={styles.confirmSubtitle}>
              Hubungi <strong>{selectedHalaqah.namaGuru}</strong> untuk halaqah{" "}
              <strong>{selectedHalaqah.namaHalaqah}</strong>
            </div>
            <div className={styles.confirmButtonContainer}>
              <button
                onClick={() => setShowConfirm(false)}
                className={styles.btnCancel}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmChat}
                className={styles.btnChat}
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
