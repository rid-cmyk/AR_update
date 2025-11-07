"use client";

import React from "react";
import { Card, Button, Space, Typography, Row, Col } from "antd";
import { 
  PlusOutlined, 
  FileTextOutlined, 
  UserAddOutlined, 
  CalendarOutlined,
  NotificationOutlined,
  BarChartOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface QuickAction {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  badge?: number;
}

interface QuickActionsProps {
  userRole?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ userRole = "admin" }) => {
  const router = useRouter();

  const getActionsForRole = (role: string): QuickAction[] => {
    const baseActions: Record<string, QuickAction[]> = {
      admin: [
        {
          key: "create-template",
          title: "Buat Template",
          description: "Template ujian & raport baru",
          icon: <FileTextOutlined />,
          color: "#1890ff",
          path: "/admin/template"
        },
        {
          key: "manage-halaqah",
          title: "Kelola Halaqah",
          description: "Atur kelas dan santri",
          icon: <UserAddOutlined />,
          color: "#52c41a",
          path: "/admin/halaqah"
        },
        {
          key: "schedule",
          title: "Jadwal Kegiatan",
          description: "Atur jadwal pembelajaran",
          icon: <CalendarOutlined />,
          color: "#722ed1",
          path: "/admin/jadwal"
        },
        {
          key: "announcement",
          title: "Pengumuman",
          description: "Buat pengumuman baru",
          icon: <NotificationOutlined />,
          color: "#fa8c16",
          path: "/admin/pengumuman"
        },

        {
          key: "reports",
          title: "Laporan",
          description: "Analisis & statistik",
          icon: <BarChartOutlined />,
          color: "#13c2c2",
          path: "/admin/laporan"
        },

        {
          key: "settings",
          title: "Pengaturan",
          description: "Konfigurasi sistem",
          icon: <SettingOutlined />,
          color: "#666",
          path: "/admin/settings"
        }
      ],
      guru: [
        {
          key: "new-exam",
          title: "Ujian Baru",
          description: "Buat ujian untuk santri",
          icon: <PlusOutlined />,
          color: "#1890ff",
          path: "/guru/ujian"
        },
        {
          key: "grade-exam",
          title: "Nilai Ujian",
          description: "Input nilai ujian santri",
          icon: <FileTextOutlined />,
          color: "#52c41a",
          path: "/guru/ujian"
        },
        {
          key: "attendance",
          title: "Absensi",
          description: "Catat kehadiran santri",
          icon: <CalendarOutlined />,
          color: "#722ed1",
          path: "/guru/absensi"
        },
        {
          key: "progress",
          title: "Progress Hafalan",
          description: "Lihat perkembangan santri",
          icon: <BarChartOutlined />,
          color: "#13c2c2",
          path: "/guru/grafik"
        }
      ]
    };

    return baseActions[role] || baseActions.admin;
  };

  const actions = getActionsForRole(userRole);

  const handleActionClick = (path: string) => {
    router.push(path);
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255, 255, 255, 0.3)",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)"
      }}
      styles={{ body: { padding: 24 } }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ 
          margin: 0,
          color: "#1a1a1a",
          fontSize: 18,
          fontWeight: 600
        }}>
          🚀 Quick Actions
        </Title>
        <Text style={{ color: "#666", fontSize: 14 }}>
          Akses cepat ke fitur yang sering digunakan
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {actions.map((action) => (
          <Col xs={24} sm={12} md={8} lg={6} key={action.key}>
            <Button
              type="text"
              onClick={() => handleActionClick(action.path)}
              style={{
                width: "100%",
                height: "auto",
                padding: 16,
                borderRadius: 12,
                border: "1px solid rgba(0, 0, 0, 0.06)",
                background: "rgba(255, 255, 255, 0.8)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                textAlign: "left"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 25px ${action.color}20`;
                e.currentTarget.style.borderColor = `${action.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
                e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.06)";
              }}
            >
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 16
                  }}>
                    {action.icon}
                  </div>
                  {action.badge && (
                    <div style={{
                      background: "#ff4d4f",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 8,
                      minWidth: 16,
                      textAlign: "center"
                    }}>
                      {action.badge}
                    </div>
                  )}
                </div>
                
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1a1a1a",
                    marginBottom: 2
                  }}>
                    {action.title}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "#666",
                    lineHeight: 1.4
                  }}>
                    {action.description}
                  </div>
                </div>
              </Space>
            </Button>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default QuickActions;