"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
  HeartOutlined,
  BellOutlined,
  FileDoneOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  MobileDashboardHero,
  MobileQuickTile,
  MobileStatTile,
  MobileSectionTitle,
  MobileCard,
} from "@/components/mobile/dashboard";

interface ChildData {
  id: number;
  namaLengkap: string;
  username: string;
  foto?: string;
  hafalanProgress?: number;
  attendanceRate?: number;
  totalPrestasi?: number;
  setoranCount?: number;
}

interface ActivityItem {
  id: string;
  santriName: string;
  activityType: string;
  description: string;
  timestamp: string;
}

interface PengumumanItem {
  id: number;
  judul: string;
  tanggal: string;
  keterangan: string;
  penulis: string;
}

export default function MobileOrtuDashboard() {
  const [userName, setUserName] = useState<string>("Bpk/Ibu Wali Santri");
  const [loading, setLoading] = useState<boolean>(true);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [overview, setOverview] = useState<{
    totalChildren: number;
    avgHafalanProgress: number;
    avgAttendanceRate: number;
    totalPrestasi: number;
  }>({
    totalChildren: 0,
    avgHafalanProgress: 0,
    avgAttendanceRate: 0,
    totalPrestasi: 0,
  });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [pengumuman, setPengumuman] = useState<PengumumanItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [meRes, dashRes, pengRes] = await Promise.all([
          fetch("/api/auth/me").catch(() => null),
          fetch("/api/ortu/dashboard").catch(() => null),
          fetch("/api/ortu/pengumuman").catch(() => null),
        ]);

        if (meRes && meRes.ok) {
          const meJson = await meRes.json();
          if (meJson.user?.namaLengkap) {
            setUserName(meJson.user.namaLengkap);
          }
        }

        if (dashRes && dashRes.ok) {
          const dashJson = await dashRes.json();

          // API /api/ortu/dashboard mengembalikan `anakList` & `overview` TOP-LEVEL
          // (bukan dibungkus `data`). Kontrak sama dengan hook useOrtuChildDashboard.
          const rawAnakList = Array.isArray(dashJson.data?.children)
            ? dashJson.data.children
            : dashJson.anakList || [];

          // Bangun children + hitung setoran pekan ini dari data Hafalan per anak
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const childrenList: ChildData[] = rawAnakList.map((anak: any) => {
            const setoranCount = Array.isArray(anak.Hafalan)
              ? anak.Hafalan.filter(
                  (h: any) => h.tanggal && new Date(h.tanggal) >= weekAgo
                ).length
              : 0;
            return {
              id: anak.id,
              namaLengkap: anak.namaLengkap,
              username: anak.username,
              foto: anak.foto,
              hafalanProgress: anak.hafalanProgress,
              attendanceRate: anak.attendanceRate,
              totalPrestasi: anak.totalPrestasi,
              setoranCount,
            };
          });
          setChildren(childrenList);

          setOverview(
            dashJson.overview || {
              totalChildren: 0,
              avgHafalanProgress: 0,
              avgAttendanceRate: 0,
              totalPrestasi: 0,
            }
          );

          // Derive aktivitas setoran terakhir dari Hafalan tiap anak
          const activities: ActivityItem[] = [];
          for (const anak of rawAnakList) {
            if (Array.isArray(anak.Hafalan)) {
              for (const h of anak.Hafalan) {
                activities.push({
                  id: `hafalan-${anak.id}-${h.id}`,
                  santriName: anak.namaLengkap,
                  activityType: "Setoran",
                  description: `${h.surat} ${h.ayatMulai}-${h.ayatSelesai}`,
                  timestamp: h.tanggal,
                });
              }
            }
          }
          activities.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setRecentActivities(activities.slice(0, 10));
        }

        if (pengRes && pengRes.ok) {
          const pengJson = await pengRes.json();
          if (pengJson.data) {
            setPengumuman(pengJson.data);
          }
        }
      } catch (e) {
        console.error("Gagal memuat data dasbor ortu:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const firstChild = children.length > 0 ? children[0] : null;
  const avatarLabel = userName.trim().charAt(0).toUpperCase() || "W";

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 pb-24">
      <div className="mx-auto max-w-lg space-y-5">
        <MobileDashboardHero
          avatarLabel={avatarLabel}
          greeting={`Assalamu'alaikum, ${userName}`}
          badge="Pantauan Orang Tua / Wali"
          subtitle="Pantau selalu perkembangan hafalan dan kehadiran ananda di halaqah secara aktual."
          actions={[
            { label: "Lihat Semua Setoran", href: "/m/ortu/hafalan", icon: <BookOutlined />, variant: "primary" },
            { label: "Rapor Ananda", href: "/m/ortu/raport", icon: <TrophyOutlined />, variant: "ghost" },
          ]}
        />

        <div>
          <MobileSectionTitle title="Menu Layanan" icon={<UserAddOutlined />} />
          <div className="grid grid-cols-4 gap-2">
            <MobileQuickTile
              icon={<BookOutlined />}
              label="Setoran"
              href="/m/ortu/hafalan"
              color="blue"
            />
            <MobileQuickTile
              icon={<CheckCircleOutlined />}
              label="Absensi"
              href="/m/ortu/absensi"
              color="teal"
            />
            <MobileQuickTile
              icon={<TrophyOutlined />}
              label="Rapor"
              href="/m/ortu/raport"
              color="amber"
            />
            <MobileQuickTile
              icon={<BellOutlined />}
              label="Notifikasi"
              href="/m/ortu/notifikasi"
              color="violet"
            />
          </div>
        </div>

        <div>
          <MobileSectionTitle
            title={firstChild ? `Capaian Ananda (${firstChild.namaLengkap})` : "Capaian Ananda"}
            icon={<FileDoneOutlined />}
          />
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton.Button active style={{ height: 72, width: "100%" }} />
              <Skeleton.Button active style={{ height: 72, width: "100%" }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <MobileStatTile
                icon={<BookOutlined />}
                label="Progress Hafalan"
                value={`${firstChild?.hafalanProgress ?? overview.avgHafalanProgress}`}
                suffix="%"
                color="amber"
              />
              <MobileStatTile
                icon={<CheckCircleOutlined />}
                label="Kehadiran"
                value={`${firstChild?.attendanceRate ?? overview.avgAttendanceRate}`}
                suffix="%"
                color="teal"
              />
              <MobileStatTile
                icon={<HeartOutlined />}
                label="Setoran Pekan Ini"
                value={`${firstChild?.setoranCount ?? 0}`}
                suffix="Kali"
                color="blue"
              />
              <MobileStatTile
                icon={<TrophyOutlined />}
                label="Total Prestasi"
                value={`${firstChild?.totalPrestasi ?? overview.totalPrestasi}`}
                color="violet"
              />
            </div>
          )}
        </div>

        <div>
          <MobileSectionTitle
            title="Pengumuman Halaqah"
            icon={<NotificationOutlined />}
            link={pengumuman.length > 0 ? "/m/ortu/notifikasi" : undefined}
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
              Belum ada pengumuman baru untuk halaqah ananda.
            </MobileCard>
          )}
        </div>

        <div>
          <MobileSectionTitle
            title="Aktivitas Setoran Terakhir"
            icon={<UserAddOutlined />}
            link="/m/ortu/hafalan"
            linkLabel="Selengkapnya"
          />
          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((item) => (
                <MobileCard key={item.id}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-[13px] font-bold text-deep-space">
                        {item.description}
                      </h4>
                      <span className="text-[11px] text-slate-400">{item.santriName}</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                      {item.activityType}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <ClockCircleOutlined /> {new Date(item.timestamp).toLocaleDateString("id-ID")}
                    </span>
                    <span className="text-teal-600">Terverifikasi</span>
                  </div>
                </MobileCard>
              ))}
            </div>
          ) : (
            <MobileCard className="py-5 text-center text-xs text-slate-400">
              Belum ada riwayat setoran terbaru tercatat.
            </MobileCard>
          )}
        </div>
      </div>
    </div>
  );
}
