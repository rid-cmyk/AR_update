'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Typography, Modal, Steps } from 'antd'
import { PlusOutlined, FileTextOutlined, SettingOutlined, PrinterOutlined, InfoCircleOutlined } from '@ant-design/icons'
import AdminHeaderCard from '@/components/admin/layout/AdminHeaderCard'
import WebSideDrawer from '@/components/ui/WebSideDrawer'
import { FormTemplateRaport } from '@/components/admin/template/FormTemplateRaport'
import { DaftarTemplate } from '@/components/admin/template/DaftarTemplate'

const { Text, Title } = Typography

export default function TemplateRaportPage() {
  const [showModal, setShowModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [stats, setStats] = useState(0)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/template-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.totalTemplateRaport)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => { fetchStats() }, [])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      <AdminHeaderCard
        title="Template Raport"
        subtitle={`${stats} template tersimpan — buat dan kelola format cetak raport santri`}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)}>
            Buat Template Baru
          </Button>
        }
      />

      {/* Panduan Cepat */}
      <Card
        style={{ marginBottom: 24, borderLeft: '4px solid #219ebc' }}
        size="small"
      >
        <div className="flex items-start gap-3">
          <InfoCircleOutlined style={{ fontSize: 18, color: '#219ebc', marginTop: 2 }} />
          <div>
            <Text strong>Apa itu Template Raport?</Text>
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              Template raport digunakan untuk mengatur format cetak laporan hasil hafalan santri.
              Setiap template berisi informasi lembaga, kop surat, tanda tangan kepala, dan pengaturan tampilan grafik/ranking.
              Pilih template saat akan mencetak raport santri.
            </Text>
          </div>
        </div>
      </Card>

      {/* Langkah Penggunaan */}
      <Card title="Cara Menggunakan" size="small" style={{ marginBottom: 24 }}>
        <Steps
          direction="vertical"
          size="small"
          current={-1}
          items={[
            {
              title: 'Buat Template',
              description: 'Klik tombol "Buat Template Baru" di atas. Isi nama template, tahun akademik, dan informasi lembaga.',
              icon: <FileTextOutlined />,
            },
            {
              title: 'Atur Detail',
              description: 'Lengkapi kop surat, nama kepala lembaga, dan pengaturan tampilan (grafik, ranking).',
              icon: <SettingOutlined />,
            },
            {
              title: 'Gunakan untuk Cetak',
              description: 'Saat mencetak raport santri, pilih template yang sudah dibuat. Format akan otomatis diterapkan.',
              icon: <PrinterOutlined />,
            },
          ]}
        />
      </Card>

      {/* Daftar Template */}
      <Card
        title={`Daftar Template (${stats})`}
        extra={
          stats === 0 && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              Belum ada template. Klik &quot;Buat Template Baru&quot; untuk memulai.
            </Text>
          )
        }
      >
        <DaftarTemplate type="template-raport" onRefresh={fetchStats} refreshTrigger={refreshTrigger} />
      </Card>

      {/* Zero Code Duplication Helper for Template Raport Form */}
      {(() => {
        const renderTemplateRaportFormContent = () => (
          <FormTemplateRaport
            onSuccess={() => {
              fetchStats()
              setRefreshTrigger(prev => prev + 1)
              setShowModal(false)
            }}
          />
        );

        return (
          <>
            {/* Mobile Modal (< 1024px) */}
            <Modal
              title="Buat Template Raport Baru"
              open={showModal}
              onCancel={() => setShowModal(false)}
              footer={null}
              width={800}
              destroyOnHidden
              className="lg:hidden"
            >
              {renderTemplateRaportFormContent()}
            </Modal>

            {/* Desktop WebSideDrawer (>= 1024px) */}
            <WebSideDrawer
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title="Buat Template Raport Baru"
              subtitle="Desain dan atur susunan kolom, bobot penilaian, dan format cetak rapor santri"
              size="lg"
            >
              {renderTemplateRaportFormContent()}
            </WebSideDrawer>
          </>
        );
      })()}
    </div>
  )
}
