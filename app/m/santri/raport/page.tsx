"use client";

import React, { useState, useEffect } from "react";
import { TrophyOutlined, FileTextOutlined } from "@ant-design/icons";
import { Skeleton, Empty } from "antd";
import { MobileCard } from "@/components/mobile/dashboard";

interface SantriProfile {
  id: number;
  namaLengkap: string;
  username: string;
}

export default function MobileSantriRaport() {
  const [santri, setSantri] = useState<SantriProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const meRes = await fetch("/api/auth/me").catch(() => null);

        if (meRes && meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.user) {
            setSantri(meJson.user);
          }
        }
      } catch (e) {
        console.error("Gagal memuat profil santri:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-6 pb-24">
      {/* Header Raport */}
      <div className="bg-gradient-to-br from-sky-blue via-blue-green to-deep-space rounded-3xl p-6 text-center space-y-2 shadow-lg shadow-blue-green/20">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-white text-2xl mb-2">
          <TrophyOutlined />
        </div>
        <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">
          Rapor Tahfizh Al-Quran
        </span>
        <h2 className="text-2xl font-bold text-white">Rapor Tahfizh Al-Quran</h2>
        {loading ? (
          <Skeleton.Input active size="small" />
        ) : (
          <p className="text-xs text-white/80">
            Santri: <span className="font-bold text-white">{santri?.namaLengkap || "Santri"}</span> — NIS: {santri?.username || "-"}
          </p>
        )}
      </div>

      {/* Data Rapor */}
      {loading ? (
        <MobileCard className="space-y-4">
          <Skeleton active paragraph={{ rows: 4 }} />
        </MobileCard>
      ) : (
        <MobileCard className="p-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-slate-500 font-medium">
                  <FileTextOutlined />
                  <span>Belum ada data rapor</span>
                </div>
                <p className="text-xs text-slate-400">
                  Rapor akan dibuat oleh guru/admin setelah evaluasi semester
                </p>
              </div>
            }
          />
        </MobileCard>
      )}
    </div>
  );
}
