'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Switch, 
  Upload, 
  Space, 
  message, 
  Typography,
  Row,
  Col,
  Divider,
  Alert
} from 'antd'
import { 
  SaveOutlined, 
  FileTextOutlined, 
  UploadOutlined, 
  EyeOutlined,
  InboxOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input
const { Dragger } = Upload
interface TahunAkademik {
  id: string
  nama: string
  tahunMulai: number
  tahunSelesai: number
  semester: string
  isActive: boolean
}

interface FormTemplateRaportProps {
  onSuccess?: () => void
}

export function FormTemplateRaport({ onSuccess }: FormTemplateRaportProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tahunAkademikList, setTahunAkademikList] = useState<TahunAkademik[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [logoFile, setLogoFile] = useState<any>(null)
  const [ttdFile, setTtdFile] = useState<any>(null)

  useEffect(() => {
    fetchTahunAkademik()
  }, [])

  const fetchTahunAkademik = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik')
      if (response.ok) {
        const data = await response.json()
        setTahunAkademikList(data)
      }
    } catch (error) {
      console.error('Error fetching tahun akademik:', error)
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const formData = new FormData()
      
      // Append form values
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key])
        }
      })

      // Append files if any
      if (logoFile) {
        formData.append('logoLembaga', logoFile)
      }
      if (ttdFile) {
        formData.append('tandaTanganKepala', ttdFile)
      }

      const response = await fetch('/api/admin/template-raport', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        message.success('Template raport berhasil disimpan!')
        form.resetFields()
        setLogoFile(null)
        setTtdFile(null)
        onSuccess?.()
      } else {
        const error = await response.json()
        message.error(error.message || 'Gagal menyimpan template raport')
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps = {
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('Hanya file gambar yang diperbolehkan!')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error('Ukuran file harus kurang dari 2MB!')
        return false
      }
      return false // Prevent auto upload
    },
    showUploadList: false
  }

  return (
    <Card 
      title={
        <Space>
          <FileTextOutlined />
          <span>Template Raport</span>
        </Space>
      }
      extra={
        <Button 
          type={previewMode ? 'default' : 'primary'}
          icon={<EyeOutlined />}
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? 'Edit' : 'Preview'}
        </Button>
      }
    >
      {!previewMode ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            namaLembaga: 'Pondok Pesantren Tahfidz Al-Quran',
            jabatanKepala: 'Kepala Pondok',
            tampilanGrafik: true,
            tampilanRanking: true
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="nama"
                label="Nama Template Raport"
                rules={[{ required: true, message: 'Nama template wajib diisi' }]}
              >
                <Input placeholder="Contoh: Template Raport Semester 1" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="tahunAkademikId"
                label="Tahun Akademik"
                rules={[{ required: true, message: 'Tahun akademik wajib dipilih' }]}
              >
                <Select placeholder="Pilih Tahun Akademik">
                  {tahunAkademikList.map((tahun) => (
                    <Select.Option key={tahun.id} value={tahun.id}>
                      {tahun.nama} - {tahun.semester}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="namaLembaga"
                label="Nama Lembaga"
                rules={[{ required: true, message: 'Nama lembaga wajib diisi' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="alamatLembaga"
                label="Alamat Lembaga"
              >
                <Input placeholder="Alamat lengkap lembaga" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="headerKop"
            label="Header Kop Surat"
          >
            <TextArea 
              rows={3} 
              placeholder="Teks yang akan muncul di bagian atas raport..."
            />
          </Form.Item>

          <Form.Item
            name="footerKop"
            label="Footer Kop Surat"
          >
            <TextArea 
              rows={3} 
              placeholder="Teks yang akan muncul di bagian bawah raport..."
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="namaKepala"
                label="Nama Kepala Lembaga"
              >
                <Input placeholder="Nama lengkap kepala lembaga" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="jabatanKepala"
                label="Jabatan Kepala Lembaga"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Divider orientation="left">Upload File</Divider>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Upload
                  {...uploadProps}
                  onChange={(info) => {
                    if (info.file) {
                      setLogoFile(info.file)
                      message.success('Logo berhasil dipilih')
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />} block>
                    Upload Logo Lembaga
                  </Button>
                </Upload>
                
                <Upload
                  {...uploadProps}
                  onChange={(info) => {
                    if (info.file) {
                      setTtdFile(info.file)
                      message.success('Tanda tangan berhasil dipilih')
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />} block>
                    Upload Tanda Tangan
                  </Button>
                </Upload>
              </Space>
            </Col>
            
            <Col xs={24} md={12}>
              <Divider orientation="left">Pengaturan Tampilan</Divider>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="tampilanGrafik"
                  valuePropName="checked"
                  style={{ marginBottom: 8 }}
                >
                  <Space>
                    <Switch />
                    <Text>Tampilkan Grafik Perkembangan</Text>
                  </Space>
                </Form.Item>
                
                <Form.Item
                  name="tampilanRanking"
                  valuePropName="checked"
                  style={{ marginBottom: 8 }}
                >
                  <Space>
                    <Switch />
                    <Text>Tampilkan Ranking Kelas</Text>
                  </Space>
                </Form.Item>
              </Space>
            </Col>
          </Row>

          <Form.Item
            name="deskripsi"
            label="Catatan Template"
          >
            <TextArea 
              rows={3} 
              placeholder="Catatan atau keterangan tambahan untuk template ini..."
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              block
            >
              Simpan Template Raport
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <Alert
          message="Preview Template Raport"
          description="Preview template raport akan ditampilkan setelah form diisi dan disimpan. Fitur preview akan segera tersedia."
          type="info"
          showIcon
          style={{ margin: '24px 0' }}
        />
      )}
    </Card>
  )
}