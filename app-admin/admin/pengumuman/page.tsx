"use client";

import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, Card, Space,
  message, Tag, Popconfirm, Input as AntInput, Statistic, Row, Col,
  Avatar, Tooltip, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SearchOutlined, FilterOutlined, UserOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import LayoutApp from '../../components/LayoutApp';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

interface Announcement {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  tanggalKadaluarsa?: string;
  targetAudience: string;
  readCount: number;
  isRead: boolean;
  creator: {
    id: number;
    namaLengkap: string;
    role: { name: string };
  };
}

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalReads: 0
  });

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchText,
        audience: audienceFilter,
        page: '1',
        limit: '100'
      });

      const response = await fetch(`/api/pengumuman?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.data || []);

        // Calculate stats
        const total = data.data?.length || 0;
        const active = data.data?.filter((a: Announcement) =>
          !a.tanggalKadaluarsa || new Date(a.tanggalKadaluarsa) > new Date()
        ).length || 0;
        const expired = total - active;
        const totalReads = data.data?.reduce((sum: number, a: Announcement) => sum + a.readCount, 0) || 0;

        setStats({ total, active, expired, totalReads });
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      message.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [searchText, audienceFilter]);

  // Handle create/edit
  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const data = {
        ...values,
        tanggalKadaluarsa: values.tanggalKadaluarsa ? values.tanggalKadaluarsa.toISOString() : null,
      };

      const url = editingAnnouncement
        ? `/api/pengumuman/${editingAnnouncement.id}`
        : '/api/pengumuman';

      const method = editingAnnouncement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        message.success(`Announcement ${editingAnnouncement ? 'updated' : 'created'} successfully`);
        setModalVisible(false);
        form.resetFields();
        setEditingAnnouncement(null);
        fetchAnnouncements();
      } else {
        const error = await response.json();
        message.error(error.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      message.error('Operation failed');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/pengumuman/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        message.success('Announcement deleted successfully');
        fetchAnnouncements();
      } else {
        message.error('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete announcement');
    }
  };

  // Handle edit
  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    form.setFieldsValue({
      judul: announcement.judul,
      isi: announcement.isi,
      targetAudience: announcement.targetAudience,
      tanggalKadaluarsa: announcement.tanggalKadaluarsa ? dayjs(announcement.tanggalKadaluarsa) : null,
    });
    setModalVisible(true);
  };

  const columns: ColumnsType<Announcement> = [
    {
      title: 'Title',
      dataIndex: 'judul',
      key: 'judul',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
            {record.isi.length > 100 ? `${record.isi.substring(0, 100)}...` : record.isi}
          </div>
        </div>
      ),
    },
    {
      title: 'Audience',
      dataIndex: 'targetAudience',
      key: 'targetAudience',
      render: (audience) => {
        const colors = {
          semua: 'blue',
          guru: 'green',
          santri: 'orange',
          admin: 'purple'
        };
        return <Tag color={colors[audience as keyof typeof colors] || 'default'}>{audience}</Tag>;
      },
    },
    {
      title: 'Stats',
      key: 'stats',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Badge count={record.readCount} showZero>
            <EyeOutlined style={{ color: '#1890ff' }} />
          </Badge>
          {record.isRead && <Tag color="green">Read</Tag>}
        </Space>
      ),
    },
    {
      title: 'Expiry',
      dataIndex: 'tanggalKadaluarsa',
      key: 'tanggalKadaluarsa',
      render: (date) => {
        if (!date) return <Tag color="blue">No expiry</Tag>;
        const expiryDate = new Date(date);
        const now = new Date();
        const isExpired = expiryDate < now;

        return (
          <Tooltip title={dayjs(date).format('DD MMM YYYY HH:mm')}>
            <Tag color={isExpired ? 'red' : 'green'}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {isExpired ? 'Expired' : dayjs(date).fromNow()}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Created By',
      dataIndex: 'creator',
      key: 'creator',
      render: (creator) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontSize: '12px' }}>{creator.namaLengkap}</div>
            <Tag color="blue">{creator.role.name}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'tanggal',
      key: 'tanggal',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Delete announcement?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1>Announcement Management</h1>
          <p>Manage system announcements with advanced features</p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic title="Total Announcements" value={stats.total} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic title="Active" value={stats.active} valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic title="Expired" value={stats.expired} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic title="Total Reads" value={stats.totalReads} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Card style={{ marginBottom: 24 }}>
          <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space wrap>
              <AntInput
                placeholder="Search announcements..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />
              <Select
                value={audienceFilter}
                onChange={setAudienceFilter}
                style={{ width: 120 }}
                suffixIcon={<FilterOutlined />}
              >
                <Select.Option value="all">All Audience</Select.Option>
                <Select.Option value="semua">Semua</Select.Option>
                <Select.Option value="guru">Guru</Select.Option>
                <Select.Option value="santri">Santri</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingAnnouncement(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Add Announcement
            </Button>
          </Space>
        </Card>

        {/* Announcements Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={announcements}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} announcements`
            }}
          />
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingAnnouncement(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="judul"
              label="Title"
              rules={[{ required: true, message: 'Please enter title' }]}
            >
              <Input placeholder="Announcement title" />
            </Form.Item>

            <Form.Item
              name="isi"
              label="Content"
              rules={[{ required: true, message: 'Please enter content' }]}
            >
              <TextArea
                placeholder="Announcement content"
                rows={4}
              />
            </Form.Item>

            <Form.Item
              name="targetAudience"
              label="Target Audience"
              initialValue="semua"
            >
              <Select>
                <Select.Option value="semua">All Users</Select.Option>
                <Select.Option value="guru">Guru Only</Select.Option>
                <Select.Option value="santri">Santri Only</Select.Option>
                <Select.Option value="admin">Admin Only</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="tanggalKadaluarsa"
              label="Expiry Date (Optional)"
            >
              <DatePicker
                showTime
                placeholder="Select expiry date"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setModalVisible(false);
                  setEditingAnnouncement(null);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingAnnouncement ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </LayoutApp>
  );
}