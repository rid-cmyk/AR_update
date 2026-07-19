import { useState, useCallback, useRef } from 'react'

interface UsePageDataOptions<T> {
  fetchFn: () => Promise<T>
  initialData?: T
  deps?: unknown[]
}

export function usePageData<T>(options: UsePageDataOptions<T>) {
  const { fetchFn, initialData } = options
  const [data, setData] = useState<T | undefined>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      if (isMounted.current) {
        setData(result)
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [fetchFn])

  return { data, loading, error, refetch: fetch }
}
