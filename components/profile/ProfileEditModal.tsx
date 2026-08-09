import React from 'react';
import { Modal, Form, Row, Col, Input, Button, Typography, FormInstance } from 'antd';
import { EditOutlined, KeyOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ProfileEditModalProps {
  editModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
  form: FormInstance;
  handleUpdateProfile: (values: any) => void;
  roleInfoColor: string;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  editModalOpen,
  setEditModalOpen,
  form,
  handleUpdateProfile,
  roleInfoColor
}) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EditOutlined />
          <span>Edit Profil</span>
        </div>
      }
      open={editModalOpen}
      onCancel={() => setEditModalOpen(false)}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdateProfile}
        style={{ marginTop: 16 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="namaLengkap"
              label="Nama Lengkap"
              rules={[{ required: true, message: 'Nama lengkap wajib diisi!' }]}
            >
              <Input placeholder="Masukkan nama lengkap" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Format email tidak valid!' }]}
            >
              <Input placeholder="Masukkan email" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="noTlp" label="No. Telepon">
              <Input placeholder="Masukkan nomor telepon" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Passcode (Username untuk Login)"
              rules={[{ required: true, message: 'Passcode wajib diisi!' }]}
            >
              <Input 
                placeholder="Masukkan passcode baru"
                prefix={<KeyOutlined style={{ color: roleInfoColor }} />}
                style={{ fontFamily: 'monospace', fontWeight: 'bold' }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="alamat" label="Alamat">
          <Input.TextArea rows={3} placeholder="Masukkan alamat lengkap" />
        </Form.Item>

        <div style={{ 
          padding: 16,
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 8,
          marginBottom: 16
        }}>
          <Text style={{ fontSize: 14, color: '#219ebc' }}>
            <CheckCircleOutlined style={{ marginRight: 8 }} />
            <strong>Passcode Info:</strong> Passcode yang Anda ubah akan menjadi username dan password baru untuk login ke sistem.
          </Text>
        </div>

        <div style={{ textAlign: 'right' }}>
          <Button 
            onClick={() => setEditModalOpen(false)} 
            style={{ marginRight: 8 }}
          >
            Batal
          </Button>
          <Button type="primary" htmlType="submit">
            Simpan Perubahan
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
