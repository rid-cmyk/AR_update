"use client"

import { Row, Col, Card, Input, Switch, Space, Typography, Button, Divider, InputNumber, Form } from "antd"
import { SettingOutlined, SaveOutlined, MailOutlined, FileTextOutlined } from "@ant-design/icons"
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard"
import { useSettings } from "@/hooks/useSettings"

const { Title, Text } = Typography
const { TextArea } = Input

export default function GeneralSettingsPage() {
  const { settings, setSettings, loading, saveSettings } = useSettings()
  const [form] = Form.useForm()

  const handleSave = async () => {
    const values = await form.validateFields()
    await saveSettings(values)
  }

  return (
    <>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0" }}>
        <AdminHeaderCard
          title="Pengaturan Umum"
          subtitle="Konfigurasi nama aplikasi, kontak, dan pengguna"
          actions={
            <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>
              Simpan
            </Button>
          }
        />
        <Space direction="vertical" size={24} style={{ width: "100%" }}>

          <Card>
            <Form form={form} layout="vertical" initialValues={settings}>
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Nama Aplikasi" name="appName" rules={[{ required: true }]}>
                    <Input size="large" placeholder="Nama aplikasi" prefix={<FileTextOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Email Kontak" name="contactEmail" rules={[{ required: true, type: "email" }]}>
                    <Input size="large" placeholder="admin@example.com" prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Deskripsi Aplikasi" name="appDescription" rules={[{ required: true }]}>
                    <TextArea rows={3} placeholder="Deskripsi singkat tentang aplikasi" showCount maxLength={500} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Divider />

            <Title level={5} style={{ marginBottom: 16 }}>Pengaturan Pengguna</Title>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Card size="small">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Text strong>Izinkan Registrasi Baru</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>Izinkan pengguna baru untuk mendaftar</Text>
                    </div>
                    <Switch
                      checked={settings.allowRegistration}
                      onChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
                    />
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Maksimal Pengguna">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    max={10000}
                    value={settings.maxUsers}
                    onChange={(value) => setSettings({ ...settings, maxUsers: value || 1000 })}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Space>
      </div>
    </>
  )
}
