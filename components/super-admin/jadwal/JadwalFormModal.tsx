import React from "react";
import dynamic from "next/dynamic";
import { Form, Space, Select, DatePicker, TimePicker, Row, Col, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";

const DynamicModal = dynamic(() => import("antd").then((mod) => mod.Modal), {
  ssr: false,
});

interface Halaqah {
  id: number;
  namaHalaqah: string;
}

interface JadwalFormModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  form: FormInstance;
  handleSave: () => void;
  editingJadwal: any;
  halaqahList: Halaqah[];
  hariOptions: { value: string; label: string }[];
}

export default function JadwalFormModal({
  isModalOpen,
  setIsModalOpen,
  form,
  handleSave,
  editingJadwal,
  halaqahList,
  hariOptions,
}: JadwalFormModalProps) {
  return (
    <DynamicModal
      title={
        <Space>
          <CalendarOutlined />
          {editingJadwal ? "Edit Schedule" : "Add New Schedule"}
        </Space>
      }
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      onOk={handleSave}
      okText="Save"
      width={600}
    >
      <Form form={form} layout="vertical" size="large">
        <Form.Item
          label="Halaqah"
          name="halaqahId"
          rules={[{ required: true, message: "Please select halaqah" }]}
        >
          <Select placeholder="Select halaqah">
            {halaqahList.map((h) => (
              <Select.Option key={h.id} value={h.id}>
                {h.namaHalaqah}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Mode Jadwal" name="isTemplate" initialValue={true}>
          <Select>
            <Select.Option value={true}>
              📅 Template Mode (Berulang Mingguan)
            </Select.Option>
            <Select.Option value={false}>
              📆 Specific Date Mode (Tanggal Tertentu)
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Hari"
          name="hari"
          rules={[{ required: true, message: "Please select day" }]}
        >
          <Select placeholder="Select day">
            {hariOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Jam Mulai"
              name="jamMulai"
              rules={[{ required: true, message: "Please select start time" }]}
            >
              <TimePicker
                format="HH:mm"
                placeholder="Start time"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Jam Selesai"
              name="jamSelesai"
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <TimePicker
                format="HH:mm"
                placeholder="End time"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.isTemplate !== currentValues.isTemplate
          }
        >
          {({ getFieldValue }) => {
            const isTemplate = getFieldValue("isTemplate");
            return isTemplate ? (
              <div
                style={{
                  padding: "16px",
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}
              >
                <Typography.Text strong style={{ color: "#219ebc" }}>
                  📅 Template Mode
                </Typography.Text>
                <br />
                <Typography.Text style={{ fontSize: "12px" }}>
                  Jadwal akan berulang setiap minggu secara otomatis. Anda
                  bisa mengatur periode berlaku di bawah (opsional).
                </Typography.Text>

                <Row gutter={16} style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <Form.Item
                      label="Tanggal Mulai Berlaku (Opsional)"
                      name="tanggalMulai"
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="Pilih tanggal mulai"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Tanggal Selesai Berlaku (Opsional)"
                      name="tanggalSelesai"
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="Pilih tanggal selesai"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            ) : (
              <div
                style={{
                  padding: "16px",
                  background: "#fff7e6",
                  border: "1px solid #ffd591",
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}
              >
                <Typography.Text strong style={{ color: "#ffb703" }}>
                  📆 Specific Date Mode
                </Typography.Text>
                <br />
                <Typography.Text style={{ fontSize: "12px" }}>
                  Jadwal hanya berlaku untuk tanggal tertentu yang Anda pilih.
                </Typography.Text>

                <Form.Item
                  label="Tanggal Spesifik"
                  name="tanggalSpesifik"
                  rules={[
                    {
                      required: !isTemplate,
                      message: "Please select specific date",
                    },
                  ]}
                  style={{ marginTop: "12px", marginBottom: 0 }}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder="Pilih tanggal spesifik"
                  />
                </Form.Item>
              </div>
            );
          }}
        </Form.Item>

        <Form.Item label="Status" name="isActive" initialValue={true}>
          <Select>
            <Select.Option value={true}>🟢 Aktif</Select.Option>
            <Select.Option value={false}>🔴 Nonaktif</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </DynamicModal>
  );
}
