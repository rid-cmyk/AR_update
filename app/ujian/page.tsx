'use client'

import { useState, useEffect } from 'react'
import { 
  Layout, 
  Button, 
  Card, 
  Steps, 
  Typography, 
  Space,
  Spin,
  Result
} from 'antd'
import { 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  BookOutlined
} from '@ant-design/icons'
import { FormUjianWizard } from '@/components/guru/ujian/FormUjianWizard'
import { FormPenilaianUjian } from '@/components/guru/ujian/FormPenilaianUjianNew'
import { useRouter } from 'next/navigation'

const { Content } = Layout
const { Title } = Typography

export default function UjianFullScreenPage() {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<'wizard' | 'form' | 'success'>('wizard')
  const [ujianData, setUjianData] = useState<any>(null)
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

  const handleBackToDashboard = () => {
    router.push('/guru/ujian')
  }

  const steps = [
    {
      title: 'Pilih Santri & Juz',
      icon: <BookOutlined />
    },
    {
      title: 'Input Nilai',
      icon: <BookOutlined />
    },
    {
      title: 'Selesai',
      icon: <CheckCircleOutlined />
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        padding: '24px 48px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToDashboard}
              style={{ color: 'white' }}
            >
              Kembali ke Dashboard
            </Button>
          </Space>
          <Title level={2} style={{ color: 'white', margin: '8px 0 0 0' }}>
            Form Ujian Hafalan
          </Title>
        </Space>
      </div>

      {/* Progress Steps */}
      <div style={{ 
        background: 'white', 
        padding: '24px 48px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Steps current={currentStep} items={steps} />
      </div>

      {/* Content */}
      <Content style={{ padding: '24px 48px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {currentView === 'wizard' && (
            <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <FormUjianWizard 
                onComplete={handleWizardComplete}
                onCancel={handleBackToDashboard}
              />
            </Card>
          )}

          {currentView === 'form' && ujianData && (
            <FormPenilaianUjian 
              ujianData={ujianData}
              onBack={handleFormBack}
              onComplete={handleFormComplete}
            />
          )}

          {currentView === 'success' && (
            <Card variant="borderless" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Result
                status="success"
                title="Ujian Berhasil Disimpan!"
                subTitle="Data ujian telah berhasil disimpan ke sistem. Anda dapat melihat hasilnya di dashboard."
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
        background: 'white',
        padding: '16px 48px',
        textAlign: 'center',
        borderTop: '1px solid #f0f0f0',
        color: '#8c8c8c'
      }}>
        © 2025 Sistem Manajemen Hafalan - AR Hapalan
      </div>
    </Layout>
  )
}
