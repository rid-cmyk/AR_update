"use client"

import { useState, useEffect } from "react"
import { Card, Row, Col, Tag, Spin, Typography, Space, Progress, Tooltip } from "antd"
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DatabaseOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons"

const { Text, Title } = Typography

interface SystemStatusData {
  status: string
  database: { connected: boolean; totalRecords: number }
  summary: { totalUsers: number; totalHalaqah: number; totalHafalan: number; totalUjian: number; totalAbsensi: number }
  academicYear: { nama: string; semester: string; isActive: boolean } | null
  templates: { ujian: number; raport: number; total: number }
  backup: { lastBackup: string; fileName: string } | null
  raport: number
  lastUpdated: string
  error?: string
}

export function SystemStatus() {
  const [data, setData] = useState<SystemStatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/system-status")
      if (res.ok) setData(await res.json())
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (!data || data.status === "unhealthy") {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <CloseCircleFilled style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }} />
          <p style={{ color: "#ff4d4f", fontWeight: 600 }}>Gagal memuat status sistem</p>
          <Text type="secondary">{data?.error || "Tidak ada koneksi ke server"}</Text>
        </div>
      </Card>
    )
  }

  const dbHealthPercent = data.database.connected ? 100 : 0

  return (
    <div>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" style={{ borderRadius: 12, border: "1px solid #f0f0f0", height: "100%" }}>
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Database</Text>
                <Tag
                  icon={data.database.connected ? <CheckCircleFilled /> : <CloseCircleFilled />}
                  color={data.database.connected ? "success" : "error"}
                  style={{ borderRadius: 8, fontSize: 10, margin: 0 }}
                >
                  {data.database.connected ? "Terhubung" : "Gagal"}
                </Tag>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <DatabaseOutlined style={{ color: "#1890ff", fontSize: 16 }} />
                <Text strong style={{ fontSize: 18 }}>{data.database.totalRecords.toLocaleString()}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>record</Text>
              </div>
              <Progress percent={dbHealthPercent} strokeColor="#52c41a" showInfo={false} size="small" />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" style={{ borderRadius: 12, border: "1px solid #f0f0f0", height: "100%" }}>
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Pengguna & Halaqah</Text>
              <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                <Tooltip title="Total Pengguna">
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <UserOutlined style={{ color: "#722ed1", fontSize: 14 }} />
                    <Text strong>{data.summary.totalUsers}</Text>
                  </div>
                </Tooltip>
                <Tooltip title="Total Halaqah">
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <TeamOutlined style={{ color: "#1890ff", fontSize: 14 }} />
                    <Text strong>{data.summary.totalHalaqah}</Text>
                  </div>
                </Tooltip>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <Tooltip title="Total Hafalan">
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <BookOutlined style={{ color: "#52c41a", fontSize: 14 }} />
                    <Text strong>{data.summary.totalHafalan}</Text>
                  </div>
                </Tooltip>
                <Tooltip title="Total Ujian">
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <FileTextOutlined style={{ color: "#fa8c16", fontSize: 14 }} />
                    <Text strong>{data.summary.totalUjian}</Text>
                  </div>
                </Tooltip>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" style={{ borderRadius: 12, border: "1px solid #f0f0f0", height: "100%" }}>
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Tahun Akademik</Text>
              {data.academicYear ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CalendarOutlined style={{ color: "#1890ff", fontSize: 14 }} />
                    <Text strong style={{ fontSize: 14 }}>{data.academicYear.nama}</Text>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Tag color="blue" style={{ borderRadius: 6, fontSize: 10, margin: 0 }}>
                      {data.academicYear.semester}
                    </Tag>
                    {data.academicYear.isActive && (
                      <Tag color="green" style={{ borderRadius: 6, fontSize: 10, margin: 0 }}>Aktif</Tag>
                    )}
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {data.templates.total} template
                    </Text>
                  </div>
                </>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>Belum diatur</Text>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small" style={{ borderRadius: 12, border: "1px solid #f0f0f0", height: "100%" }}>
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Backup & Raport</Text>
              {data.backup ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CloudUploadOutlined style={{ color: "#52c41a", fontSize: 14 }} />
                  <div>
                    <Text strong style={{ fontSize: 12, display: "block" }}>{formatTime(data.backup.lastBackup)}</Text>
                    <Text type="secondary" style={{ fontSize: 10 }}>{data.backup.fileName}</Text>
                  </div>
                </div>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>Belum ada backup</Text>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <FileTextOutlined style={{ color: "#722ed1", fontSize: 12 }} />
                <Text style={{ fontSize: 11 }}>
                  <Text strong>{data.raport}</Text> raport tergenerate
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      <div style={{ textAlign: "right", marginTop: 8 }}>
        <Space size={4}>
          <ClockCircleOutlined style={{ fontSize: 11, color: "#999" }} />
          <Text type="secondary" style={{ fontSize: 11 }}>Diperbarui: {formatTime(data.lastUpdated)}</Text>
        </Space>
      </div>
    </div>
  )
}
