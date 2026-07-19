'use client';

import React from 'react';
import { Modal, Form, DatePicker, Button, Space, Radio, Checkbox, message } from 'antd';

const { RangePicker } = DatePicker;

export function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form] = Form.useForm();

  const handleExport = () => {
    message.info('Fitur export akan segera tersedia');
    onClose();
  };

  return (
    <Modal
      title="Export Data Hafalan"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Batal
        </Button>,
        <Button key="export" type="primary" onClick={handleExport}>
          Export
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="format" label="Format File" initialValue="pdf">
          <Radio.Group>
            <Radio value="pdf">PDF</Radio>
            <Radio value="excel">Excel</Radio>
            <Radio value="csv">CSV</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="dateRange" label="Rentang Waktu">
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="dataTypes" label="Data yang Diexport" initialValue={['hafalan', 'target', 'stats']}>
          <Checkbox.Group>
            <Space direction="vertical">
              <Checkbox value="hafalan">Riwayat Hafalan</Checkbox>
              <Checkbox value="target">Target Hafalan</Checkbox>
              <Checkbox value="stats">Statistik & Progres</Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}