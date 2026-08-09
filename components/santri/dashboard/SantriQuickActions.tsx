import React from "react";
import { Row, Col, Card, Typography } from "antd";
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined, AimOutlined, FireOutlined } from "@ant-design/icons";

import styles from "./SantriDashboard.module.css";

const { Text } = Typography;

interface SantriQuickActionsProps {
  totalSetoran: number;
  activeTargets: number;
  totalTargetProgress: number;
  hafalanProgress: any[];
}

export default function SantriQuickActions({
  totalSetoran,
  activeTargets,
  totalTargetProgress,
  hafalanProgress,
}: SantriQuickActionsProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card
          title="Aksi Cepat"
          variant="outlined"
        >
          <div className={styles.quickActionItem}>
            <BookOutlined className={styles.quickActionIconPrimary} />
            <Text strong>Lihat Hafalan:</Text>
            <br />
            <Text className={styles.quickActionDesc}>
              Pantau perkembangan hafalan Anda
            </Text>
          </div>
          <div className={styles.quickActionItem}>
            <CheckCircleOutlined className={styles.quickActionIconPrimary} />
            <Text strong>Lihat Absensi:</Text>
            <br />
            <Text className={styles.quickActionDesc}>
              Cek kehadiran Anda di halaqah
            </Text>
          </div>
          <div>
            <ClockCircleOutlined className={styles.quickActionIconWarning} />
            <Text strong>Lihat Target:</Text>
            <br />
            <Text className={styles.quickActionDesc}>
              Pantau progress target hafalan
            </Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card
          title="Status Hafalan"
          variant="outlined"
        >
          <div className={styles.statusItem}>
            <BookOutlined className={styles.statusIconPrimary} />
            <span>Total Setoran: <strong>{totalSetoran}</strong></span>
          </div>
          <div className={styles.statusItem}>
            <AimOutlined className={styles.statusIconPrimary} />
            <span>Target Aktif: <strong>{activeTargets}</strong></span>
          </div>
          <div className={styles.statusItem}>
            <CheckCircleOutlined className={styles.statusIconWarning} />
            <span>Progress Target: <strong>{totalTargetProgress}%</strong></span>
          </div>
          <div className={styles.statusItemLast}>
            <FireOutlined className={styles.statusIconDanger} />
            <span>Streak Days: <strong>{hafalanProgress.filter(day => day.total > 0).length}</strong></span>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        {/* AnnouncementList */}
      </Col>
    </Row>
  );
}
