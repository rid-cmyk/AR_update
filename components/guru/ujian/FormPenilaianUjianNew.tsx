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

  // Generate penilaian items based on ujian type
  const generatePenilaianItems = () => {
    const items = []
    
    if (ujianData.jenisUjian.nama.toLowerCase().includes('mhq')) {
      // MHQ - Per Juz dengan aspek penilaian dari admin
      const juzStart = ujianData.juzRange?.dari || 1
      const juzEnd = ujianData.juzRange?.sampai || 1
      
      for (let juz = juzStart; juz <= juzEnd; juz++) {
        // Untuk setiap juz, buat item dengan aspek penilaian
        ujianData.jenisUjian.komponenPenilaian.forEach((komponen) => {
          items.push({
            key: `juz-${juz}-${komponen.nama.toLowerCase().replace(/\s+/g, '_')}`,
            label: `Juz ${juz} - ${komponen.nama}`,
            type: 'juz-aspek',
            juz: juz,
            aspek: komponen.nama,
            bobot: komponen.bobot,
            nilaiMaksimal: komponen.nilaiMaksimal || 100,
            number: juz
          })
        })
      }
    } else {
      // Tasmi - Per Halaman (20 halaman per juz)
      const juzPageMapping: Record<number, { start: number; end: number }> = {
        1: { start: 1, end: 21 },
        2: { start: 22, end: 41 },
        3: { start: 42, end: 61 },
        4: { start: 62, end: 81 },
        5: { start: 82, end: 101 },
        6: { start: 102, end: 121 },
        7: { start: 122, end: 141 },
        8: { start: 142, end: 161 },
        9: { start: 162, end: 181 },
        10: { start: 182, end: 201 },
        11: { start: 202, end: 221 },
        12: { start: 222, end: 241 },
        13: { start: 242, end: 261 },
        14: { start: 262, end: 281 },
        15: { start: 282, end: 301 },
        16: { start: 302, end: 321 },
        17: { start: 322, end: 341 },
        18: { start: 342, end: 361 },
        19: { start: 362, end: 381 },
        20: { start: 382, end: 401 },
        21: { start: 402, end: 421 },
        22: { start: 422, end: 441 },
        23: { start: 442, end: 461 },
        24: { start: 462, end: 481 },
        25: { start: 482, end: 501 },
        26: { start: 502, end: 521 },
        27: { start: 522, end: 541 },
        28: { start: 542, end: 561 },
        29: { start: 562, end: 581 },
        30: { start: 582, end: 604 }
      }

      const juzStart = ujianData.juzRange?.dari || 1
      const juzEnd = ujianData.juzRange?.sampai || 1
      
      for (let juz = juzStart; juz <= juzEnd; juz++) {
        const juzInfo = juzPageMapping[juz]
        if (juzInfo) {
          // 20 halaman per juz (atau sesuai mapping)
          for (let page = juzInfo.start; page <= juzInfo.end; page++) {
            items.push({
              key: `halaman-${page}`,
              label: `Halaman ${page}`,
              type: 'halaman',
              number: page,
              juz: juz
            })
          }
        }
      }
    }
    
    return items
  }

  const penilaianItems = generatePenilaianItems()

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
    const santriPenilaian = penilaianData[santriId]
    if (!santriPenilaian?.nilai) return 0

    const nilaiList = Object.values(santriPenilaian.nilai).filter(n => n > 0)
    if (nilaiList.length === 0) return 0

    return Math.round(nilaiList.reduce((sum, nilai) => sum + nilai, 0) / nilaiList.length)
  }

  const getCompletionStatus = (santriId: string) => {
    const santriPenilaian = penilaianData[santriId]
    if (!santriPenilaian?.nilai) return 0

    const totalItems = penilaianItems.length
    const completedItems = Object.keys(santriPenilaian.nilai).filter(key => 
      santriPenilaian.nilai[key] > 0
    ).length

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
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

  // State untuk navigasi juz
  const [currentJuz, setCurrentJuz] = useState(ujianData.juzRange?.dari || 1)
  
  // Get current juz pages for per-halaman
  const getCurrentJuzPages = () => {
    const juzPageMapping: Record<number, { start: number; end: number }> = {
      1: { start: 1, end: 21 }, 2: { start: 22, end: 41 }, 3: { start: 42, end: 61 },
      4: { start: 62, end: 81 }, 5: { start: 82, end: 101 }, 6: { start: 102, end: 121 },
      7: { start: 122, end: 141 }, 8: { start: 142, end: 161 }, 9: { start: 162, end: 181 },
      10: { start: 182, end: 201 }, 11: { start: 202, end: 221 }, 12: { start: 222, end: 241 },
      13: { start: 242, end: 261 }, 14: { start: 262, end: 281 }, 15: { start: 282, end: 301 },
      16: { start: 302, end: 321 }, 17: { start: 322, end: 341 }, 18: { start: 342, end: 361 },
      19: { start: 362, end: 381 }, 20: { start: 382, end: 401 }, 21: { start: 402, end: 421 },
      22: { start: 422, end: 441 }, 23: { start: 442, end: 461 }, 24: { start: 462, end: 481 },
      25: { start: 482, end: 501 }, 26: { start: 502, end: 521 }, 27: { start: 522, end: 541 },
      28: { start: 542, end: 561 }, 29: { start: 562, end: 581 }, 30: { start: 582, end: 604 }
    }
    return juzPageMapping[currentJuz] || { start: 1, end: 21 }
  }

  const handleNextJuz = () => {
    if (currentJuz < (ujianData.juzRange?.sampai || 1)) {
      setCurrentJuz(currentJuz + 1)
      const nextJuzPages = getCurrentJuzPages()
      setCurrentPage(nextJuzPages.start)
    }
  }

  const handlePrevJuz = () => {
    if (currentJuz > (ujianData.juzRange?.dari || 1)) {
      setCurrentJuz(currentJuz - 1)
      const prevJuzPages = getCurrentJuzPages()
      setCurrentPage(prevJuzPages.start)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Full Screen Header - Royal Islamic Emerald & Gold Theme */}
      <div className="bg-gradient-to-r from-[#046c4e] via-[#057a55] to-[#046c4e] border-b border-emerald-600/40 px-6 py-3.5 shadow-lg relative overflow-hidden">
        {/* Decorative royal gold accent line at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400" />

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              className="bg-white/15 hover:bg-white/25 border-white/25 text-white px-4 h-10 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center"
            >
              Kembali
            </Button>
            
            <div className="h-8 w-px bg-white/20 hidden sm:block" />

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-md border-2 border-white/30">
                <UserOutlined className="text-white text-lg" />
              </div>
              
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-xl font-bold text-white tracking-tight drop-shadow-sm">
                    {currentSantri.nama}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 shadow-sm">
                    {ujianData.jenisUjian.nama}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-emerald-100 font-medium flex-wrap">
                  <span className="flex items-center gap-1 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {ujianData.juzRange?.dari === ujianData.juzRange?.sampai
                      ? `Juz ${ujianData.juzRange?.dari}`
                      : `Juz ${ujianData.juzRange?.dari} - ${ujianData.juzRange?.sampai}`}
                  </span>
                  
                  <span className="text-emerald-300">•</span>
                  
                  <span>
                    {ujianData.jenisUjian.tipeUjian === 'per-juz' ? 'Mode Per Juz' : 'Mode Per Halaman'}
                  </span>
                  
                  <span className="text-emerald-300">•</span>
                  
                  <span className="text-emerald-100">
                    Halaqah: <span className="text-white font-semibold">{currentSantri.halaqah}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-white/15 backdrop-blur-md border border-white/25 px-5 py-2 rounded-2xl flex items-center gap-5 shadow-inner">
              <div className="text-left">
                <div className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider mb-1">
                  Total Nilai
                </div>
                <Progress 
                  percent={getCompletionStatus(currentSantri.id)} 
                  strokeColor="#f59e0b"
                  showInfo={false}
                  size={6}
                  style={{ width: '110px', marginBottom: 0 }}
                />
              </div>
              
              <div className="h-8 w-px bg-white/20" />

              <div className="text-right">
                <span className="text-3xl font-extrabold text-amber-300 tracking-tight drop-shadow-sm">
                  {calculateNilaiAkhir(currentSantri.id)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <div className="space-y-4">
                <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <div className="text-center">
                    <Title level={4} className="text-white mb-2">
                      🎯 Penilaian Per Juz
                    </Title>
                    <div className="text-2xl font-bold">Juz {currentPage}</div>
                  </div>
                </Card>

                {/* Aspek Penilaian Cards */}
                <div className="space-y-3">
                  {ujianData.jenisUjian.komponenPenilaian.map((komponen, index) => {
                    const itemKey = `juz-${currentPage}-${komponen.nama.toLowerCase().replace(/\s+/g, '_')}`
                    return (
                      <Card 
                        key={itemKey}
                        className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <Text strong className="text-lg text-gray-800">{komponen.nama}</Text>
                              <div className="flex items-center gap-2 mt-1">
                                <Tag color="blue">Bobot: {komponen.bobot}%</Tag>
                                <Tag color="green">Max: {komponen.nilaiMaksimal || 100}</Tag>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Text className="text-sm text-gray-600 font-medium">Nilai:</Text>
                            <InputNumber
                              min={0}
                              max={komponen.nilaiMaksimal || 100}
                              value={getCurrentSantriNilai(itemKey)}
                              onChange={(value) => handleNilaiChange(itemKey, value || 0)}
                              className="w-full"
                              placeholder={`0-${komponen.nilaiMaksimal || 100}`}
                              size="large"
                              style={{ 
                                fontSize: '18px', 
                                fontWeight: 'bold',
                                borderRadius: '8px'
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Text className="text-sm text-gray-600 font-medium">Catatan:</Text>
                            <Input
                              value={getCurrentSantriCatatan(itemKey)}
                              onChange={(e) => handleCatatanItemChange(itemKey, e.target.value)}
                              placeholder={`Catatan untuk ${komponen.nama}...`}
                              className="rounded-lg"
                            />
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>

                {/* Navigation Juz */}
                <Card className="border-0 shadow-md bg-white">
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, ujianData.juzRange?.dari || 1))}
                      disabled={currentPage <= (ujianData.juzRange?.dari || 1)}
                      className="flex-1 mr-2"
                    >
                      ← Juz Sebelumnya
                    </Button>
                    <div className="text-center px-4">
                      <Text strong>Juz {currentPage}</Text>
                    </div>
                    <Button
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, ujianData.juzRange?.sampai || 1))}
                      disabled={currentPage >= (ujianData.juzRange?.sampai || 1)}
                      className="flex-1 ml-2"
                      type="primary"
                    >
                      Juz Selanjutnya →
                    </Button>
                  </div>
                </Card>
              </div>
              )
            ) : (
              // PER-HALAMAN MODE: 20 Number Boxes per Juz
              <div className="space-y-4">
                <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
                  <div className="text-center">
                    <Title level={4} className="text-white mb-2">
                      📄 Penilaian Per Halaman
                    </Title>
                    <div className="text-xl font-bold">Juz {currentJuz}</div>
                    <div className="text-sm opacity-90">Halaman {getCurrentJuzPages().start} - {getCurrentJuzPages().end}</div>
                  </div>
                </Card>

                {/* 20 Number Boxes Grid */}
                <Card className="border-0 shadow-md bg-white">
                  <Title level={5} className="mb-4 text-center text-gray-800">
                    📊 Nilai Per Halaman - Juz {currentJuz}
                  </Title>
                  
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {Array.from({ length: getCurrentJuzPages().end - getCurrentJuzPages().start + 1 }, (_, i) => {
                      const pageNum = getCurrentJuzPages().start + i
                      const itemKey = `halaman-${pageNum}`
                      return (
                        <div 
                          key={pageNum}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                            currentPage === pageNum 
                              ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                          }`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          <div className="text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 ${
                              currentPage === pageNum 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              {pageNum}
                            </div>
                            <InputNumber
                              min={0}
                              max={100}
                              value={getCurrentSantriNilai(itemKey)}
                              onChange={(value) => handleNilaiChange(itemKey, value || 0)}
                              className="w-full"
                              placeholder="0-100"
                              size="small"
                              style={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Navigation Juz */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <Button
                      onClick={handlePrevJuz}
                      disabled={currentJuz <= (ujianData.juzRange?.dari || 1)}
                      className="flex-1 mr-2"
                    >
                      ← Juz {currentJuz - 1}
                    </Button>
                    <div className="text-center px-4">
                      <Text strong className="text-lg">Juz {currentJuz}</Text>
                      <div className="text-xs text-gray-500">
                        {currentJuz - (ujianData.juzRange?.dari || 1) + 1} dari {(ujianData.juzRange?.sampai || 1) - (ujianData.juzRange?.dari || 1) + 1}
                      </div>
                    </div>
                    <Button
                      onClick={handleNextJuz}
                      disabled={currentJuz >= (ujianData.juzRange?.sampai || 1)}
                      className="flex-1 ml-2"
                      type="primary"
                    >
                      Juz {currentJuz + 1} →
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Section Divider & Generous Spacing for Summary and Notes */}
            <div className="pt-6 mt-8 border-t border-slate-200/90">
              {/* Spacer above Catatan Umum */}
              <div style={{ height: '16px' }} />

              {/* Catatan Umum & Evaluasi - Clean Elegant White & Gold Card */}
              <Card 
                className="border border-amber-200/90 shadow-sm transition-all hover:shadow" 
                style={{ 
                  borderRadius: '16px', 
                  background: '#ffffff',
                  marginBottom: '28px'
                }}
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-sm">📝</span>
                    </div>
                    <div>
                      <Title level={5} className="mb-0 text-slate-800 font-bold tracking-tight">
                        Catatan Umum & Evaluasi
                      </Title>
                      <Text className="text-[11px] text-slate-500">Masukan atau nasehat untuk santri ini</Text>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Opsional
                  </span>
                </div>
                <TextArea
                  rows={3}
                  value={getCurrentSantriCatatan()}
                  onChange={(e) => handleCatatanChange(e.target.value)}
                  placeholder="Berikan catatan, nasehat, atau evaluasi bacaan santri di sini..."
                  style={{ 
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#ffffff',
                    border: '1px solid #fde68a',
                    padding: '12px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}
                />
              </Card>

              {/* Explicit 28px DOM Spacer to guarantee spacing between both cards */}
              <div style={{ height: '28px', width: '100%', display: 'block' }} />

              {/* Ringkasan Penilaian - Beautiful Soft Islamic Mint & Royal Green Card */}
              <Card 
                className="border border-emerald-200/80 shadow-md relative overflow-hidden" 
                style={{ 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #ffffff 100%)',
                  marginTop: '8px',
                  marginBottom: '32px'
                }}
              >
                {/* Decorative subtle top-right emerald glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-tr from-[#046c4e] to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">📊</span>
                    </div>
                    <div>
                      <Title level={5} className="mb-0 text-emerald-950 font-bold tracking-tight">
                        Ringkasan Penilaian
                      </Title>
                      <Text className="text-[11px] text-emerald-700/80 font-medium">Progres evaluasi santri</Text>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#046c4e] text-white shadow-sm">
                    {Math.round((Object.keys(penilaianData[currentSantri.id]?.nilai || {}).filter(key => 
                      (penilaianData[currentSantri.id]?.nilai?.[key] || 0) > 0
                    ).length / Math.max(penilaianItems.length, 1)) * 100)}% Selesai
                  </span>
                </div>

                {/* 3-Column White Overlay Metric Cards */}
                <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
                  <div className="text-center p-3 bg-white border border-emerald-100 rounded-xl shadow-sm">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Item</div>
                    <div className="text-2xl font-bold text-slate-800">{penilaianItems.length}</div>
                  </div>
                  <div className="text-center p-3 bg-white border border-emerald-100 rounded-xl shadow-sm">
                    <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">Sudah Dinilai</div>
                    <div className="text-2xl font-extrabold text-[#046c4e]">
                      {Object.keys(penilaianData[currentSantri.id]?.nilai || {}).filter(key => 
                        (penilaianData[currentSantri.id]?.nilai?.[key] || 0) > 0
                      ).length}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white border border-emerald-100 rounded-xl shadow-sm">
                    <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5">Belum Dinilai</div>
                    <div className="text-2xl font-extrabold text-amber-600">
                      {Math.max(0, penilaianItems.length - Object.keys(penilaianData[currentSantri.id]?.nilai || {}).filter(key => 
                        (penilaianData[currentSantri.id]?.nilai?.[key] || 0) > 0
                      ).length)}
                    </div>
                  </div>
                </div>
                
                <Progress 
                  percent={Math.round((Object.keys(penilaianData[currentSantri.id]?.nilai || {}).filter(key => 
                    (penilaianData[currentSantri.id]?.nilai?.[key] || 0) > 0
                  ).length / Math.max(penilaianItems.length, 1)) * 100)} 
                  strokeColor={{
                    '0%': '#059669',
                    '100%': '#046c4e',
                  }}
                  size={8}
                  showInfo={false}
                  className="mb-4 relative z-10"
                />
                
                <div className="flex gap-3 pt-1 relative z-10">
                  <Button 
                    type="default"
                    icon={<SaveOutlined />}
                    onClick={() => handleSubmit('DRAFT')}
                    loading={loading}
                    size="large"
                    style={{
                      flex: 1,
                      height: '48px',
                      fontSize: '13px',
                      fontWeight: 700,
                      borderRadius: '12px',
                      border: '1.5px solid #f59e0b',
                      color: '#b45309',
                      background: '#fffbeb'
                    }}
                  >
                    ⏸️ Pause (Draft)
                  </Button>
                  <Button 
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleSubmit('SELESAI')}
                    loading={loading}
                    size="large"
                    disabled={!canSubmit()}
                    style={{
                      flex: 1,
                      height: '48px',
                      fontSize: '13px',
                      fontWeight: 700,
                      borderRadius: '12px',
                      background: canSubmit() ? 'linear-gradient(135deg, #046c4e 0%, #059669 100%)' : undefined,
                      border: 'none',
                      boxShadow: canSubmit() ? '0 4px 14px rgba(4, 108, 78, 0.35)' : undefined
                    }}
                  >
                    {loading ? 'Menyimpan...' : canSubmit() ? '✅ Selesaikan' : '⏳ Belum Lengkap'}
                  </Button>
                </div>
              </Card>
            </div>
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