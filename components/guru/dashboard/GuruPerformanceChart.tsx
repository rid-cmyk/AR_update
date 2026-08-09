import React from "react";
import { Row, Col, Card } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";
import styles from "./GuruDashboard.module.css";

interface GuruPerformanceChartProps {
  perfBarData: any[];
}

export default function GuruPerformanceChart({ perfBarData }: GuruPerformanceChartProps) {
  return (
    <Row gutter={[16, 16]} className={styles.chartRow}>
      <Col xs={24}>
        <Card
          title={
            <div className={styles.cardTitleWrapper}>
              <TrophyOutlined className={styles.cardTitleIconWarning} />
              <span>Performance Overview</span>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perfBarData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} stroke="#666" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#666" fontSize={11} width={130} />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
                formatter={(value: any) => [`\${value}%`, 'Persentase']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Persentase">
                {perfBarData.map((entry, index) => (
                  <Cell key={`cell-\${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  );
}
