'use client'

import { Form, Input, Select, Space } from "antd";
import type { FormInstance } from "antd";
import { useQuranSuratList } from "@/hooks/useQuranSuratList";
import type { Santri } from "@/lib/utils/hafalanUtils";

const { Option } = Select;

interface HafalanFormProps {
  form: FormInstance;
  santriList: Santri[];
}

export default function HafalanForm({ form, santriList }: HafalanFormProps) {
  const { suratList } = useQuranSuratList();

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="Santri"
        name="santriId"
        rules={[{ required: true, message: "Pilih santri" }]}
      >
        <Select placeholder="Pilih Santri dari halaqah Anda">
          {santriList.map((santri) => (
            <Option key={santri.id} value={santri.id}>
              {santri.namaLengkap}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="Surat"
        name="surat"
        rules={[{ required: true, message: "Pilih surat" }]}
      >
        <Select
          placeholder="Pilih Surat"
          showSearch
          filterOption={(input, option) =>
            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
          }
        >
          {suratList.map((surat) => (
            <Option key={surat.nomor} value={surat.namaLatin}>
              {surat.nomor}. {surat.namaLatin} ({surat.jumlahAyat} ayat)
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Space>
        <Form.Item
          label="Ayat Mulai"
          name="ayatMulai"
          rules={[{ required: true, message: "Masukkan ayat mulai" }]}
        >
          <Input type="number" placeholder="Mulai" />
        </Form.Item>
        <Form.Item
          label="Ayat Selesai"
          name="ayatSelesai"
          rules={[{ required: true, message: "Masukkan ayat selesai" }]}
        >
          <Input type="number" placeholder="Selesai" />
        </Form.Item>
      </Space>
      <Form.Item
        label="Nilai"
        name="nilai"
      >
        <Select placeholder="Pilih Nilai">
          <Option value="Mumtaz">Mumtaz</Option>
          <Option value="Jayyid Jiddan">Jayyid Jiddan</Option>
          <Option value="Jayyid">Jayyid</Option>
          <Option value="Maqbul">Maqbul</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="Status"
        name="status"
        rules={[{ required: true, message: "Pilih status" }]}
      >
        <Select placeholder="Pilih Status">
          <Option value="ziyadah">Ziyadah</Option>
          <Option value="murojaah">Murojaah</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label="Keterangan (Opsional)"
        name="keterangan"
      >
        <Input.TextArea
          placeholder="Catatan tambahan tentang hafalan ini..."
          rows={3}
        />
      </Form.Item>
    </Form>
  );
}
