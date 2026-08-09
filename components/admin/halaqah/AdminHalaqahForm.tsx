import React from "react";
import { Form, Input, Select, FormInstance } from "antd";

interface AdminHalaqahFormProps {
  form: FormInstance;
  guruOptions: any[];
  santriOptions: any[];
}

export default function AdminHalaqahForm({ form, guruOptions, santriOptions }: AdminHalaqahFormProps) {
  return (
    <Form form={form} layout="vertical" size="large">
      <Form.Item
        label="Nama Halaqah"
        name="namaHalaqah"
        rules={[{ required: true, message: "Please enter halaqah name" }]}
      >
        <Input placeholder="Enter halaqah name" />
      </Form.Item>
      <Form.Item
        label="Pilih Guru Pembimbing"
        name="guruId"
        rules={[{ required: true, message: "Please select a guru" }]}
      >
        <Select
          showSearch
          placeholder="Select a guru"
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children as unknown as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {guruOptions.map((g) => (
            <Select.Option key={g.id} value={g.id}>
              {g.namaLengkap}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="Pilih Santri (Minimal 5 santri)"
        name="santriIds"
        rules={[{ required: true, message: "Please select at least 5 santri" }]}
      >
        <Select
          mode="multiple"
          placeholder="Select santri for halaqah"
          maxTagCount={5}
          maxTagTextLength={20}
          style={{ width: "100%" }}
          notFoundContent={
            santriOptions.length === 0
              ? "Semua santri sudah terdaftar di halaqah lain"
              : "Tidak ada santri tersedia"
          }
        >
          {santriOptions.map((s) => (
            <Select.Option key={s.id} value={s.id}>
              {s.namaLengkap}
            </Select.Option>
          ))}
        </Select>
        {santriOptions.length === 0 && (
          <div
            style={{ color: "#fb8500", fontSize: "12px", marginTop: "4px" }}
          >
            ⚠️ Semua santri sudah terdaftar di halaqah lain
          </div>
        )}
      </Form.Item>
    </Form>
  );
}
