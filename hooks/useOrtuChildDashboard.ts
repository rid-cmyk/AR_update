"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface OrtuChild {
  id: number;
  namaLengkap: string;
  username: string;
  hafalanProgress?: number;
}

export interface UseOrtuChildDashboardOptions<T extends Record<string, unknown[]>> {
  /** Endpoint data dashboard ortu (default "/api/ortu/dashboard") */
  endpoint?: string;
  /** Transform satu `anak` dari `anakList` menjadi data (key → array) + child */
  transformAnak: (anak: unknown) => { data: T; child?: OrtuChild };
  /** Data awal / state kosong */
  initialData: T;
  /** Nilai awal filter anak */
  defaultSelectedChild?: string;
}

export function aggregateOrtuChildren<T extends Record<string, unknown[]>>(
  anakList: unknown[] | undefined,
  transformAnak: (anak: unknown) => { data: T; child?: OrtuChild },
  initialData: T
): { data: T; children: OrtuChild[] } {
  const acc: Record<string, unknown[]> = {};
  for (const key of Object.keys(initialData)) acc[key] = [];
  const children: OrtuChild[] = [];

  anakList?.forEach((anak) => {
    const result = transformAnak(anak);
    for (const key of Object.keys(result.data)) {
      (acc[key] ??= []).push(...(result.data[key] as unknown[]));
    }
    if (result.child) children.push(result.child);
  });

  return { data: acc as T, children };
}

/**
 * Hook terpusat untuk halaman dashboard Ortu (target/absensi/hafalan/raport).
 * Menangani fetch `/api/ortu/dashboard`, transform per-anak, dan fallback mock
 * agar skeleton fetch/loading/error tidak terduplikasi di 4 halaman.
 * Data per-key (misal `data.target`, `data.stats`) sengaja fleksibel agar
 * halaman dengan beberapa daftar (raport + prestasi) tetap didukung.
 */
export function useOrtuChildDashboard<T extends Record<string, unknown[]>>(
  options: UseOrtuChildDashboardOptions<T>
) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [data, setData] = useState<T>(() => {
    const initial: Record<string, unknown[]> = {};
    for (const key of Object.keys(optionsRef.current.initialData)) {
      initial[key] = [];
    }
    return initial as T;
  });
  const [children, setChildren] = useState<OrtuChild[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState(options.defaultSelectedChild ?? "all");

  const fetchData = useCallback(async () => {
    const {
      endpoint = "/api/ortu/dashboard",
      transformAnak,
      initialData,
    } = optionsRef.current;

    try {
      setLoading(true);
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch ortu dashboard data");
      const json = await res.json();
      if (json.success === false) throw new Error(json.error || "Failed to fetch ortu dashboard data");

      const { data: acc, children: kids } = aggregateOrtuChildren(
        json.anakList,
        transformAnak,
        initialData
      );

      setData(acc);
      setChildren(kids);
    } catch (error) {
      console.error("Error fetching ortu dashboard data:", error);
      setData(initialData);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    children,
    childNames: children.map((c) => c.namaLengkap),
    loading,
    selectedChild,
    setSelectedChild,
    refetch: fetchData,
  };
}