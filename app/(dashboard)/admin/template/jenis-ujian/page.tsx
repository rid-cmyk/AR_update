'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Typography, Space, Modal } from 'antd'
import { BookOutlined, PlusOutlined } from '@ant-design/icons'
import AdminHeaderCard from '@/components/admin/layout/AdminHeaderCard'
import { FormJenisUjian } from '@/components/admin/template/FormJenisUjian'
import { DaftarTemplate } from '@/components/admin/template/DaftarTemplate'

const { Text } = Typography

export default function JenisUjianPage() {
  const [showModal, setShowModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [stats, setStats] = useState(0)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/template-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.totalJenisUjian)
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
          title="Jenis Ujian"
          subtitle={`${stats} jenis ujian terdaftar — kelola jenis ujian dan komponen penilaian`}
          actions={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowModal(true)}>
              Tambah Jenis Ujian
            </Button>
          }
        />
        <Space direction="vertical" size={24} style={{ width: '100%' }}>

          <Card>
            <DaftarTemplate type="jenis-ujian" onRefresh={fetchStats} refreshTrigger={refreshTrigger} />
          </Card>
        </Space>
      </div>

      <Modal
        title="Tambah Jenis Ujian"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={700}
        destroyOnHidden
      >
        <FormJenisUjian
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
