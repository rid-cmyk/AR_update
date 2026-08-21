import React from "react";
import { Modal, Form, Select, Switch, Typography, Row, Col, Button, Space } from "antd";
import { KeyOutlined } from "@ant-design/icons";
import WebSideDrawer from "@/components/ui/WebSideDrawer";
import type { FormInstance } from "antd";

interface Guru {
  id: number;
  namaLengkap: string;
  username: string;
}

interface Halaqah {
  id: number;
  namaHalaqah: string;
  guru?: {
    namaLengkap: string;
  };
}

interface GuruPermissionsFormModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  form: FormInstance;
  handleSave: () => void;
  editingPermission: any;
  gurus: Guru[];
  halaqahs: Halaqah[];
}

export default function GuruPermissionsFormModal({
  isModalOpen,
  setIsModalOpen,
  form,
  handleSave,
  editingPermission,
  gurus,
  halaqahs,
}: GuruPermissionsFormModalProps) {
  const renderPermissionFormContent = () => (
    <Form form={form} layout="vertical" size="large">
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label="Guru"
          name="guruId"
          rules={[{ required: true, message: "Please select guru" }]}
        >
          <Select 
            placeholder="Select guru"
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {gurus.map((guru) => (
              <Select.Option key={guru.id} value={guru.id}>
                {guru.namaLengkap} (@{guru.username})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label="Halaqah"
          name="halaqahId"
          rules={[{ required: true, message: "Please select halaqah" }]}
        >
          <Select 
            placeholder="Select halaqah"
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {halaqahs.map((halaqah) => (
              <Select.Option key={halaqah.id} value={halaqah.id}>
                <div>
                  <div>{halaqah.namaHalaqah}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Guru: {halaqah.guru?.namaLengkap || '-'}
                  </div>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
    </Row>

    <div style={{ 
      padding: '16px', 
      background: '#f6ffed', 
      border: '1px solid #b7eb8f', 
      borderRadius: '6px',
      marginBottom: '16px'
    }}>
      <Typography.Text strong style={{ color: '#219ebc' }}>
        🔑 Permissions
      </Typography.Text>
      <br />
      <Typography.Text style={{ fontSize: '12px' }}>
        Pilih akses yang akan diberikan kepada guru untuk halaqah ini
      </Typography.Text>

      <Row gutter={16} style={{ marginTop: '12px' }}>
        <Col span={8}>
          <Form.Item
            label="Absensi"
            name="canAbsensi"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="✅" 
              unCheckedChildren="❌"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Hafalan"
            name="canHafalan"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="✅" 
              unCheckedChildren="❌"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Target"
            name="canTarget"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="✅" 
              unCheckedChildren="❌"
            />
          </Form.Item>
        </Col>
      </Row>
    </div>

    <Form.Item
      label="Status"
      name="isActive"
      valuePropName="checked"
    >
      <Switch 
        checkedChildren="🟢 Aktif" 
        unCheckedChildren="🔴 Nonaktif"
      />
    </Form.Item>
  </Form>
  );

  return (
    <>
      {/* Mobile Modal (< 1024px) */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            {editingPermission ? "Edit Permission" : "Add New Permission"}
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Save"
        width={600}
        className="lg:hidden"
      >
        {renderPermissionFormContent()}
      </Modal>

      {/* Desktop WebSideDrawer (>= 1024px) */}
      <WebSideDrawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPermission ? "Edit Hak Akses Guru" : "Tambah Hak Akses Guru"}
        subtitle="Atur izin absensi, setoran hafalan, dan target KKM guru untuk halaqah tertentu"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="primary" onClick={handleSave}>Simpan</Button>
          </div>
        }
      >
        {renderPermissionFormContent()}
      </WebSideDrawer>
    </>
  );
}
