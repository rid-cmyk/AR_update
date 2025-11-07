"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Select,
  Input,
  Switch,
  Space,
  Statistic,
  Typography,
  Progress,
  message,
  Tag,
  Tooltip,
  Tabs,
  Badge,
  Form,
  InputNumber,
  Divider,
  Alert,
  Modal,
} from "antd";
import {
  SettingOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
  ServerOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  BellOutlined,
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloudServerOutlined,
  SafetyOutlined,
  MonitorOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SystemSettings {
  appName: string;
  appDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUsers: number;
  sessionTimeout: number;
  backupEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoBackupHour: number;
  maxFileSize: number;
  allowedFileTypes: string[];
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalUjian: number;
  totalRaport: number;
  dbSize: string;
  lastBackup: string;
  systemUptime: string;
  memoryUsage: number;
  diskUsage: number;
  cpuUsage: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    appName: "AR-Hafalan",
    appDescription: "Sistem Manajemen Hafalan Al-Quran Terpadu",
    contactEmail: "admin@arhafalan.com",
    maintenanceMode: false,
    allowRegistration: true,
    maxUsers: 1000,
    sessionTimeout: 30,
    backupEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    autoBackupHour: 2,
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "doc", "docx", "jpg", "png"],
  });

  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 342,
    activeUsers: 89,
    totalUjian: 1250,
    totalRaport: 340,
    dbSize: "2.4 GB",
    lastBackup: "2 jam yang lalu",
    systemUptime: "15 hari 4 jam",
    memoryUsage: 68,
    diskUsage: 45,
    cpuUsage: 23,
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSettings();
    fetchSystemStats();
    // Auto refresh stats every 30 seconds
    const interval = setInterval(fetchSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      // Simulate API call
      console.log("Fetching settings...");
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchSystemStats = async () => {
    try {
      // Simulate API call with random variations
      setSystemStats(prev => ({
        ...prev,
        activeUsers: 85 + Math.floor(Math.random() * 10),
        memoryUsage: 65 + Math.floor(Math.random() * 10),
        cpuUsage: 20 + Math.floor(Math.random() * 15),
      }));
    } catch (error) {
      console.error("Error fetching system stats:", error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success("Pengaturan sistem berhasil disimpan!");
    } catch (error) {
      message.error("Gagal menyimpan pengaturan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    Modal.confirm({
      title: "Reset Pengaturan",
      content: "Apakah Anda yakin ingin mereset semua pengaturan ke default?",
      icon: <ExclamationCircleOutlined />,
      okText: "Ya, Reset",
      cancelText: "Batal",
      okType: "danger",
      onOk: () => {
        // Reset to default values
        message.success("Pengaturan berhasil direset ke default");
      },
    });
  };

  const tabItems = [
    {
      key: "general",
      label: (
        <Space>
          <SettingOutlined />
          Umum
        </Space>
      ),
    },
    {
      key: "security",
      label: (
        <Space>
          <SecurityScanOutlined />
          Keamanan
        </Space>
      ),
    },
    {
      key: "system",
      label: (
        <Space>
          <ServerOutlined />
          Sistem
        </Space>
      ),
    },
    {
      key: "notifications",
      label: (
        <Space>
          <BellOutlined />
          Notifikasi
        </Space>
      ),
    },
    {
      key: "backup",
      label: (
        <Space>
          <DatabaseOutlined />
          Backup
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "0 4px" }}>
        {/* Modern Header */}
        <div
          style={{
            marginBottom: 32,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 20,
            padding: "32px 40px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "50%",
              filter: "blur(30px)",
            }}
          />

          <Row align="middle" justify="space-between">
            <Col>
              <Space direction="vertical" size={4}>
                <Title
                  level={2}
                  style={{
                    color: "white",
                    margin: 0,
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  <SettingOutlined style={{ marginRight: 12 }} />
                  Pengaturan Sistem
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 16,
                    fontWeight: 400,
                  }}
                >
                  Kelola konfigurasi dan pengaturan sistem AR-Hafalan
                </Text>
                <Space style={{ marginTop: 8 }}>
                  <Tag
                    icon={<MonitorOutlined />}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                      borderRadius: 20,
                      padding: "4px 12px",
                    }}
                  >
                    System Online
                  </Tag>
                  <Tag
                    icon={<SafetyOutlined />}
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      color: "white",
                      borderRadius: 20,
                      padding: "4px 12px",
                    }}
                  >
                    Secure
                  </Tag>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space size="middle">
                <Button
                  icon={<ReloadOutlined />}
                  size="large"
                  onClick={fetchSystemStats}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    borderRadius: 12,
                    backdropFilter: "blur(10px)",
                    color: "white",
                    fontWeight: 500,
                  }}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  size="large"
                  loading={loading}
                  onClick={handleSaveSettings}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: 12,
                    backdropFilter: "blur(10px)",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  Simpan Pengaturan
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* System Status Cards */}
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                border: "1px solid #e8f4fd",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                boxShadow: "0 2px 12px rgba(59, 130, 246, 0.08)",
                transition: "all 0.3s ease",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <UserOutlined style={{ fontSize: 20, color: "white" }} />
                  </div>
                  <Tag color="blue" style={{ borderRadius: 12, fontSize: 11 }}>
                    +{systemStats.activeUsers} aktif
                  </Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                    Total Pengguna
                  </Text>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#1e293b",
                      lineHeight: 1,
                    }}
                  >
                    {systemStats.totalUsers}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                border: "1px solid #f0fdf4",
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                boxShadow: "0 2px 12px rgba(34, 197, 94, 0.08)",
                transition: "all 0.3s ease",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    <DatabaseOutlined style={{ fontSize: 20, color: "white" }} />
                  </div>
                  <Tag color="green" style={{ borderRadius: 12, fontSize: 11 }}>
                    {systemStats.diskUsage}% used
                  </Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                    Database Size
                  </Text>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#1e293b",
                      lineHeight: 1,
                    }}
                  >
                    {systemStats.dbSize}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                border: "1px solid #fdf4ff",
                background: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)",
                boxShadow: "0 2px 12px rgba(168, 85, 247, 0.08)",
                transition: "all 0.3s ease",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
                    }}
                  >
                    <MonitorOutlined style={{ fontSize: 20, color: "white" }} />
                  </div>
                  <Tag color="purple" style={{ borderRadius: 12, fontSize: 11 }}>
                    {systemStats.cpuUsage}% CPU
                  </Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                    Memory Usage
                  </Text>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#1e293b",
                      lineHeight: 1,
                    }}
                  >
                    {systemStats.memoryUsage}%
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{
                borderRadius: 16,
                border: "1px solid #fff7ed",
                background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
                boxShadow: "0 2px 12px rgba(249, 115, 22, 0.08)",
                transition: "all 0.3s ease",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                    }}
                  >
                    <ClockCircleOutlined style={{ fontSize: 20, color: "white" }} />
                  </div>
                  <Tag color="orange" style={{ borderRadius: 12, fontSize: 11 }}>
                    Online
                  </Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                    System Uptime
                  </Text>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#1e293b",
                      lineHeight: 1,
                    }}
                  >
                    {systemStats.systemUptime}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Main Settings Tabs */}
        <Card
          style={{
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
          }}
          styles={{ body: { padding: 0 } }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ padding: "24px" }}
            size="large"
          />

          <div style={{ padding: "0 24px 24px" }}>
            {/* General Settings Tab */}
            {activeTab === "general" && (
              <div>
                <Title level={4} style={{ marginBottom: 24 }}>
                  <SettingOutlined style={{ marginRight: 8 }} />
                  Pengaturan Umum Aplikasi
                </Title>
                
                <Form form={form} layout="vertical" initialValues={settings}>
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Nama Aplikasi"
                        name="appName"
                        rules={[{ required: true, message: "Nama aplikasi wajib diisi" }]}
                      >
                        <Input
                          size="large"
                          placeholder="Masukkan nama aplikasi"
                          prefix={<FileTextOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email Kontak"
                        name="contactEmail"
                        rules={[
                          { required: true, message: "Email kontak wajib diisi" },
                          { type: "email", message: "Format email tidak valid" },
                        ]}
                      >
                        <Input
                          size="large"
                          placeholder="admin@example.com"
                          prefix={<MailOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        label="Deskripsi Aplikasi"
                        name="appDescription"
                        rules={[{ required: true, message: "Deskripsi aplikasi wajib diisi" }]}
                      >
                        <TextArea
                          rows={4}
                          placeholder="Deskripsi singkat tentang aplikasi"
                          showCount
                          maxLength={500}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>

                <Divider />

                <Title level={5} style={{ marginBottom: 16 }}>
                  Pengaturan Pengguna
                </Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 16,
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                      }}
                    >
                      <div>
                        <Text strong>Izinkan Registrasi Baru</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Izinkan pengguna baru untuk mendaftar
                        </Text>
                      </div>
                      <Switch
                        checked={settings.allowRegistration}
                        onChange={(checked) =>
                          setSettings({ ...settings, allowRegistration: checked })
                        }
                      />
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div
                      style={{
                        padding: 16,
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                      }}
                    >
                      <Text strong>Maksimal Pengguna</Text>
                      <br />
                      <InputNumber
                        style={{ width: "100%", marginTop: 8 }}
                        size="large"
                        min={1}
                        max={10000}
                        value={settings.maxUsers}
                        onChange={(value) =>
                          setSettings({ ...settings, maxUsers: value || 1000 })
                        }
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Security Settings Tab */}
            {activeTab === "security" && (
              <div>
                <Title level={4} style={{ marginBottom: 24 }}>
                  <SecurityScanOutlined style={{ marginRight: 8 }} />
                  Pengaturan Keamanan Sistem
                </Title>

                <Alert
                  message="Keamanan Sistem"
                  description="Pengaturan keamanan akan mempengaruhi seluruh sistem. Pastikan Anda memahami dampak dari setiap perubahan."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Card
                      size="small"
                      title={
                        <Space>
                          <LockOutlined />
                          Mode Maintenance
                        </Space>
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <Text>Aktifkan mode maintenance</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Mencegah akses pengguna saat maintenance
                          </Text>
                        </div>
                        <Switch
                          checked={settings.maintenanceMode}
                          onChange={(checked) =>
                            setSettings({ ...settings, maintenanceMode: checked })
                          }
                        />
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card
                      size="small"
                      title={
                        <Space>
                          <ClockCircleOutlined />
                          Session Timeout
                        </Space>
                      }
                    >
                      <Text>Timeout sesi (menit)</Text>
                      <br />
                      <InputNumber
                        style={{ width: "100%", marginTop: 8 }}
                        min={5}
                        max={480}
                        value={settings.sessionTimeout}
                        onChange={(value) =>
                          setSettings({ ...settings, sessionTimeout: value || 30 })
                        }
                        addonAfter="menit"
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginBottom: 16 }}>
                  Pengaturan File Upload
                </Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Card size="small" title="Ukuran File Maksimal">
                      <InputNumber
                        style={{ width: "100%" }}
                        min={1}
                        max={100}
                        value={settings.maxFileSize}
                        onChange={(value) =>
                          setSettings({ ...settings, maxFileSize: value || 10 })
                        }
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
                        onChange={(value) =>
                          setSettings({ ...settings, allowedFileTypes: value })
                        }
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
              </div>
            )}

            {/* System Info Tab */}
            {activeTab === "system" && (
              <div>
                <Title level={4} style={{ marginBottom: 24 }}>
                  <ServerOutlined style={{ marginRight: 8 }} />
                  Informasi & Status Sistem
                </Title>

                <Row gutter={[24, 16]}>
                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <Space>
                          <CloudServerOutlined />
                          Informasi Sistem
                        </Space>
                      }
                    >
                      <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text>Versi Aplikasi</Text>
                          <Tag color="blue">v2.1.0</Tag>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text>Environment</Text>
                          <Tag color="green">Production</Tag>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text>Database</Text>
                          <Tag color="purple">PostgreSQL 14</Tag>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text>Last Update</Text>
                          <Text type="secondary">
                            {new Date().toLocaleDateString("id-ID")}
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card
                      title={
                        <Space>
                          <MonitorOutlined />
                          Performance Monitor
                        </Space>
                      }
                    >
                      <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 8,
                            }}
                          >
                            <Text>CPU Usage</Text>
                            <Text strong>{systemStats.cpuUsage}%</Text>
                          </div>
                          <Progress
                            percent={systemStats.cpuUsage}
                            status={systemStats.cpuUsage > 80 ? "exception" : "active"}
                            strokeColor={
                              systemStats.cpuUsage > 80
                                ? "#ff4d4f"
                                : systemStats.cpuUsage > 60
                                ? "#faad14"
                                : "#52c41a"
                            }
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 8,
                            }}
                          >
                            <Text>Memory Usage</Text>
                            <Text strong>{systemStats.memoryUsage}%</Text>
                          </div>
                          <Progress
                            percent={systemStats.memoryUsage}
                            status={systemStats.memoryUsage > 80 ? "exception" : "active"}
                            strokeColor={
                              systemStats.memoryUsage > 80
                                ? "#ff4d4f"
                                : systemStats.memoryUsage > 60
                                ? "#faad14"
                                : "#52c41a"
                            }
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 8,
                            }}
                          >
                            <Text>Disk Usage</Text>
                            <Text strong>{systemStats.diskUsage}%</Text>
                          </div>
                          <Progress
                            percent={systemStats.diskUsage}
                            status={systemStats.diskUsage > 80 ? "exception" : "active"}
                            strokeColor={
                              systemStats.diskUsage > 80
                                ? "#ff4d4f"
                                : systemStats.diskUsage > 60
                                ? "#faad14"
                                : "#52c41a"
                            }
                          />
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginBottom: 16 }}>
                  Status Komponen Sistem
                </Title>
                <Row gutter={[16, 16]}>
                  {[
                    { name: "Database PostgreSQL", status: "healthy", icon: <DatabaseOutlined /> },
                    { name: "File Storage", status: "healthy", icon: <CloudServerOutlined /> },
                    { name: "Email Service", status: "healthy", icon: <MailOutlined /> },
                    { name: "Backup Service", status: "healthy", icon: <SafetyOutlined /> },
                  ].map((component, index) => (
                    <Col xs={24} md={12} key={index}>
                      <Card size="small">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Space>
                            {component.icon}
                            <Text strong>{component.name}</Text>
                          </Space>
                          <Space>
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                            <Tag color="green">Healthy</Tag>
                          </Space>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div>
                <Title level={4} style={{ marginBottom: 24 }}>
                  <BellOutlined style={{ marginRight: 8 }} />
                  Pengaturan Notifikasi
                </Title>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <Space>
                          <MailOutlined />
                          Email Notifications
                        </Space>
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <div>
                          <Text strong>Aktifkan Email</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Kirim notifikasi via email
                          </Text>
                        </div>
                        <Switch
                          checked={settings.emailNotifications}
                          onChange={(checked) =>
                            setSettings({ ...settings, emailNotifications: checked })
                          }
                        />
                      </div>
                      <Divider style={{ margin: "12px 0" }} />
                      <Space direction="vertical" size={8} style={{ width: "100%" }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Jenis notifikasi email:
                        </Text>
                        <div style={{ paddingLeft: 16 }}>
                          <div>• Ujian baru dibuat</div>
                          <div>• Raport siap diunduh</div>
                          <div>• Backup berhasil</div>
                          <div>• Error sistem</div>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <Space>
                          <BellOutlined />
                          SMS Notifications
                        </Space>
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <div>
                          <Text strong>Aktifkan SMS</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Kirim notifikasi via SMS
                          </Text>
                        </div>
                        <Switch
                          checked={settings.smsNotifications}
                          onChange={(checked) =>
                            setSettings({ ...settings, smsNotifications: checked })
                          }
                        />
                      </div>
                      <Divider style={{ margin: "12px 0" }} />
                      <Space direction="vertical" size={8} style={{ width: "100%" }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Jenis notifikasi SMS:
                        </Text>
                        <div style={{ paddingLeft: 16 }}>
                          <div>• Error kritis sistem</div>
                          <div>• Backup gagal</div>
                          <div>• Maintenance mode</div>
                          <div>• Security alert</div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {/* Backup Tab */}
            {activeTab === "backup" && (
              <div>
                <Title level={4} style={{ marginBottom: 24 }}>
                  <DatabaseOutlined style={{ marginRight: 8 }} />
                  Pengaturan Backup & Recovery
                </Title>

                <Alert
                  message="Backup Otomatis Aktif"
                  description={`Backup terakhir: ${systemStats.lastBackup}. Backup otomatis berjalan setiap hari pada pukul ${settings.autoBackupHour}:00.`}
                  type="success"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <Space>
                          <SafetyOutlined />
                          Pengaturan Backup
                        </Space>
                      }
                    >
                      <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <Text strong>Backup Otomatis</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Backup harian otomatis
                            </Text>
                          </div>
                          <Switch
                            checked={settings.backupEnabled}
                            onChange={(checked) =>
                              setSettings({ ...settings, backupEnabled: checked })
                            }
                          />
                        </div>
                        <div>
                          <Text strong>Jam Backup Otomatis</Text>
                          <br />
                          <InputNumber
                            style={{ width: "100%", marginTop: 8 }}
                            min={0}
                            max={23}
                            value={settings.autoBackupHour}
                            onChange={(value) =>
                              setSettings({ ...settings, autoBackupHour: value || 2 })
                            }
                            addonAfter=":00"
                          />
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      title={
                        <Space>
                          <HistoryOutlined />
                          Manual Backup
                        </Space>
                      }
                    >
                      <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <Text>
                          Buat backup manual untuk memastikan data terbaru tersimpan dengan aman.
                        </Text>
                        <Button
                          type="primary"
                          icon={<DatabaseOutlined />}
                          size="large"
                          block
                          onClick={() => {
                            message.loading("Membuat backup...", 2);
                            setTimeout(() => {
                              message.success("Backup berhasil dibuat!");
                            }, 2000);
                          }}
                        >
                          Buat Backup Sekarang
                        </Button>
                        <Button
                          icon={<EyeOutlined />}
                          size="large"
                          block
                          onClick={() => {
                            message.info("Menampilkan riwayat backup...");
                          }}
                        >
                          Lihat Riwayat Backup
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Title level={5} style={{ marginBottom: 16 }}>
                  Riwayat Backup Terbaru
                </Title>
                <div style={{ background: "#fafafa", padding: 16, borderRadius: 8 }}>
                  {[
                    { date: "2025-11-06 02:00", size: "2.4 GB", status: "success" },
                    { date: "2025-11-05 02:00", size: "2.3 GB", status: "success" },
                    { date: "2025-11-04 02:00", size: "2.3 GB", status: "success" },
                    { date: "2025-11-03 02:00", size: "2.2 GB", status: "success" },
                  ].map((backup, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: index < 3 ? "1px solid #e8e8e8" : "none",
                      }}
                    >
                      <Space>
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        <Text>{backup.date}</Text>
                      </Space>
                      <Space>
                        <Text type="secondary">{backup.size}</Text>
                        <Tag color="green">Success</Tag>
                      </Space>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleResetSettings}
          >
            Reset ke Default
          </Button>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchSystemStats}>
              Refresh Data
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={loading}
              onClick={handleSaveSettings}
            >
              Simpan Semua Pengaturan
            </Button>
          </Space>
        </div>
      </div>
    </LayoutApp>
  );
}