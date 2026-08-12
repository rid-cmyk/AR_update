'use client'

import { useState, useEffect } from 'react'
import { message } from 'antd'
import { MushafDigital } from './MushafDigital'
import { FormPertanyaanPerJuz } from './FormPertanyaanPerJuz'
import { FormPenilaianSummary } from './FormPenilaianSummary'
import { FormPenilaianHeader } from './FormPenilaianHeader'
import { PenilaianPerHalamanMode } from './PenilaianPerHalamanMode'
import { AspekPenilaianMode } from './AspekPenilaianMode'
import {
  generatePenilaianItems,
  calculateNilaiAkhir,
  getCompletionStatus,
  buildPertanyaanPerJuzState,
  buildNilaiDetailFromPertanyaan,
  isPertanyaanPerJuzLengkap
} from './utils/penilaianUtils'
import { usePenilaianUjianNav } from './usePenilaianUjianNav'

interface UjianData {
  santriIds: string[]
  jenisUjian: {
    id: string
    nama: string
    tipeUjian: 'per-halaman' | 'per-juz'
    komponenPenilaian: Array<{
      nama: string
      bobot: number
      nilaiMaksimal?: number
    }>
  }
  juzRange?: {
    dari: number
    sampai: number
  }
  jumlahPertanyaanPerJuz?: number
}

interface FormPenilaianUjianProps {
  ujianData: UjianData
  onBack: () => void
  onComplete: (data: Record<string, unknown>) => void
}

interface PenilaianSantri {
  santriId: string
  nilai: Record<string, number>
  catatan: string
  catatanItem?: Record<string, string>
  nilaiAkhir: number
}

