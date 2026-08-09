import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';

export interface UseHafalanGuruOptions {
  initialHafalanList?: any[];
  initialSantriList?: any[];
}

export function useHafalanGuru(options?: UseHafalanGuruOptions) {
  const [hafalanList, setHafalanList] = useState<any[]>(options?.initialHafalanList ?? []);
  const [santriList, setSantriList] = useState<any[]>(options?.initialSantriList ?? []);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHafalan, setEditingHafalan] = useState<any | null>(null);
  const [filters, setFilters] = useState({ santriName: '', surat: '', status: '' });

  const fetchHafalan = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      );
      const res = await fetch(`/api/guru/hafalan?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setHafalanList(json.data ?? json);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal memuat data hafalan');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSantri = useCallback(async () => {
    try {
      const res = await fetch('/api/guru/santri');
      const json = await res.json();
      setSantriList(json.data ?? json);
    } catch (err) {
      console.error('Failed to fetch santri list:', err);
    }
  }, []);

  const saveHafalan = useCallback(async (payload: any, customId?: number) => {
    setLoading(true);
    try {
      const isEdit = !!editingHafalan || !!customId;
      const targetId = customId || editingHafalan?.id;
      const url = isEdit ? `/api/guru/hafalan/${targetId}` : '/api/guru/hafalan';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      message.success(isEdit ? 'Hafalan berhasil diupdate' : 'Hafalan berhasil ditambahkan');
      await fetchHafalan();
      setIsModalOpen(false);
      setEditingHafalan(null);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menyimpan hafalan');
    } finally {
      setLoading(false);
    }
  }, [editingHafalan, fetchHafalan]);

  const deleteHafalan = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guru/hafalan/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      message.success('Hafalan berhasil dihapus');
      await fetchHafalan();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menghapus hafalan');
    } finally {
      setLoading(false);
    }
  }, [fetchHafalan]);

  const openModal = useCallback((h?: any) => {
    setEditingHafalan(h ?? null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setEditingHafalan(null);
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    fetchHafalan();
    if (santriList.length === 0) fetchSantri();
  }, [fetchHafalan, fetchSantri, santriList.length]);

  return {
    hafalanList, santriList, loading,
    isModalOpen, editingHafalan, filters, setFilters,
    fetchHafalan, fetchSantri, saveHafalan, deleteHafalan,
    openModal, closeModal,
  };
}
