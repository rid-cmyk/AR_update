import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';

export function useTargetHafalan(role: 'guru' | 'santri') {
  const endpoint = role === 'guru' ? '/api/guru/target' : '/api/santri/target';
  const [targetList, setTargetList] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<any | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({ halaqahId: '', status: '' });
  const [santriList, setSantriList] = useState<any[]>([]);

  const fetchTargets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      );
      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setTargetList(json.data ?? json.targets ?? json);
      if (json.milestones) setMilestones(json.milestones);
      if (json.santriList && santriList.length === 0) setSantriList(json.santriList);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal memuat target hafalan');
    } finally {
      setLoading(false);
    }
  }, [endpoint, filters, santriList.length]);

  const saveTarget = useCallback(async (payload: any, customId?: number) => {
    setLoading(true);
    try {
      const isEdit = !!editingTarget || !!customId;
      const targetId = customId || editingTarget?.id;
      const url = isEdit ? `${endpoint}/${targetId}` : endpoint;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      message.success(isEdit ? 'Target berhasil diupdate' : 'Target berhasil dibuat');
      await fetchTargets();
      setIsModalOpen(false);
      setEditingTarget(null);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menyimpan target');
    } finally {
      setLoading(false);
    }
  }, [editingTarget, endpoint, fetchTargets]);

  const deleteTarget = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      message.success('Target berhasil dihapus');
      await fetchTargets();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menghapus target');
    } finally {
      setLoading(false);
    }
  }, [endpoint, fetchTargets]);

  const openModal = useCallback((t?: any) => {
    setEditingTarget(t ?? null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setEditingTarget(null);
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  return { 
    targetList, milestones, santriList, loading, 
    isModalOpen, editingTarget, filters, setFilters, 
    fetchTargets, saveTarget, deleteTarget,
    openModal, closeModal
  };
}
