"use client";

import React, { useEffect, useState } from "react";
import { Button, message, Skeleton } from "antd";
import { useAbsensiGuru } from "@/hooks/useAbsensiGuru";
import {
  CheckOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

type StatusAbsensi = "masuk" | "izin" | "sakit" | "alpha";

interface SantriAbsen {
  id: number;
  nama: string;
  status: StatusAbsensi;
}

interface JadwalData {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  halaqah?: {
    id: number;
    namaHalaqah: string;
    santri?: {
      id: number;
      santri?: {
        id: number;
        namaLengkap: string;
      };
    }[];
  };
}

export default function MobileGuruAbsensi() {
  const { jadwals, absensiData, loading, selectedDate, saveBulkAbsensi } = useAbsensiGuru();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedJadwalId, setSelectedJadwalId] = useState<number | null>(null);
  const [santriMap, setSantriMap] = useState<Record<number, SantriAbsen[]>>({});

  const jadwalList = jadwals as JadwalData[];

  useEffect(() => {
    if (jadwalList.length > 0 && !selectedJadwalId) {
      setSelectedJadwalId(jadwalList[0].id);
    }
    const map: Record<number, SantriAbsen[]> = {};
    jadwalList.forEach((jad) => {
      const hsList = jad.halaqah?.santri || [];
      const sList: SantriAbsen[] = hsList.map((hs: any) => {
        const s = hs.santri;
        const sid = s?.id || 0;
        const rec = absensiData.find(
          (a: any) => a.santriId === sid && a.jadwalId === jad.id
        );
        return {
          id: sid,
          nama: s?.namaLengkap || "Santri",
          status: (rec?.status as StatusAbsensi) || "masuk",
        };
      });
      map[jad.id] = sList;
    });
    setSantriMap(map);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jadwalList, absensiData]);

  const currentSantriList =
    selectedJadwalId && santriMap[selectedJadwalId]
      ? santriMap[selectedJadwalId]
      : [];

  const handleStatusChange = (santriId: number, status: StatusAbsensi) => {
    if (!selectedJadwalId) return;
    setSantriMap((prev) => {
      const list = prev[selectedJadwalId] || [];
      const updated = list.map((s) =>
        s.id === santriId ? { ...s, status } : s
      );
      return { ...prev, [selectedJadwalId]: updated };
    });
  };

  const handleSaveAll = async () => {
    if (!selectedJadwalId || currentSantriList.length === 0) return;
    setIsSaving(true);
    try {
      const entries = currentSantriList.map((s) => ({
        santriId: s.id,
        jadwalId: selectedJadwalId,
        tanggal: selectedDate.format('YYYY-MM-DD'),
        status: s.status,
      }));
      await saveBulkAbsensi(entries);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const hadirCount = currentSantriList.filter((s) => s.status === "masuk").length;
  const izinCount = currentSantriList.filter((s) => s.status === "izin").length;
  const sakitCount = currentSantriList.filter((s) => s.status === "sakit").length;
  const alpaCount = currentSantriList.filter((s) => s.status === "alpha").length;

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#f4f9fb] p-4 space-y-4 pb-24">
      {/* Header HALAQAH Selector */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Halaqah Anda (Hari Ini)
          </span>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
            {selectedDate.format('YYYY-MM-DD')}
          </span>
        </div>

        {loading ? (
          <Skeleton.Button active size="small" shape="round" />
        ) : jadwalList.length === 0 ? (
          <div className="text-xs text-princeton py-1">
            Tidak ada sesi jadwal aktif untuk halaqah Anda hari ini.
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {jadwalList.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedJadwalId(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  selectedJadwalId === item.id
                    ? "bg-blue-green text-white shadow-md shadow-blue-green/20"
                    : "bg-slate-100 text-slate-500 hover:text-deep-space"
                }`}
              >
                {item.halaqah?.namaHalaqah || `Jadwal #${item.id}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ringkasan Kehadiran */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm">
          <div className="text-xs text-emerald-600 font-medium mb-0.5">Hadir</div>
          <div className="text-lg font-bold text-deep-space">{hadirCount}</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm">
          <div className="text-xs text-blue-green font-medium mb-0.5">Izin</div>
          <div className="text-lg font-bold text-deep-space">{izinCount}</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm">
          <div className="text-xs text-princeton font-medium mb-0.5">Sakit</div>
          <div className="text-lg font-bold text-deep-space">{sakitCount}</div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-sm">
          <div className="text-xs text-rose-500 font-medium mb-0.5">Alpa</div>
          <div className="text-lg font-bold text-deep-space">{alpaCount}</div>
        </div>
      </div>

      {/* Daftar Santri */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton active paragraph={{ rows: 2 }} className="bg-white p-4 rounded-2xl" />
          <Skeleton active paragraph={{ rows: 2 }} className="bg-white p-4 rounded-2xl" />
        </div>
      ) : jadwalList.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center text-slate-400 text-xs shadow-sm">
          Silakan cek kembali halaman jadwal Anda. Absensi hanya dapat diisi jika terdapat sesi halaqah aktif hari ini.
        </div>
      ) : currentSantriList.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center text-slate-400 text-xs shadow-sm">
          Tidak ada santri yang terdaftar di halaqah ini.
        </div>
      ) : (
        <div className="space-y-3">
          {currentSantriList.map((santri) => (
            <div
              key={santri.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-deep-space">
                  {santri.nama}
                </span>
                <span className="text-[10px] text-slate-400">ID #{santri.id}</span>
              </div>

              {/* Status Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {(["masuk", "izin", "sakit", "alpha"] as StatusAbsensi[]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(santri.id, status)}
                      className={`py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all ${
                        santri.status === status
                          ? status === "masuk"
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                            : status === "izin"
                            ? "bg-blue-green text-white shadow-md shadow-blue-green/20"
                            : status === "sakit"
                            ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                            : "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                          : "bg-slate-100 text-slate-500 hover:text-deep-space"
                      }`}
                    >
                      {status === "masuk" ? "Hadir" : status}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Save Button */}
          <div className="pt-2">
            <Button
              type="primary"
              size="large"
              block
              icon={<SaveOutlined />}
              loading={isSaving}
              onClick={handleSaveAll}
              className="bg-blue-green hover:bg-blue-green font-bold h-12 rounded-2xl shadow-lg shadow-blue-green/25"
            >
              Simpan Absensi Keuangan & DB
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
