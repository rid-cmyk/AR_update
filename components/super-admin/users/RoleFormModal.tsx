import React from 'react';
import { Form, Input, Button, Space, Typography, Modal } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import WebSideDrawer from '@/components/ui/WebSideDrawer';

const { Text } = Typography;

export default function RoleFormModal({ 
  visible, 
  editingRole, 
  onClose, 
  onSubmit, 
  form 
}: any) {
  const renderContent = () => (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item name="name" label="Nama Role" rules={[
        { required: true, message: 'Nama role harus diisi' },
        { min: 3, message: 'Nama role minimal 3 karakter' },
      ]}>
        <Input placeholder="Contoh: koordinator, pengawas, dll" />
      </Form.Item>
      {!editingRole && (
        <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: 12, marginBottom: 16 }}>
          <Text type="secondary">
            <SettingOutlined style={{ color: '#219ebc', marginRight: 8 }} />
            Role baru akan otomatis mendapat hak akses dasar (dashboard, profil, pengumuman)
          </Text>
        </div>
      )}
      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose}>Batal</Button>
          <Button type="primary" htmlType="submit">{editingRole ? 'Update' : 'Simpan'}</Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <>
      <Modal title={editingRole ? 'Edit Role' : 'Tambah Role Baru'} open={visible} onCancel={onClose} footer={null} className="lg:hidden">
        {renderContent()}
      </Modal>
      <WebSideDrawer isOpen={visible} onClose={onClose} title={editingRole ? 'Edit Role Pengguna' : 'Tambah Role Baru'} subtitle="Daftarkan nama role kustom dan tetapkan tingkat akses dalam sistem" size="sm">
        {renderContent()}
      </WebSideDrawer>
    </>
  );
}