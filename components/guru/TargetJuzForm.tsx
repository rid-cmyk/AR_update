"use client";

import React from 'react';
import { Card, Form, Input, Select, Button, DatePicker } from 'antd';

interface TargetJuzFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
  santriOptions?: any[];
}

export default function TargetJuzForm({ onSubmit, initialData, santriOptions = [] }: TargetJuzFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return (
    <Card title="Target Juz Form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData}
      >
        <Form.Item
          label="Santri"
          name="santriId"
          rules={[{ required: true, message: 'Pilih santri' }]}
        >
          <Select placeholder="Pilih santri">
            {santriOptions.map((santri) => (
              <Select.Option key={santri.id} value={santri.id}>
                {santri.namaLengkap}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Juz"
          name="juz"
          rules={[{ required: true, message: 'Pilih juz' }]}
        >
          <Select placeholder="Pilih juz">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
              <Select.Option key={juz} value={juz}>
                Juz {juz}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Deadline"
          name="deadline"
          rules={[{ required: true, message: 'Pilih deadline' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Simpan Target
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}