'use client';

import React from 'react';
import { Modal, Form, DatePicker, Button, Space, Radio, Checkbox, message } from 'antd';

const { RangePicker } = DatePicker;

export function ExportModal({ open, onClose, hafalanData }: { open: boolean; onClose: () => void; hafalanData?: any[] }) {
  const [form] = Form.useForm();

  const handleExport = () => {
    const format = form.getFieldValue('format');
    if (format === 'csv') {
      const rows = hafalanData?.map(h => ({ Tanggal: h.tanggal, Surah: h.surahNama || h.surah, Mulai: h.ayatMulai || h.ayat, Selesai: h.ayatSelesai || h.ayat, Nilai: h.nilai })) || [];
      const header = Object.keys(rows[0] || {});
      if (header.length > 0) {
        const csv = [header.join(','), ...rows.map(r => header.map(f => JSON.stringify((r as any)[f] || '')).join(','))].join('\n');
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        link.download = 'hafalan.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      message.success('Ekspor berhasil');
      onClose();
    } else if (format === 'pdf') {
      window.print();
      onClose();
    } else {
      message.info('Fitur export format ini sedang dalam pengembangan');
      onClose();
    }
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