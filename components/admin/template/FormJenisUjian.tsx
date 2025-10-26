'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber, 
  Space, 
  Table, 
  message, 
  Modal, 
  Typography,
  Divider,
  Tag,
  Popconfirm
} from 'antd'
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  SaveOutlined,
  BookOutlined,
  SettingOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input

interface KomponenPenilaian {
  id?: string
  nama: string
  bobot: number
  deskripsi: string
  urutan: number
}

interface JenisUjian {
  id?: string
  nama: string
  kode: string
  deskripsi: string
  komponenPenilaian: KomponenPenilaian[]
}

interface FormJenisUjianProps {
  onSuccess?: () => void
}

export function FormJenisUjian({ onSuccess }: FormJenisUjianProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [jenisUjianList, setJenisUjianList] = useState<JenisUjian[]>([])
  const [komponenPenilaian, setKomponenPenilaian] = useState<KomponenPenilaian[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  // Default komponen penilaian untuk berbagai jenis ujian
  const defaultKomponen = {
    tasmi: [
      { nama: 'Kelancaran', bobot: 30, deskripsi: 'Kelancaran dalam membaca', urutan: 1 },
      { nama: 'Ketepatan Ayat', bobot: 25, deskripsi: 'Ketepatan hafalan ayat', urutan: 2 },
      { nama: 'Tajwid', bobot: 25, deskripsi: 'Penerapan kaidah tajwid', urutan: 3 },
      { nama: 'Adab', bobot: 20, deskripsi: 'Adab selama ujian', urutan: 4 }
    ],
    mhq: [
      { nama: 'Tajwid', bobot: 30, deskripsi: 'Ketepatan dalam penerapan kaidah tajwid', urutan: 1 },
      { nama: 'Sifatul Huruf', bobot: 25, deskripsi: 'Kejelasan sifat-sifat huruf hijaiyah', urutan: 2 },
      { nama: 'Kejelasan Bacaan', bobot: 25, deskripsi: 'Kejelasan dan ketepatan dalam membaca', urutan: 3 },
      { nama: 'Kelancaran', bobot: 20, deskripsi: 'Kelancaran dan kecepatan dalam membaca', urutan: 4 }
    ],
    uas: [
      { nama: 'Hafalan', bobot: 40, deskripsi: 'Penilaian hafalan Al-Quran secara keseluruhan', urutan: 1 },
      { nama: 'Tajwid', bobot: 30, deskripsi: 'Penguasaan kaidah tajwid', urutan: 2 },
      { nama: 'Pemahaman', bobot: 20, deskripsi: 'Pemahaman makna dan tafsir ayat', urutan: 3 },
      { nama: 'Sikap & Adab', bobot: 10, deskripsi: 'Sikap dan adab selama proses pembelajaran', urutan: 4 }
    ],
    kenaikan_juz: [
      { nama: 'Kelancaran Hafalan', bobot: 35, deskripsi: 'Kelancaran dalam menghafalkan juz yang diujikan', urutan: 1 },
      { nama: 'Ketepatan Bacaan', bobot: 35, deskripsi: 'Ketepatan dalam membaca ayat-ayat dalam juz', urutan: 2 },
      { nama: 'Tajwid', bobot: 20, deskripsi: 'Penerapan kaidah tajwid yang benar', urutan: 3 },
      { nama: 'Kesiapan Mental', bobot: 10, deskripsi: 'Kesiapan mental dan kepercayaan diri saat ujian', urutan: 4 }
    ]
  }

  // Fetch jenis ujian yang sudah ada
  const fetchJenisUjian = async () => {
    try {
      const response = await fetch('/api/admin/jenis-ujian')
      if (response.ok) {
        const result = await response.json()
        // API returns { success: true, data: [...], message: "..." }
        setJenisUjianList(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching jenis ujian:', error)
      setJenisUjianList([]) // Set empty array on error
    }
  }

  useEffect(() => {
    fetchJenisUjian()
  }, [])

  // Handle perubahan jenis ujian untuk load default komponen
  const handleJenisUjianChange = (value: string | string[]) => {
    // Handle array dari mode="tags", ambil nilai pertama
    const selectedValue = Array.isArray(value) ? value[0] : value
    
    if (!selectedValue) {
      setKomponenPenilaian([])
      return
    }
    
    const kode = selectedValue.toLowerCase().replace(/\s+/g, '_').replace(/'/g, '')
    if (defaultKomponen[kode as keyof typeof defaultKomponen]) {
      setKomponenPenilaian(defaultKomponen[kode as keyof typeof defaultKomponen])
    } else {
      // Jika tidak ada default, buat komponen kosong
      setKomponenPenilaian([])
    }
  }

  // Tambah komponen penilaian baru
  const addKomponen = () => {
    const newKomponen: KomponenPenilaian = {
      id: Date.now().toString(),
      nama: '',
      bobot: 0,
      deskripsi: '',
      urutan: komponenPenilaian.length + 1
    }
    setKomponenPenilaian([...komponenPenilaian, newKomponen])
  }

  // Update komponen penilaian
  const updateKomponen = (index: number, field: keyof KomponenPenilaian, value: any) => {
    const updated = [...komponenPenilaian]
    updated[index] = { ...updated[index], [field]: value }
    setKomponenPenilaian(updated)
  }

  // Hapus komponen penilaian
  const removeKomponen = (index: number) => {
    const updated = komponenPenilaian.filter((_, i) => i !== index)
    setKomponenPenilaian(updated)
  }

  // Validasi total bobot
  const getTotalBobot = () => {
    return komponenPenilaian.reduce((total, k) => total + (k.bobot || 0), 0)
  }

  // Submit form
  const handleSubmit = async (values: any) => {
    const totalBobot = getTotalBobot()
    if (totalBobot !== 100) {
      message.error('Total bobot komponen penilaian harus 100%')
      return
    }

    if (komponenPenilaian.length === 0) {
      message.error('Minimal harus ada satu komponen penilaian')
      return
    }

    setLoading(true)
    try {
      // Handle array dari Select mode="tags"
      const namaJenisUjian = Array.isArray(values.nama) ? values.nama[0] : values.nama
      
      const payload = {
        ...values,
        nama: namaJenisUjian,
        kode: namaJenisUjian.toLowerCase().replace(/\s+/g, '_').replace(/'/g, ''),
        komponenPenilaian
      }

      const url = editingId ? `/api/admin/jenis-ujian/${editingId}` : '/api/admin/jenis-ujian'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        message.success(`Jenis ujian berhasil ${editingId ? 'diupdate' : 'ditambahkan'}!`)
        form.resetFields()
        setKomponenPenilaian([])
        setEditingId(null)
        setModalVisible(false)
        fetchJenisUjian()
        onSuccess?.()
      } else {
        const error = await response.json()
        message.error(error.message || 'Gagal menyimpan jenis ujian')
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  // Edit jenis ujian
  const handleEdit = (jenisUjian: JenisUjian) => {
    setEditingId(jenisUjian.id!)
    form.setFieldsValue({
      nama: jenisUjian.nama,
      deskripsi: jenisUjian.deskripsi
    })
    setKomponenPenilaian(jenisUjian.komponenPenilaian || [])
    setModalVisible(true)
  }

  // Hapus jenis ujian
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/jenis-ujian/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        message.success('Jenis ujian berhasil dihapus!')
        fetchJenisUjian()
        onSuccess?.()
      } else {
        const error = await response.json()
        message.error(error.message || 'Gagal menghapus jenis ujian')
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menghapus')
    }
  }

  // Columns untuk tabel jenis ujian
  const columns = [
    {
      title: 'Nama Jenis Ujian',
      dataIndex: 'nama',
      key: 'nama',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Kode',
      dataIndex: 'kode',
      key: 'kode',
      render: (text: string) => <Tag color="blue">{text?.toUpperCase()}</Tag>
    },
    {
      title: 'Komponen Penilaian',
      dataIndex: 'komponenPenilaian',
      key: 'komponenPenilaian',
      render: (komponen: KomponenPenilaian[]) => (
        <Space wrap>
          {komponen?.length > 0 ? komponen.map((k, idx) => (
            <Tag key={idx} color="green">
              {k.nama} ({k.bobot}%)
            </Tag>
          )) : <Text type="secondary">Belum ada komponen</Text>}
        </Space>
      )
    },
    {
      title: 'Deskripsi',
      dataIndex: 'deskripsi',
      key: 'deskripsi',
      ellipsis: true
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record: JenisUjian) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Hapus jenis ujian?"
            description="Apakah Anda yakin ingin menghapus jenis ujian ini?"
            onConfirm={() => handleDelete(record.id!)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  // Columns untuk tabel komponen penilaian
  const komponenColumns = [
    {
      title: 'Urutan',
      dataIndex: 'urutan',
      key: 'urutan',
      width: 80,
      render: (_, __, index: number) => index + 1
    },
    {
      title: 'Nama Komponen',
      key: 'nama',
      render: (_, __, index: number) => (
        <Input
          value={komponenPenilaian[index]?.nama}
          onChange={(e) => updateKomponen(index, 'nama', e.target.value)}
          placeholder="Nama komponen"
          size="small"
        />
      )
    },
    {
      title: 'Bobot (%)',
      key: 'bobot',
      width: 120,
      render: (_, __, index: number) => (
        <InputNumber
          value={komponenPenilaian[index]?.bobot}
          onChange={(value) => updateKomponen(index, 'bobot', value || 0)}
          min={0}
          max={100}
          size="small"
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Deskripsi',
      key: 'deskripsi',
      render: (_, __, index: number) => (
        <Input
          value={komponenPenilaian[index]?.deskripsi}
          onChange={(e) => updateKomponen(index, 'deskripsi', e.target.value)}
          placeholder="Deskripsi komponen"
          size="small"
        />
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 80,
      render: (_, __, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeKomponen(index)}
          size="small"
        />
      )
    }
  ]

  return (
    <div>
      {/* Daftar Jenis Ujian */}
      <Card 
        title={
          <Space>
            <BookOutlined />
            <span>Daftar Jenis Ujian</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null)
              form.resetFields()
              setKomponenPenilaian([])
              setModalVisible(true)
            }}
          >
            Tambah Jenis Ujian
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          dataSource={jenisUjianList}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={
          <Space>
            <SettingOutlined />
            <span>{editingId ? 'Edit Jenis Ujian' : 'Tambah Jenis Ujian'}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingId(null)
          form.resetFields()
          setKomponenPenilaian([])
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#f0f9ff', borderRadius: 6, border: '1px solid #bae6fd' }}>
          <Text type="secondary">
            💡 <strong>Petunjuk:</strong> Pilih dari daftar yang tersedia atau ketik nama jenis ujian baru. 
            Sistem akan otomatis memuat komponen penilaian default jika tersedia.
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="nama"
            label="Nama Jenis Ujian"
            rules={[{ required: true, message: 'Nama jenis ujian wajib diisi' }]}
          >
            <Select
              placeholder="Pilih atau ketik nama jenis ujian"
              onChange={handleJenisUjianChange}
              showSearch
              allowClear
              mode="tags"
              maxTagCount={1}
              options={[
                { value: 'Tasmi\'', label: 'Tasmi\'' },
                { value: 'MHQ', label: 'MHQ (Musabaqah Hifdzil Qur\'an)' },
                { value: 'UAS', label: 'UAS (Ujian Akhir Semester)' },
                { value: 'Kenaikan Juz', label: 'Kenaikan Juz' },
                { value: 'Tahfidz', label: 'Tahfidz' },
                { value: 'Ujian Harian', label: 'Ujian Harian' },
                { value: 'Ujian Tengah Semester', label: 'Ujian Tengah Semester' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="deskripsi"
            label="Deskripsi"
            rules={[{ required: true, message: 'Deskripsi wajib diisi' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Deskripsi singkat tentang jenis ujian ini..."
            />
          </Form.Item>

          <Divider orientation="left">
            <Space>
              <SettingOutlined />
              <span>Komponen Penilaian</span>
              <Tag color={getTotalBobot() === 100 ? 'green' : 'red'}>
                Total: {getTotalBobot()}%
              </Tag>
            </Space>
          </Divider>

          <div style={{ marginBottom: 16 }}>
            <Button 
              type="dashed" 
              icon={<PlusOutlined />}
              onClick={addKomponen}
              block
            >
              Tambah Komponen Penilaian
            </Button>
            {komponenPenilaian.length === 0 && (
              <div style={{ marginTop: 8, padding: 8, background: '#fff7e6', borderRadius: 4, border: '1px solid #ffd591' }}>
                <Text type="warning" style={{ fontSize: 12 }}>
                  ⚠️ Belum ada komponen penilaian. Klik tombol di atas untuk menambahkan komponen.
                </Text>
              </div>
            )}
          </div>

          {komponenPenilaian.length > 0 && (
            <Table
              dataSource={komponenPenilaian}
              columns={komponenColumns}
              pagination={false}
              size="small"
              style={{ marginBottom: 24 }}
            />
          )}

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Batal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                disabled={getTotalBobot() !== 100 || komponenPenilaian.length === 0}
              >
                {editingId ? 'Update' : 'Simpan'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}