import React, { useState } from 'react';
import { Modal, Upload, Button, message, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Image from 'next/image';
import WebSideDrawer from "@/components/ui/WebSideDrawer";

export default function PhotoModal({ visible, user, onClose, onUpdatePhoto }: any) {
  const [uploadedPhoto, setUploadedPhoto] = useState('');
  
  React.useEffect(() => {
    if (visible && user) {
      setUploadedPhoto(user.foto || '');
    }
  }, [visible, user]);

  const handlePhotoUpload = (info: any) => {
    if (info.file.status === 'done') {
      const photoUrl = info.file.response?.url || `/uploads/users/${info.file.response?.filename}`;
      setUploadedPhoto(photoUrl);
      message.success('Foto berhasil diupload');
    } else if (info.file.status === 'error') {
      message.error('Gagal mengupload foto');
    }
  };

  const handleSave = () => {
    if (user) {
      onUpdatePhoto(user.id, uploadedPhoto);
    }
  };

  const renderContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {uploadedPhoto ? (
        <Image src={uploadedPhoto} alt="Preview" width={200} height={200} style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 8 }} />
      ) : (
        <div style={{ width: 200, height: 200, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
          Belum ada foto
        </div>
      )}
      <Upload
        name="file"
        action="/api/upload"
        showUploadList={false}
        onChange={handlePhotoUpload}
        accept="image/*"
      >
        <Button icon={<UploadOutlined />}>Upload Foto Baru</Button>
      </Upload>
      <div style={{ width: '100%', textAlign: 'right', marginTop: 16 }}>
        <Space>
          <Button onClick={onClose}>Batal</Button>
          <Button type="primary" onClick={handleSave}>Simpan Foto</Button>
        </Space>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        title={`Kelola Foto - ${user?.namaLengkap}`}
        open={visible}
        onCancel={onClose}
        footer={null}
        className="lg:hidden"
      >
        {renderContent()}
      </Modal>
      <WebSideDrawer isOpen={visible} onClose={onClose} title={`Kelola Foto - ${user?.namaLengkap}`} size="sm">
        {renderContent()}
      </WebSideDrawer>
    </>
  );
}