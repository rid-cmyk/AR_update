"use client"

import { Row, Col, Card, Switch, Space, Typography, Button, Divider, InputNumber, Select, Alert } from "antd"
import { SecurityScanOutlined, SaveOutlined, LockOutlined, ClockCircleOutlined } from "@ant-design/icons"
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard"
import { useSettings } from "@/hooks/useSettings"

const { Title, Text } = Typography

export default function SecuritySettingsPage() {
  const { settings, setSettings, loading, saveSettings } = useSettings()

  return (
    <>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0" }}>
        <AdminHeaderCard
          title="Pengaturan Keamanan"
          subtitle="Mode maintenance, session timeout, dan upload file"
          actions={
            <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={() => saveSettings()}>
              Simpan
            </Button>
          }
        />
        <Space direction="vertical" size={24} style={{ width: "100%" }}>

          <Alert
            message="Perubahan keamanan berlaku untuk seluruh sistem. Pastikan Anda memahami dampaknya."
            type="warning"
            showIcon
          />

          <Card>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title={<Space><LockOutlined />Mode Maintenance</Space>}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Text>Aktifkan mode maintenance</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>Mencegah akses pengguna saat maintenance</Text>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                    />
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title={<Space><ClockCircleOutlined />Session Timeout</Space>}>
                  <Text>Timeout sesi (menit)</Text>
                  <InputNumber
                    style={{ width: "100%", marginTop: 8 }}
                    min={5}
                    max={480}
                    value={settings.sessionTimeout}
                    onChange={(value) => setSettings({ ...settings, sessionTimeout: value || 30 })}
                    addonAfter="menit"
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Title level={5} style={{ marginBottom: 16 }}>Pengaturan File Upload</Title>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Ukuran File Maksimal">
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    max={100}
                    value={settings.maxFileSize}
                    onChange={(value) => setSettings({ ...settings, maxFileSize: value || 10 })}
                    addonAfter="MB"
                  />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Tipe File yang Diizinkan">
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    placeholder="Pilih tipe file"
                    value={settings.allowedFileTypes}
                    onChange={(value) => setSettings({ ...settings, allowedFileTypes: value })}
                    options={[
                      { label: "PDF", value: "pdf" },
                      { label: "DOC", value: "doc" },
                      { label: "DOCX", value: "docx" },
                      { label: "JPG", value: "jpg" },
                      { label: "PNG", value: "png" },
                      { label: "GIF", value: "gif" },
                      { label: "MP4", value: "mp4" },
                      { label: "MP3", value: "mp3" },
                    ]}
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
