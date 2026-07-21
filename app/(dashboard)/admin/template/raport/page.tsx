'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Typography, Space, Modal } from 'antd'
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons'
import AdminHeaderCard from '@/components/admin/layout/AdminHeaderCard'
import { FormTemplateRaport } from '@/components/admin/template/FormTemplateRaport'
import { DaftarTemplate } from '@/components/admin/template/DaftarTemplate'

const { Text } = Typography

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
    <>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
        <AdminHeaderCard
          title="Template Raport"
          subtitle={`${stats} template raport — kelola template cetak laporan santri`}
          actions={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)}>
              Buat Template
            </Button>
          }
        />
        <Space direction="vertical" size={24} style={{ width: '100%' }}>

          <Card>
            <DaftarTemplate type="template-raport" onRefresh={fetchStats} refreshTrigger={refreshTrigger} />
          </Card>
        </Space>
      </div>

      <Modal
        title="Buat Template Raport"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <FormTemplateRaport
          onSuccess={() => {
            fetchStats()
            setRefreshTrigger(prev => prev + 1)
            setShowModal(false)
          }}
        />
      </Modal>
    </>
  )
}
