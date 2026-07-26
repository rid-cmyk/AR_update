'use client'

import { useState } from 'react'
import { Card, Row, Col, Statistic, Typography, Space } from 'antd'
import { FileTextOutlined, BookOutlined, UnorderedListOutlined } from '@ant-design/icons'
import AdminHeaderCard from '@/components/admin/layout/AdminHeaderCard'
import { TahunAkademikSelector } from '@/components/admin/tahun-akademik/TahunAkademikSelector'

const { Text } = Typography

interface Stats {
  totalTahunAkademik: number
  totalTemplateUjian: number
  totalTemplateRaport: number
  totalKomponenPenilaian: number
}

const statItems = [
  { key: 'totalTemplateUjian', label: 'Template Ujian', icon: <FileTextOutlined />, color: '#f59e0b' },
  { key: 'totalTemplateRaport', label: 'Template Raport', icon: <UnorderedListOutlined />, color: '#ec4899' },
  { key: 'totalKomponenPenilaian', label: 'Komponen Penilaian', icon: <BookOutlined />, color: '#8b5cf6' },
] as const

interface TemplateTahunAkademikClientProps {
  initialStats: Stats
}

export default function TemplateTahunAkademikClient({ initialStats }: TemplateTahunAkademikClientProps) {
  const [stats, setStats] = useState<Stats>(initialStats)
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/template-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
        <AdminHeaderCard
          title="Tahun Akademik"
          subtitle="Atur tahun ajaran untuk seluruh sistem template"
        />
        <Space direction="vertical" size={24} style={{ width: '100%' }}>

          <Row gutter={[16, 16]}>
            {statItems.map(({ key, label, icon, color }) => (
              <Col xs={8} key={key}>
                <Card size="small" loading={loading} style={{ borderTop: `3px solid ${color}` }}>
                  <Statistic
                    title={<Text style={{ fontSize: 12 }}>{label}</Text>}
                    value={stats[key as keyof Stats]}
                    prefix={<span style={{ color }}>{icon}</span>}
                    valueStyle={{ fontSize: 20, fontWeight: 600 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <TahunAkademikSelector onTahunAkademikChange={fetchStats} showStats={true} />
        </Space>
      </div>
    </>
  )
}
