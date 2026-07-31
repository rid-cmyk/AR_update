"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import MobileFAB from "./MobileFAB";

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

  if (!isOrtu && !isYayasan) return null;

  return (
    <>
      <MobileFAB
        onClick={handleFABClick}
        color="#25d366"
        label="Chat Guru"
      />

      {showSheet && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => { setShowSheet(false); setSelectedHalaqah(null); setShowConfirm(false); }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
              background: "#fff",
              borderRadius: "20px 20px 0 0",
              padding: "20px 16px",
              paddingBottom: "env(safe-area-inset-bottom, 20px)",
              maxHeight: "70vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "#ddd",
                margin: "0 auto 16px",
              }}
            />
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 4,
                color: "#1a1a1a",
              }}
            >
              {isOrtu ? "Pilih Guru Halaqah" : "Pilih Halaqah"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#888",
                marginBottom: 16,
              }}
            >
              {isOrtu
                ? "Anak Anda terdaftar di halaqah berikut"
                : "Pilih halaqah yang ingin Anda tanyakan"}
            </div>

            {isOrtu && gurus.map((guru, idx) => (
              <div
                key={`${guru.halaqahId}-${idx}`}
                onClick={() => handleSelectGuru(guru)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: idx < gurus.length - 1 ? "1px solid #f0f0f0" : "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #25d366, #128c7e)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {guru.namaGuru.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
                    {guru.namaGuru}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    {guru.namaHalaqah}
                    {guru.namaSantri && ` • ${guru.namaSantri}`}
                  </div>
                </div>
                <div style={{ color: "#25d366", fontSize: 20 }}>›</div>
              </div>
            ))}

            {isYayasan && halaqahList.map((h, idx) => (
              <div
                key={h.halaqahId}
                onClick={() => handleSelectHalaqah(h)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: idx < halaqahList.length - 1 ? "1px solid #f0f0f0" : "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1890ff, #096dd9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {h.namaHalaqah.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
                    {h.namaHalaqah}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    Guru: {h.namaGuru}
                  </div>
                </div>
                <div style={{ color: "#1890ff", fontSize: 20 }}>›</div>
              </div>
            ))}

            {!loading && ((isOrtu && gurus.length === 0) || (isYayasan && halaqahList.length === 0)) && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#aaa", fontSize: 14 }}>
                Tidak ada data halaqah
              </div>
            )}
          </div>
        </div>
      )}

      {showConfirm && selectedHalaqah && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
            }}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 340,
              background: "#fff",
              borderRadius: 16,
              padding: "24px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#fff",
                fontSize: 24,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              Chat via WhatsApp?
            </div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
              Hubungi <strong>{selectedHalaqah.namaGuru}</strong> untuk halaqah{" "}
              <strong>{selectedHalaqah.namaHalaqah}</strong>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmChat}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "#25d366",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
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
