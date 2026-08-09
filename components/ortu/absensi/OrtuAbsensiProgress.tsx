import React from "react";
import { Row, Col, Card, Progress } from "antd";
import styles from "./Absensi.module.css";

interface ChildStat {
  namaLengkap: string;
  persentaseKehadiran: number;
}

interface OrtuAbsensiProgressProps {
  filteredStats: ChildStat[];
}

export default function OrtuAbsensiProgress({ filteredStats }: OrtuAbsensiProgressProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {filteredStats.map((child, index) => (
        <Col xs={24} md={12} lg={8} key={index}>
          <Card title={`🎯 Kehadiran \${child.namaLengkap}`} variant="borderless">
            <div className={styles.progressContainer}>
              <Progress
                type="circle"
                percent={child.persentaseKehadiran}
                format={(percent) => `\${percent}%`}
                strokeColor="#219ebc"
                size={100}
              />
              <p className={styles.progressSubtitle}>
                Persentase kehadiran bulan ini
              </p>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
