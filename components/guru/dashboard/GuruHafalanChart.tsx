import React from "react";
import { Card } from "antd";
import { BookOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./GuruDashboard.module.css";

interface GuruHafalanChartProps {
  hafalanProgress: any[];
}

export default function GuruHafalanChart({ hafalanProgress }: GuruHafalanChartProps) {
  return (
    <Card
      title={
        <div className={styles.cardTitleWrapper}>
          <BookOutlined className={styles.cardTitleIconPrimary} />
          <span>Hafalan 7 Hari Terakhir</span>
        </div>
      }
      className={styles.cardFullHeight}
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={hafalanProgress} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            stroke="#666"
            fontSize={11}
            tickFormatter={(val: string) => {
              const d = new Date(val);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
          />
          <YAxis stroke="#666" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
            labelFormatter={(val: string) => {
              const d = new Date(val);
              return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="ziyadah" stroke="#219ebc" strokeWidth={3} name="Ziyadah" dot={{ r: 4 }} />
          <Line type="monotone" dataKey="murajaah" stroke="#219ebc" strokeWidth={3} name="Murajaah" dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
