"use client"

import {
  Row, Col, Card, Switch, Space, Typography, Button, Divider,
  Table, Tag, InputNumber, Progress, Statistic,
} from "antd"
import {
  SaveOutlined,
  CloudDownloadOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons"
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard"
import { useSettings } from "@/hooks/useSettings"
import type { ColumnsType } from "antd/es/table"

const { Title, Text } = Typography

interface BackupHistory {
  key: string
  date: string
  size: string
  status: "completed" | "in_progress" | "failed"
  type: "manual" | "scheduled"
}

export default function BackupSettingsPage() {
  const { settings, setSettings, stats, loading, saveSettings } = useSettings()

  const backupHistory: BackupHistory[] = [
    { key: "1", date: "2026-07-20 02:00", size: "2.4 GB", status: "completed", type: "scheduled" },
    { key: "2", date: "2026-07-19 02:00", size: "2.3 GB", status: "completed", type: "scheduled" },
    { key: "3", date: "2026-07-18 15:30", size: "2.2 GB", status: "completed", type: "manual" },
    { key: "4", date: "2026-07-18 02:00", size: "2.1 GB", status: "failed", type: "scheduled" },
    { key: "5", date: "2026-07-17 02:00", size: "2.0 GB", status: "completed", type: "scheduled" },
  ]

  const columns: ColumnsType<BackupHistory> = [
    {
      title: "Tanggal",
      dataIndex: "date",
      key: "date",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Ukuran",
      dataIndex: "size",
      key: "size",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Tipe",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "scheduled" ? "blue" : "green"}>
          {type === "scheduled" ? "Terjadwal" : "Manual"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
          completed: { color: "green", icon: <CheckCircleOutlined />, label: "Berhasil" },
          in_progress: { color: "processing", icon: <SyncOutlined spin />, label: "Berlangsung" },
          failed: { color: "red", icon: <DeleteOutlined />, label: "Gagal" },
        }
        const s = map[status as keyof typeof map]
        return <Tag color={s.color} icon={s.icon}>{s.label}</Tag>
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status === "completed" && (
            <Button size="small" icon={<DownloadOutlined />} type="link">Download</Button>
          )}
          <Button size="small" danger type="link">Hapus</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0" }}>
        <AdminHeaderCard
          title="Backup & Pemulihan"
          subtitle="Pengaturan backup otomatis dan riwayat backup"
          actions={
            <Space>
              <Button icon={<DownloadOutlined />}>Backup Manual</Button>
              <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={() => saveSettings()}>
                Simpan
              </Button>
            </Space>
          }
        />
        <Space direction="vertical" size={24} style={{ width: "100%" }}>

          <Card title={<Space><ClockCircleOutlined />Backup Otomatis</Space>}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Text strong>Aktifkan Backup Otomatis</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>Jalankan backup secara berkala</Text>
                  </div>
                  <Switch
                    checked={settings.backupEnabled}
                    onChange={(checked) => setSettings({ ...settings, backupEnabled: checked })}
                  />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <Text>Jam Backup Harian</Text>
                <InputNumber
                  style={{ width: "100%", marginTop: 8 }}
                  min={0}
                  max={23}
                  value={settings.autoBackupHour}
                  onChange={(v) => setSettings({ ...settings, autoBackupHour: v || 2 })}
                  addonAfter=":00 WIB"
                  disabled={!settings.backupEnabled}
                />
              </Col>
              <Col xs={24} md={8}>
                <Text>Terakhir Backup</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color="green" icon={<CheckCircleOutlined />}>{stats.lastBackup}</Tag>
                </div>
              </Col>
            </Row>
          </Card>

          <Card title={<Space><DatabaseOutlined />Status Penyimpanan</Space>}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <Statistic title="Ukuran Database" value={stats.dbSize} />
              </Col>
              <Col xs={24} md={16}>
                <Text>Penggunaan Penyimpanan Backup</Text>
                <Progress
                  percent={35}
                  status="active"
                  strokeColor="#1890ff"
                  format={(percent) => `${percent}% (8.5 / 25 GB)`}
                  style={{ marginTop: 8 }}
                />
              </Col>
            </Row>
          </Card>

          <Card title="Riwayat Backup">
            <Table
              columns={columns}
              dataSource={backupHistory}
              pagination={false}
              size="middle"
            />
          </Card>
        </Space>
      </div>
    </>
  )
}
