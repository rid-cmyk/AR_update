import { useState, useCallback } from 'react';
import { message } from 'antd';

export function useProfileManager(initialUser?: any) {
  const [profile, setProfile] = useState(initialUser ?? {});
  const [loading, setLoading] = useState(false);

  const updateProfile = useCallback(async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await res.text());
      const updatedUser = await res.json();
      setProfile((prev: any) => ({ ...prev, ...updatedUser }));
      message.success('Profil berhasil diperbarui');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui profil');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: base64 }),
      });
      
      if (!res.ok) throw new Error(await res.text());
      const updatedUser = await res.json();
      setProfile((prev: any) => ({ ...prev, avatar: updatedUser.avatar }));
      message.success('Foto profil berhasil diperbarui');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengupload foto');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (callback?: () => void) => {
    setLoading(true);
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (!res.ok) throw new Error();
      if (callback) callback();
    } catch (err) {
      message.error('Gagal logout');
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, updateProfile, uploadAvatar, logout };
}
