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
  SettingOutlined,
  ThunderboltFilled,
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

const QuickActions: React.FC<QuickActionsProps> = ({ userRole = "super_admin" }) => {
  const router = useRouter();

  const getActionsForRole = (role: string): QuickAction[] => {
    const baseActions: Record<string, QuickAction[]> = {
      super_admin: [
        {
          key: "create-template",
          title: "Buat Template",
          description: "Template ujian & raport baru",
          icon: <FileTextOutlined />,
          color: "#219ebc",
          path: "/super-admin/template-ujian",
        },
        {
          key: "manage-halaqah",
          title: "Kelola Halaqah",
          description: "Atur kelas dan santri",
          icon: <UserAddOutlined />,
          color: "#219ebc",
          path: "/super-admin/halaqah",
        },
        {
          key: "schedule",
          title: "Jadwal Kegiatan",
          description: "Atur jadwal pembelajaran",
          icon: <CalendarOutlined />,
          color: "#8ecae6",
          path: "/super-admin/jadwal",
        },
        {
          key: "announcement",
          title: "Pengumuman",
          description: "Buat pengumuman baru",
          icon: <NotificationOutlined />,
          color: "#ffb703",
          path: "/super-admin/pengumuman",
        },
        {
          key: "reports",
          title: "Laporan",
          description: "Analisis & statistik",
          icon: <BarChartOutlined />,
          color: "#13c2c2",
          path: "/super-admin/laporan",
        },
        {
          key: "settings",
          title: "Pengaturan",
          description: "Konfigurasi sistem",
          icon: <SettingOutlined />,
          color: "#64748b",
          path: "/super-admin/settings",
        },
      ],
      guru: [
        {
          key: "new-exam",
          title: "Ujian Baru",
          description: "Buat ujian untuk santri",
          icon: <PlusOutlined />,
          color: "#219ebc",
          path: "/guru/ujian",
        },
        {
          key: "grade-exam",
          title: "Nilai Ujian",
          description: "Input nilai ujian santri",
          icon: <FileTextOutlined />,
          color: "#219ebc",
          path: "/guru/ujian",
        },
        {
          key: "attendance",
          title: "Absensi",
          description: "Catat kehadiran santri",
          icon: <CalendarOutlined />,
          color: "#8ecae6",
          path: "/guru/absensi",
        },
        {
          key: "progress",
          title: "Progress Hafalan",
          description: "Lihat perkembangan santri",
          icon: <BarChartOutlined />,
          color: "#13c2c2",
          path: "/guru/grafik",
        },
      ],
    };

    return baseActions[role] || baseActions.super_admin;
  };

  const actions = getActionsForRole(userRole);

  const handleActionClick = (path: string) => {
    router.push(path);
  };

  return (
    <Card
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255, 255, 255, 0.5)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow:
          "0 10px 32px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
      styles={{ body: { padding: 24 } }}
    >
      <div
        style={{
          marginBottom: 22,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #219ebc, #5fd3c4)",
            boxShadow: "0 4px 12px rgba(33, 158, 188, 0.35)",
            color: "#fff",
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          <ThunderboltFilled />
        </div>
        <div>
          <Title
            level={4}
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: "-0.2px",
              lineHeight: 1.2,
            }}
          >
            Quick Actions
          </Title>
          <Text style={{ color: "#64748b", fontSize: 13 }}>
            Akses cepat ke fitur yang sering digunakan
          </Text>
        </div>
      </div>

      <Row gutter={[14, 14]}>
        {actions.map((action) => (
          <Col xs={24} sm={12} md={8} lg={6} key={action.key}>
            <Button
              type="text"
              onClick={() => handleActionClick(action.path)}
              className="quick-action-btn"
              style={
                {
                  width: "100%",
                  height: "auto",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid rgba(15, 23, 42, 0.06)",
                  background: "#ffffff",
                  textAlign: "left",
                  transition:
                    "transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1), border-color 0.22s ease",
                  "--action-color": action.color,
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 12px 28px ${action.color}26`;
                e.currentTarget.style.borderColor = `${action.color}55`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04)";
                e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.06)";
              }}
            >
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    className="action-icon"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${action.color}, ${action.color}cc)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 16,
                      boxShadow: `0 4px 10px ${action.color}40`,
                      transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    {action.icon}
                  </div>
                  {!!action.badge && (
                    <div
                      style={{
                        background: "linear-gradient(135deg, #fb8500, #ffb703)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 8,
                        minWidth: 16,
                        textAlign: "center",
                        boxShadow: "0 2px 6px rgba(251, 133, 0, 0.4)",
                      }}
                    >
                      {action.badge}
                    </div>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0f172a",
                      marginBottom: 3,
                    }}
                  >
                    {action.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      lineHeight: 1.45,
                    }}
                  >
                    {action.description}
                  </div>
                </div>

                <div
                  className="action-underline"
                  style={{
                    height: 2,
                    width: 20,
                    borderRadius: 2,
                    background: action.color,
                    opacity: 0.5,
                    transition: "width 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
                  }}
                />
              </Space>
            </Button>
          </Col>
        ))}
      </Row>

      <style jsx>{`
        :global(.quick-action-btn:hover .action-icon) {
          transform: scale(1.06) rotate(-2deg);
        }
        :global(.quick-action-btn:hover .action-underline) {
          width: 36px;
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.quick-action-btn),
          :global(.quick-action-btn .action-icon),
          :global(.quick-action-btn .action-underline) {
            transition: none !important;
          }
        }
      `}</style>
    </Card>
  );
};

export default QuickActions;