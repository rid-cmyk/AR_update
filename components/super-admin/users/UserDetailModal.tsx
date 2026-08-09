import React from 'react';
import { Modal, Descriptions, Tag, Badge, Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { formatPhoneNumberDisplay } from '@/lib/utils/phoneFormatter';
import WebSideDrawer from "@/components/ui/WebSideDrawer";

const { Text } = Typography;

export default function UserDetailModal({ visible, user, santriAssignments, onClose }: any) {
  if (!user) return null;

  const renderContent = () => (
    <>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {user.foto ? (
          <Image src={user.foto} alt={user.namaLengkap} width={120} height={120} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #219ebc' }} />
        ) : (
          <Avatar size={120} icon={<UserOutlined />} style={{ backgroundColor: '#219ebc' }} />
        )}
      </div>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Username">
          <Text strong>@{user.username}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Nama Lengkap">{user.namaLengkap}</Descriptions.Item>
        <Descriptions.Item label="Role">
          <Tag color="blue">{user.role?.name}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Email">{user.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="No. Telepon">{user.noTlp ? formatPhoneNumberDisplay(user.noTlp) : '-'}</Descriptions.Item>
        <Descriptions.Item label="Alamat">{user.alamat || '-'}</Descriptions.Item>
        <Descriptions.Item label="Passcode Login">
          {user.passCode ? (
            <><Badge status="success" /> <Text strong>{user.passCode}</Text></>
          ) : <Badge status="default" text="Belum diset" />}
        </Descriptions.Item>
        {user.role?.name?.toLowerCase() === 'ortu' && (
          <Descriptions.Item label="Anak (Santri)">
            {(() => {
              const ortuAssignments = Object.values(santriAssignments || {}).filter(
                (assignment: any) => assignment.parents.some((p: any) => p.id === user.id)
              );
              if (ortuAssignments.length === 0) return <Text type="secondary">Belum ada anak yang terdaftar</Text>;
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ortuAssignments.map((assignment: any) => (
                    <div key={assignment.santri.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, backgroundColor: '#f6ffed' }}>
                      <Avatar size={32} src={assignment.santri.foto} icon={<UserOutlined />} style={{ backgroundColor: '#219ebc' }} />
                      <div>
                        <Text strong style={{ fontSize: 13 }}>{assignment.santri.namaLengkap}</Text><br />
                        <Text type="secondary" style={{ fontSize: 11 }}>@{assignment.santri.username}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Descriptions.Item>
        )}
      </Descriptions>
    </>
  );

  return (
    <>
      <Modal
        title={`Detail User - ${user.namaLengkap}`}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
        className="lg:hidden"
      >
        {renderContent()}
      </Modal>
      <WebSideDrawer isOpen={visible} onClose={onClose} title={`Detail User - ${user.namaLengkap}`} size="md">
        {renderContent()}
      </WebSideDrawer>
    </>
  );
}