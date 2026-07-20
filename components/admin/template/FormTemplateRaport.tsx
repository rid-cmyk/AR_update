"use client";

import { useState, useEffect } from "react";
import { Card, Form, Input, Button, Space, Typography, message, Divider, Select, Switch } from "antd";

const { Text } = Typography;

interface TahunAjaran {
  id: number;
  namaLengkap: string;
  isActive: boolean;
}

interface FormTemplateRaportProps {
  onSuccess?: () => void;
}

export function FormTemplateRaport({ onSuccess }: FormTemplateRaportProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [loadingTahun, setLoadingTahun] = useState(true);

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch('/api/admin/tahun-akademik');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setTahunAjaranList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error);
    } finally {
      setLoadingTahun(false);
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/template-raport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: values.nama,
          tahunAjaranId: values.tahunAjaranId,
          namaLembaga: values.namaLembaga,
          alamatLembaga: values.alamatLembaga || null,
          headerKop: values.headerKop || null,
          footerKop: values.footerKop || null,
          tandaTanganKepala: values.tandaTanganKepala || null,
          namaKepala: values.namaKepala || null,
          jabatanKepala: values.jabatanKepala || null,
          tampilanGrafik: values.tampilanGrafik ?? true,
          tampilanRanking: values.tampilanRanking ?? true,
          catatanTemplate: values.catatanTemplate || null
        })
      });

      const result = await response.json();

      if (response.ok) {
        message.success('Template raport berhasil dibuat');
        form.resetFields();
        onSuccess?.();
      } else {
        message.error(result.error || 'Gagal membuat template raport');
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
        initialValues={{
          tampilanGrafik: true,
          tampilanRanking: true
        }}
      >
        <Form.Item
          name="nama"
          label={<Text strong>Nama Template</Text>}
          rules={[{ required: true, message: 'Nama template wajib diisi' }]}
        >
          <Input placeholder="Contoh: Template Raport Semester Ganjil 2024" />
        </Form.Item>

        <Form.Item
          name="tahunAjaranId"
          label={<Text strong>Tahun Akademik</Text>}
          rules={[{ required: true, message: 'Tahun akademik wajib dipilih' }]}
        >
          <Select
            placeholder="Pilih tahun akademik"
            loading={loadingTahun}
            options={tahunAjaranList.map(ta => ({
              value: ta.id,
              label: ta.namaLengkap + (ta.isActive ? ' (Aktif)' : '')
            }))}
          />
        </Form.Item>

        <Divider orientation="left">Informasi Lembaga</Divider>

        <Form.Item
          name="namaLembaga"
          label={<Text strong>Nama Lembaga</Text>}
          rules={[{ required: true, message: 'Nama lembaga wajib diisi' }]}
        >
          <Input placeholder="Contoh: Pondok Pesantren Al-Hikmah" />
        </Form.Item>

        <Form.Item
          name="alamatLembaga"
          label={<Text strong>Alamat Lembaga</Text>}
        >
          <Input.TextArea rows={2} placeholder="Alamat lengkap lembaga" />
        </Form.Item>

        <Divider orientation="left">Kop Surat</Divider>

        <Form.Item
          name="headerKop"
          label={<Text strong>Header Kop</Text>}
        >
          <Input.TextArea rows={3} placeholder="Header/kop surat untuk raport (nama lembaga, alamat, kontak)" />
        </Form.Item>

        <Form.Item
          name="footerKop"
          label={<Text strong>Footer Kop</Text>}
        >
          <Input.TextArea rows={3} placeholder="Footer untuk raport" />
        </Form.Item>

        <Divider orientation="left">Tanda Tangan</Divider>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            name="tandaTanganKepala"
            label={<Text strong>Tanda Tangan Kepala</Text>}
            style={{ flex: 1 }}
          >
            <Input placeholder="URL atau nama file tanda tangan" />
          </Form.Item>

          <Form.Item
            name="namaKepala"
            label={<Text strong>Nama Kepala</Text>}
            style={{ flex: 1 }}
          >
            <Input placeholder="Contoh: Dr. H. Ahmad Fauzi, M.Pd" />
          </Form.Item>
        </Space>

        <Form.Item
          name="jabatanKepala"
          label={<Text strong>Jabatan Kepala</Text>}
        >
          <Input placeholder="Contoh: Kepala Sekolah / Pengasuh" />
        </Form.Item>

        <Divider orientation="left">Pengaturan Tampilan</Divider>

        <Space style={{ width: '100%' }} size="large">
          <Form.Item name="tampilanGrafik" label={<Text strong>Tampilkan Grafik</Text>} valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="tampilanRanking" label={<Text strong>Tampilkan Ranking</Text>} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Space>

        <Form.Item
          name="catatanTemplate"
          label={<Text strong>Catatan Template</Text>}
        >
          <Input.TextArea rows={2} placeholder="Catatan tambahan untuk template ini" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => form.resetFields()}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Simpan Template Raport
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
