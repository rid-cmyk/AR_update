'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Select, Badge, Progress, message, Space, Typography } from 'antd'
import { 
  FileTextOutlined, 
  DownloadOutlined, 
  EyeOutlined, 
  PrinterOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

interface TahunAjaran {
  id: number
  namaLengkap: string
}

interface TemplateRaport {
  id: number
  namaTemplate: string
  tahunAjaran: {
    namaLengkap: string
  }
}

interface Santri {
  id: number
  namaLengkap: string
  username: string
  halaqah: {
    namaHalaqah: string
  }
}

interface RaportData {
  santriId: number
  templateRaportId: number
  tahunAjaranId: number
  nilaiRataRata: number
  ranking: number
  statusKelulusan: string
  pathFilePDF?: string
}

export function GenerateRaportPDF() {
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([])
  const [templateList, setTemplateList] = useState<TemplateRaport[]>([])
  const [santriList, setSantriList] = useState<Santri[]>([])
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number>(0)
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0)
  const [selectedSantri, setSelectedSantri] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedRaports, setGeneratedRaports] = useState<RaportData[]>([])

  useEffect(() => {
    fetchTahunAjaran()
    fetchTemplateRaport()
    fetchSantriList()
  }, [])

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik')
      if (response.ok) {
        const data = await response.json()
        setTahunAjaranList(data)
      }
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error)
    }
  }

  const fetchTemplateRaport = async () => {
    try {
      const response = await fetch('/api/admin/template-raport')
      if (response.ok) {
        const data = await response.json()
        setTemplateList(data)
      }
    } catch (error) {
      console.error('Error fetching template raport:', error)
    }
  }

  const fetchSantriList = async () => {
    try {
      const response = await fetch('/api/guru/santri')
      if (response.ok) {
        const data = await response.json()
        setSantriList(data)
      }
    } catch (error) {
      console.error('Error fetching santri:', error)
    }
  }

  const handleGenerateRaport = async () => {
    if (!selectedTahunAjaran || !selectedTemplate || selectedSantri.length === 0) {
      message.error('Pilih tahun ajaran, template, dan minimal satu santri')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      const totalSantri = selectedSantri.length
      const generatedData: RaportData[] = []

      for (let i = 0; i < selectedSantri.length; i++) {
        const santriId = selectedSantri[i]
        
        // Simulate API call untuk generate raport
        const response = await fetch('/api/admin/generate-raport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            santriId,
            templateRaportId: selectedTemplate,
            tahunAjaranId: selectedTahunAjaran
          })
        })

        if (response.ok) {
          const raportData = await response.json()
          generatedData.push(raportData)
        }

        // Update progress
        const progress = ((i + 1) / totalSantri) * 100
        setGenerationProgress(progress)
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setGeneratedRaports(generatedData)
      message.success(`${generatedData.length} raport berhasil di-generate!`)
    } catch (error) {
      console.error('Error generating raport:', error)
      message.error('Gagal generate raport')
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  const handleDownloadRaport = async (raportId: number) => {
    try {
      const response = await fetch(`/api/admin/download-raport/${raportId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `raport-${raportId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading raport:', error)
      message.error('Gagal download raport')
    }
  }

  const handleDownloadAll = async () => {
    try {
      const response = await fetch('/api/admin/download-raport-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raportIds: generatedRaports.map(r => r.santriId),
          tahunAjaranId: selectedTahunAjaran
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `raport-batch-${selectedTahunAjaran}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        message.success('Semua raport berhasil didownload!')
      }
    } catch (error) {
      console.error('Error downloading batch raport:', error)
      message.error('Gagal download batch raport')
    }
  }

  const toggleSantriSelection = (santriId: number) => {
    setSelectedSantri(prev => 
      prev.includes(santriId) 
        ? prev.filter(id => id !== santriId)
        : [...prev, santriId]
    )
  }

  const selectAllSantri = () => {
    setSelectedSantri(santriList.map(s => s.id))
  }

  const clearSelection = () => {
    setSelectedSantri([])
  }

  const { Title } = Typography;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card
        style={{
          background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
          border: "1px solid #d8b4fe",
          borderRadius: 16
        }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            color: '#7c3aed',
            margin: 0
          }}>
            <FileTextOutlined style={{ fontSize: 24 }} />
            Generate Raport PDF
          </Title>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#374151', 
                  marginBottom: 8, 
                  display: 'block' 
                }}>
                  Tahun Akademik
                </label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Pilih Tahun Akademik"
                  value={selectedTahunAjaran || undefined}
                  onChange={(value) => setSelectedTahunAjaran(value)}
                >
                  {tahunAjaranList.map((tahun) => (
                    <Select.Option key={tahun.id} value={tahun.id}>
                      {tahun.namaLengkap}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <label style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#374151', 
                  marginBottom: 8, 
                  display: 'block' 
                }}>
                  Template Raport
                </label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Pilih Template Raport"
                  value={selectedTemplate || undefined}
                  onChange={(value) => setSelectedTemplate(value)}
                >
                  {templateList.map((template) => (
                    <Select.Option key={template.id} value={template.id}>
                      {template.namaTemplate}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Pilih Santri ({selectedSantri.length} dipilih)
                </label>
                <div className="flex gap-2">
                  <Button type="default" size="small" onClick={selectAllSantri}>
                    Pilih Semua
                  </Button>
                  <Button type="default" size="small" onClick={clearSelection}>
                    Batal Pilih
                  </Button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                {santriList.map((santri) => (
                  <div
                    key={santri.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      selectedSantri.includes(santri.id)
                        ? 'bg-purple-100 border-purple-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleSantriSelection(santri.id)}
                  >
                    <div>
                      <p className="font-medium text-sm">{santri.namaLengkap}</p>
                      <p className="text-xs text-gray-600">{santri.halaqah.namaHalaqah}</p>
                    </div>
                    {selectedSantri.includes(santri.id) && (
                      <CheckCircleOutlined style={{ color: '#9333ea' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generating raport...</span>
                <span className="text-sm text-gray-600">{Math.round(generationProgress)}%</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="primary"
              onClick={handleGenerateRaport}
              disabled={isGenerating || !selectedTahunAjaran || !selectedTemplate || selectedSantri.length === 0}
              loading={isGenerating}
              style={{ background: '#9333ea', borderColor: '#9333ea' }}
            >
              <FileTextOutlined style={{ marginRight: 8 }} />
              {isGenerating ? 'Generating...' : 'Generate Raport'}
            </Button>

            {generatedRaports.length > 0 && (
              <Button
                type="default"
                onClick={handleDownloadAll}
                style={{ borderColor: '#c084fc', color: '#7c3aed' }}
              >
                <DownloadOutlined style={{ marginRight: 8 }} />
                Download Semua
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Generated Raports */}
      {generatedRaports.length > 0 && (
        <Card
          title={
            <Space>
              <BarChartOutlined />
              <span>Raport yang Telah Di-generate</span>
            </Space>
          }
          styles={{ body: { padding: 24 } }}
        >
            <div className="space-y-3">
              {generatedRaports.map((raport) => {
                const santri = santriList.find(s => s.id === raport.santriId)
                return (
                  <div key={raport.santriId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{santri?.namaLengkap}</h4>
                        <Badge variant="outline">{santri?.halaqah.namaHalaqah}</Badge>
                        <Badge className={
                          raport.statusKelulusan === 'Lulus' 
                            ? 'bg-green-100 text-green-800'
                            : raport.statusKelulusan === 'Tidak Lulus'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {raport.statusKelulusan}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                        <span>Nilai Rata-rata: <strong>{raport.nilaiRataRata}</strong></span>
                        <span>Ranking: <strong>#{raport.ranking}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="default" size="small" icon={<EyeOutlined />} />
                      <Button 
                        type="default" 
                        size="small"
                        onClick={() => handleDownloadRaport(raport.santriId)}
                        icon={<DownloadOutlined />}
                      />
                      <Button type="default" size="small" icon={<PrinterOutlined />} />
                    </div>
                  </div>
                )
              })}
            </div>
        </Card>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
        <Card
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            border: "1px solid #bbf7d0"
          }}
          styles={{ body: { padding: 24 } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Typography.Text style={{ color: '#16a34a', fontSize: 14, fontWeight: 500 }}>
                Raport Generated
              </Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#15803d' }}>
                {generatedRaports.length}
              </div>
            </div>
            <FileTextOutlined style={{ fontSize: 32, color: '#22c55e' }} />
          </div>
        </Card>

        <Card
          style={{
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            border: "1px solid #93c5fd"
          }}
          styles={{ body: { padding: 24 } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Typography.Text style={{ color: '#2563eb', fontSize: 14, fontWeight: 500 }}>
                Santri Lulus
              </Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1d4ed8' }}>
                {generatedRaports.filter(r => r.statusKelulusan === 'Lulus').length}
              </div>
            </div>
            <UserOutlined style={{ fontSize: 32, color: '#3b82f6' }} />
          </div>
        </Card>

        <Card
          style={{
            background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
            border: "1px solid #c4b5fd"
          }}
          styles={{ body: { padding: 24 } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Typography.Text style={{ color: '#7c3aed', fontSize: 14, fontWeight: 500 }}>
                Rata-rata Kelas
              </Typography.Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#6d28d9' }}>
                {generatedRaports.length > 0
                  ? Math.round(generatedRaports.reduce((sum, r) => sum + r.nilaiRataRata, 0) / generatedRaports.length)
                  : 0
                }
              </div>
            </div>
            <BarChartOutlined style={{ fontSize: 32, color: '#8b5cf6' }} />
          </div>
        </Card>
      </div>
    </div>
  )
}