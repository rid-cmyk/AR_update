'use client'

import { useState } from 'react'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Upload, 
  message, 
  Space, 
  Divider,
  Row,
  Col,
  Typography,
  Alert
} from 'antd'
import { 
  SaveOutlined, 
  UploadOutlined, 
  FileTextOutlined,
  PictureOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'

const { TextArea } = Input
const { Title, Text } = Typography

interface FormTemplateRaportProps {
  onSuccess?: () => void
}

interface TemplateRaportData {
  nama: string
  header: string
  footer: string
  logo?: string
}

export function FormTemplateRaport({ onSuccess }: FormTemplateRaportProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([])

  const handleSubmit = async (values: TemplateRaportData) => {
    try {
      setLoading(true)
      
      // Simulasi API call - ganti dengan endpoint yang sesuai
      const formData = new FormData()
      formData.append('nama', values.nama)
      formData.append('header', values.header)
      formData.append('footer', values.footer)
      
      if (logoFileList.length > 0 && logoFileList[0].originFileObj) {
        formData.append('logo', logoFileList[0].originFileObj)
      }

      const response = await fetch('/api/admin/template-raport', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        message.success('Template raport berhasil dibuat!')
        form.resetFields()
        setLogoFileList([])
        onSuccess?.()
      } else {
        throw new Error('Gagal menyimpan template raport')
      }
    } catch (error) {
      console.error('Error creating template raport:', error)
      message.error('Gagal menyimpan template raport')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps: UploadProps = {
    fileList: logoFileList,
    beforeUpload: (file) => {
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
    onChange: ({ fileList }) => {
      setLogoFileList(fileList.slice(-1)) // Keep only the last file
    },
    onRemove: () => {
      setLogoFileList([])
    }
  }

  return (
    <div style={{ padding: '8px' }}>
      <Alert
        message="Panduan Template Raport"
        description="Template raport akan digunakan untuk mencetak laporan hasil belajar santri. Pastikan informasi header dan footer sudah benar sebelum menyimpan."
        type="info"
        showIcon
        style={{ 
          marginBottom: 24,
          borderRadius: 8,
          border: '1px solid #91d5ff',
          background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)'
        }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <div style={{
                    padding: 8,
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileTextOutlined style={{ fontSize: 16, color: 'white' }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Informasi Template</span>
                </Space>
              }
              size="small"
              style={{ 
                marginBottom: 16,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Form.Item
                name="nama"
                label={<Text strong style={{ fontSize: 13 }}>Nama Template</Text>}
                rules={[
                  { required: true, message: 'Nama template wajib diisi!' },
                  { min: 3, message: 'Nama template minimal 3 karakter!' }
                ]}
              >
                <Input 
                  placeholder="Contoh: Template Raport Semester Ganjil 2024"
                  prefix={<FileTextOutlined style={{ color: '#bfbfbf' }} />}
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="header"
                label={<Text strong style={{ fontSize: 13 }}>Header Raport</Text>}
                rules={[
                  { required: true, message: 'Header raport wajib diisi!' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Contoh:&#10;PONDOK PESANTREN AL-HIKMAH&#10;Jl. Raya Pendidikan No. 123&#10;Telp: (021) 1234567 | Email: info@alhikmah.ac.id"
                  style={{ resize: 'none', borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="footer"
                label={<Text strong style={{ fontSize: 13 }}>Footer Raport</Text>}
                rules={[
                  { required: true, message: 'Footer raport wajib diisi!' }
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Contoh:&#10;Kepala Sekolah,&#10;&#10;&#10;Dr. H. Ahmad Fauzi, M.Pd&#10;NIP. 123456789"
                  style={{ resize: 'none', borderRadius: 8 }}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <div style={{
                    padding: 8,
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PictureOutlined style={{ fontSize: 16, color: 'white' }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Logo Lembaga</span>
                </Space>
              }
              size="small"
              style={{ 
                marginBottom: 16,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Form.Item
                name="logo"
                label={<Text strong style={{ fontSize: 13 }}>Upload Logo</Text>}
                extra={
                  <Text style={{ fontSize: 11, color: '#666' }}>
                    Format: JPG, PNG, GIF. Maksimal 2MB. Ukuran disarankan 200x200px
                  </Text>
                }
              >
                <Upload
                  {...uploadProps}
                  listType="picture-card"
                  maxCount={1}
                  accept="image/*"
                  style={{ width: '100%' }}
                >
                  {logoFileList.length === 0 && (
                    <div style={{ 
                      textAlign: 'center',
                      padding: '20px 10px',
                      border: '2px dashed #d9d9d9',
                      borderRadius: 8,
                      background: '#fafafa'
                    }}>
                      <UploadOutlined style={{ fontSize: 32, color: '#bfbfbf', marginBottom: 8 }} />
                      <div style={{ color: '#bfbfbf', fontSize: 12 }}>
                        Klik atau drag logo ke sini
                      </div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Alert
                message="Tips Upload Logo"
                description={
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12 }}>
                    <li>Gunakan logo dengan latar belakang transparan (PNG)</li>
                    <li>Pastikan logo terlihat jelas saat dicetak</li>
                    <li>Ukuran optimal: 200x200 pixel</li>
                    <li>Logo akan muncul di bagian kop surat raport</li>
                  </ul>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                  border: '1px solid #b7eb8f'
                }}
              />
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '24px 0' }} />

        <div style={{ textAlign: 'right', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Space size="middle">
            <Button 
              size="large"
              onClick={() => {
                form.resetFields()
                setLogoFileList([])
              }}
              disabled={loading}
              style={{ borderRadius: 8, minWidth: 100 }}
            >
              Reset Form
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              icon={<SaveOutlined />}
              style={{
                background: 'linear-gradient(135deg, #be185d 0%, #9f1239 100%)',
                border: 'none',
                borderRadius: 8,
                minWidth: 140,
                boxShadow: '0 2px 8px rgba(190, 24, 93, 0.3)'
              }}
            >
              {loading ? 'Menyimpan...' : 'Simpan Template'}
            </Button>
          </Space>
        </div>
      </Form>

      <Divider style={{ margin: '32px 0 24px 0' }} />

      <Card 
        title={
          <Space>
            <div style={{
              padding: 8,
              background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileTextOutlined style={{ fontSize: 16, color: 'white' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Preview Template</span>
          </Space>
        }
        size="small"
        style={{ 
          background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <div style={{ 
          border: '2px dashed #d9d9d9', 
          borderRadius: 12, 
          padding: 32, 
          textAlign: 'center',
          background: 'white',
          minHeight: 180
        }}>
          <div style={{
            padding: 16,
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
            borderRadius: 8,
            marginBottom: 16,
            display: 'inline-block'
          }}>
            <FileTextOutlined style={{ fontSize: 40, color: '#3b82f6' }} />
          </div>
          <br />
          <Text style={{ color: '#374151', fontSize: 14, fontWeight: 500 }}>
            Preview template raport akan muncul di sini
          </Text>
          <br />
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>
            Header, logo, dan footer akan ditampilkan sesuai dengan input Anda
          </Text>
        </div>
      </Card>
    </div>
  )
}