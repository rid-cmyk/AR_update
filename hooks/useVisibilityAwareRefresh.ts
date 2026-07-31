import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hanya memanggil router.refresh() saat tab browser aktif (visible).
 * Mencegah beban server yang tidak perlu saat pengguna idle atau berpindah tab.
 * Default interval: 120_000 ms (2 menit).
 */
export function useVisibilityAwareRefresh(intervalMs: number = 120_000) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        router.refresh();
      }
    };

    const interval = setInterval(refresh, intervalMs);

    // Juga refresh saat tab kembali aktif setelah disembunyikan
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [router, intervalMs]);
}
