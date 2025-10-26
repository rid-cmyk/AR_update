'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Input, 
  Button, 
  Table, 
  Space, 
  message, 
  Typography,
  Tag,
  Popconfirm,
  Tabs,
  Spin
} from 'antd'
import { 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface TahunAkademik {
  id: string
  nama: string
  tahunMulai: number
  tahunSelesai: number
  semester: string
  isActive: boolean
  createdAt: string
}

interface JenisUjian {
  id: string
  nama: string
  kode: string
}

interface TemplateUjian {
  id: string
  nama: string
  jenisUjian: JenisUjian
  tahunAkademik: TahunAkademik
  komponenPenilaian: Array<{
    nama: string
    bobot: number
  }>
  createdAt: string
}

interface TemplateRaport {
  id: string
  nama: string
  namaLembaga: string
  tahunAkademik: TahunAkademik
  tampilanGrafik: boolean
  tampilanRanking: boolean
  createdAt: string
}

interface DaftarTemplateProps {
  onUpdate?: () => void
}

export function DaftarTemplate({ onUpdate }: DaftarTemplateProps) {
  const [tahunAkademikList, setTahunAkademikList] = useState<TahunAkademik[]>([])
  const [templateUjianList, setTemplateUjianList] = useState<TemplateUjian[]>([])
  const [templateRaportList, setTemplateRaportList] = useState<TemplateRaport[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllTemplates()
  }, [])

  const fetchAllTemplates = async () => {
    setLoading(true)
    try {
      const [tahunAkademikRes, templateUjianRes, templateRaportRes] = await Promise.all([
        fetch('/api/admin/tahun-akademik'),
        fetch('/api/admin/template-ujian'),
        fetch('/api/admin/template-raport')
      ])

      if (tahunAkademikRes.ok) {
        const data = await tahunAkademikRes.json()
        setTahunAkademikList(data)
      }

      if (templateUjianRes.ok) {
        const data = await templateUjianRes.json()
        setTemplateUjianList(data)
      }

      if (templateRaportRes.ok) {
        const data = await templateRaportRes.json()
        setTemplateRaportList(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      message.error('Gagal memuat data template')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTahunAkademik = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/tahun-akademik/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        message.success('Tahun akademik berhasil dihapus!')
        fetchAllTemplates()
        onUpdate?.()
      } else {
        const error = await response.json()
        message.error(error.error || 'Gagal menghapus tahun akademik')
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menghapus')
    }
  }

  const handleDeleteTemplateUjian = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/template-ujian/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        message.success('Template ujian berhasil dihapus!')
        fetchAllTemplates()
        onUpdate?.()
      } else {
        const error = await response.json()
        message.error(error.message || 'Gagal menghapus template ujian')
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menghapus')
    }
  }

  const handleDeleteTemplateRaport = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/template-raport/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        message.success('Template raport berhasil dihapus!')
        fetchAllTemplates()
        onUpdate?.()
      } else {
        const error = await response.json()
        message.error(error.message || 'Gagal menghapus template raport')
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menghapus')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      {/* Search */}
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Input
          placeholder="Cari template..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
        <Button 
          icon={<ReloadOutlined />}
          onClick={fetchAllTemplates}
        >
          Refresh
        </Button>
      </Space>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: (
              <Space>
                <CalendarOutlined />
                <span>Tahun Akademik ({tahunAkademikList.length})</span>
              </Space>
            ),
            children: (
              <Table
                dataSource={tahunAkademikList.filter(item =>
                  item.nama.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                columns={[
                  {
                    title: 'Tahun Akademik',
                    dataIndex: 'nama',
                    key: 'nama',
                    render: (text: string, record: TahunAkademik) => (
                      <Space direction="vertical" size="small">
                        <Text strong>{text}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {record.tahunMulai}/{record.tahunSelesai} - {record.semester}
                        </Text>
                      </Space>
                    )
                  },
                  {
                    title: 'Status',
                    dataIndex: 'isActive',
                    key: 'isActive',
                    render: (isActive: boolean) => (
                      <Tag color={isActive ? 'green' : 'default'}>
                        {isActive ? 'Aktif' : 'Tidak Aktif'}
                      </Tag>
                    )
                  },
                  {
                    title: 'Tanggal Dibuat',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (date: string) => dayjs(date).format('DD MMM YYYY')
                  },
                  {
                    title: 'Aksi',
                    key: 'action',
                    render: (_, record: TahunAkademik) => (
                      <Space>
                        <Button type="text" icon={<EyeOutlined />} size="small" />
                        <Button type="text" icon={<EditOutlined />} size="small" />
                        <Popconfirm
                          title="Hapus tahun akademik?"
                          description="Apakah Anda yakin ingin menghapus tahun akademik ini?"
                          onConfirm={() => handleDeleteTahunAkademik(record.id)}
                          okText="Ya"
                          cancelText="Tidak"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                      </Space>
                    )
                  }
                ]}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
              />
            )
          },
          {
            key: '2',
            label: (
              <Space>
                <BookOutlined />
                <span>Template Ujian ({templateUjianList.length})</span>
              </Space>
            ),
            children: (
              <Table
                dataSource={templateUjianList.filter(item =>
                  item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.jenisUjian?.nama.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                columns={[
                  {
                    title: 'Nama Template',
                    dataIndex: 'nama',
                    key: 'nama',
                    render: (text: string, record: TemplateUjian) => (
                      <Space direction="vertical" size="small">
                        <Text strong>{text}</Text>
                        <Space>
                          <Tag color="blue">{record.jenisUjian?.nama}</Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.komponenPenilaian?.length || 0} komponen
                          </Text>
                        </Space>
                      </Space>
                    )
                  },
                  {
                    title: 'Tahun Akademik',
                    key: 'tahunAkademik',
                    render: (_, record: TemplateUjian) => record.tahunAkademik?.nama
                  },
                  {
                    title: 'Tanggal Dibuat',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (date: string) => dayjs(date).format('DD MMM YYYY')
                  },
                  {
                    title: 'Aksi',
                    key: 'action',
                    render: (_, record: TemplateUjian) => (
                      <Space>
                        <Button type="text" icon={<EyeOutlined />} size="small" />
                        <Button type="text" icon={<EditOutlined />} size="small" />
                        <Popconfirm
                          title="Hapus template ujian?"
                          description="Apakah Anda yakin ingin menghapus template ujian ini?"
                          onConfirm={() => handleDeleteTemplateUjian(record.id)}
                          okText="Ya"
                          cancelText="Tidak"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                      </Space>
                    )
                  }
                ]}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
              />
            )
          },
          {
            key: '3',
            label: (
              <Space>
                <FileTextOutlined />
                <span>Template Raport ({templateRaportList.length})</span>
              </Space>
            ),
            children: (
              <Table
                dataSource={templateRaportList.filter(item =>
                  item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.namaLembaga.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                columns={[
                  {
                    title: 'Nama Template',
                    dataIndex: 'nama',
                    key: 'nama',
                    render: (text: string, record: TemplateRaport) => (
                      <Space direction="vertical" size="small">
                        <Text strong>{text}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {record.namaLembaga}
                        </Text>
                      </Space>
                    )
                  },
                  {
                    title: 'Tahun Akademik',
                    key: 'tahunAkademik',
                    render: (_, record: TemplateRaport) => record.tahunAkademik?.nama
                  },
                  {
                    title: 'Fitur',
                    key: 'fitur',
                    render: (_, record: TemplateRaport) => (
                      <Space>
                        <Tag color={record.tampilanGrafik ? 'green' : 'default'}>
                          Grafik: {record.tampilanGrafik ? 'Ya' : 'Tidak'}
                        </Tag>
                        <Tag color={record.tampilanRanking ? 'green' : 'default'}>
                          Ranking: {record.tampilanRanking ? 'Ya' : 'Tidak'}
                        </Tag>
                      </Space>
                    )
                  },
                  {
                    title: 'Tanggal Dibuat',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (date: string) => dayjs(date).format('DD MMM YYYY')
                  },
                  {
                    title: 'Aksi',
                    key: 'action',
                    render: (_, record: TemplateRaport) => (
                      <Space>
                        <Button type="text" icon={<EyeOutlined />} size="small" />
                        <Button type="text" icon={<EditOutlined />} size="small" />
                        <Popconfirm
                          title="Hapus template raport?"
                          description="Apakah Anda yakin ingin menghapus template raport ini?"
                          onConfirm={() => handleDeleteTemplateRaport(record.id)}
                          okText="Ya"
                          cancelText="Tidak"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                        </Popconfirm>
                      </Space>
                    )
                  }
                ]}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
              />
            )
          }
        ]}
      />

    </div>
  )
}