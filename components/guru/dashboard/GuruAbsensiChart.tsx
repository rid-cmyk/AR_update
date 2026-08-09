import React from "react";
import { Col, Card } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import styles from "./GuruDashboard.module.css";

interface GuruAbsensiChartProps {
  absensiHadir: number;
  absensiTidakHadir: number;
  absensiPieData: any[];
}

export default function GuruAbsensiChart({ absensiHadir, absensiTidakHadir, absensiPieData }: GuruAbsensiChartProps) {
  return (
    <Col xs={24} lg={12}>
      <Card
        title={
          <div className={styles.cardTitleWrapper}>
            <CheckCircleOutlined className={styles.cardTitleIconPrimary} />
            <span>Absensi Hari Ini</span>
          </div>
        }
        className={styles.cardFullHeight}
      >
        {absensiHadir + absensiTidakHadir > 0 ? (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="60%" height={260}>
              <PieChart>
                <Pie
                  data={absensiPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: any) => `\${name} \${(percent * 100).toFixed(0)}%`}
                >
                  {absensiPieData.map((entry, index) => (
                    <Cell key={`cell-\${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.emptyStateContainer}>
            <CheckCircleOutlined className={styles.emptyStateIcon} />
            <div>Belum ada data absensi hari ini</div>
          </div>
        )}
      </Card>
    </Col>
  );
}
