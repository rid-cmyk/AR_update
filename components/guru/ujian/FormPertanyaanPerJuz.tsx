'use client'

import { useState } from 'react'
import { Card, InputNumber, Button, Typography, Tag, Progress, message } from 'antd'
import { CheckCircleOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

interface FormPertanyaanPerJuzProps {
  ujianData: {
    jenisUjian: {
      komponenPenilaian: Array<{
        nama: string
        bobot: number
        nilaiMaksimal?: number
      }>
    }
    juzRange: { dari: number; sampai: number }
    jumlahPertanyaanPerJuz: number
  }
  currentJuz: number
  onJuzChange: (juz: number) => void
  nilaiData: Record<number, Record<number, Record<string, number>>>
  onNilaiChange: (juz: number, pertanyaan: number, komponen: string, nilai: number) => void
}

export function FormPertanyaanPerJuz({
  ujianData,
  currentJuz,
  onJuzChange,
  nilaiData,
  onNilaiChange
}: FormPertanyaanPerJuzProps) {
  const [currentPertanyaan, setCurrentPertanyaan] = useState(1)

  const isPertanyaanComplete = (juz: number, pertanyaan: number) => {
    const nilaiKomponen = nilaiData[juz]?.[pertanyaan]
    if (!nilaiKomponen) return false
    return Object.values(nilaiKomponen).every(nilai => nilai > 0)
  }

  const isJuzComplete = (juz: number) => {
    for (let p = 1; p <= ujianData.jumlahPertanyaanPerJuz; p++) {
      if (!isPertanyaanComplete(juz, p)) return false
    }
    return true
  }

  const handleNext = () => {
    if (currentPertanyaan < ujianData.jumlahPertanyaanPerJuz) {
      setCurrentPertanyaan(currentPertanyaan + 1)
    } else if (currentJuz < ujianData.juzRange.sampai) {
      if (isJuzComplete(currentJuz)) {
        onJuzChange(currentJuz + 1)
        setCurrentPertanyaan(1)
        message.success(`Pindah ke Juz ${currentJuz + 1}`)
      } else {
        message.warning('Selesaikan semua pertanyaan di juz ini terlebih dahulu')
      }
    }
  }

  const handlePrev = () => {
    if (currentPertanyaan > 1) {
      setCurrentPertanyaan(currentPertanyaan - 1)
    } else if (currentJuz > ujianData.juzRange.dari) {
      onJuzChange(currentJuz - 1)
      setCurrentPertanyaan(ujianData.jumlahPertanyaanPerJuz)
    }
  }

  const getJuzProgress = (juz: number) => {
    const completed = Array.from({ length: ujianData.jumlahPertanyaanPerJuz }, (_, i) => i + 1)
      .filter(p => isPertanyaanComplete(juz, p)).length
    return Math.round((completed / ujianData.jumlahPertanyaanPerJuz) * 100)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <Card className="border-0 shadow-sm" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px'
      }}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold text-lg">{currentPertanyaan}</Text>
            </div>
            <Title level={4} className="text-white mb-0">
              Pertanyaan {currentPertanyaan} untuk Juz {currentJuz}
            </Title>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isPertanyaanComplete(currentJuz, currentPertanyaan) && (
              <Tag color="success" className="border-0">
                <CheckCircleOutlined /> Selesai
              </Tag>
            )}
            <Text className="text-white/90 text-sm">
              {currentPertanyaan} dari {ujianData.jumlahPertanyaanPerJuz} pertanyaan
            </Text>
          </div>
        </div>
      </Card>

      {/* Progress Juz */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <Text strong className="text-gray-700 text-sm">Progress Juz {currentJuz}</Text>
            </div>
            <div className="px-3 py-1 bg-purple-50 rounded-full">
              <Text className="text-xs font-semibold text-purple-700">
                {Array.from({ length: ujianData.jumlahPertanyaanPerJuz }, (_, i) => i + 1)
                  .filter(p => isPertanyaanComplete(currentJuz, p)).length} / {ujianData.jumlahPertanyaanPerJuz}
              </Text>
            </div>
          </div>
          <Progress 
            percent={getJuzProgress(currentJuz)}
            strokeColor={{ '0%': '#667eea', '100%': '#764ba2' }}
            strokeWidth={8}
            style={{ marginBottom: 0 }}
          />
        </div>
      </Card>

      {/* Komponen Penilaian */}
      <div className="space-y-2">
        {ujianData.jenisUjian.komponenPenilaian.map((komponen, index) => {
          const nilaiKomponen = nilaiData[currentJuz]?.[currentPertanyaan]?.[komponen.nama] || 0
          const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']
          const color = colors[index % colors.length]
          
          return (
            <Card 
              key={komponen.nama}
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
              style={{ 
                borderRadius: '12px',
                borderLeft: `4px solid ${color}`
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: color }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <Text strong className="text-base text-gray-800">{komponen.nama}</Text>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">Bobot {komponen.bobot}%</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">Max {komponen.nilaiMaksimal || 100}</span>
                      </div>
                    </div>
                  </div>
                  {nilaiKomponen > 0 && (
                    <div className="px-2 py-1 bg-green-50 rounded-md">
                      <CheckCircleOutlined className="text-green-600 text-sm" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <InputNumber
                    min={0}
                    max={komponen.nilaiMaksimal || 100}
                    value={nilaiKomponen}
                    onChange={(value) => onNilaiChange(currentJuz, currentPertanyaan, komponen.nama, value || 0)}
                    className="w-full"
                    placeholder={`Masukkan nilai 0-${komponen.nilaiMaksimal || 100}`}
                    size="large"
                    style={{ 
                      fontSize: '16px', 
                      fontWeight: '600',
                      borderRadius: '8px',
                      borderColor: nilaiKomponen > 0 ? color : undefined
                    }}
                  />
                  
                  <Progress 
                    percent={Math.round((nilaiKomponen / (komponen.nilaiMaksimal || 100)) * 100)}
                    strokeColor={nilaiKomponen >= 85 ? '#10b981' : nilaiKomponen >= 70 ? '#3b82f6' : nilaiKomponen >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth={6}
                    showInfo={false}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Navigation */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrev}
              disabled={currentJuz === ujianData.juzRange.dari && currentPertanyaan === 1}
              icon={<ArrowLeftOutlined />}
              size="large"
              style={{ 
                flex: 1,
                borderRadius: '8px',
                height: '44px',
                fontWeight: 500
              }}
            >
              Sebelumnya
            </Button>
            <div className="px-4 py-2 rounded-lg" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <Text strong className="text-white text-sm">
                {currentPertanyaan}/{ujianData.jumlahPertanyaanPerJuz}
              </Text>
            </div>
            <Button
              onClick={handleNext}
              disabled={currentJuz === ujianData.juzRange.sampai && currentPertanyaan === ujianData.jumlahPertanyaanPerJuz}
              type="primary"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              size="large"
              style={{ 
                flex: 1,
                borderRadius: '8px',
                height: '44px',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Selanjutnya
            </Button>
          </div>
          
          {/* Juz Navigation */}
          {ujianData.juzRange.sampai > ujianData.juzRange.dari && (
            <div className="pt-3 border-t border-gray-100">
              <Text className="text-xs text-gray-500 mb-2 block">Navigasi Juz:</Text>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: ujianData.juzRange.sampai - ujianData.juzRange.dari + 1 }, (_, i) => {
                  const juz = ujianData.juzRange.dari + i
                  const isComplete = isJuzComplete(juz)
                  const isCurrent = juz === currentJuz
                  return (
                    <Button
                      key={juz}
                      size="small"
                      type={isCurrent ? 'primary' : 'default'}
                      onClick={() => {
                        onJuzChange(juz)
                        setCurrentPertanyaan(1)
                      }}
                      style={{
                        borderRadius: '6px',
                        fontSize: '12px',
                        height: '28px',
                        minWidth: '50px',
                        background: isCurrent ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : isComplete ? '#f0fdf4' : undefined,
                        borderColor: isComplete && !isCurrent ? '#10b981' : undefined,
                        color: isComplete && !isCurrent ? '#10b981' : undefined
                      }}
                    >
                      {isComplete && !isCurrent && <CheckCircleOutlined style={{ fontSize: '10px', marginRight: '2px' }} />}
                      {juz}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
