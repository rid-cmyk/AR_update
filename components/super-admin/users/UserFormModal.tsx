import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, Row, Col, Modal } from 'antd';
import WebSideDrawer from '@/components/ui/WebSideDrawer';
import PhoneNumberInput from '@/components/common/PhoneNumberInput';

const { Option } = Select;

export default function UserFormModal({
  visible, editingUser, onClose, onSubmit, form, roles, santriList, usedSantriIds, checkPasscodeUnique
}: any) {
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);
  const [passcodeValidation, setPasscodeValidation] = useState({ isValid: false, message: '', isChecking: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && editingUser) {
      if (editingUser.passCode) {
        setPasscodeValidation({ isValid: true, message: 'Passcode saat ini valid', isChecking: false });
      }
      form.setFieldsValue({ ...editingUser, roleId: editingUser.role?.id });
    } else if (visible) {
      form.resetFields();
      setSelectedChildren([]);
      setPasscodeValidation({ isValid: false, message: '', isChecking: false });
    }
  }, [visible, editingUser, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await onSubmit(values, selectedChildren);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    const selectedRoleId = Form.useWatch('roleId', form);
    const selectedRole = roles.find((r: any) => r.id === selectedRoleId);
    
    return (
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="username" label="Username" rules={[{ required: true }, { min: 3 }]}>
              <Input placeholder="Username" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="namaLengkap" label="Nama Lengkap" rules={[{ required: true }]}>
              <Input placeholder="Nama Lengkap" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
              <Input placeholder="Email" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="noTlp" label="No. Telepon">
              <PhoneNumberInput placeholder="Nomor Telepon" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
          <Select placeholder="Pilih Role">
            {roles.map((r: any) => <Option key={r.id} value={r.id}>{r.name}</Option>)}
          </Select>
        </Form.Item>
        
        {selectedRole?.name?.toLowerCase() === 'ortu' && (
          <Form.Item label="Pilih Anak (Santri)">
            <Select mode="multiple" value={selectedChildren} onChange={setSelectedChildren}>
              {santriList.map((s: any) => {
                const isUsed = usedSantriIds.includes(s.id) && !selectedChildren.includes(s.id);
                return <Option key={s.id} value={s.id} disabled={isUsed}>{s.namaLengkap} - @{s.username}</Option>;
              })}
            </Select>
          </Form.Item>
        )}

        <Form.Item name="passCode" label="Passcode (6-10 karakter)" rules={[
          { required: true }, { min: 6 }, { max: 10 }, { pattern: /^[a-zA-Z0-9]+$/ }
        ]}>
          <Input maxLength={10} onChange={async (e) => {
            const v = e.target.value;
            if (!v) { setPasscodeValidation({ isValid: false, message: '', isChecking: false }); return; }
            if (editingUser && v === editingUser.passCode) { setPasscodeValidation({ isValid: true, message: 'Valid', isChecking: false }); return; }
            if (v.length < 6 || !/^[a-zA-Z0-9]+$/.test(v)) { setPasscodeValidation({ isValid: false, message: 'Invalid', isChecking: false }); return; }
            
            setPasscodeValidation({ isValid: false, message: 'Checking...', isChecking: true });
            const res = await checkPasscodeUnique(v, editingUser?.id);
            if (res && res.exists) {
              setPasscodeValidation({ isValid: false, message: 'Passcode sudah digunakan', isChecking: false });
            } else {
              setPasscodeValidation({ isValid: true, message: 'Valid', isChecking: false });
            }
          }} />
        </Form.Item>
        <Form.Item name="alamat" label="Alamat">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>Batal</Button>
            <Button type="primary" htmlType="submit" loading={loading} disabled={passcodeValidation.isChecking || (!passcodeValidation.isValid && form.getFieldValue('passCode')?.length > 0)}>
              {editingUser ? 'Update' : 'Simpan'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };

  return (
    <>
      <Modal title={editingUser ? 'Edit User' : 'Tambah User'} open={visible} onCancel={onClose} footer={null} className="lg:hidden">
        {renderContent()}
      </Modal>
      <WebSideDrawer isOpen={visible} onClose={onClose} title={editingUser ? 'Edit User' : 'Tambah User'} size="md">
        {renderContent()}
      </WebSideDrawer>
    </>
  );
}