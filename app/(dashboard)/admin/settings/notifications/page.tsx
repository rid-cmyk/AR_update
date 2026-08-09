"use client"

import { Row, Col, Card, Switch, Space, Typography, Button, List, Tag, Divider, Input, message, Spin } from "antd"
import {
  BellOutlined,
  SaveOutlined,
  MailOutlined,
  MobileOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  WhatsAppOutlined,
  ApiOutlined,
  KeyOutlined,
} from "@ant-design/icons"
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard"
import { useSettings } from "@/hooks/useSettings"
import { useState, useEffect } from "react"

const { Title, Text } = Typography

interface WhatsAppConfig {
  whatsapp_enabled: boolean;
  whatsapp_api_key: string;
  whatsapp_session_id: string;
}

export default function NotificationsSettingsPage() {
  const { settings, setSettings, loading, saveSettings } = useSettings()
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>({
    whatsapp_enabled: false,
    whatsapp_api_key: "",
    whatsapp_session_id: "",
  })
  const [waLoading, setWaLoading] = useState(false)
  const [waTesting, setWaTesting] = useState(false)

  useEffect(() => {
    fetch("/api/admin-settings/whatsapp")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setWaConfig(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const saveWhatsAppConfig = async () => {
    setWaLoading(true);
    try {
      const res = await fetch("/api/admin-settings/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waConfig),
      });
      const data = await res.json();
      if (data.success) {
        message.success("WhatsApp settings saved");
      } else {
        message.error(data.error || "Failed to save");
      }
    } catch {
      message.error("Failed to save WhatsApp settings");
    } finally {
      setWaLoading(false);
    }
  };

  const testWhatsApp = async () => {
    setWaTesting(true);
    try {
      const res = await fetch("/api/admin-settings/whatsapp/test", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        message.success("Test message sent successfully!");
      } else {
        message.error(data.error || "Failed to send test message");
      }
    } catch {
      message.error("Failed to send test message");
    } finally {
      setWaTesting(false);
    }
  };

  const notificationChannels = [
    {
      icon: <MailOutlined style={{ color: "#219ebc", fontSize: 20 }} />,
      title: "Email Notifikasi",
      description: "Kirim notifikasi ke email pengguna",
      checked: settings.emailNotifications,
      onChange: (checked: boolean) => setSettings({ ...settings, emailNotifications: checked }),
    },
    {
      icon: <MobileOutlined style={{ color: "#219ebc", fontSize: 20 }} />,
      title: "SMS Notifikasi",
      description: "Kirim notifikasi via SMS (membutuhkan konfigurasi provider)",
      checked: settings.smsNotifications,
      onChange: (checked: boolean) => setSettings({ ...settings, smsNotifications: checked }),
    },
    {
      icon: <WhatsAppOutlined style={{ color: "#25d366", fontSize: 20 }} />,
      title: "WhatsApp Notifikasi",
      description: "Kirim notifikasi via WhatsApp (FSN WA Gateway)",
      checked: waConfig.whatsapp_enabled,
      onChange: (checked: boolean) => setWaConfig({ ...waConfig, whatsapp_enabled: checked }),
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
                      <CheckCircleOutlined style={{ color: "#219ebc", fontSize: 18 }} />
                    ) : (
                      <BellOutlined style={{ color: "#d9d9d9", fontSize: 18 }} />
                    )}
                    title={item.label}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card
            title={<Space><WhatsAppOutlined style={{ color: "#25d366" }} />WhatsApp Configuration</Space>}
            extra={
              <Space>
                <Button
                  icon={<ApiOutlined />}
                  loading={waTesting}
                  onClick={testWhatsApp}
                  disabled={!waConfig.whatsapp_enabled || !waConfig.whatsapp_api_key}
                >
                  Test Kirim
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={waLoading}
                  onClick={saveWhatsAppConfig}
                  style={{ background: "#25d366", borderColor: "#25d366" }}
                >
                  Simpan
                </Button>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>API Key</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>FSN WA Gateway API Key</Text>
                </div>
                <Input
                  prefix={<KeyOutlined />}
                  placeholder="fsk_xxxxxxxxxx"
                  value={waConfig.whatsapp_api_key}
                  onChange={(e) => setWaConfig({ ...waConfig, whatsapp_api_key: e.target.value })}
                  type="password"
                />
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Session ID</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>FSN WA Gateway Session ID</Text>
                </div>
                <Input
                  prefix={<ApiOutlined />}
                  placeholder="wa_xxxxxxxxxx_xxxxxxxxxxxxxxxx"
                  value={waConfig.whatsapp_session_id}
                  onChange={(e) => setWaConfig({ ...waConfig, whatsapp_session_id: e.target.value })}
                />
              </Col>
              <Col xs={24}>
                <div style={{ background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 8, padding: 12 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <strong>Catatan:</strong> WhatsApp notification akan mengirim pesan otomatis untuk:
                    Hafalan (ziyadah/muroja'ah), Absensi (malam hari), Target, Ujian, Pengumuman, dan Lupa Passcode.
                    Recipient: Guru, Yayasan, dan Orang Tua santri.
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Space>
      </div>
    </>
  )
}
