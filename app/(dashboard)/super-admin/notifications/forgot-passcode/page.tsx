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
    Popconfirm,
    message,
    Row,
    Col,
    Statistic,
    Modal,
    Descriptions,
    Tooltip
} from "antd";
import {
    BellOutlined,
    PhoneOutlined,
    UserOutlined,
    EyeOutlined,
    CheckOutlined,
    QuestionCircleOutlined,
    DeleteOutlined,
    InfoCircleOutlined,
    WhatsAppOutlined,
    SettingOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PageHeader from "@/components/layout/PageHeader";
import { formatPhoneNumberDisplay, formatPhoneNumberForWhatsApp } from "@/lib/utils/phoneFormatter";
import AdminSettingsModal from "@/components/super-admin/AdminSettingsModal";

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
        passCode?: string;
    };
}

interface AdminSettings {
    id: number;
    whatsappNumber: string;
    whatsappMessageHelp: string;
    whatsappMessageRegistered: string;
    whatsappMessageUnregistered: string;
}

export default function ForgotPasscodeNotificationsPage() {
    const [notifications, setNotifications] = useState<ForgotPasscodeNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        registered: 0,
        unregistered: 0
    });
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<ForgotPasscodeNotification | null>(null);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
    const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);

    // Fetch admin settings
    const fetchAdminSettings = async () => {
        try {
            const response = await fetch('/api/admin-settings');
            if (response.ok) {
                const data = await response.json();
                setAdminSettings(data);
            }
        } catch (error) {
            console.error('Error fetching admin settings:', error);
        }
    };

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

            if (Array.isArray(data)) {
                setNotifications(data);

                const total = data.length;
                const unread = data.filter((n: ForgotPasscodeNotification) => !n.isRead).length;
                const registered = data.filter((n: ForgotPasscodeNotification) => n.isRegistered).length;
                const unregistered = total - registered;

                setStats({ total, unread, registered, unregistered });
            } else {
                setNotifications([]);
                setStats({ total: 0, unread: 0, registered: 0, unregistered: 0 });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            message.error('Gagal memuat notifikasi');
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
            fetchNotifications();
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
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
            message.error('Gagal menandai semua sebagai dibaca');
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId: number) => {
        try {
            setDeleteLoading(notificationId);
            const response = await fetch(`/api/notifications/forgot-passcode/${notificationId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete notification');
            }

            message.success('Notifikasi berhasil dihapus');
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            message.error('Gagal menghapus notifikasi');
        } finally {
            setDeleteLoading(null);
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
            setDeleteLoading(-1);
            const promises = readNotifications.map(n =>
                fetch(`/api/notifications/forgot-passcode/${n.id}`, { method: 'DELETE' })
            );

            const results = await Promise.allSettled(promises);
            const successCount = results.filter(result => result.status === 'fulfilled').length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                message.success(`${successCount} notifikasi berhasil dihapus`);
            }
            if (failCount > 0) {
                message.warning(`${failCount} notifikasi gagal dihapus`);
            }

            fetchNotifications();
        } catch (error) {
            console.error('Error bulk deleting:', error);
            message.error('Gagal menghapus notifikasi');
        } finally {
            setDeleteLoading(null);
        }
    };

    // Open detail modal
    const handleViewDetail = (notification: ForgotPasscodeNotification) => {
        setSelectedNotification(notification);
        setDetailModalVisible(true);
    };

    // Sync notifications (silent - no notification)
    const syncNotifications = async () => {
        try {
            const response = await fetch('/api/notifications/forgot-passcode/sync', {
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                // Silent sync - hanya refresh data jika ada perubahan
                if (data.syncedCount > 0) {
                    fetchNotifications();
                }
            }
        } catch (error) {
            // Silent error - tidak tampilkan notifikasi
            console.error('Error syncing notifications:', error);
        }
    };

    // Handle WhatsApp message with template
    const handleWhatsAppMessage = (notification: ForgotPasscodeNotification) => {
        if (!adminSettings) {
            message.error('Pengaturan admin belum dimuat');
            return;
        }

        let whatsappMessage = "";

        if (notification.isRegistered && notification.user) {
            // Use template for registered user
            const tanggalPermintaan = new Date(notification.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            whatsappMessage = adminSettings.whatsappMessageRegistered
                .replace('{tanggal}', tanggalPermintaan)
                .replace('{nama}', notification.user.namaLengkap)
                .replace('{passcode}', notification.user.passCode || '[Passcode belum diset]');
        } else {
            // Use template for unregistered user
            whatsappMessage = adminSettings.whatsappMessageUnregistered
                .replace('{nomor}', notification.phoneNumber);
        }

        const whatsappNumber = formatPhoneNumberForWhatsApp(notification.phoneNumber);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        window.open(whatsappUrl, '_blank');
        message.success('Pesan WhatsApp telah disiapkan');
    };

    useEffect(() => {
        fetchNotifications();
        fetchAdminSettings();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 15000);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchNotifications();
                syncNotifications();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const columns = [
        {
            title: 'Pengguna',
            key: 'user',
            render: (record: ForgotPasscodeNotification) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar
                        size={40}
                        src={record.isRegistered && record.user?.foto ? record.user.foto : undefined}
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
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <PhoneOutlined style={{ marginRight: 4 }} />
                            {formatPhoneNumberDisplay(record.phoneNumber)}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (record: ForgotPasscodeNotification) => (
                <Space direction="vertical" size="small">
                    {record.isRead ? (
                        <Tag color="green">✓ Dibaca</Tag>
                    ) : (
                        <Tag color="orange">● Baru</Tag>
                    )}
                    <Tag color={record.isRegistered ? 'blue' : 'red'}>
                        {record.isRegistered ? 'Terdaftar' : 'Tidak Terdaftar'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Waktu',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt: string) => (
                <div>
                    <Text style={{ fontSize: 12, display: 'block' }}>
                        {new Date(createdAt).toLocaleDateString('id-ID')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Aksi',
            key: 'actions',
            render: (record: ForgotPasscodeNotification) => (
                <Space wrap>
                    <Tooltip title="Kirim WhatsApp">
                        <Button
                            type="default"
                            size="small"
                            icon={<WhatsAppOutlined />}
                            style={{
                                color: '#25D366',
                                borderColor: '#25D366'
                            }}
                            onClick={() => handleWhatsAppMessage(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Lihat Detail">
                        <Button
                            type="default"
                            size="small"
                            icon={<InfoCircleOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    {!record.isRead && (
                        <Tooltip title="Tandai Dibaca">
                            <Button
                                type="primary"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => markAsRead(record.id)}
                            />
                        </Tooltip>
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
                            loading={deleteLoading === record.id}
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
                        <Button
                            icon={<SettingOutlined />}
                            onClick={() => setSettingsModalVisible(true)}
                            type="default"
                        >
                            Pengaturan
                        </Button>
                    }
                />

                {/* Action Buttons */}
                <Card size="small" style={{ background: '#fafafa', border: '1px solid #e8e8e8' }}>
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24}>
                            <Space wrap size="middle">
                                <Text strong style={{ color: '#666' }}>
                                    Aksi Cepat:
                                </Text>
                                {stats.unread > 0 && (
                                    <Button
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        onClick={markAllAsRead}
                                    >
                                        Tandai Semua Dibaca ({stats.unread})
                                    </Button>
                                )}
                                {notifications.filter(n => n.isRead).length > 0 && (
                                    <Popconfirm
                                        title="Hapus Semua yang Sudah Dibaca"
                                        description={`Yakin ingin menghapus ${notifications.filter(n => n.isRead).length} notifikasi?`}
                                        onConfirm={bulkDeleteRead}
                                        okText="Ya"
                                        cancelText="Batal"
                                    >
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            loading={deleteLoading === -1}
                                        >
                                            Bersihkan yang Sudah Dibaca
                                        </Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Statistics */}
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

                {/* Table */}
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <BellOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                            <span>Daftar Permintaan Reset Passcode</span>
                        </div>
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={notifications}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 15,
                            showSizeChanger: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} dari ${total} notifikasi`,
                        }}
                        rowClassName={(record) =>
                            record.isRead ? 'ant-table-row-read' : 'ant-table-row-unread'
                        }
                    />
                </Card>
            </div>

            {/* Settings Modal */}
            <AdminSettingsModal
                visible={settingsModalVisible}
                onClose={() => setSettingsModalVisible(false)}
                onSuccess={() => {
                    fetchAdminSettings();
                    message.success('Pengaturan berhasil diperbarui');
                }}
            />

            {/* Detail Modal */}
            <Modal
                title="Detail Notifikasi"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedNotification(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Tutup
                    </Button>
                ]}
                width={600}
            >
                {selectedNotification && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Avatar
                                size={100}
                                src={selectedNotification.user?.foto}
                                icon={selectedNotification.isRegistered ? <UserOutlined /> : <QuestionCircleOutlined />}
                                style={{
                                    backgroundColor: selectedNotification.isRegistered ? '#1890ff' : '#fa8c16'
                                }}
                            />
                        </div>

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Status Baca">
                                {selectedNotification.isRead ? (
                                    <Tag color="green">✓ Sudah Dibaca</Tag>
                                ) : (
                                    <Tag color="orange">● Belum Dibaca</Tag>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nomor Telepon">
                                {formatPhoneNumberDisplay(selectedNotification.phoneNumber)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status Registrasi">
                                <Tag color={selectedNotification.isRegistered ? 'blue' : 'red'}>
                                    {selectedNotification.isRegistered ? 'Terdaftar' : 'Tidak Terdaftar'}
                                </Tag>
                            </Descriptions.Item>
                            {selectedNotification.user && (
                                <>
                                    <Descriptions.Item label="Nama">
                                        {selectedNotification.user.namaLengkap}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Username">
                                        @{selectedNotification.user.username}
                                    </Descriptions.Item>
                                </>
                            )}
                            <Descriptions.Item label="Pesan">
                                {selectedNotification.message || 'Tidak ada pesan'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Waktu Permintaan">
                                {new Date(selectedNotification.createdAt).toLocaleString('id-ID')}
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Space>
                                <Button
                                    icon={<WhatsAppOutlined />}
                                    style={{ color: '#25D366', borderColor: '#25D366' }}
                                    onClick={() => handleWhatsAppMessage(selectedNotification)}
                                >
                                    Kirim WhatsApp
                                </Button>
                                {!selectedNotification.isRead && (
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={() => {
                                            markAsRead(selectedNotification.id);
                                            setDetailModalVisible(false);
                                        }}
                                    >
                                        Tandai Dibaca
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>

            <style jsx global>{`
                .ant-table-row-unread {
                    background-color: #f8f9fa !important;
                    border-left: 3px solid #1890ff !important;
                }
                .ant-table-row-read {
                    opacity: 0.7;
                }
            `}</style>
        </LayoutApp>
    );
}
