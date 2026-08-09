import React from "react";
import { Row, Col, Card, Progress } from "antd";
import styles from "./Laporan.module.css";

interface AdminLaporanPerformanceProps {
  reportData: any;
}

export default function AdminLaporanPerformance({ reportData }: AdminLaporanPerformanceProps) {
  return (
    <Row gutter={[16, 16]} className={styles.performanceRow}>
      <Col xs={24} md={12}>
        <Card title="Ringkasan Kehadiran" variant="borderless">
          <div className={styles.performanceCardContent}>
            <Progress
              type="circle"
              percent={reportData?.summary?.overallAttendance || 0}
              format={(percent) => `\${percent}%`}
              strokeColor="#219ebc"
              size={120}
            />
            <p className={styles.performanceDesc}>
              Rata-rata kehadiran di semua halaqah
            </p>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Ringkasan Progress Hafalan" variant="borderless">
          <div className={styles.performanceCardContent}>
            <Progress
              type="circle"
              percent={reportData?.summary?.overallHafalanProgress || 0}
              format={(percent) => `\${percent}%`}
              strokeColor="#219ebc"
              size={120}
            />
            <p className={styles.performanceDesc}>
              Rata-rata progress hafalan semua santri
            </p>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
