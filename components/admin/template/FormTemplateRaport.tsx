"use client";

import { Card, Typography } from "antd";

const { Text } = Typography;

interface FormTemplateRaportProps {
  onSuccess?: () => void;
}

export function FormTemplateRaport({ onSuccess }: FormTemplateRaportProps) {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Text type="secondary">Form Template Raport akan ditampilkan di sini</Text>
      </div>
    </Card>
  );
}
