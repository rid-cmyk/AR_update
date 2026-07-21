"use client"

import { Row, Col, Card, Switch, Space, Typography, Button, List, Tag, Divider } from "antd"
import {
  BellOutlined,
  SaveOutlined,
  MailOutlined,
  MobileOutlined,
  AlertOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons"
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard"
import { useSettings } from "@/hooks/useSettings"

const { Title, Text } = Typography

export default function NotificationsSettingsPage() {
  const { settings, setSettings, loading, saveSettings } = useSettings()

  const notificationChannels = [
    {
      icon: <MailOutlined style={{ color: "#1890ff", fontSize: 20 }} />,
      title: "Email Notifikasi",
      description: "Kirim notifikasi ke email pengguna",
      checked: settings.emailNotifications,
      onChange: (checked: boolean) => setSettings({ ...settings, emailNotifications: checked }),
    },
    {
      icon: <MobileOutlined style={{ color: "#52c41a", fontSize: 20 }} />,
      title: "SMS Notifikasi",
      description: "Kirim notifikasi via SMS (membutuhkan konfigurasi provider)",
      checked: settings.smsNotifications,
      onChange: (checked: boolean) => setSettings({ ...settings, smsNotifications: checked }),
    },
  ]

  const notificationTypes = [
    { label: "Ujian Baru", tag: "Aktif", color: "green" },
    { label: "Jadwal Raport", tag: "Aktif", color: "green" },
    { label: "Hafalan Baru", tag: "Aktif", color: "green" },
    { label: "Pencapaian Target", tag: "Aktif", color: "green" },
    { label: "Peringatan Sistem", tag: "Aktif", color: "green" },
    { label: "Update Versi", tag: "Nonaktif", color: "default" },
  ]

  return (
    <>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0" }}>
        <AdminHeaderCard
          title="Notifikasi"
          subtitle="Pengaturan notifikasi otomatis untuk pengguna"
          actions={
            <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={() => saveSettings()}>
              Simpan
            </Button>
          }
        />
        <Space direction="vertical" size={24} style={{ width: "100%" }}>

          <Card title={<Space><MailOutlined />Channel Notifikasi</Space>}>
            <Row gutter={[16, 16]}>
              {notificationChannels.map((ch) => (
                <Col xs={24} sm={12} key={ch.title}>
                  <Card size="small">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <Space>
                          {ch.icon}
                          <Text strong>{ch.title}</Text>
                        </Space>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{ch.description}</Text>
                      </div>
                      <Switch checked={ch.checked} onChange={ch.onChange} />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          <Card title={<Space><AlertOutlined />Jenis Notifikasi</Space>}>
            <List
              dataSource={notificationTypes}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Switch key={item.label} defaultChecked={item.color === "green"} size="small" />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={item.color === "green" ? (
                      <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 18 }} />
                    ) : (
                      <BellOutlined style={{ color: "#d9d9d9", fontSize: 18 }} />
                    )}
                    title={item.label}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Space>
      </div>
    </>
  )
}
