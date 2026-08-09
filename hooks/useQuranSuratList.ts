"use client";

import { usePageData } from "./usePageData";

export interface SuratInfo {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
}

/**
 * Hook daftar surat Al-Qur'an dari `/api/quran`.
 * Response berbentuk `{ code: 200, data: SuratInfo[] }`; hook ini mengubahnya
 * menjadi `suratList` yang selalu array sehingga aman untuk `.map` di JSX.
 */
export function useQuranSuratList() {
  const { data, loading, error, refetch } = usePageData<SuratInfo[]>({
    endpoint: "/api/quran",
    transform: (json: unknown) => {
      const j = json as { code?: number; data?: SuratInfo[] };
      return Array.isArray(j?.data) ? j.data : [];
    },
  });
  return { suratList: data ?? [], loading, error, refetch };
}
