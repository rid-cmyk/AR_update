import React from "react";
import { Row, Col, Card, Typography } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import { HalaqahData } from "./guruDashboardTypes";
import HalaqahCard from "./HalaqahCard";
import TargetHafalanCard from "./TargetHafalanCard";
import styles from "./GuruDashboard.module.css";

const { Text } = Typography;

interface HalaqahSectionProps {
  halaqah: HalaqahData[];
}

export default function HalaqahSection({ halaqah }: HalaqahSectionProps) {
  return (
    <Card
      title={
        <div className={styles.cardTitleWrapper}>
          <TeamOutlined className={styles.cardTitleIconPrimary} />
          <span>Halaqah yang Anda Ajarkan</span>
        </div>
      }
      variant="outlined"
    >
      {halaqah.length > 0 ? (
        <Row gutter={[16, 16]}>
          {halaqah.map((halaqahItem) => (
            <React.Fragment key={halaqahItem.id}>
              <Col xs={24} md={12}>
                <HalaqahCard halaqah={halaqahItem} />
              </Col>
              <Col xs={24} md={12}>
                <TargetHafalanCard halaqah={halaqahItem} />
              </Col>
            </React.Fragment>
          ))}
        </Row>
      ) : (
        <div className={styles.emptyHalaqahContainer}>
          <TeamOutlined className={styles.emptyHalaqahIcon} />
          <div>
            <Text className={styles.emptyHalaqahTextMain}>Belum ada halaqah yang ditugaskan</Text>
            <br />
            <Text className={styles.emptyHalaqahTextSub}>
              Admin akan menugaskan halaqah kepada Anda
            </Text>
          </div>
        </div>
      )}
    </Card>
  );
}
