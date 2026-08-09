import React from "react";
import { Modal, Form, Select, Input, Button, Space } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import WebSideDrawer from "@/components/ui/WebSideDrawer";
import type { FormInstance } from "antd";

const { Option } = Select;
const { TextArea } = Input;

interface Santri {
  id: number;
  namaLengkap: string;
  username: string;
}

interface PrestasiFormModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  form: FormInstance;
  handleSubmit: (values: any) => void;
  selectedHalaqahData: any;
  editingPrestasi: any;
}

export default function PrestasiFormModal({
  isModalOpen,
  setIsModalOpen,
  form,
  handleSubmit,
  selectedHalaqahData,
  editingPrestasi
}: PrestasiFormModalProps) {
  const renderPrestasiFormContent = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ marginTop: 24 }}
    >
      <Form.Item
        name="santriId"
        label="Santri"
        rules={[{ required: true, message: "Pilih santri" }]}
      >
        <Select
          placeholder="Pilih santri"
          showSearch
          optionFilterProp="children"
        >
          {selectedHalaqahData?.santri.map((santri: Santri) => (
            <Option key={santri.id} value={santri.id}>
              {santri.namaLengkap} (@{santri.username})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="namaPrestasi"
        label="Nama Prestasi"
        rules={[{ required: true, message: "Masukkan nama prestasi" }]}
      >
        <Input placeholder="Contoh: Juara 1 Lomba Tahfidz Tingkat Kecamatan" />
      </Form.Item>

      <Form.Item
        name="kategori"
        label="Kategori"
        rules={[{ required: true, message: "Pilih kategori" }]}
      >
        <Select placeholder="Pilih kategori prestasi">
          <Option value="Tahfidz">Tahfidz</Option>
          <Option value="Akademik">Akademik</Option>
          <Option value="Olahraga">Olahraga</Option>
          <Option value="Seni">Seni</Option>
          <Option value="Kepemimpinan">Kepemimpinan</Option>
          <Option value="Lainnya">Lainnya</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="tahun"
        label="Tahun"
        rules={[{ required: true, message: "Masukkan tahun" }]}
        initialValue={new Date().getFullYear()}
      >
        <Input type="number" placeholder="2024" />
      </Form.Item>

      <Form.Item
        name="keterangan"
        label="Keterangan"
      >
        <TextArea
          rows={4}
          placeholder="Deskripsi detail tentang prestasi (opsional)"
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}>
            Batal
          </Button>
          <Button type="primary" htmlType="submit">
            {editingPrestasi ? "Update" : "Simpan"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <>
      {/* Mobile Modal (< 1024px) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrophyOutlined style={{ color: '#ffb703' }} />
            <span>{editingPrestasi ? "Edit Prestasi" : "Tambah Prestasi Baru"}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="lg:hidden"
      >
        {renderPrestasiFormContent()}
      </Modal>

      {/* Desktop WebSideDrawer (>= 1024px) */}
      <WebSideDrawer
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        title={editingPrestasi ? "Edit Prestasi Santri" : "Catat Prestasi Baru"}
        subtitle="Catat penghargaan, kompetisi tahfidz, atau capaian istimewa santri halaqah"
        size="md"
      >
        {renderPrestasiFormContent()}
      </WebSideDrawer>
    </>
  );
}
