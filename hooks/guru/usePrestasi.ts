import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';

export function usePrestasiGuru() {
  const [halaqahList, setHalaqahList] = useState<any[]>([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState<number | null>(null);
  const [prestasiList, setPrestasiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrestasi, setEditingPrestasi] = useState<any | null>(null);

  const fetchHalaqah = useCallback(async () => {
    try {
      const res = await fetch('/api/guru/dashboard'); // Or another endpoint that gives halaqahs
      if (!res.ok) throw new Error();
      const data = await res.json();
      const halaqahs = data.halaqahList || [];
      setHalaqahList(halaqahs);
      if (halaqahs.length > 0 && !selectedHalaqah) {
        setSelectedHalaqah(halaqahs[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch halaqah list');
    }
  }, [selectedHalaqah]);

  const fetchPrestasiData = useCallback(async () => {
    if (!selectedHalaqah) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/guru/prestasi?halaqahId=${selectedHalaqah}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPrestasiList(data);
    } catch (err) {
      message.error('Gagal memuat data prestasi');
    } finally {
      setLoading(false);
    }
  }, [selectedHalaqah]);

  const savePrestasiData = useCallback(async (payload: any, editingId?: number) => {
    setLoading(true);
    try {
      const isEdit = !!editingPrestasi || !!editingId;
      const targetId = editingId || editingPrestasi?.id;
      const url = isEdit ? `/api/guru/prestasi/${targetId}` : '/api/guru/prestasi';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      message.success(isEdit ? 'Prestasi berhasil diupdate' : 'Prestasi berhasil ditambahkan');
      await fetchPrestasiData();
      setIsModalOpen(false);
      setEditingPrestasi(null);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menyimpan prestasi');
    } finally {
      setLoading(false);
    }
  }, [editingPrestasi, fetchPrestasiData]);

  const deletePrestasiData = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guru/prestasi/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      message.success('Prestasi berhasil dihapus');
      await fetchPrestasiData();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menghapus prestasi');
    } finally {
      setLoading(false);
    }
  }, [fetchPrestasiData]);

  const validatePrestasi = useCallback(async (id: number, validated: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guru/prestasi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validated }),
      });
      if (!res.ok) throw new Error(await res.text());
      message.success(validated ? 'Prestasi diverifikasi' : 'Prestasi batal diverifikasi');
      await fetchPrestasiData();
    } catch (err) {
      message.error('Gagal memverifikasi prestasi');
    } finally {
      setLoading(false);
    }
  }, [fetchPrestasiData]);

  const openModal = useCallback((p?: any) => {
    setEditingPrestasi(p ?? null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setEditingPrestasi(null);
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    fetchHalaqah();
  }, [fetchHalaqah]);

  useEffect(() => {
    if (selectedHalaqah) {
      fetchPrestasiData();
    }
  }, [selectedHalaqah, fetchPrestasiData]);

  return { 
    halaqahList, selectedHalaqah, setSelectedHalaqah, 
    prestasiList, loading, isModalOpen, editingPrestasi,
    fetchPrestasiData, savePrestasiData, deletePrestasiData, validatePrestasi,
    openModal, closeModal
  };
}
