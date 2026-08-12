import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';

export interface UseAbsensiGuruOptions {
  initialJadwals?: any[];
  initialAbsensi?: any[];
  initialSummary?: any;
  initialHalaqahList?: any[];
}

export function useAbsensiGuru(options?: UseAbsensiGuruOptions) {
  const [jadwals, setJadwals] = useState<any[]>(options?.initialJadwals ?? []);
  const [absensiData, setAbsensiData] = useState<any[]>(options?.initialAbsensi ?? []);
  const [summary, setSummary] = useState<any>(options?.initialSummary ?? null);
  const [halaqahList, setHalaqahList] = useState<any[]>(options?.initialHalaqahList ?? []);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedHalaqah, setSelectedHalaqah] = useState<number | null>(null);

  const fetchAbsensiData = useCallback(async (date: dayjs.Dayjs, halaqahId?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ tanggal: date.format('YYYY-MM-DD') });
      if (halaqahId) params.append('halaqahId', String(halaqahId));
      
      const res = await fetch(`/api/guru/absensi?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();

      // API membungkus data di dalam `data` ({ success, data: { jadwals, absensi, summary } })
      const payload = json.data ?? json;
      setJadwals(payload.jadwals ?? []);
      setAbsensiData(payload.absensi ?? []);
      setSummary(payload.summary ?? null);
      if (payload.halaqahList && halaqahList.length === 0) {
        setHalaqahList(payload.halaqahList);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  }, [halaqahList.length]);

  const saveAbsensi = useCallback(async (santriId: number, jadwalId: number, status: string, customDate?: dayjs.Dayjs) => {
    try {
      const dateStr = (customDate || selectedDate).format('YYYY-MM-DD');
      const res = await fetch('/api/guru/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ santriId, jadwalId, status, tanggal: dateStr }),
      });
      if (!res.ok) throw new Error(await res.text());
      // Optionally show a subtle toast or nothing for quick saving
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menyimpan absensi');
      throw err;
    }
  }, [selectedDate]);

  const saveBulkAbsensi = useCallback(async (entries: any[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/guru/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      });
      if (!res.ok) throw new Error(await res.text());
      message.success('Absensi berhasil disimpan semua');
      await fetchAbsensiData(selectedDate, selectedHalaqah || undefined);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menyimpan absensi');
    } finally {
      setLoading(false);
    }
  }, [fetchAbsensiData, selectedDate, selectedHalaqah]);

  useEffect(() => {
    fetchAbsensiData(selectedDate, selectedHalaqah || undefined);
  }, [fetchAbsensiData, selectedDate, selectedHalaqah]);

  return { 
    jadwals, absensiData, summary, halaqahList, loading, 
    selectedDate, setSelectedDate, selectedHalaqah, setSelectedHalaqah, 
    fetchAbsensiData, saveAbsensi, saveBulkAbsensi 
  };
}
