'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Tag, 
  Typography,
  Card,
  Empty,
  Tooltip
} from 'antd'
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  FileTextOutlined,
  BookOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography

interface DaftarTemplateProps {
  type: 'jenis-ujian' | 'template-raport'
  onRefresh?: () => void
}

interface JenisUjianItem {
  id: string
  nama: string
  deskripsi: string
  komponenPenilaian: Array<{
    nama: string
    bobot: number
  }>
  createdAt: string
  status: 'aktif' | 'nonaktif'
}

interface TemplateRaportItem {
  id: string
  nama: string
  header: string
  footer: string
  logo?: string
  createdAt: string
  status: 'aktif' | 'nonaktif'
}

export function DaftarTemplate({ type, onRefresh }: DaftarTemplateProps) {
  const [data, setData] = useState<(JenisUjianItem | TemplateRaportItem)[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const endpoint = type === 'jenis-ujian' ? '/api/admin/jenis-ujian' : '/api/admin/template-raport'
      const response = await fetch(endpoint)
      
      if (response.ok) {
        const result = await response.json()
        setData(result.data || [])
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
      message.error(`Gagal memuat data ${type}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [type])

  const handleDelete = async (id: string) => {
    try {
      const endpoint = type === 'jenis-ujian' ? `/api/admin/jenis-ujian/${id}` : `/api/admin/template-raport/${id}`
      const response = await fetch(endpoint, { method: 'DELETE' })
      
      if (response.ok) {
        message.success(`${type === 'jenis-ujian' ? 'Jenis ujian' : 'Template raport'} berhasil dihapus!`)
        fetchData()
        onRefresh?.()
      } else {
        throw new Error('Gagal menghapus data')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      message.error('Gagal menghapus data')
    }
  }

  const jenisUjianColumns: ColumnsType<JenisUjianItem> = [
    {
      title: 'Nama Jenis Ujian',
      dataIndex: 'nama',
      key: 'nama',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#1890ff' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.deskripsi}
          </Text>
        </Space>
      )
    },
    {
      title: 'Komponen Penilaian',
      dataIndex: 'komponenPenilaian',
      key: 'komponenPenilaian',
      render: (komponen: JenisUjianItem['komponenPenilaian']) => (
        <Space wrap>
          {komponen?.map((item, index) => (
            <Tag key={index} color="blue">
              {item.nama} ({item.bobot}%)
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'aktif' ? 'green' : 'red'}>
          {status === 'aktif' ? 'Aktif' : 'Nonaktif'}
        </Tag>
      )
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: '#bfbfbf' }} />
          <Text style={{ fontSize: 12 }}>
            {new Date(date).toLocaleDateString('id-ID')}
          </Text>
        </Space>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Lihat Detail">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              style={{ color: '#faad14' }}
            />
          </Tooltip>
          <Popconfirm
            title="Hapus jenis ujian ini?"
            description="Data yang sudah dihapus tidak dapat dikembalikan."
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Tooltip title="Hapus">
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                size="small"
                style={{ color: '#ff4d4f' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const templateRaportColumns: ColumnsType<TemplateRaportItem> = [
    {
      title: 'Template Raport',
      dataIndex: 'nama',
      key: 'nama',
      width: '30%',
      render: (text, record) => (
        <div>
          <Space>
            <div style={{
              padding: 6,
              background: 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileTextOutlined style={{ fontSize: 12, color: 'white' }} />
            </div>
            <Text strong style={{ color: '#be185d', fontSize: 14 }}>{text}</Text>
          </Space>
          <div style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: '#999' }}>
              Dibuat: {new Date(record.createdAt).toLocaleDateString('id-ID')}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Konten Template',
      key: 'content',
      width: '40%',
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>Header:</Text>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '4px 8px', 
              borderRadius: 4, 
              marginTop: 2,
              border: '1px solid #e9ecef'
            }}>
              <Text 
                ellipsis={{ tooltip: record.header }} 
                style={{ fontSize: 11, color: '#495057' }}
              >
                {record.header.length > 50 ? `${record.header.substring(0, 50)}...` : record.header}
              </Text>
            </div>
          </div>
          <div>
            <Text style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>Footer:</Text>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '4px 8px', 
              borderRadius: 4, 
              marginTop: 2,
              border: '1px solid #e9ecef'
            }}>
              <Text 
                ellipsis={{ tooltip: record.footer }} 
                style={{ fontSize: 11, color: '#495057' }}
              >
                {record.footer.length > 50 ? `${record.footer.substring(0, 50)}...` : record.footer}
              </Text>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Status & Logo',
      key: 'status_logo',
      width: '15%',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag 
            color={record.status === 'aktif' ? 'success' : 'default'} 
            style={{ borderRadius: 12, fontSize: 11 }}
          >
            {record.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
          </Tag>
          <Tag 
            color={record.logo ? 'processing' : 'default'} 
            style={{ borderRadius: 12, fontSize: 11 }}
          >
            {record.logo ? '🖼️ Ada Logo' : '📄 Tanpa Logo'}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            style={{ borderRadius: 6, width: '100%' }}
          >
            Preview
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            style={{ borderRadius: 6, width: '100%' }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus template ini?"
            description="Data yang sudah dihapus tidak dapat dikembalikan."
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              style={{ borderRadius: 6, width: '100%' }}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const columns = type === 'jenis-ujian' ? jenisUjianColumns : templateRaportColumns

  if (data.length === 0 && !loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: '40px 20px',
        textAlign: 'center',
        border: '2px dashed #d9d9d9'
      }}>
        <Empty
          image={type === 'jenis-ujian' ? <BookOutlined style={{ fontSize: 48, color: '#bfbfbf' }} /> : <FileTextOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
          description={
            <Space direction="vertical" size="small">
              <Text type="secondary" style={{ fontSize: 16 }}>
                {type === 'jenis-ujian' ? 'Belum ada jenis ujian yang dibuat' : 'Belum ada template raport yang dibuat'}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {type === 'jenis-ujian' 
                  ? 'Klik tombol "Tambah Jenis Ujian" untuk membuat jenis ujian baru'
                  : 'Klik tombol "Buat Template Raport" untuk membuat template baru'
                }
              </Text>
            </Space>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} dari ${total} ${type === 'jenis-ujian' ? 'jenis ujian' : 'template'}`,
          style: { marginTop: 16 }
        }}
        scroll={{ x: 800 }}
        style={{
          background: 'white',
          borderRadius: 8
        }}
        size="middle"
      />
    </div>
  )
}