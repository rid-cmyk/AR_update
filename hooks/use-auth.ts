'use client'

import useSWR from 'swr'

export interface UserSession {
  id: number
  username: string
  namaLengkap: string
  role: {
    id: number
    name: string;
    description?: string
  }
  foto?: string
  nomorHP?: string
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Unauthorized')
  return res.json()
})

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<{ user: UserSession }>('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000, // Deduplicate /api/auth/me for 60 seconds across all components
  })

  return {
    user: data?.user || null,
    isLoading,
    isError: !!error,
    mutate
  }
}
