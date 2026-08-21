import React from "react";
import { Row, Col, Card } from "antd";
import { CalendarOutlined, TeamOutlined, ClockCircleOutlined } from "@ant-design/icons";

interface JadwalStatisticsProps {
  initialJadwalCount: number;
  halaqahListCount: number;
  thisWeekCount: number;
}

export default function JadwalStatistics({
  initialJadwalCount,
  halaqahListCount,
  thisWeekCount,
}: JadwalStatisticsProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined
              style={{ fontSize: "24px", color: "#219ebc", marginRight: 12 }}
            />
            <div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Total Schedules
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#219ebc",
                }}
              >
                {initialJadwalCount}
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <div style={{ display: "flex", alignItems: "center" }}>
            <TeamOutlined
              style={{ fontSize: "24px", color: "#219ebc", marginRight: 12 }}
            />
            <div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Active Halaqah
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#219ebc",
                }}
              >
                {halaqahListCount}
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <div style={{ display: "flex", alignItems: "center" }}>
            <ClockCircleOutlined
              style={{ fontSize: "24px", color: "#8ecae6", marginRight: 12 }}
            />
            <div>
              <div style={{ fontSize: "14px", color: "#666" }}>This Week</div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#8ecae6",
                }}
              >
                {thisWeekCount}
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
