'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCurrentTahunAkademik } from '@/lib/tahun-akademik-utils'

interface TahunAkademik {
  id: number
  tahunMulai: number
  tahunSelesai: number
  semester: 'S1' | 'S2'
  namaLengkap: string
  tanggalMulai: string
  tanggalSelesai: string
  isActive: boolean
  _count?: {
    templateUjian: number
    templateRaport: number
    ujianSantri: number
    raportSantri: number
  }
}

interface UseTahunAkademikReturn {
  activeTahunAkademik: TahunAkademik | null
  currentTahunAkademik: any
  tahunAkademikList: TahunAkademik[]
  isLoading: boolean
  error: string | null
  refreshTahunAkademik: () => Promise<void>
  setActiveTahunAkademik: (tahunAjaranId: number) => Promise<boolean>
}

export function useTahunAkademik(): UseTahunAkademikReturn {
  const [activeTahunAkademik, setActiveTahunAkademikState] = useState<TahunAkademik | null>(null)
  const [currentTahunAkademik, setCurrentTahunAkademik] = useState<any>(null)
  const [tahunAkademikList, setTahunAkademikList] = useState<TahunAkademik[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch active tahun akademik
  const fetchActiveTahunAkademik = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik/active')
      const result = await response.json()

      if (result.success) {
        setActiveTahunAkademikState(result.data.active)
        setCurrentTahunAkademik(result.data.current)
        setError(null)
      } else {
        setError(result.error || 'Gagal mengambil tahun akademik aktif')
      }
    } catch (err) {
      console.error('Error fetching active tahun akademik:', err)
      setError('Terjadi kesalahan saat mengambil tahun akademik aktif')
    }
  }, [])

  // Fetch all tahun akademik
  const fetchTahunAkademikList = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik')
      const result = await response.json()

      if (result.success) {
        setTahunAkademikList(result.data)
        setError(null)
      } else {
        setError(result.error || 'Gagal mengambil daftar tahun akademik')
      }
    } catch (err) {
      console.error('Error fetching tahun akademik list:', err)
      setError('Terjadi kesalahan saat mengambil daftar tahun akademik')
    }
  }, [])

  // Refresh all data
  const refreshTahunAkademik = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        fetchActiveTahunAkademik(),
        fetchTahunAkademikList()
      ])
    } catch (err) {
      console.error('Error refreshing tahun akademik:', err)
      setError('Terjadi kesalahan saat memuat data tahun akademik')
    } finally {
      setIsLoading(false)
    }
  }, [fetchActiveTahunAkademik, fetchTahunAkademikList])

  // Set active tahun akademik
  const setActiveTahunAkademik = useCallback(async (tahunAjaranId: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/tahun-akademik/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tahunAjaranId })
      })

      const result = await response.json()

      if (result.success) {
        // Refresh data after setting active
        await refreshTahunAkademik()
        return true
      } else {
        setError(result.error || 'Gagal mengaktifkan tahun akademik')
        return false
      }
    } catch (err) {
      console.error('Error setting active tahun akademik:', err)
      setError('Terjadi kesalahan saat mengaktifkan tahun akademik')
      return false
    }
  }, [refreshTahunAkademik])

  // Initialize data on mount
  useEffect(() => {
    // Set current tahun akademik from utility
    const current = getCurrentTahunAkademik()
    setCurrentTahunAkademik(current)
    
    // Fetch data
    refreshTahunAkademik()
  }, [refreshTahunAkademik])

  return {
    activeTahunAkademik,
    currentTahunAkademik,
    tahunAkademikList,
    isLoading,
    error,
    refreshTahunAkademik,
    setActiveTahunAkademik
  }
}

// Hook untuk mendapatkan tahun akademik context untuk filtering data
export function useTahunAkademikContext() {
  const { activeTahunAkademik, currentTahunAkademik } = useTahunAkademik()
  
  return {
    tahunAjaranId: activeTahunAkademik?.id || null,
    tahunAkademikInfo: activeTahunAkademik || currentTahunAkademik,
    isActive: !!activeTahunAkademik
  }
}

// Hook untuk format display tahun akademik
export function useTahunAkademikDisplay() {
  const { activeTahunAkademik, currentTahunAkademik } = useTahunAkademik()
  
  const formatTahunAkademik = useCallback((tahunAkademik: any) => {
    if (!tahunAkademik) return 'Tidak ada tahun akademik'
    
    const semester = tahunAkademik.semester === 'S1' ? 'Semester 1' : 'Semester 2'
    const icon = tahunAkademik.semester === 'S1' ? '🌞' : '❄️'
    
    return {
      full: tahunAkademik.namaLengkap || `${tahunAkademik.tahunMulai}/${tahunAkademik.tahunSelesai} ${semester}`,
      short: `${tahunAkademik.tahunMulai}/${tahunAkademik.tahunSelesai}`,
      semester: semester,
      icon: icon,
      period: `${tahunAkademik.tahunMulai}-${tahunAkademik.tahunSelesai}`
    }
  }, [])
  
  return {
    active: formatTahunAkademik(activeTahunAkademik),
    current: formatTahunAkademik(currentTahunAkademik),
    formatTahunAkademik
  }
}