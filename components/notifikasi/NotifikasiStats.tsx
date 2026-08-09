"use client";

import React from "react";
import { Card, Col, Row, Statistic } from "antd";
import { BellOutlined, CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { NotifikasiTheme } from "./notifikasiUi";

interface StatCardConfig {
  from: string;
  to: string;
  shadow: string;
  icon: React.ReactNode;
}

export interface NotifikasiStatsProps {
  unreadCount: number;
  todayCount: number;
  thisWeekCount: number;
  statCards: NotifikasiTheme["statCards"];
}

/** Tiga kartu statistik (Belum Dibaca / Hari Ini / Minggu Ini) yang dipakai bersama semua role */
export function NotifikasiStats({
  unreadCount,
  todayCount,
  thisWeekCount,
  statCards,
}: NotifikasiStatsProps) {
  const cards: StatCardConfig[] = [
    { ...statCards.unread, icon: <BellOutlined style={{ color: "white" }} /> },
    { ...statCards.today, icon: <CalendarOutlined style={{ color: "white" }} /> },
    { ...statCards.week, icon: <ClockCircleOutlined style={{ color: "white" }} /> },
  ];

  const values = [unreadCount, todayCount, thisWeekCount];
  const titles = ["Belum Dibaca", "Hari Ini", "Minggu Ini"];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {cards.map((card, index) => (
        <Col xs={24} sm={8} key={titles[index]}>
          <Card
            style={{
              borderRadius: "16px",
              background: `${card.from}`,
              border: "none",
              boxShadow: `0 8px 32px ${card.shadow}`,
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.9)" }}>{titles[index]}</span>}
              value={values[index]}
              valueStyle={{ color: "white", fontSize: "28px", fontWeight: "bold" }}
              prefix={card.icon}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default NotifikasiStats;