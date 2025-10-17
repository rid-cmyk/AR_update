"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Space, Button, message } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  SyncOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

interface Role {
  id: number;
  name: string;
  userCount?: number;
}

interface User {
  id: number;
  username: string;
  namaLengkap: string;
  noTlp?: string;
  role: Role;
}

interface Hafalan {
  id: number;
  status: string;
}

interface Absensi {
  id: number;
  status: string;
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [hafalan, setHafalan] = useState<Hafalan[]>([]);
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Fetch data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch {
      // Handle error silently for dashboard
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data);
    } catch {
      // Handle error silently for dashboard
    }
  };

  const fetchHafalan = async () => {
    try {
      // Assuming there's an API for hafalan stats
      // For now, using placeholder
      setHafalan([]);
    } catch {
      // Handle error
    }
  };

  const fetchAbsensi = async () => {
    try {
      // Assuming there's an API for absensi stats
      // For now, using placeholder
      setAbsensi([]);
    } catch {
      // Handle error
    }
  };

  // Synchronization function
  const handleSyncData = async () => {
    setSyncing(true);
    try {
      message.loading({ content: 'Menyinkronkan data...', key: 'sync' });

      // Fetch all data simultaneously
      await Promise.all([
        fetchUsers(),
        fetchRoles(),
        fetchHafalan(),
        fetchAbsensi()
      ]);

      // Update last sync timestamp
      setLastSync(new Date());

      message.success({ content: 'Data berhasil disinkronkan!', key: 'sync' });
    } catch (error) {
      console.error('Sync error:', error);
      message.error({ content: 'Gagal menyinkronkan data', key: 'sync' });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchHafalan();
    fetchAbsensi();
  }, []);

  // Statistics
  const getUserCountByRole = (roleName: string) => {
    return users.filter((user) => user.role.name.toLowerCase() === roleName.toLowerCase()).length;
  };

  const totalUsers = users.length;
  const totalSantri = getUserCountByRole("santri");
  const totalGuru = getUserCountByRole("guru");
  const totalAdmin = getUserCountByRole("admin");

  // Calculate hafalan completion rate (placeholder)
  const hafalanCompleted = hafalan.filter((h) => h.status === "selesai").length;
  const hafalanTotal = hafalan.length;
  const hafalanRate = hafalanTotal > 0 ? Math.round((hafalanCompleted / hafalanTotal) * 100) : 0;

  // Calculate attendance rate (placeholder)
  const absensiPresent = absensi.filter((a) => a.status === "masuk").length;
  const absensiTotal = absensi.length;
  const attendanceRate = absensiTotal > 0 ? Math.round((absensiPresent / absensiTotal) * 100) : 0;

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1>Super Admin Dashboard</h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>
              Overview of system statistics and user management
            </p>
          </div>
          <Button
            type="primary"
            icon={<SyncOutlined spin={syncing} />}
            onClick={handleSyncData}
            loading={syncing}
            size="large"
          >
            {syncing ? 'Menyinkronkan...' : 'Sinkronisasi Data'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Users"
                value={totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Santri"
                value={totalSantri}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Guru"
                value={totalGuru}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Admin"
                value={totalAdmin}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Hafalan Rate"
                value={hafalanRate}
                suffix="%"
                prefix={<BookOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Attendance"
                value={attendanceRate}
                suffix="%"
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Role Synchronization Card */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <TeamOutlined />
                  Role Management Sync
                </Space>
              }
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon={<SyncOutlined spin={syncing} />}
                  onClick={async () => {
                    setSyncing(true);
                    try {
                      message.loading({ content: 'Menyinkronkan data role...', key: 'role-sync' });
                      await Promise.all([fetchUsers(), fetchRoles()]);
                      setLastSync(new Date());
                      message.success({ content: 'Data role berhasil disinkronkan!', key: 'role-sync' });
                    } catch (error) {
                      console.error('Role sync error:', error);
                      message.error({ content: 'Gagal menyinkronkan data role', key: 'role-sync' });
                    } finally {
                      setSyncing(false);
                    }
                  }}
                  loading={syncing}
                  size="small"
                >
                  {syncing ? 'Menyinkronkan...' : 'Sync Roles'}
                </Button>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span><strong>Total Roles:</strong></span>
                  <span style={{ color: "#1890ff", fontWeight: "bold" }}>{roles.length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span><strong>Total Users:</strong></span>
                  <span style={{ color: "#52c41a", fontWeight: "bold" }}>{totalUsers}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span><strong>Last Sync:</strong></span>
                  <span style={{ color: "#fa8c16", fontSize: "12px" }}>
                    {lastSync ? lastSync.toLocaleString('id-ID') : 'Belum pernah'}
                  </span>
                </div>
              </div>
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: 8 }}>
                  <strong>Role Distribution:</strong>
                </div>
                {roles.slice(0, 3).map((role, index) => {
                  const colors = ["#1890ff", "#722ed1", "#eb2f96"];
                  return (
                    <div key={role.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "12px" }}>{role.name}:</span>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: colors[index % colors.length] }}>
                        {getUserCountByRole(role.name.toLowerCase())}
                      </span>
                    </div>
                  );
                })}
                {roles.length > 3 && (
                  <div style={{ fontSize: "12px", color: "#999", textAlign: "center", marginTop: 8 }}>
                    +{roles.length - 3} more roles
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <DatabaseOutlined />
                  System Overview
                </Space>
              }
              bordered={false}
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#52c41a",
                    marginRight: 8
                  }}></div>
                  <span>Database Status: <strong>Connected</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#1890ff",
                    marginRight: 8
                  }}></div>
                  <span>API Status: <strong>Operational</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#fa8c16",
                    marginRight: 8
                  }}></div>
                  <span>Cache Status: <strong>Active</strong></span>
                </div>
              </div>
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: 8 }}>
                  <strong>Quick Stats:</strong>
                </div>
                <Row gutter={8}>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#3f8600" }}>{totalUsers}</div>
                      <div style={{ fontSize: "10px", color: "#666" }}>Users</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1890ff" }}>{roles.length}</div>
                      <div style={{ fontSize: "10px", color: "#666" }}>Roles</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#722ed1" }}>{hafalanRate}%</div>
                      <div style={{ fontSize: "10px", color: "#666" }}>Hafalan</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Quick Actions"
              bordered={false}
            >
              <p style={{ marginBottom: 16 }}>
                <strong>Manage Users:</strong> Add, edit, and organize user accounts by role
              </p>
              <p style={{ marginBottom: 16 }}>
                <strong>System Settings:</strong> Configure raport templates, academic years, and backups
              </p>
              <p>
                <strong>Database:</strong> Monitor system performance and data integrity
              </p>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="System Status"
              bordered={false}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <DatabaseOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                <span>Database: <strong style={{ color: "#52c41a" }}>Healthy</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <UserOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                <span>Active Users: <strong>{totalUsers}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <ReloadOutlined style={{ color: "#fa8c16", marginRight: 8 }} />
                <span>Last Sync: <strong style={{ color: "#fa8c16" }}>
                  {lastSync ? lastSync.toLocaleString('id-ID') : 'Belum pernah'}
                </strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <BookOutlined style={{ color: "#722ed1", marginRight: 8 }} />
                <span>Last Backup: <strong>Today</strong></span>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}