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
  message
} from 'antd'
import { 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  BookOutlined,
  EditOutlined
} from '@ant-design/icons'
import { FormUjianWizard } from '@/components/guru/ujian/FormUjianWizard'
import { LiveExamSplitScreen } from '@/components/guru/ujian/LiveExamSplitScreen'
import { useRouter } from 'next/navigation'

const { Content } = Layout
const { Title } = Typography

export default function UjianFullScreenPage() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<'wizard' | 'form' | 'success'>('wizard')
  const [ujianData, setUjianData] = useState<any | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const handleWizardComplete = (data: any) => {
    setUjianData(data)
    setCurrentView('form')
    setCurrentStep(1)
  }

  const handleFormBack = () => {
    setCurrentView('wizard')
    setCurrentStep(0)
  }

  const handleFormComplete = () => {
    setCurrentView('success')
    setCurrentStep(2)
  }

  const handlePauseComplete = () => {
    message.success("Progress ujian (Draft) telah disimpen.")
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
  const kategoriUjian: "kenaikan_juz" | "uas" | "mhq" | "tasmi" =
    ujianData?.jenisUjian?.jenisUjian === "mhq"
      ? "mhq"
      : ujianData?.jenisUjian?.jenisUjian === "uas"
      ? "uas"
      : ujianData?.jenisUjian?.jenisUjian === "tasmi" ||
        ujianData?.jenisUjian?.tipeUjian === "per-halaman"
      ? "tasmi"
      : "kenaikan_juz";

  return (
    <Layout style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Header */}
      <div style={{
        background: '#1e293b',
        padding: '16px 32px',
        borderBottom: '1px solid #334155'
      }}>
        <div className="flex items-center justify-between">
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToDashboard}
              style={{ color: '#94a3b8' }}
            >
              Kembali ke Dashboard
            </Button>
          </Space>
          <div className="text-right">
            <Title level={4} style={{ color: '#ffffff', margin: 0 }}>
              Ujian Tahfizh & Evaluasi Al-Qur&apos;an
            </Title>
            <div style={{ color: '#94a3b8', fontSize: '12px' }}>
              Wizard Penilaian & Mode Ujian Split-Screen Digital
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ 
        background: '#1e293b', 
        padding: '16px 32px',
        borderBottom: '1px solid #334155'
      }}>
        <Steps current={currentStep} items={steps} />
      </div>

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
              onBack={handleFormBack}
              onPause={handlePauseComplete}
              onFinish={handleFormComplete}
            />
          )}

          {currentView === 'success' && (
            <Card variant="borderless" style={{ background: '#1e293b', borderRadius: '16px' }}>
              <Result
                status="success"
                title={<span className="text-white font-bold">Ujian Berhasil Disimpan!</span>}
                subTitle={<span className="text-slate-300">Seluruh nilai, catatan ustadz, dan capaian hafalan santri telah tersimpan secara resmi di sistem.</span>}
                extra={[
                  <Button type="primary" size="large" onClick={handleBackToDashboard} key="dashboard" className="bg-emerald-600 hover:bg-emerald-500 border-none">
                    Kembali ke Dashboard
                  </Button>,
                  <Button size="large" onClick={() => {
                    setCurrentView('wizard')
                    setCurrentStep(0)
                    setUjianData(null)
                  }} key="new" className="bg-slate-700 text-white hover:bg-slate-600 border-none">
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
        background: '#1e293b',
        padding: '12px 32px',
        textAlign: 'center',
        borderTop: '1px solid #334155',
        color: '#64748b',
        fontSize: '12px'
      }}>
        © 2025 Sistem Manajemen Hafalan Al-Qur&apos;an • Mode Split-Screen Interaktif
      </div>
    </Layout>
  )
}
