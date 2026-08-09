import React from 'react';
import { Table, Space, Typography, Button, Popconfirm, Tag } from 'antd';
import { UserSwitchOutlined, TeamOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function RoleTable({ roles, loading, onEdit, onDelete }: any) {
  const columns = [
    {
      title: 'Nama Role',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <UserSwitchOutlined style={{ color: '#219ebc' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Jumlah User',
      dataIndex: ['_count', 'users'],
      key: 'userCount',
      render: (count: number) => (
        <Tag color="blue" icon={<TeamOutlined />}>
          {count || 0} user
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button type="default" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Hapus Role" description={`Yakin ingin menghapus role "${record.name}"?`} onConfirm={() => onDelete(record)} okText="Ya" cancelText="Tidak">
            <Button danger size="small" icon={<DeleteOutlined />}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={roles} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total: number) => `Total ${total} role` }} />;
}