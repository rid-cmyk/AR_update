"use client";

import { useState, useEffect } from "react";
import { Card, Form, Input, InputNumber, Button, Space, Typography, message, Divider, Alert } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface KomponenForm {
  nama: string;
  bobot: number;
  deskripsi: string;
}

interface FormJenisUjianProps {
  onSuccess?: () => void;
}

export function FormJenisUjian({ onSuccess }: FormJenisUjianProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [komponenList, setKomponenList] = useState<KomponenForm[]>([
    { nama: '', bobot: 0, deskripsi: '' }
  ]);

  const totalBobot = komponenList.reduce((sum, k) => sum + (k.bobot || 0), 0);

  const handleAddKomponen = () => {
    setKomponenList([...komponenList, { nama: '', bobot: 0, deskripsi: '' }]);
  };

  const handleRemoveKomponen = (index: number) => {
    if (komponenList.length <= 1) return;
    setKomponenList(komponenList.filter((_, i) => i !== index));
  };

  const handleKomponenChange = (index: number, field: keyof KomponenForm, value: string | number) => {
    const updated = [...komponenList];
    updated[index] = { ...updated[index], [field]: value };
    setKomponenList(updated);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (Math.abs(totalBobot - 100) > 0.01) {
      message.error('Total bobot komponen penilaian harus 100%');
      return;
    }

    const validKomponen = komponenList.filter(k => k.nama.trim() !== '');
    if (validKomponen.length === 0) {
      message.error('Minimal harus ada 1 komponen penilaian');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/jenis-ujian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: values.nama,
          kode: values.kode,
          deskripsi: values.deskripsi || null,
          komponenPenilaian: validKomponen.map(k => ({
            nama: k.nama,
            bobot: k.bobot.toString(),
          }))
        })
      });

      const result = await response.json();

      if (response.ok) {
        message.success('Jenis ujian berhasil dibuat');
        form.resetFields();
        setKomponenList([{ nama: '', bobot: 0, deskripsi: '' }]);
        onSuccess?.();
      } else {
        message.error(result.error || 'Gagal membuat jenis ujian');
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        <Form.Item
          name="nama"
          label={<Text strong>Nama Jenis Ujian</Text>}
          rules={[{ required: true, message: 'Nama jenis ujian wajib diisi' }]}
        >
          <Input placeholder="Contoh: Ujian Hafalan Tasmi'" />
        </Form.Item>

        <Form.Item
          name="kode"
          label={<Text strong>Kode Jenis Ujian</Text>}
          rules={[{ required: true, message: 'Kode jenis ujian wajib diisi' }]}
        >
          <Input placeholder="Contoh: tasmi" style={{ textTransform: 'lowercase' }} />
        </Form.Item>

        <Form.Item
          name="deskripsi"
          label={<Text strong>Deskripsi</Text>}
        >
          <Input.TextArea rows={2} placeholder="Deskripsi singkat tentang jenis ujian ini" />
        </Form.Item>

        <Divider orientation="left">Komponen Penilaian</Divider>

        <Alert
          message={`Total bobot saat ini: ${totalBobot}% ${totalBobot === 100 ? '(✓ Sesuai)' : '(Harus 100%)'}`}
          type={totalBobot === 100 ? 'success' : 'warning'}
          showIcon
          style={{ marginBottom: 16 }}
        />

        {komponenList.map((komponen, index) => (
          <div key={index} style={{
            padding: '12px',
            marginBottom: 8,
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #e5e7eb'
          }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <Form.Item style={{ flex: 2, marginBottom: 0 }} label={index === 0 ? <Text strong>Nama Komponen</Text> : undefined}>
                  <Input
                    value={komponen.nama}
                    onChange={(e) => handleKomponenChange(index, 'nama', e.target.value)}
                    placeholder="Contoh: Tajwid"
                  />
                </Form.Item>
                <Form.Item style={{ flex: 1, marginBottom: 0 }} label={index === 0 ? <Text strong>Bobot (%)</Text> : undefined}>
                  <InputNumber
                    value={komponen.bobot}
                    onChange={(val) => handleKomponenChange(index, 'bobot', val || 0)}
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    placeholder="30"
                  />
                </Form.Item>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveKomponen(index)}
                  disabled={komponenList.length <= 1}
                  style={{ marginBottom: 0 }}
                />
              </div>
            </Space>
          </div>
        ))}

        <Button
          type="dashed"
          onClick={handleAddKomponen}
          icon={<PlusOutlined />}
          style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
        >
          Tambah Komponen
        </Button>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => {
              form.resetFields();
              setKomponenList([{ nama: '', bobot: 0, deskripsi: '' }]);
            }}>
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={Math.abs(totalBobot - 100) > 0.01}
            >
              Simpan Jenis Ujian
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
