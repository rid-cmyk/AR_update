"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  MobileDashboardHero,
  MobileQuickTile,
  MobileStatTile,
  MobileSectionTitle,
  MobileCard,
} from "@/components/mobile/dashboard";

interface HalaqahData {
  id: number;
  namaHalaqah: string;
  jumlahSantri: number;
}

interface HafalanItem {
  id: number;
  santri?: {
    namaLengkap?: string;
  };
  surat?: string;
  ayatMulai?: number;
  ayatSelesai?: number;
  jenis?: string;
  status?: string;
  tanggal?: string;
  juz?: number;
}

interface JadwalItem {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  halaqah?: {
    namaHalaqah: string;
  };
}

export default function MobileGuruDashboard() {
  const [loading, setLoading] = useState(true);
  const [guruName, setGuruName] = useState("");
  const [totalSantri, setTotalSantri] = useState(0);
  const [totalHalaqah, setTotalHalaqah] = useState(0);
  const [halaqahList, setHalaqahList] = useState<HalaqahData[]>([]);
  const [recentSetoran, setRecentSetoran] = useState<HafalanItem[]>([]);
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [dashRes, hafRes, jadRes, meRes] = await Promise.all([
          fetch("/api/guru/dashboard"),
          fetch("/api/guru/hafalan?limit=5"),
          fetch("/api/guru/jadwal"),
          fetch("/api/auth/me").catch(() => null),
        ]);

        if (isMounted && dashRes.ok) {
          const dashJson = await dashRes.json();
          if (dashJson?.data) {
            setTotalSantri(dashJson.data.totalSantri || 0);
            setTotalHalaqah(dashJson.data.totalHalaqah || 0);
            setHalaqahList(dashJson.data.halaqah || []);
          }
        }

        if (isMounted && hafRes.ok) {
          const hafJson = await hafRes.json();
          if (hafJson?.data && Array.isArray(hafJson.data)) {
            setRecentSetoran(hafJson.data);
          }
        }

        if (isMounted && jadRes.ok) {
          const jadJson = await jadRes.json();
          if (jadJson?.data && Array.isArray(jadJson.data)) {
            setJadwalList(jadJson.data);
          }
        }

        if (isMounted && meRes && meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.user?.namaLengkap) {
            setGuruName(meJson.user.namaLengkap);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard guru:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const halaqahName =
    halaqahList.length > 0 ? `Halaqah ${halaqahList[0].namaHalaqah}` : "Halaqah Tahfizh";
  const namaDepan = guruName.trim().split(" ")[0];
  const avatarLabel = (guruName.trim().charAt(0) || "U").toUpperCase();

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 pb-24">
      <div className="mx-auto max-w-lg space-y-5">
        <MobileDashboardHero
          avatarLabel={avatarLabel}
          greeting={namaDepan ? `Ahlan wa Sahlan, Ustadz ${namaDepan}!` : "Ahlan wa Sahlan, Ustadz!"}
          badge={halaqahName}
          subtitle="Pantau perkembangan hafalan santri halaqah Anda dan catat absensi harian secara aktual."
          actions={[
            { label: "Setoran Baru", href: "/m/guru/hafalan", icon: <PlusOutlined />, variant: "primary" },
            { label: "Absen Hari Ini", href: "/m/guru/absensi", icon: <CheckCircleOutlined />, variant: "ghost" },
          ]}
        />

        <div>
          <MobileSectionTitle title="Aksi Cepat" icon={<EditOutlined />} />
          <div className="grid grid-cols-4 gap-2">
            <MobileQuickTile
              icon={<CheckCircleOutlined />}
              label="Absensi"
              href="/m/guru/absensi"
              color="teal"
            />
            <MobileQuickTile
              icon={<BookOutlined />}
              label="Hafalan"
              href="/m/guru/hafalan"
              color="blue"
            />
            <MobileQuickTile
              icon={<TrophyOutlined />}
              label="Ujian"
              href="/m/guru/ujian"
              color="amber"
            />
            <MobileQuickTile
              icon={<CalendarOutlined />}
              label="Jadwal"
              href="/m/guru/jadwal"
              color="sky"
            />
          </div>
        </div>

        <div>
          <MobileSectionTitle title="Statistik Halaqah Sendiri" icon={<TeamOutlined />} />
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton.Button active style={{ height: 72, width: "100%" }} />
              <Skeleton.Button active style={{ height: 72, width: "100%" }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <MobileStatTile
                icon={<TeamOutlined />}
                label="Total Santri"
                value={totalSantri}
                color="blue"
              />
              <MobileStatTile
                icon={<BookOutlined />}
                label="Setoran Hari Ini"
                value={recentSetoran.length}
                color="teal"
              />
              <MobileStatTile
                icon={<CheckCircleOutlined />}
                label="Halaqah Anda"
                value={totalHalaqah}
                color="amber"
              />
              <MobileStatTile
                icon={<CalendarOutlined />}
                label="Jadwal Mengajar"
                value={jadwalList.length}
                color="orange"
              />
            </div>
          )}
        </div>

        <div>
          <MobileSectionTitle
            title="Setoran Terakhir"
            icon={<UserAddOutlined />}
            link="/m/guru/hafalan"
          />
          {recentSetoran.length === 0 ? (
            <MobileCard className="py-5 text-center text-xs text-slate-400">
              Belum ada data setoran dari santri di halaqah Anda.
            </MobileCard>
          ) : (
            <div className="space-y-3">
              {recentSetoran.map((item) => {
                const santriNama = item.santri?.namaLengkap || "Santri";
                const suratAyat =
                  item.surat && item.ayatMulai && item.ayatSelesai
                    ? `${item.surat} (${item.ayatMulai}-${item.ayatSelesai})`
                    : item.surat || "Setoran Hafalan";
                const statusText = item.jenis || item.status || "Lancar";
                const tanggalText = item.tanggal
                  ? new Date(item.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })
                  : "Baru saja";
                const lancar = statusText.toLowerCase().includes("lancar");

                return (
                  <MobileCard key={item.id}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-deep-space text-sm font-bold text-white">
                        {santriNama.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-deep-space">{santriNama}</p>
                        <p className="truncate text-[11px] text-slate-500">{suratAyat}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            lancar ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {statusText}
                        </span>
                        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                          <ClockCircleOutlined />
                          <span>{tanggalText}</span>
                        </div>
                      </div>
                    </div>
                  </MobileCard>
                );
              })}
            </div>
          )}
        </div>

        <p className="pb-2 text-center text-[10px] text-slate-400">
          <Link href="/m/guru/grafik" className="font-semibold text-blue-green">
            Grafik Perkembangan
          </Link>{" "}
          · Data aktual dari database
        </p>
      </div>
    </div>
  );
}
