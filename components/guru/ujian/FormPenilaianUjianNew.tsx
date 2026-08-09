'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  InputNumber, 
  Button, 
  Typography, 
  Tag,
  message,
  Progress,
  Input
} from 'antd'
import { 
  SaveOutlined, 
  ArrowLeftOutlined,
  UserOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { MushafDigital } from './MushafDigital'
import { FormPertanyaanPerJuz } from './FormPertanyaanPerJuz'
import { FormPenilaianSummary } from './FormPenilaianSummary'
import { FormPenilaianHeader } from './FormPenilaianHeader'
import { PenilaianPerHalamanMode } from './PenilaianPerHalamanMode'
import { AspekPenilaianMode } from './AspekPenilaianMode'
import { generatePenilaianItems } from './utils/penilaianUtils'
import { calculateNilaiAkhir as calculateNilaiAkhirUtil, getCompletionStatus as getCompletionStatusUtil } from './utils/penilaianUtils';
import { usePenilaianUjianNav } from './usePenilaianUjianNav';

const { Title, Text } = Typography
const { TextArea } = Input

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

  // Initialize pertanyaan per juz
  useEffect(() => {
    if (ujianData.jenisUjian.tipeUjian === 'per-juz' && ujianData.jumlahPertanyaanPerJuz) {
      const initialData: Record<number, Record<number, Record<string, number>>> = {}
      for (let juz = ujianData.juzRange!.dari; juz <= ujianData.juzRange!.sampai; juz++) {
        initialData[juz] = {}
        for (let p = 1; p <= ujianData.jumlahPertanyaanPerJuz; p++) {
          initialData[juz][p] = {}
          ujianData.jenisUjian.komponenPenilaian.forEach(k => {
            initialData[juz][p][k.nama] = 0
          })
        }
      }
      setNilaiPertanyaanPerJuz(initialData)
    }
  }, [ujianData])

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
                halaqah: santri.halaqah?.namaHalaqah || 'Halaqah Umar'
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
    setPenilaianData(prev => ({
      ...prev,
      [currentSantri.id]: {
        ...prev[currentSantri.id],
        santriId: currentSantri.id,
        nilai: {
          ...prev[currentSantri.id]?.nilai,
          [itemKey]: nilai
        },
        catatan: prev[currentSantri.id]?.catatan || '',
        nilaiAkhir: 0 // Will be calculated
      }
    }))
  }

  const handleCatatanChange = (catatan: string) => {
    setPenilaianData(prev => ({
      ...prev,
      [currentSantri.id]: {
        ...prev[currentSantri.id],
        santriId: currentSantri.id,
        nilai: prev[currentSantri.id]?.nilai || {},
        catatan,
        nilaiAkhir: 0
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

  const handleCatatanItemChange = (itemKey: string, catatan: string) => {
    setPenilaianData(prev => ({
      ...prev,
      [currentSantri.id]: {
        ...prev[currentSantri.id],
        santriId: currentSantri.id,
        nilai: prev[currentSantri.id]?.nilai || {},
        catatan: prev[currentSantri.id]?.catatan || '',
        catatanItem: {
          ...prev[currentSantri.id]?.catatanItem,
          [itemKey]: catatan
        },
        nilaiAkhir: 0
      }
    }))
  }

  const calculateNilaiAkhir = (santriId: string) => {
    return calculateNilaiAkhirUtil(penilaianData[santriId]);
  }

  const getCompletionStatus = (santriId: string) => {
    return getCompletionStatusUtil(penilaianData[santriId], penilaianItems.length);
  }
  const handleSubmit = async (status: 'DRAFT' | 'SELESAI' = 'SELESAI') => {
    try {
      setLoading(true)

      // Untuk mode pertanyaan per juz
      if (ujianData.jenisUjian.tipeUjian === 'per-juz' && ujianData.jumlahPertanyaanPerJuz) {
        // Hitung nilai akhir dari semua pertanyaan
        const allNilai: number[] = []
        const nilaiDetail: Record<string, number> = {}
        
        // Konversi nilai pertanyaan per juz ke format nilaiDetail
        Object.entries(nilaiPertanyaanPerJuz).forEach(([juz, pertanyaanData]) => {
          Object.entries(pertanyaanData).forEach(([pertanyaan, komponenData]) => {
            Object.entries(komponenData).forEach(([komponen, nilai]) => {
              const key = `juz-${juz}-p${pertanyaan}-${komponen.toLowerCase().replace(/\s+/g, '_')}`
              nilaiDetail[key] = nilai
              if (nilai > 0) {
                allNilai.push(nilai)
              }
            })
          })
        })

        const nilaiAkhir = allNilai.length > 0 
          ? Math.round(allNilai.reduce((sum, n) => sum + n, 0) / allNilai.length)
          : 0

        // Format data sesuai dengan API yang ada
        const ujianResult = {
          santriId: currentSantri.id,
          nilaiDetail: nilaiDetail,
          nilaiAkhir: nilaiAkhir,
          catatan: penilaianData[currentSantri.id]?.catatan || ''
        }

        const submitData = {
          status: status,
          jenisUjian: {
            nama: ujianData.jenisUjian.nama,
            tipeUjian: ujianData.jenisUjian.tipeUjian,
            komponenPenilaian: ujianData.jenisUjian.komponenPenilaian
          },
          juzRange: ujianData.juzRange,
          ujianResults: [ujianResult],
          metadata: {
            tanggalUjian: new Date().toISOString(),
            guruId: 'current_guru_id',
            jumlahPertanyaanPerJuz: ujianData.jumlahPertanyaanPerJuz,
            totalPertanyaan: (ujianData.juzRange!.sampai - ujianData.juzRange!.dari + 1) * ujianData.jumlahPertanyaanPerJuz
          }
        }

        const response = await fetch('/api/guru/ujian', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })

        if (response.ok) {
          const result = await response.json()
          message.success(status === 'DRAFT' ? 'Progress ujian disimpan sebagai Draft (Jeda)!' : 'Penilaian ujian berhasil diselesaikan!')
          console.log('Ujian saved:', result)
          await onComplete(submitData)
        } else {
          const error = await response.json()
          message.error(error.message || 'Gagal menyimpan penilaian ujian')
        }
      } else {
        // Mode lainnya (per-halaman atau per-juz tanpa pertanyaan)
        const finalData = Object.keys(penilaianData).map(santriId => ({
          santriId: santriId,
          nilaiDetail: penilaianData[santriId].nilai,
          nilaiAkhir: calculateNilaiAkhir(santriId),
          catatan: penilaianData[santriId].catatan || ''
        }))

        const submitData = {
          status: status,
          jenisUjian: ujianData.jenisUjian,
          juzRange: ujianData.juzRange,
          ujianResults: finalData,
          metadata: {
            tanggalUjian: new Date().toISOString(),
            guruId: 'current_guru_id'
          }
        }

        const response = await fetch('/api/guru/ujian', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        })

        if (response.ok) {
          message.success(status === 'DRAFT' ? 'Progress ujian disimpan sebagai Draft (Jeda)!' : 'Penilaian ujian berhasil diselesaikan!')
          await onComplete(submitData)
        } else {
          const error = await response.json()
          message.error(error.message || 'Gagal menyimpan penilaian ujian')
        }
      }
    } catch (error) {
      console.error('Error submitting ujian:', error)
      message.error('Gagal menyimpan penilaian ujian')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = () => {
    // Untuk mode pertanyaan per juz
    if (ujianData.jenisUjian.tipeUjian === 'per-juz' && ujianData.jumlahPertanyaanPerJuz) {
      // Cek apakah semua pertanyaan di semua juz sudah dinilai
      for (let juz = ujianData.juzRange!.dari; juz <= ujianData.juzRange!.sampai; juz++) {
        for (let p = 1; p <= ujianData.jumlahPertanyaanPerJuz; p++) {
          const komponenData = nilaiPertanyaanPerJuz[juz]?.[p]
          if (!komponenData) return false
          
          // Cek apakah semua komponen sudah dinilai
          const allFilled = ujianData.jenisUjian.komponenPenilaian.every(
            komponen => (komponenData[komponen.nama] || 0) > 0
          )
          if (!allFilled) return false
        }
      }
      return true
    }
    
    // Untuk mode lainnya
    return getCompletionStatus(currentSantri.id) > 0
  }

  const { currentJuz, setCurrentJuz, getCurrentJuzPages, handleNextJuz, handlePrevJuz } = usePenilaianUjianNav({ ujianData, currentPage, setCurrentPage });

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <FormPenilaianHeader
        onBack={onBack}
        currentSantri={currentSantri}
        ujianData={ujianData}
        completionPercent={getCompletionStatus(currentSantri.id)}
        nilaiAkhir={calculateNilaiAkhir(currentSantri.id)}
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