"use client";

import { useState, useEffect } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Typography,
    Avatar,
    Badge,
    Popconfirm,
    message,
    Row,
    Col,
    Statistic,
    Empty
} from "antd";
import {
    BellOutlined,
    PhoneOutlined,
    UserOutlined,
    EyeOutlined,
    CheckOutlined,
    QuestionCircleOutlined,
    ReloadOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PageHeader from "@/components/layout/PageHeader";

const { Text } = Typography;

interface ForgotPasscodeNotification {
    id: number;
    phoneNumber: string;
    message?: string;
    isRead: boolean;
    isRegistered: boolean;
    userId?: number;
    createdAt: string;
    readAt?: string;
    user?: {
        id: number;
        namaLengkap: string;
        username: string;
        foto?: string;
    };
}

export default function ForgotPasscodeNotificationsPage() {
    const [notifications, setNotifications] = useState<ForgotPasscodeNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        registered: 0,
        unregistered: 0
    });

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/notifications/forgot-passcode');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch notifications');
            }
            
            const data = await response.json();

            // Ensure data is an array
            if (Array.isArray(data)) {
                setNotifications(data);

                // Calculate stats
                const total = data.length;
                const unread = data.filter((n: ForgotPasscodeNotification) => !n.isRead).length;
                const registered = data.filter((n: ForgotPasscodeNotification) => n.isRegistered).length;
                const unregistered = total - registered;

                setStats({ total, unread, registered, unregistered });
            } else {
                console.warn('Invalid data format received:', data);
                setNotifications([]);
                setStats({ total: 0, unread: 0, registered: 0, unregistered: 0 });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            message.error('Gagal memuat notifikasi: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setNotifications([]);
            setStats({ total: 0, unread: 0, registered: 0, unregistered: 0 });
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: number) => {
        try {
            const response = await fetch(`/api/notifications/forgot-passcode/${notificationId}/read`, {
                method: 'PUT'
            });

            if (!response.ok) throw new Error('Failed to mark as read');

            message.success('Notifikasi ditandai sebagai dibaca');
            fetchNotifications(); // Refresh data
        } catch (error) {
            console.error('Error marking as read:', error);
            message.error('Gagal menandai sebagai dibaca');
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/forgot-passcode/mark-all-read', {
                method: 'PUT'
            });

            if (!response.ok) throw new Error('Failed to mark all as read');

            message.success('Semua notifikasi ditandai sebagai dibaca');
            fetchNotifications(); // Refresh data
        } catch (error) {
            console.error('Error marking all as read:', error);
            message.error('Gagal menandai semua sebagai dibaca');
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId: number) => {
        try {
            const response = await fetch(`/api/notifications/forgot-passcode/${notificationId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete notification');

            message.success('Notifikasi berhasil dihapus');
            fetchNotifications(); // Refresh data
        } catch (error) {
            console.error('Error deleting notification:', error);
            message.error('Gagal menghapus notifikasi');
        }
    };

    // Bulk mark as read
    const bulkMarkAsRead = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Pilih notifikasi yang ingin ditandai sebagai dibaca');
            return;
        }

        try {
            setBulkLoading(true);
            const promises = selectedRowKeys.map(id =>
                fetch(`/api/notifications/forgot-passcode/${Number(id)}/read`, { method: 'PUT' })
            );

            await Promise.all(promises);

            message.success(`${selectedRowKeys.length} notifikasi ditandai sebagai dibaca`);
            setSelectedRowKeys([]);
            fetchNotifications();
        } catch (error) {
            console.error('Error bulk marking as read:', error);
            message.error('Gagal menandai notifikasi sebagai dibaca');
        } finally {
            setBulkLoading(false);
        }
    };

    // Bulk delete read notifications
    const bulkDeleteRead = async () => {
        const readNotifications = notifications.filter(n => n.isRead);
        if (readNotifications.length === 0) {
            message.warning('Tidak ada notifikasi yang sudah dibaca untuk dihapus');
            return;
        }

        try {
            setBulkLoading(true);
            const promises = readNotifications.map(n =>
                fetch(`/api/notifications/forgot-passcode/${n.id}`, { method: 'DELETE' })
            );

            await Promise.all(promises);

            message.success(`${readNotifications.length} notifikasi yang sudah dibaca berhasil dihapus`);
            setSelectedRowKeys([]);
            fetchNotifications();
        } catch (error) {
            console.error('Error bulk deleting read notifications:', error);
            message.error('Gagal menghapus notifikasi yang sudah dibaca');
        } finally {
            setBulkLoading(false);
        }
    };

    // Bulk delete selected
    const bulkDeleteSelected = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Pilih notifikasi yang ingin dihapus');
            return;
        }

        try {
            setBulkLoading(true);
            const promises = selectedRowKeys.map(id =>
                fetch(`/api/notifications/forgot-passcode/${Number(id)}`, { method: 'DELETE' })
            );

            await Promise.all(promises);

            message.success(`${selectedRowKeys.length} notifikasi berhasil dihapus`);
            setSelectedRowKeys([]);
            fetchNotifications();
        } catch (error) {
            console.error('Error bulk deleting selected notifications:', error);
            message.error('Gagal menghapus notifikasi yang dipilih');
        } finally {
            setBulkLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const columns = [
        {
            title: 'Status',
            key: 'status',
            width: 80,
            render: (record: ForgotPasscodeNotification) => (
                <div style={{ textAlign: 'center' }}>
                    {record.isRead ? (
                        <CheckOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                    ) : (
                        <Badge status="processing" />
                    )}
                </div>
            ),
        },
        {
            title: 'Pengguna',
            key: 'user',
            render: (record: ForgotPasscodeNotification) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar
                        size={40}
                        src={record.user?.foto}
                        icon={record.isRegistered ? <UserOutlined /> : <QuestionCircleOutlined />}
                        style={{
                            backgroundColor: record.isRegistered ? '#1890ff' : '#fa8c16'
                        }}
                    />
                    <div>
                        <Text strong>
                            {record.isRegistered && record.user
                                ? record.user.namaLengkap
                                : 'Orang Tidak Dikenali'
                            }
                        </Text>
                        <br />
                        {record.isRegistered && record.user && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                @{record.user.username}
                            </Text>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Nomor Telepon',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (phoneNumber: string) => (
                <Space>
                    <PhoneOutlined style={{ color: '#1890ff' }} />
                    <Text>{phoneNumber}</Text>
                </Space>
            ),
        },
        {
            title: 'Status Registrasi',
            key: 'registration',
            render: (record: ForgotPasscodeNotification) => (
                <Tag color={record.isRegistered ? 'green' : 'orange'}>
                    {record.isRegistered ? 'Terdaftar' : 'Tidak Terdaftar'}
                </Tag>
            ),
        },
        {
            title: 'Waktu Permintaan',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt: string) => (
                <div>
                    <Text>{new Date(createdAt).toLocaleDateString('id-ID')}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(createdAt).toLocaleTimeString('id-ID')}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Aksi',
            key: 'actions',
            render: (record: ForgotPasscodeNotification) => (
                <Space>
                    {!record.isRead && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => markAsRead(record.id)}
                        >
                            Tandai Dibaca
                        </Button>
                    )}
                    <Popconfirm
                        title="Hapus Notifikasi"
                        description="Yakin ingin menghapus notifikasi ini?"
                        onConfirm={() => deleteNotification(record.id)}
                        okText="Ya"
                        cancelText="Tidak"
                    >
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <LayoutApp>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <PageHeader
                    title="Notifikasi Forgot Passcode"
                    subtitle="Kelola permintaan reset passcode dari pengguna"
                    breadcrumbs={[
                        { title: "Super Admin Dashboard", href: "/super-admin/dashboard" },
                        { title: "Notifikasi Forgot Passcode" }
                    ]}
                    extra={
                        <Space wrap>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchNotifications}
                                loading={loading}
                            >
                                Refresh
                            </Button>
                            {stats.unread > 0 && (
                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={markAllAsRead}
                                >
                                    Tandai Semua Dibaca ({stats.unread})
                                </Button>
                            )}
                            {selectedRowKeys.length > 0 && (
                                <>
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={bulkMarkAsRead}
                                        loading={bulkLoading}
                                    >
                                        Tandai Dibaca ({selectedRowKeys.length})
                                    </Button>
                                    <Popconfirm
                                        title="Hapus Notifikasi Terpilih"
                                        description={`Yakin ingin menghapus ${selectedRowKeys.length} notifikasi yang dipilih?`}
                                        onConfirm={bulkDeleteSelected}
                                        okText="Ya"
                                        cancelText="Tidak"
                                    >
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            loading={bulkLoading}
                                        >
                                            Hapus Terpilih ({selectedRowKeys.length})
                                        </Button>
                                    </Popconfirm>
                                </>
                            )}
                            {notifications.filter(n => n.isRead).length > 0 && (
                                <Popconfirm
                                    title="Hapus Semua yang Sudah Dibaca"
                                    description={`Yakin ingin menghapus ${notifications.filter(n => n.isRead).length} notifikasi yang sudah dibaca?`}
                                    onConfirm={bulkDeleteRead}
                                    okText="Ya"
                                    cancelText="Tidak"
                                >
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        loading={bulkLoading}
                                    >
                                        Hapus yang Sudah Dibaca
                                    </Button>
                                </Popconfirm>
                            )}
                        </Space>
                    }
                />

                {/* Statistics Cards */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={6}>
                        <Card>
                            <Statistic
                                title="Total Permintaan"
                                value={stats.total}
                                prefix={<BellOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card>
                            <Statistic
                                title="Belum Dibaca"
                                value={stats.unread}
                                prefix={<EyeOutlined />}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card>
                            <Statistic
                                title="User Terdaftar"
                                value={stats.registered}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Card>
                            <Statistic
                                title="Tidak Dikenali"
                                value={stats.unregistered}
                                prefix={<QuestionCircleOutlined />}
                                valueStyle={{ color: '#f5222d' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Notifications Table */}
                <Card title="Daftar Permintaan Reset Passcode">
                    {notifications.length === 0 && !loading ? (
                        <Empty
                            description="Belum ada permintaan reset passcode"
                            style={{ padding: '60px 0' }}
                        />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={notifications}
                            rowKey="id"
                            loading={loading}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: setSelectedRowKeys,
                                getCheckboxProps: (record) => ({
                                    name: record.phoneNumber,
                                }),
                            }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `Total ${total} notifikasi`,
                            }}
                            rowClassName={(record) =>
                                record.isRead ? '' : 'ant-table-row-unread'
                            }
                        />
                    )}
                </Card>
            </div>

            <style jsx global>{`
        .ant-table-row-unread {
          background-color: #f6ffed !important;
        }
        .ant-table-row-unread:hover {
          background-color: #f6ffed !important;
        }
      `}</style>
        </LayoutApp>
    );
}