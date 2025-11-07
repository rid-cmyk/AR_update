"use client";

import { Card, Typography } from "antd";

const { Text } = Typography;

interface FormJenisUjianProps {
  onSuccess?: () => void;
}

export function FormJenisUjian({ onSuccess }: FormJenisUjianProps) {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Text type="secondary">Form Jenis Ujian akan ditampilkan di sini</Text>
      </div>
    </Card>
  );
}
