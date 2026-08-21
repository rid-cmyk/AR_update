import React from 'react';
import { Table, Space, Typography, Button, Popconfirm, Tag, Avatar, Badge, Tooltip, Modal } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, CameraOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { formatPhoneNumberDisplay } from '@/lib/utils/phoneFormatter';

const { Text } = Typography;

export default function UserTable({ users, loading, santriAssignments, onViewDetail, onEdit, onManagePhoto, onDelete }: any) {
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={50} src={record.foto} icon={<UserOutlined />} style={{ backgroundColor: '#219ebc', border: '2px solid #f0f0f0', cursor: record.foto ? 'pointer' : 'default' }} onClick={() => {
            if (record.foto) {
              Modal.info({
                title: `Foto ${record.namaLengkap}`,
                content: (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Image src={record.foto || '/default-avatar.png'} alt={record.namaLengkap || 'Avatar'} width={400} height={400} style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', objectFit: 'contain' }} />
                  </div>
                ),
                width: 500,
                okText: 'Tutup'
              });
            }
          }} />
          <div>
            <Text strong>{record.namaLengkap}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>@{record.username}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: ['role', 'name'],
      key: 'role',
      render: (roleName: string) => {
        const roleColors: any = { 'super_admin': 'red', 'yayasan': 'purple', 'guru': 'blue', 'santri': 'green', 'ortu': 'cyan' };
        return <Tag color={roleColors[roleName?.toLowerCase()] || 'default'}>{roleName}</Tag>;
      },
    },
    {
      title: 'Anak (Santri)',
      key: 'children',
      render: (record: any) => {
        if (record.role?.name?.toLowerCase() !== 'ortu') return <Text type="secondary">-</Text>;
        const ortuAssignments = Object.values(santriAssignments || {}).filter((assignment: any) => assignment.parents.some((p: any) => p.id === record.id));
        if (ortuAssignments.length === 0) return <Text type="secondary" style={{ fontSize: 12 }}>Belum ada anak</Text>;
        return (
          <div style={{ textAlign: 'center' }}>
            <Badge count={ortuAssignments.length} style={{ backgroundColor: '#219ebc' }} title={`Total ${ortuAssignments.length} anak`} />
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{ortuAssignments.length} anak</div>
          </div>
        );
      },
    },
    {
      title: 'No. Telepon',
      key: 'phone',
      render: (record: any) => (
        <div>{record.noTlp ? <Text style={{ fontSize: 12 }}>{formatPhoneNumberDisplay(record.noTlp)}</Text> : <Text type="secondary" style={{ fontSize: 12 }}>Belum diset</Text>}</div>
      ),
    },
    {
      title: 'Passcode Login',
      key: 'passcode',
      render: (record: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {record.passCode ? (
              <><Badge status="success" /><Text strong style={{ fontFamily: 'monospace', fontSize: 14 }}>{record.passCode}</Text></>
            ) : <Badge status="default" text="Belum diset" />}
          </div>
          {record.passCode && <Text type="secondary" style={{ fontSize: 11 }}>Login: {record.passCode}</Text>}
        </div>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (record: any) => (
        <Space wrap>
          <Tooltip title="Lihat Detail">
            <Button type="default" size="small" icon={<InfoCircleOutlined />} onClick={() => onViewDetail(record)} />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button type="default" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          </Tooltip>
          {record.role?.name?.toLowerCase() === 'santri' && (
            <Tooltip title="Kelola Foto">
              <Button type="default" size="small" icon={<CameraOutlined />} onClick={() => onManagePhoto(record)} />
            </Tooltip>
          )}
          <Popconfirm title="Hapus User" description={`Yakin ingin menghapus user "${record.namaLengkap}"?`} onConfirm={() => onDelete(record)} okText="Ya" cancelText="Tidak">
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={users} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t: number) => `Total ${t} user` }} />;
}