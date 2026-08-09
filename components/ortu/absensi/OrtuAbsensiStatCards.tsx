import React from "react";
import { Row, Col, Card } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, HeartOutlined } from "@ant-design/icons";
import styles from "./Absensi.module.css";

interface ChildStat {
  namaLengkap: string;
  totalKehadiran: number;
  totalAbsensi: number;
  totalAlpha: number;
  totalIzin: number;
  totalSakit: number;
}

interface OrtuAbsensiStatCardsProps {
  filteredStats: ChildStat[];
}

export default function OrtuAbsensiStatCards({ filteredStats }: OrtuAbsensiStatCardsProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      {filteredStats.map((child, index) => (
        <React.Fragment key={index}>
          {/* Kehadiran Card */}
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCardHadir}>
              <div className={styles.statIconWrapper}>
                <CheckCircleOutlined style={{ fontSize: '32px' }} />
              </div>
              <div className={styles.statValue}>
                {child.totalKehadiran}
              </div>
              <div className={styles.statTitle}>
                ✅ Hadir
              </div>
              <div className={styles.statSubtitle}>
                Dari {child.totalAbsensi} total hari
              </div>
            </Card>
          </Col>

          {/* Alpha Card */}
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCardAlpha}>
              <div className={styles.statIconWrapper}>
                <CloseCircleOutlined style={{ fontSize: '32px' }} />
              </div>
              <div className={styles.statValue}>
                {child.totalAlpha}
              </div>
              <div className={styles.statTitle}>
                ❌ Alpha
              </div>
              <div className={styles.statSubtitle}>
                Perlu perhatian khusus
              </div>
            </Card>
          </Col>

          {/* Izin Card */}
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCardIzin}>
              <div className={styles.statIconWrapper}>
                <ClockCircleOutlined style={{ fontSize: '32px' }} />
              </div>
              <div className={styles.statValue}>
                {child.totalIzin}
              </div>
              <div className={styles.statTitle}>
                📝 Izin
              </div>
              <div className={styles.statSubtitle}>
                Dengan keterangan
              </div>
            </Card>
          </Col>

          {/* Sakit Card */}
          <Col xs={24} sm={12} md={6}>
            <Card className={styles.statCardSakit}>
              <div className={styles.statIconWrapper}>
                <HeartOutlined style={{ fontSize: '32px' }} />
              </div>
              <div className={styles.statValue}>
                {child.totalSakit}
              </div>
              <div className={styles.statTitle}>
                🤒 Sakit
              </div>
              <div className={styles.statSubtitle}>
                Kondisi tidak sehat
              </div>
            </Card>
          </Col>
        </React.Fragment>
      ))}
    </Row>
  );
}
