import React from "react";
import { Row, Col, Card, Space, Button } from "antd";
import { UserSwitchOutlined, FileTextOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import styles from "./YayasanDashboard.module.css";

export default function YayasanDashboardInfoCards() {
  const router = useRouter();
  
  return (
    <Row gutter={[16, 16]} className={styles.sectionRow}>
      <Col xs={24} md={12}>
        <Card
          title="📖 Detail Per Santri"
          variant="borderless"
          className={styles.actionCard}
        >
          <Space direction="vertical" size="middle" className={styles.actionSpace}>
            <div>
              <strong>👤 Santri Overview:</strong>
              <p className={styles.actionDesc}>
                Detail progress hafalan, absensi, dan prestasi per santri
              </p>
            </div>
            <div>
              <strong>📊 Individual Reports:</strong>
              <p className={styles.actionDesc}>
                Laporan lengkap untuk setiap santri
              </p>
            </div>
            <Button
              type="primary"
              icon={<UserSwitchOutlined />}
              onClick={() => router.push('/yayasan/santri')}
              className={styles.btnFullWidth}
            >
              Lihat Detail Santri
            </Button>
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card
          title="📑 Raport Tahfidz"
          variant="borderless"
          className={styles.actionCard}
        >
          <Space direction="vertical" size="small" className={styles.actionSpace}>
            <div>
              <strong>📋 Semester Reports:</strong>
              <p className={styles.actionDesc}>
                Raport tahfidz per semester
              </p>
            </div>
            <div>
              <strong>🏆 Achievement Tracking:</strong>
              <p className={styles.actionDesc}>
                Pelacakan pencapaian hafalan
              </p>
            </div>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => router.push('/yayasan/raport')}
              className={styles.btnFullWidth}
            >
              Lihat Raport
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