export function FormPenilaianUjian({
  ujianData,
  onBack,
  onComplete
}: FormPenilaianUjianProps) {
  const [currentPage, setCurrentPage] = useState(ujianData.juzRange?.dari || 1)
  const [penilaianData, setPenilaianData] = useState<Record<string, PenilaianSantri>>({})
  const [loading, setLoading] = useState(false)

  // State untuk nilai pertanyaan per juz: { juz: { pertanyaan: { komponenNama: nilai } } }
  const [nilaiPertanyaanPerJuz, setNilaiPertanyaanPerJuz] = useState<Record<number, Record<number, Record<string, number>>>>({})

  // Single santri data - fetch from API
  const [santriData, setSantriData] = useState<{id: string, nama: string, halaqah: string} | null>(null)

  const isPertanyaanMode = ujianData.jenisUjian.tipeUjian === 'per-juz' && !!ujianData.jumlahPertanyaanPerJuz

  // Initialize pertanyaan per juz
  useEffect(() => {
    if (isPertanyaanMode && ujianData.juzRange) {
      setNilaiPertanyaanPerJuz(
        buildPertanyaanPerJuzState(
          ujianData.juzRange.dari,
          ujianData.juzRange.sampai,
          ujianData.jumlahPertanyaanPerJuz!,
          ujianData.jenisUjian.komponenPenilaian
        )
      )
    }
  }, [isPertanyaanMode, ujianData])

  useEffect(() => {
    let isMounted = true
    
    // Fetch santri data based on ID
    const fetchSantriData = async () => {
      try {
        const response = await fetch('/api/guru/santri')
        if (response.ok && isMounted) {
          const result = await response.json()
          if (result.success && result.data.santriList && result.data.santriList.length > 0) {
            const santri = result.data.santriList.find((s: Record<string, unknown>) => Number(s.id) === Number(ujianData.santriIds[0]))
            if (santri && isMounted) {
              setSantriData({
                id: santri.id,
                nama: santri.namaLengkap,
                halaqah: santri.halaqah?.namaHalaqah || 'Tidak ada halaqah'
              })
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching santri data:', error)
        }
      }
    }

    if (ujianData.santriIds.length > 0) {
      fetchSantriData()
    }

    return () => {
      isMounted = false
    }
  }, [ujianData.santriIds])

  const currentSantri = santriData || { id: ujianData.santriIds[0], nama: 'Loading...', halaqah: 'Loading...' }

  // Helper: update data penilaian santri aktif (merge dengan state lama di dalam updater agar aman dari race)
  const updateCurrentSantri = (patch: (current: PenilaianSantri | undefined) => Partial<PenilaianSantri>) => {
    setPenilaianData(prev => {
      const existing = prev[currentSantri.id]
      return {
        ...prev,
        [currentSantri.id]: {
          ...existing,
          santriId: currentSantri.id,
          catatan: existing?.catatan || '',
          nilaiAkhir: 0,
          ...patch(existing)
        }
      }
    })
  }

  // Handler untuk update nilai pertanyaan per juz
  const handleNilaiPertanyaanChange = (juz: number, pertanyaan: number, komponen: string, nilai: number) => {
    setNilaiPertanyaanPerJuz(prev => ({
      ...prev,
      [juz]: {
        ...prev[juz],
        [pertanyaan]: {
          ...prev[juz]?.[pertanyaan],
          [komponen]: nilai
        }
      }
    }))
  }

  const penilaianItems = generatePenilaianItems(ujianData)

  const handleNilaiChange = (itemKey: string, nilai: number) => {
    updateCurrentSantri(existing => ({
      nilai: {
        ...(existing?.nilai || {}),
        [itemKey]: nilai
      }
    }))
  }

  const handleCatatanChange = (catatan: string) => {
    updateCurrentSantri(() => ({ catatan }))
  }

  const handleCatatanItemChange = (itemKey: string, catatan: string) => {
    updateCurrentSantri(existing => ({
      catatanItem: {
        ...(existing?.catatanItem || {}),
        [itemKey]: catatan
      }
    }))
  }

  const getCurrentSantriCatatan = (itemKey?: string) => {
    if (itemKey) {
      return penilaianData[currentSantri.id]?.catatanItem?.[itemKey] || ''
    }
    return penilaianData[currentSantri.id]?.catatan || ''
  }

  const getCurrentSantriNilai = (itemKey: string): number => {
    return penilaianData[currentSantri.id]?.nilai?.[itemKey] || 0
  }

  const calculateNilaiAkhirSantri = (santriId: string) => {
    return calculateNilaiAkhir(penilaianData[santriId]);
  }

  const getCompletionStatusSantri = (santriId: string) => {
    return getCompletionStatus(penilaianData[santriId], penilaianItems.length);
  }
  // Bangun payload submit untuk mode pertanyaan per juz
  const buildPerJuzSubmitData = (status: 'DRAFT' | 'SELESAI') => {
    const { nilaiDetail, nilaiAkhir } = buildNilaiDetailFromPertanyaan(nilaiPertanyaanPerJuz)

    return {
      status,
      jenisUjian: {
        nama: ujianData.jenisUjian.nama,
        tipeUjian: ujianData.jenisUjian.tipeUjian,
        komponenPenilaian: ujianData.jenisUjian.komponenPenilaian
      },
      juzRange: ujianData.juzRange,
      ujianResults: [{
        santriId: currentSantri.id,
        nilaiDetail,
        nilaiAkhir,
        catatan: penilaianData[currentSantri.id]?.catatan || ''
      }],
      metadata: {
        tanggalUjian: new Date().toISOString(),
        jumlahPertanyaanPerJuz: ujianData.jumlahPertanyaanPerJuz!,
        totalPertanyaan: (ujianData.juzRange!.sampai - ujianData.juzRange!.dari + 1) * ujianData.jumlahPertanyaanPerJuz!
      }
    }
  }

  // Bangun payload submit untuk mode per-halaman / per-juz tanpa pertanyaan
  const buildUmumSubmitData = (status: 'DRAFT' | 'SELESAI') => {
    const finalData = Object.keys(penilaianData).map(santriId => ({
      santriId,
      nilaiDetail: penilaianData[santriId].nilai,
      nilaiAkhir: calculateNilaiAkhirSantri(santriId),
      catatan: penilaianData[santriId].catatan || ''
    }))

    return {
      status,
      jenisUjian: ujianData.jenisUjian,
      juzRange: ujianData.juzRange,
      ujianResults: finalData,
      metadata: {
        tanggalUjian: new Date().toISOString()
      }
    }
  }

  // Kirim payload ke API (shared untuk semua mode)
  const persistUjian = async (submitData: Record<string, unknown>, status: 'DRAFT' | 'SELESAI') => {
    const response = await fetch('/api/guru/ujian', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData)
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Ujian saved:', result)
      message.success(status === 'DRAFT' ? 'Progress ujian disimpan sebagai Draft (Jeda)!' : 'Penilaian ujian berhasil diselesaikan!')
      await onComplete(submitData)
    } else {
      const error = await response.json()
      message.error(error.message || 'Gagal menyimpan penilaian ujian')
    }
  }

  const handleSubmit = async (status: 'DRAFT' | 'SELESAI' = 'SELESAI') => {
    try {
      setLoading(true)
      const submitData = isPertanyaanMode
        ? buildPerJuzSubmitData(status)
        : buildUmumSubmitData(status)
      await persistUjian(submitData, status)
    } catch (error) {
      console.error('Error submitting ujian:', error)
      message.error('Gagal menyimpan penilaian ujian')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = () => {
    // Untuk mode pertanyaan per juz
    if (isPertanyaanMode) {
      return isPertanyaanPerJuzLengkap(ujianData, ujianData.jumlahPertanyaanPerJuz!, nilaiPertanyaanPerJuz)
    }

    // Untuk mode lainnya
    return getCompletionStatusSantri(currentSantri.id) > 0
  }

  const { currentJuz, setCurrentJuz, getCurrentJuzPages, handleNextJuz, handlePrevJuz } = usePenilaianUjianNav({ ujianData, currentPage, setCurrentPage });

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <FormPenilaianHeader
        onBack={onBack}
        currentSantri={currentSantri}
        ujianData={ujianData}
        completionPercent={getCompletionStatusSantri(currentSantri.id)}
        nilaiAkhir={calculateNilaiAkhirSantri(currentSantri.id)}
      />

      {/* Main Content - Full Screen */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Side - Form Penilaian (50% width) */}
        <div className="w-1/2 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 overflow-auto border-r-2 border-gray-200">
          <div className="p-5 space-y-3">
            
            {ujianData.jenisUjian.tipeUjian === 'per-juz' ? (
              ujianData.jumlahPertanyaanPerJuz ? (
                // PER-JUZ MODE dengan PERTANYAAN
                <FormPertanyaanPerJuz
                  ujianData={{
                    jenisUjian: ujianData.jenisUjian,
                    juzRange: ujianData.juzRange!,
                    jumlahPertanyaanPerJuz: ujianData.jumlahPertanyaanPerJuz
                  }}
                  currentJuz={currentPage}
                  onJuzChange={setCurrentPage}
                  nilaiData={nilaiPertanyaanPerJuz}
                  onNilaiChange={handleNilaiPertanyaanChange}
                />
              ) : (
                // PER-JUZ MODE: Aspek Penilaian (tanpa pertanyaan)
                <AspekPenilaianMode
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                ujianData={ujianData}
                getCurrentSantriNilai={getCurrentSantriNilai}
                handleNilaiChange={handleNilaiChange}
                getCurrentSantriCatatan={getCurrentSantriCatatan}
                handleCatatanItemChange={handleCatatanItemChange}
              />
              )
            ) : (
              // PER-HALAMAN MODE: 20 Number Boxes per Juz
              <PenilaianPerHalamanMode
                currentJuz={currentJuz}
                getCurrentJuzPages={getCurrentJuzPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                getCurrentSantriNilai={getCurrentSantriNilai}
                handleNilaiChange={handleNilaiChange}
                handlePrevJuz={handlePrevJuz}
                handleNextJuz={handleNextJuz}
                ujianData={ujianData}
              />
            )}

            <FormPenilaianSummary
              currentSantriId={currentSantri.id}
              penilaianData={penilaianData}
              penilaianItemsLength={penilaianItems.length}
              getCurrentSantriCatatan={getCurrentSantriCatatan}
              handleCatatanChange={handleCatatanChange}
              handleSubmit={handleSubmit}
              loading={loading}
              canSubmit={canSubmit}
            />
          </div>
        </div>

        {/* Right Side - Mushaf Digital (50% width) */}
        <div className="w-1/2 bg-white overflow-auto">
          <MushafDigital
            juzMulai={ujianData.juzRange?.dari || 1}
            juzSampai={ujianData.juzRange?.sampai || 30}
            tipeUjian={ujianData.jenisUjian.tipeUjian === 'per-halaman' ? 'per-halaman' : 'per-juz'}
            currentPage={currentPage}
            currentJuz={currentJuz}
            onPageChange={setCurrentPage}
            onJuzChange={setCurrentJuz}
            showAcakHalaman={ujianData.jenisUjian.nama.toLowerCase().includes('mhq')}
            kategoriUjian={ujianData.jenisUjian.nama}
            className="h-full border-0"
          />
        </div>
      </div>
    </div>
  )


}