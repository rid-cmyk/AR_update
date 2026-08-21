"use client";

import { usePageData } from "./usePageData";

export interface JadwalBase {
  id: number;
  hari: string;
  jamMulai: Date | string;
  jamSelesai: Date | string;
}

const HARI_COLORS: Record<string, string> = {
  Senin: "blue",
  Selasa: "green",
  Rabu: "orange",
  Kamis: "red",
  Jumat: "purple",
  Sabtu: "cyan",
  Minggu: "magenta",
};

export function getHariColor(hari: string): string {
  return HARI_COLORS[hari] || "default";
}

interface UseJadwalOptions<T extends JadwalBase> {
  endpoint: string;
  /** Transform response JSON → array Jadwal (default: json sebagai array) */
  transform?: (json: unknown) => T[];
}

/**
 * Hook jadwal terpusat: fetch endpoint jadwal + mapping warna hari.
 * Generic `<T>` agar halaman bisa memakai bentuk `halaqah` spesifiknya
 * (guru: `santri`, santri: `guru`). Kembalikan `jadwal` yang selalu array.
 */
export function useJadwal<T extends JadwalBase = JadwalBase>(
  options: UseJadwalOptions<T>
) {
  const { data, loading, error, refetch } = usePageData<T[]>(options);
  return { jadwal: data ?? [], loading, error, refetch, getHariColor };
}
