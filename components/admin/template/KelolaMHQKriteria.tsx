'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Input, Badge, message, Typography, Space, Divider } from 'antd'
import { Slider } from '@/components/ui/slider-antd'
import { SaveOutlined, SettingOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { RotateCcw, Trash2, Plus, Save } from 'lucide-react'
import { Label } from '@/components/ui/label'
interface KriteriaMHQ {
  id: string
  nama: string
  bobot: number
  deskripsi: string
}

const defaultKriteria: KriteriaMHQ[] = [
  { id: '1', nama: 'Tajwid', bobot: 30, deskripsi: 'Ketepatan dalam penerapan kaidah tajwid' },
  { id: '2', nama: 'Sifatul Huruf', bobot: 25, deskripsi: 'Kejelasan sifat-sifat huruf hijaiyah' },
  { id: '3', nama: 'Kejelasan Bacaan', bobot: 25, deskripsi: 'Kejelasan dan ketepatan dalam membaca' },
  { id: '4', nama: 'Kelancaran', bobot: 20, deskripsi: 'Kelancaran dan kecepatan dalam membaca' }
]

export function KelolaMHQKriteria() {
  const [kriteria, setKriteria] = useState<KriteriaMHQ[]>(defaultKriteria)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchKriteria()
  }, [])

  const fetchKriteria = async () => {
    try {
      const response = await fetch('/api/admin/mhq-kriteria')
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setKriteria(data)
        }
      }
    } catch (error) {
      console.error('Error fetching kriteria:', error)
    }
  }

  const getTotalBobot = () => {
    return kriteria.reduce((total, k) => total + k.bobot, 0)
  }

  const updateKriteria = (id: string, field: keyof KriteriaMHQ, value: string | number) => {
    setKriteria(prev => prev.map(k => 
      k.id === id ? { ...k, [field]: value } : k
    ))
  }

  const addKriteria = () => {
    const newId = Date.now().toString()
    const newKriteria: KriteriaMHQ = {
      id: newId,
      nama: '',
      bobot: 0,
      deskripsi: ''
    }
    setKriteria(prev => [...prev, newKriteria])
  }

  const removeKriteria = (id: string) => {
    if (kriteria.length <= 1) {
      message.error('Minimal harus ada satu kriteria')
      return
    }
    setKriteria(prev => prev.filter(k => k.id !== id))
  }

  const resetToDefault = () => {
    setKriteria(defaultKriteria)
    message.info('Kriteria direset ke pengaturan default')
  }

  const handleSave = async () => {
    if (getTotalBobot() !== 100) {
      message.error('Total bobot harus 100%')
      return
    }

    if (kriteria.some(k => !k.nama.trim())) {
      message.error('Semua kriteria harus memiliki nama')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/mhq-kriteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kriteria })
      })

      if (response.ok) {
        message.success('Kriteria MHQ berhasil disimpan!')
      } else {
        const error = await response.json()
        message.error(error.message || 'Gagal menyimpan kriteria')
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setIsLoading(false)
    }
  }

  const { Title, Text } = Typography;

  return (
    <Card
      style={{
        maxWidth: 1024,
        margin: '0 auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        background: 'white',
        backdropFilter: 'blur(8px)',
        borderRadius: 16
      }}
      styles={{ body: { padding: 32 } }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px 16px 0 0',
        padding: 24,
        marginBottom: 24,
        margin: '-32px -32px 24px -32px'
      }}>
        <Title level={3} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: 0,
          color: '#1e293b'
        }}>
          <div style={{
            padding: 8,
            background: '#e0e7ff',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <SettingOutlined style={{ fontSize: 20, color: '#4f46e5' }} />
          </div>
          Kelola Kriteria MHQ
        </Title>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#374151' }}>
              Kriteria Penilaian MHQ
            </Title>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>
              Atur kriteria dan bobot penilaian untuk ujian MHQ (Muraaja'ah Hafalan)
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge 
              color={getTotalBobot() === 100 ? "blue" : "red"}
              style={{ padding: '4px 12px' }}
            >
              Total Bobot: {getTotalBobot()}%
            </Badge>
            <Button
              type="default"
              size="small"
              onClick={resetToDefault}
              icon={<ReloadOutlined />}
            >
              Reset Default
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {kriteria.map((k, index) => (
            <Card 
              key={k.id} 
              style={{
                border: '1px solid rgba(148, 163, 184, 0.2)',
                background: 'rgba(248, 250, 252, 0.3)',
                transition: 'all 0.3s ease'
              }}
              styles={{ body: { padding: 24 } }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(248, 250, 252, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(248, 250, 252, 0.3)';
              }}
            >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-800">Kriteria {index + 1}</h4>
                    <Button
                      type="default"
                      size="small"
                      onClick={() => removeKriteria(k.id)}
                      danger
                      disabled={kriteria.length <= 1}
                      icon={<DeleteOutlined />}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`nama-${k.id}`} className="text-sm font-medium text-gray-700">
                        Nama Kriteria
                      </Label>
                      <Input
                        id={`nama-${k.id}`}
                        value={k.nama}
                        onChange={(e) => updateKriteria(k.id, 'nama', e.target.value)}
                        placeholder="Contoh: Tajwid"
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Bobot Penilaian: {k.bobot}%
                      </Label>
                      <div className="px-3">
                        <Slider
                          value={[k.bobot]}
                          onValueChange={(value) => updateKriteria(k.id, 'bobot', value[0])}
                          max={100}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`deskripsi-${k.id}`} className="text-sm font-medium text-gray-700">
                      Deskripsi Kriteria
                    </Label>
                    <Input
                      id={`deskripsi-${k.id}`}
                      value={k.deskripsi}
                      onChange={(e) => updateKriteria(k.id, 'deskripsi', e.target.value)}
                      placeholder="Deskripsi singkat tentang kriteria ini..."
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-sm text-indigo-800">
                      <strong>Kontribusi:</strong> {k.bobot}% dari total nilai akhir
                    </p>
                  </div>
                </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            type="default"
            onClick={addKriteria}
            icon={<PlusOutlined />}
          >
            Tambah Kriteria
          </Button>

          <Button
            type="primary"
            onClick={handleSave}
            disabled={isLoading || getTotalBobot() !== 100}
            loading={isLoading}
            icon={<SaveOutlined />}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Kriteria'}
          </Button>
        </div>

        {/* Preview */}
        <Card
          title={
            <Title level={4} style={{ margin: 0, color: '#374151' }}>
              Preview Penilaian MHQ
            </Title>
          }
          style={{
            background: '#f9fafb',
            border: '1px solid #d1d5db'
          }}
          styles={{ body: { padding: 24 } }}
        >
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">
                Contoh tampilan form penilaian dengan kriteria yang telah diatur:
              </p>
              {kriteria.map((k, index) => (
                <div key={k.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{k.nama || `Kriteria ${index + 1}`}</p>
                    <p className="text-xs text-gray-500">{k.deskripsi}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge count={`${k.bobot}%`} color="blue" />
                    <div className="w-20 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                      0-100
                    </div>
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 16,
                padding: 12,
                background: '#e0e7ff',
                borderRadius: 8,
                borderLeft: '4px solid #6366f1'
              }}>
                <Typography.Text style={{ fontSize: 14, color: '#3730a3' }}>
                  <strong>Perhitungan:</strong> Nilai Akhir = Σ(Nilai × Bobot) / 100
                </Typography.Text>
              </div>
            </div>
        </Card>
      </div>
    </Card>
  )
}