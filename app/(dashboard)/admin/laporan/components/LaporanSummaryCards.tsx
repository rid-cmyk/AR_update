import { Row, Col, Card, Statistic } from "antd";
import { TeamOutlined, UserOutlined, CalendarOutlined, BookOutlined, BarChartOutlined, TrophyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import React from "react";
import styles from "../LaporanClient.module.css";

interface LaporanSummaryCardsProps {
  summary: any;
}

export default function LaporanSummaryCards({ summary }: LaporanSummaryCardsProps) {
  return (
    <>
      <Row gutter={[16, 16]} className={styles.summaryRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Halaqah"
              value={summary?.totalHalaqah || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#219ebc" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Santri"
              value={summary?.totalSantri || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#219ebc" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Guru"
              value={summary?.totalGuru || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#8ecae6" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Overall Attendance"
              value={summary?.overallAttendance || 0}
              suffix="%"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#ffb703" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={styles.summaryRow}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hafalan Progress"
              value={summary?.overallHafalanProgress || 0}
              suffix="%"
              prefix={<BookOutlined />}
              valueStyle={{ color: "#eb2f96" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Hafalan Records"
              value={summary?.totalHafalanRecords || 0}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Ujian"
              value={summary?.totalUjian || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#fb8500" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Target Progress"
              value={summary?.targetProgress || 0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#023047" }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
