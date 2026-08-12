"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Progress, Skeleton } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  ReadOutlined,
  NotificationOutlined,
  UserAddOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  MobileDashboardHero,
  MobileQuickTile,
  MobileStatTile,
  MobileSectionTitle,
  MobileCard,
} from "@/components/mobile/dashboard";

interface HafalanItem {
  id: number;
  tanggal: string;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: string;
  keterangan: string;
}

interface PengumumanItem {
  id: number;
  judul: string;
  tanggal: string;
  keterangan: string;
  penulis: string;
}

export default function MobileSantriDashboard() {
  const [santriName, setSantriName] = useState<string>("Santri");
  const [halaqahName, setHalaqahName] = useState<string>("Halaqah Tahfizh");
  const [loading, setLoading] = useState<boolean>(true);
  const [recentHafalan, setRecentHafalan] = useState<HafalanItem[]>([]);
  const [overview, setOverview] = useState<{
    totalHafalan: number;
    totalAyatZiyadah: number;
    totalAyatMurajaah: number;
    activeTargets: number;
    completedTargets: number;
    totalJuzCompleted: number;
  }>({
    totalHafalan: 0,
    totalAyatZiyadah: 0,
    totalAyatMurajaah: 0,
    activeTargets: 0,
    completedTargets: 0,
    totalJuzCompleted: 0,
  });
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [meRes, hafRes, pengRes] = await Promise.all([
          fetch("/api/auth/me").catch(() => null),
          fetch("/api/santri/hafalan").catch(() => null),
          fetch("/api/santri/pengumuman").catch(() => null),
        ]);

        if (meRes && meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.user?.namaLengkap) {
            setSantriName(meJson.user.namaLengkap);
          }
        }

        if (hafRes && hafRes.ok) {
          const hafJson = await hafRes.json();
          if (hafJson.data) {
            setRecentHafalan(hafJson.data.recentHafalan || []);
            if (hafJson.data.overview) {
              setOverview(hafJson.data.overview);
            }
          }
        }

        if (pengRes && pengRes.ok) {
          const pengJson = await pengRes.json();
          if (pengJson.data) {
            setPengumuman(pengJson.data);
          }
        }
      } catch (e) {
        console.error("Gagal memuat data santri dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const progressPercent = Math.min(
    Math.round(((overview.totalAyatZiyadah || 0) / 6236) * 100),
    100
  );

  const avatarLabel = santriName.trim().charAt(0).toUpperCase() || "S";

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 pb-24">
      <div className="mx-auto max-w-lg space-y-5">
        <MobileDashboardHero
          avatarLabel={avatarLabel}
          greeting={`Assalamu'alaikum, ${santriName}!`}
          badge={halaqahName}
          subtitle="Terus pertahankan keistiqomahan ziyadah dan muroja'ah harianmu."
          actions={[
            { label: "Riwayat Hafalan", href: "/m/santri/hafalan", icon: <ReadOutlined />, variant: "primary" },
            { label: "Rapor Tahfizh", href: "/m/santri/raport", icon: <TrophyOutlined />, variant: "ghost" },
          ]}
        >
          <div className="rounded-2xl bg-sky-blue/20 p-3.5">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-deep-space">
              <span className="flex items-center gap-1">
                <FireOutlined className="text-princeton" /> Capaian Ziyadah
              </span>
              <span>{progressPercent}%</span>
            </div>
            <Progress
              percent={progressPercent}
              showInfo={false}
              strokeColor="#219ebc"
              trailColor="#dbe7ee"
              size="small"
            />
            <div className="mt-1.5 text-[11px] text-slate-500">
              {overview.totalAyatZiyadah.toLocaleString("id-ID")} ayat telah dihafal
            </div>
          </div>
        </MobileDashboardHero>

        <div>
          <MobileSectionTitle title="Menu Layanan" icon={<ReadOutlined />} />
          <div className="grid grid-cols-4 gap-2">
            <MobileQuickTile
              icon={<BookOutlined />}
              label="Hafalan"
              href="/m/santri/hafalan"
              color="blue"
            />
            <MobileQuickTile
              icon={<CheckCircleOutlined />}
              label="Absensi"
              href="/m/santri/absensi"
              color="teal"
            />
            <MobileQuickTile
              icon={<TrophyOutlined />}
              label="Rapor"
              href="/m/santri/raport"
              color="amber"
            />
            <MobileQuickTile
              icon={<BellOutlined />}
              label="Notifikasi"
              href="/m/santri/notifikasi"
              color="violet"
            />
          </div>
        </div>

        <div>
          <MobileSectionTitle title="Statistik Hafalan" icon={<FileDoneOutlined />} />
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton.Button active style={{ height: 72, width: "100%" }} />
              <Skeleton.Button active style={{ height: 72, width: "100%" }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <MobileStatTile
                icon={<BookOutlined />}
                label="Total Juz"
                value={overview.totalJuzCompleted}
                suffix="Juz"
                color="blue"
              />
              <MobileStatTile
                icon={<CheckCircleOutlined />}
                label="Ayat Ziyadah"
                value={overview.totalAyatZiyadah.toLocaleString("id-ID")}
                color="teal"
              />
              <MobileStatTile
                icon={<FireOutlined />}
                label="Ayat Murojaah"
                value={overview.totalAyatMurajaah.toLocaleString("id-ID")}
                color="amber"
              />
              <MobileStatTile
                icon={<TrophyOutlined />}
                label="Target Aktif"
                value={overview.activeTargets}
                color="orange"
              />
            </div>
          )}
        </div>

        <div>
          <MobileSectionTitle
            title="Pengumuman Halaqah"
            icon={<NotificationOutlined />}
            link={pengumuman.length > 0 ? "/m/santri/notifikasi" : undefined}
          />
          {loading ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : pengumuman.length > 0 ? (
            <div className="space-y-3">
              {pengumuman.map((item) => (
                <MobileCard key={item.id} className="border-l-4 border-l-amber-flame">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-deep-space">{item.judul}</span>
                    <span className="shrink-0 text-[10px] text-slate-400">{item.tanggal}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {item.keterangan}
                  </p>
                  <div className="mt-2 text-right text-[11px] font-medium text-blue-green">
                    — {item.penulis}
                  </div>
                </MobileCard>
              ))}
            </div>
          ) : (
            <MobileCard className="py-5 text-center text-xs text-slate-400">
              Belum ada pengumuman baru untuk halaqahmu.
            </MobileCard>
          )}
        </div>

        <div>
          <MobileSectionTitle
            title="Setoran Terakhirmu"
            icon={<UserAddOutlined />}
            link="/m/santri/hafalan"
          />
          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : recentHafalan.length > 0 ? (
            <div className="space-y-3">
              {recentHafalan.map((item) => (
                <MobileCard key={item.id}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-bold text-deep-space">
                        Surat {item.surat}
                      </h4>
                      <span className="text-[11px] text-blue-green">
                        Ayat {item.ayatMulai} - {item.ayatSelesai}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  {item.keterangan && (
                    <p className="mt-2 rounded-xl bg-[#f4f9fb] px-3 py-2 text-xs italic leading-relaxed text-slate-500">
                      &ldquo;{item.keterangan}&rdquo;
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <ClockCircleOutlined /> {new Date(item.tanggal).toLocaleDateString("id-ID")}
                    </span>
                    <span className="text-teal-600">Terverifikasi</span>
                  </div>
                </MobileCard>
              ))}
            </div>
          ) : (
            <MobileCard className="py-5 text-center text-xs text-slate-400">
              Belum ada catatan setoran terbaru.
            </MobileCard>
          )}
        </div>

        <p className="pb-2 text-center text-[10px] text-slate-400">
          <Link href="/m/santri/profil" className="font-semibold text-blue-green">
            Profil Santri
          </Link>{" "}
          · Tetap istiqomah, hafalanmu aset akhiratmu
        </p>
      </div>
    </div>
  );
}
