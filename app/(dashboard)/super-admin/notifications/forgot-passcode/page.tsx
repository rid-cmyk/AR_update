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
    ReloadOutlined,
    DeleteOutlined,
    InfoCircleOutlined,
    WhatsAppOutlined,
    SyncOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PageHeader from "@/components/layout/PageHeader";
import { formatPhoneNumberDisplay, formatPhoneNumberForWhatsApp } from "@/lib/utils/phoneFormatter";

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

export default function ForgotPasscodeNotificationsPage() {
    const [notifications, setNotifications] = useState<ForgotPasscodeNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
    const [syncLoading, setSyncLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        registered: 0,
        unregistered: 0
    });
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<ForgotPasscodeNotification | null>(null);

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
            setDeleteLoading(notificationId);
            const response = await fetch(`/api/notifications/forgot-passcode/${notificationId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete notification');
            }

            message.success('Notifikasi berhasil dihapus');
            fetchNotifications(); // Refresh data
        } catch (error) {
            console.error('Error deleting notification:', error);
            message.error('Gagal menghapus notifikasi: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
            setDeleteLoading(-1); // Use -1 for bulk operations
            const promises = readNotifications.map(n =>
                fetch(`/api/notifications/forgot-passcode/${n.id}`, { method: 'DELETE' })
            );

            const results = await Promise.allSettled(promises);
            const successCount = results.filter(result => result.status === 'fulfilled').length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                message.success(`${successCount} notifikasi yang sudah dibaca berhasil dihapus`);
            }
            if (failCount > 0) {
                message.warning(`${failCount} notifikasi gagal dihapus`);
            }

            fetchNotifications();
        } catch (error) {
            console.error('Error bulk deleting read notifications:', error);
            message.error('Gagal menghapus notifikasi yang sudah dibaca');
        } finally {
            setDeleteLoading(null);
        }
    };

    // Open detail modal
    const handleViewDetail = (notification: ForgotPasscodeNotification) => {
        setSelectedNotification(notification);
        setDetailModalVisible(true);
    };

    // Sync notifications with user data
    const syncNotifications = async () => {
        try {
            setSyncLoading(true);
            const response = await fetch('/api/notifications/forgot-passcode/sync', {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error('Failed to sync notifications');
            }

            const data = await response.json();

            if (data.syncedCount > 0) {
                message.success(`${data.syncedCount} notifikasi berhasil disinkronisasi`);
                fetchNotifications(); // Refresh data
            } else {
                message.info('Semua notifikasi sudah tersinkronisasi');
            }
        } catch (error) {
            console.error('Error syncing notifications:', error);
            message.error('Gagal melakukan sinkronisasi');
        } finally {
            setSyncLoading(false);
        }
    };

    // Handle WhatsApp message
    const handleWhatsAppMessage = (notification: ForgotPasscodeNotification) => {
        const superAdminNumber = "+6281213923253";
        let whatsappMessage = "";

        if (notification.isRegistered && notification.user) {
            // Message for registered user
            const tanggalPermintaan = new Date(notification.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            whatsappMessage = `Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. Berikut adalah passcode yang Anda minta:

📅 Tanggal Permintaan: ${tanggalPermintaan}
👤 Nama Pengguna: ${notification.user.namaLengkap}
🔐 Passcode: ${notification.user.passCode || '[Passcode belum diset]'}

Passcode ini dapat digunakan untuk mengakses akun Anda di Aplikasi AR-Hafalan. Jaga kerahasiaan passcode Anda dan jangan berikan kepada siapapun.

Terima kasih atas partisipasinya dalam menggunakan Aplikasi AR-Hafalan.

Wassalamualaikum Warahmatullahi Wabarakatuh.`;
        } else {
            // Message for unregistered user
            whatsappMessage = `Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. Maaf, nomor ${notification.phoneNumber} belum terdaftar dalam sistem kami.

Silakan melakukan pendaftaran terlebih dahulu melalui aplikasi atau hubungi admin untuk informasi lebih lanjut.

Terima kasih.

Wassalamualaikum Warahmatullahi Wabarakatuh.`;
        }

        // Create WhatsApp URL with properly formatted number
        const whatsappNumber = formatPhoneNumberForWhatsApp(notification.phoneNumber);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');

        // Show success message
        message.success('Pesan WhatsApp telah disiapkan');
    };

    useEffect(() => {
        fetchNotifications();

        // Auto-refresh every 15 seconds for real-time sync
        const interval = setInterval(() => {
            fetchNotifications();
        }, 15000);

        // Auto-sync when page becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchNotifications();
                // Also run sync to catch any updates
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
                        <Space>
                            <Tooltip title="Sinkronisasi data notifikasi dengan data user terbaru">
                                <Button
                                    icon={<SyncOutlined />}
                                    onClick={syncNotifications}
                                    loading={syncLoading}
                                    type="primary"
                                    ghost
                                >
                                    Sync Data
                                </Button>
                            </Tooltip>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchNotifications}
                                loading={loading}
                                type="default"
                            >
                                Refresh Data
                            </Button>
                        </Space>
                    }
                />

                {/* Action Buttons Section */}
                <Card
                    size="small"
                    style={{
                        background: '#fafafa',
                        border: '1px solid #e8e8e8'
                    }}
                >
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24}>
                            <Space wrap size="middle">
                                <Text strong style={{ color: '#666' }}>
                                    Aksi Cepat:
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    💡 Data disinkronisasi otomatis setiap 15 detik
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
                                        description={`Yakin ingin menghapus ${notifications.filter(n => n.isRead).length} notifikasi yang sudah dibaca?`}
                                        onConfirm={bulkDeleteRead}
                                        okText="Ya, Hapus"
                                        cancelText="Batal"
                                        placement="topRight"
                                    >
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            loading={deleteLoading === -1}
                                        >
                                            Bersihkan yang Sudah Dibaca ({notifications.filter(n => n.isRead).length})
                                        </Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        </Col>
                    </Row>
                </Card>

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
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <BellOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                            <span>Daftar Permintaan Reset Passcode</span>
                            {notifications.length > 0 && (
                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                    {notifications.length} Total
                                </Tag>
                            )}
                        </div>
                    }
                    extra={
                        <Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                💡 Tip: Pilih baris untuk aksi bulk
                            </Text>
                        </Space>
                    }
                >
                    {notifications.length === 0 && !loading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: '#fafafa',
                            borderRadius: '8px',
                            margin: '20px 0'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.6 }}>🔔</div>
                            <Text style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '8px' }}>
                                Belum ada permintaan reset passcode
                            </Text>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                Notifikasi akan muncul di sini ketika ada pengguna yang meminta reset passcode
                            </Text>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={notifications}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 15,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `Menampilkan ${range[0]}-${range[1]} dari ${total} notifikasi`,
                                pageSizeOptions: ['10', '15', '25', '50'],
                                style: { marginTop: 16 }
                            }}
                            rowClassName={(record) =>
                                record.isRead ? 'ant-table-row-read' : 'ant-table-row-unread'
                            }
                            scroll={{ x: 800 }}
                            size="middle"
                        />
                    )}
                </Card>
            </div>

            <style jsx global>{`
                .ant-table-row-unread {
                    background-color: #f8f9fa !important;
                    border-left: 3px solid #1890ff !important;
                }
                
                .ant-table-row-unread:hover {
                    background-color: #e6f7ff !important;
                }
                
                .ant-table-row-read {
                    background-color: #ffffff !important;
                    opacity: 0.7;
                }
                
                .ant-table-row-read:hover {
                    background-color: #fafafa !important;
                }
                
                .ant-card {
                    border-radius: 8px !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                }
                
                .ant-btn {
                    border-radius: 6px !important;
                    font-weight: 500 !important;
                }
                
                .ant-table-thead > tr > th {
                    background-color: #fafafa !important;
                    font-weight: 600 !important;
                    color: #333 !important;
                }
                
                .ant-pagination {
                    text-align: center !important;
                    margin-top: 24px !important;
                }
                
                .ant-statistic-content {
                    font-weight: 600 !important;
                }
            `}</style>

            {/* Detail Modal */}
            <Modal
                title={`Detail Notifikasi - ${selectedNotification?.isRegistered && selectedNotification?.user ? selectedNotification.user.namaLengkap : 'Orang Tidak Dikenali'}`}
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
                                src={selectedNotification.isRegistered && selectedNotification.user?.foto ? selectedNotification.user.foto : undefined}
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
                                <Space>
                                    <PhoneOutlined style={{ color: '#1890ff' }} />
                                    <Text>{formatPhoneNumberDisplay(selectedNotification.phoneNumber)}</Text>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status Registrasi">
                                <Tag color={selectedNotification.isRegistered ? 'blue' : 'red'}>
                                    {selectedNotification.isRegistered ? '✓ Terdaftar di Sistem' : '✗ Tidak Terdaftar'}
                                </Tag>
                            </Descriptions.Item>
                            {selectedNotification.isRegistered && selectedNotification.user && (
                                <>
                                    <Descriptions.Item label="Nama Lengkap">
                                        {selectedNotification.user.namaLengkap}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Username">
                                        @{selectedNotification.user.username}
                                    </Descriptions.Item>
                                </>
                            )}
                            <Descriptions.Item label="Pesan">
                                {selectedNotification.message || 'Tidak ada pesan tambahan'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Waktu Permintaan">
                                {new Date(selectedNotification.createdAt).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Descriptions.Item>
                            {selectedNotification.readAt && (
                                <Descriptions.Item label="Waktu Dibaca">
                                    {new Date(selectedNotification.readAt).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {/* Action buttons in modal */}
                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Space>
                                <Button
                                    type="default"
                                    icon={<WhatsAppOutlined />}
                                    style={{
                                        color: '#25D366',
                                        borderColor: '#25D366'
                                    }}
                                    onClick={() => {
                                        handleWhatsAppMessage(selectedNotification);
                                    }}
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
                                        Tandai Sebagai Dibaca
                                    </Button>
                                )}
                                <Popconfirm
                                    title="Hapus Notifikasi"
                                    description="Yakin ingin menghapus notifikasi ini?"
                                    onConfirm={() => {
                                        deleteNotification(selectedNotification.id);
                                        setDetailModalVisible(false);
                                        setSelectedNotification(null);
                                    }}
                                    okText="Ya, Hapus"
                                    cancelText="Batal"
                                >
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        loading={deleteLoading === selectedNotification.id}
                                    >
                                        Hapus Notifikasi
                                    </Button>
                                </Popconfirm>
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>
        </LayoutApp>
    );
}