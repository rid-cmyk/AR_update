'use client'

import { useState } from 'react'
import { 
  Layout, 
  Button, 
  Card, 
  Steps, 
  Typography, 
  Space,
  Result,
  App
} from 'antd'
import { 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  BookOutlined,
  EditOutlined
} from '@ant-design/icons'
import { useSearchParams, useRouter } from 'next/navigation'
import { FormUjianWizard } from '@/components/guru/ujian/FormUjianWizard'
import { LiveExamSplitScreen } from '@/components/guru/ujian/LiveExamSplitScreen'
import { isPerHalamanKategori } from '@/components/guru/ujian/utils/penilaianUtils'

const { Content } = Layout
const { Title } = Typography

const VALID_KATEGORI = ['kenaikan_juz', 'uas', 'mhq', 'tasmi'] as const
type Kategori = (typeof VALID_KATEGORI)[number]

export default function UjianFullScreenPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { message } = App.useApp()

  const remedialMode = searchParams.get('mode') === 'remedial'
  const remedialId = searchParams.get('id')
  const remedialKategori = (VALID_KATEGORI as readonly string[]).includes(searchParams.get('jenis') || '')
    ? (searchParams.get('jenis') as Kategori)
    : 'kenaikan_juz'
  const remedialSantriId = Number(searchParams.get('santri')) || 0
  const remedialSantriNama = searchParams.get('nama') || 'Santri Remedial'
  const remedialDari = Math.min(30, Math.max(1, Number(searchParams.get('dari')) || 1))
  const remedialSampai = Math.min(30, Math.max(remedialDari, Number(searchParams.get('sampai')) || remedialDari))
  const remedialKkm = Math.min(100, Math.max(0, Number(searchParams.get('kkm')) || 70))

  const [currentView, setCurrentView] = useState<'wizard' | 'form' | 'success'>(
    remedialMode ? 'form' : 'wizard'
  )
  const [ujianData, setUjianData] = useState<any | null>(
    remedialMode
      ? {
          santriIds: [remedialSantriId],
          santriNama: remedialSantriNama,
          jenisUjian: { jenisUjian: remedialKategori },
          juzRange: { dari: remedialDari, sampai: remedialSampai },
        }
      : null
  )
  const [currentStep, setCurrentStep] = useState(remedialMode ? 1 : 0)
  const [submitting, setSubmitting] = useState(false)

  const handleWizardComplete = (data: any) => {
    setUjianData(data)
    setCurrentView('form')
    setCurrentStep(1)
  }

  const handleFormBack = () => {
    if (remedialMode) {
      router.push('/guru/ujian')
      return
    }
    setCurrentView('wizard')
    setCurrentStep(0)
  }

  const persistExam = async (dataState: any, status: 'DRAFT' | 'SELESAI') => {
    const kategoriUjian = (dataState.kategoriUjian as Kategori) || remedialKategori
    const tipeUjian = isPerHalamanKategori(kategoriUjian) ? 'per-halaman' : 'per-juz'

    if (remedialMode && remedialId) {
      const res = await fetch(`/api/guru/ujian/${remedialId}/remedial`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nilaiDetail: dataState.nilaiDetail || {},
          nilaiAkhir: Number(dataState.nilaiAkhir) || 0,
          catatan: dataState.catatan || '',
          status,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal menyimpan ujian remedial')
      }
      return
    }

    const res = await fetch('/api/guru/ujian', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        jenisUjian: {
          nama: kategoriUjian,
          tipeUjian,
        },
        juzRange: {
          dari: Number(dataState.juzDari) || 1,
          sampai: Number(dataState.juzSampai) || 1,
        },
        ujianResults: [
          {
            santriId: dataState.santri?.id,
            nilaiDetail: dataState.nilaiDetail || {},
            nilaiAkhir: Number(dataState.nilaiAkhir) || 0,
            catatan: dataState.catatan || '',
          },
        ],
        metadata: {
          tanggalUjian: new Date().toISOString(),
        },
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Gagal menyimpan hasil ujian')
    }
  }

  const handleFormComplete = async (dataState: any) => {
    try {
      setSubmitting(true)
      await persistExam(dataState, 'SELESAI')
      message.success(remedialMode ? 'Ujian remedial berhasil disimpan!' : 'Ujian Berhasil Disimpan!')
      if (remedialMode) {
        router.push('/guru/ujian')
        return
      }
      setCurrentView('success')
      setCurrentStep(2)
    } catch (err: any) {
      message.error(err?.message || 'Gagal menyimpan ujian')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePauseComplete = async (dataState: any) => {
    try {
      if (!remedialMode) {
        await persistExam(dataState, 'DRAFT')
        message.success('Progress ujian (Draft) telah disimpan.')
      } else if (remedialId) {
        await persistExam(dataState, 'DRAFT')
        message.success('Progress ujian remedial (Draft) telah disimpan.')
      }
    } catch (err: any) {
      message.error(err?.message || 'Gagal menyimpan draft ujian')
    }
    handleBackToDashboard()
  }

  const handleBackToDashboard = () => {
    router.push('/guru/ujian')
  }

  const steps = [
    {
      title: 'Pilih Santri & Kategori',
      icon: <BookOutlined />
    },
    {
      title: 'Live Exam (Split-Screen)',
      icon: <EditOutlined />
    },
    {
      title: 'Selesai',
      icon: <CheckCircleOutlined />
    }
  ]

  // Parse kategoriUjian safely
  const kategoriUjian: Kategori =
    ujianData?.jenisUjian?.jenisUjian === "mhq"
      ? "mhq"
      : ujianData?.jenisUjian?.jenisUjian === "uas"
      ? "uas"
      : ujianData?.jenisUjian?.jenisUjian === "tasmi" ||
        ujianData?.jenisUjian?.tipeUjian === "per-halaman"
      ? "tasmi"
      : "kenaikan_juz";

  return (
    <Layout style={{ minHeight: '100vh', background: '#f4f9fb' }}>
      {/* Header */}
      {currentView !== 'form' && (
        <div style={{
          background: '#ffffff',
          padding: '16px 32px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div className="flex items-center justify-between gap-4">
            <Space>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToDashboard}
                style={{ color: '#023047' }}
              >
                Kembali ke Dashboard
              </Button>
            </Space>
            <div className="text-right">
              <Title level={4} style={{ color: '#023047', margin: 0 }}>
                {remedialMode ? 'Ujian Remedial' : 'Ujian Tahfizh & Evaluasi Al-Qur\'an'}
              </Title>
              <div style={{ color: '#64748b', fontSize: '12px' }}>
                {remedialMode
                  ? `Remedial per-juz di bawah KKM — ${remedialKategori.toUpperCase()}`
                  : 'Wizard Penilaian & Mode Ujian Split-Screen Digital'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      {currentView !== 'form' && (
        <div style={{
          background: '#ffffff',
          padding: '14px 32px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <Steps current={currentStep} items={steps} />
        </div>
      )}

      {/* Content */}
      <Content style={{ padding: '24px 32px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          {currentView === 'wizard' && (
            <Card variant="borderless" style={{ background: 'transparent' }}>
              <FormUjianWizard 
                onComplete={handleWizardComplete}
                onCancel={handleBackToDashboard}
              />
            </Card>
          )}

          {currentView === 'form' && ujianData && (
            <LiveExamSplitScreen
              santri={{
                id: ujianData.santriIds?.[0] || 1,
                nama: ujianData.santriNama || "Santri Evaluasi",
              }}
              kategoriUjian={kategoriUjian}
              juzDari={ujianData.juzRange?.dari || 1}
              juzSampai={ujianData.juzRange?.sampai || 1}
              jumlahSoalMhq={ujianData.jumlahPertanyaanPerJuz || 3}
              kkm={remedialMode ? remedialKkm : 70}
              isRemedial={remedialMode}
              onBack={handleFormBack}
              onPause={handlePauseComplete}
              onFinish={handleFormComplete}
            />
          )}

          {currentView === 'success' && (
            <Card variant="borderless" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <Result
                status="success"
                title={<span className="text-deep-space font-bold">Ujian Berhasil Disimpan!</span>}
                subTitle={<span className="text-slate-500">Seluruh nilai, catatan ustadz, dan capaian hafalan santri telah tersimpan secara resmi di sistem.</span>}
                extra={[
                  <Button type="primary" size="large" onClick={handleBackToDashboard} key="dashboard">
                    Kembali ke Dashboard
                  </Button>,
                  <Button size="large" onClick={() => {
                    setCurrentView('wizard')
                    setCurrentStep(0)
                    setUjianData(null)
                  }} key="new">
                    Buat Ujian Baru
                  </Button>
                ]}
              />
            </Card>
          )}
        </div>
      </Content>

      {/* Footer */}
      <div style={{
        background: '#ffffff',
        padding: '12px 32px',
        textAlign: 'center',
        borderTop: '1px solid #e2e8f0',
        color: '#64748b',
        fontSize: '12px'
      }}>
        © 2025 Sistem Manajemen Hafalan Al-Qur&apos;an • Mode Split-Screen Interaktif
      </div>
    </Layout>
  )
}
