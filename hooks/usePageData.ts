import { useCallback, useEffect, useRef, useState } from "react";

interface UsePageDataOptions<T> {
  /** Endpoint GET untuk data halaman */
  endpoint: string;
  /** Transform response JSON → bentuk yang dipakai komponen (default: json sebagai T) */
  transform?: (json: unknown) => T;
}

/**
 * Hook data halaman yang self-fetching: menangani fetch GET ke `endpoint`,
 * state loading/error, dan opsi transform/mockData — sehingga pola
 * `useState + fetch + useEffect + setLoading/setError` tidak terduplikasi.
 * `fetchFn`/endpoint dipegang lewat ref agar tidak memicu re-fetch berulang
 * saat options dibuat inline.
 */
export function usePageData<T>(options: UsePageDataOptions<T>) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    const { endpoint, transform } = optionsRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
      const json = await res.json();
      if (json?.success === false) {
        throw new Error(json.error || `Failed to fetch ${endpoint}`);
      }
      if (!isMounted.current) return;
      setData(transform ? transform(json) : (json as T));
    } catch (err) {
      if (!isMounted.current) return;
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
