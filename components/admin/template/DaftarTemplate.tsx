"use client";

import { Card, Typography } from "antd";

const { Text } = Typography;

interface DaftarTemplateProps {
  type: 'jenis-ujian' | 'template-raport';
  onRefresh?: () => void;
}

export function DaftarTemplate({ type, onRefresh }: DaftarTemplateProps) {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Text type="secondary">
          Daftar {type === 'jenis-ujian' ? 'Jenis Ujian' : 'Template Raport'} akan ditampilkan di sini
        </Text>
      </div>
    </Card>
  );
}
