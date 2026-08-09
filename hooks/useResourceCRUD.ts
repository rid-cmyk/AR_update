import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';

export interface CRUDOptions<T> {
  endpoint: string;
  initialData?: T[];
  onSuccess?: (action: 'create' | 'update' | 'delete', item: T | any) => void;
  successMessages?: { create?: string; update?: string; delete?: string };
}

export function useResourceCRUD<T extends { id: number | string }>(
  options: CRUDOptions<T>
) {
  const [data, setData] = useState<T[]>(options.initialData ?? []);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const fetchAll = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const url = params
        ? `${options.endpoint}?${new URLSearchParams(params)}`
        : options.endpoint;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json.data ?? json);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [options.endpoint]);

  const save = useCallback(async (payload: Partial<T>, customId?: number | string) => {
    setLoading(true);
    try {
      const isEdit = !!editingItem || !!customId;
      const targetId = customId || (editingItem as T)?.id;
      const url = isEdit ? `${options.endpoint}/${targetId}` : options.endpoint;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'headers' in payload ? 'PUT' : 'POST', // Basic heuristic, customize later if needed
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      message.success(options.successMessages?.[isEdit ? 'update' : 'create'] ?? 'Berhasil disimpan');
      options.onSuccess?.(isEdit ? 'update' : 'create', saved);
      await fetchAll();
      closeModal();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  }, [editingItem, fetchAll, options]);

  const remove = useCallback(async (id: number | string) => {
    setLoading(true);
    try {
      const res = await fetch(`${options.endpoint}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      message.success(options.successMessages?.delete ?? 'Berhasil dihapus');
      options.onSuccess?.('delete', { id });
      await fetchAll();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Gagal menghapus');
    } finally {
      setLoading(false);
    }
  }, [fetchAll, options]);

  const openModal = (item?: T) => {
    setEditingItem(item ?? null);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data,
    loading,
    isModalOpen,
    editingItem,
    fetchAll,
    save,
    remove,
    openModal,
    closeModal,
  };
}
