"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Row, Col, Card, Switch, Space, Typography, Button, Divider,
  Table, Tag, InputNumber, Progress, Statistic, message, Spin,
} from "antd"
import {
  SaveOutlined,
  DownloadOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard"
import { useSettings } from "@/hooks/useSettings"
import type { ColumnsType } from "antd/es/table"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/id"

dayjs.extend(relativeTime)
dayjs.locale("id")

const { Text, Title } = Typography

interface BackupItem {
  id: number
  namaFile: string
  tanggal: string
}

interface BackupStats {
  dbSize: string
  memoryUsage: number
  totalBackups: number
  lastBackup: string | null
}

export default function BackupSettingsPage() {
  const { settings, setSettings, loading: settingsLoading, saveSettings } = useSettings()
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [backupStats, setBackupStats] = useState<BackupStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/backup")
      if (res.ok) {
        const data = await res.json()
        setBackups(data.backups || [])
        setBackupStats(data.stats || null)
      }
    } catch (error) {
      console.error("Error fetching backups:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBackups() }, [fetchBackups])

  const handleCreateBackup = async () => {
    try {
      setCreating(true)
      const res = await fetch("/api/admin/backup", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        message.success(data.message || "Backup berhasil dibuat")
        fetchBackups()
      } else {
        message.error(data.error || "Gagal membuat backup")
      }
    } catch {
      message.error("Gagal membuat backup")
    } finally {
      setCreating(false)
    }
  }

  const columns: ColumnsType<BackupItem> = [
    {
      title: "Nama File",
      dataIndex: "namaFile",
      key: "namaFile",
      render: (text: string) => <Text code style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (text: string) => (
        <div>
          <div>{dayjs(text).format("DD MMM YYYY HH:mm")}</div>
          <div className="text-xs text-gray-400">{dayjs(text).fromNow()}</div>
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      render: () => (
        <Button size="small" icon={<DownloadOutlined />} type="link" disabled>
          Download
        </Button>
      ),
    },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0" }}>
      <AdminHeaderCard
        title="Backup & Pemulihan"
        subtitle="Kelola backup database dan pengaturan backup otomatis"
        actions={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchBackups} loading={loading}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={creating}
              onClick={handleCreateBackup}
            >
              Backup Sekarang
            </Button>
            <Button icon={<SaveOutlined />} loading={settingsLoading} onClick={() => saveSettings()}>
              Simpan Pengaturan
            </Button>
          </Space>
        }
      />

      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        {/* Info */}
        <Card size="small" style={{ borderLeft: "4px solid #1890ff" }}>
          <div className="flex items-start gap-3">
            <InfoCircleOutlined style={{ fontSize: 18, color: "#1890ff", marginTop: 2 }} />
            <div>
              <Text strong>Tentang Backup</Text>
              <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                Backup menyimpan salinan data database ke file terpisah. Gunakan &quot;Backup Sekarang&quot; untuk membuat backup manual, atau aktifkan backup otomatis agar sistem melakukan backup secara berkala.
              </Text>
            </div>
          </div>
        </Card>

        {/* Backup Otomatis */}
        <Card title={<Space><ClockCircleOutlined /> Backup Otomatis</Space>}>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text strong>Aktifkan Backup Otomatis</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Jalankan backup setiap hari</Text>
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
                {backupStats?.lastBackup ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    {dayjs(backupStats.lastBackup).fromNow()}
                  </Tag>
                ) : (
                  <Tag color="default">Belum ada backup</Tag>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Status Penyimpanan */}
        <Card title={<Space><DatabaseOutlined /> Status Penyimpanan</Space>}>
          <Spin spinning={loading}>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={8}>
                <Statistic title="Ukuran Database" value={backupStats?.dbSize || "-"} />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic title="Total Backup" value={backupStats?.totalBackups || 0} suffix="file" />
              </Col>
              <Col xs={24} sm={8}>
                <Text>Penggunaan Memori Server</Text>
                <Progress
                  percent={backupStats?.memoryUsage || 0}
                  status="active"
                  strokeColor={backupStats && backupStats.memoryUsage > 80 ? "#ff4d4f" : "#1890ff"}
                  style={{ marginTop: 8 }}
                />
              </Col>
            </Row>
          </Spin>
        </Card>

        {/* Riwayat Backup */}
        <Card title="Riwayat Backup">
          <Table
            columns={columns}
            dataSource={backups}
            rowKey="id"
            loading={loading}
            pagination={backups.length > 10 ? { pageSize: 10 } : false}
            locale={{ emptyText: "Belum ada riwayat backup" }}
            size="middle"
          />
        </Card>
      </Space>
    </div>
  )
}
