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
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import ForgotPasscodeStats from "@/components/super-admin/notifications/ForgotPasscodeStats";
import { getForgotPasscodeColumns } from "@/components/super-admin/notifications/forgotPasscodeColumns";
import WebSideDrawer from "@/components/ui/WebSideDrawer";
import { formatPhoneNumberDisplay, formatPhoneNumberForWhatsApp } from "@/lib/utils/phoneFormatter";
import AdminSettingsModal from "@/components/super-admin/AdminSettingsModal";
import ForgotPasscodeDetailModal from "@/components/super-admin/notifications/ForgotPasscodeDetailModal";

const { Text } = Typography;


interface AdminSettings {
    id: number;
    whatsappNumber: string;
    whatsappMessageHelp: string;
    whatsappMessageRegistered: string;
    whatsappMessageUnregistered: string;
}

export default function anysPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState<number | string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        registered: 0,
        unregistered: 0
    });
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
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
                const unread = data.filter((n: any) => !n.isRead).length;
                const registered = data.filter((n: any) => n.isRegistered).length;
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
    const markAsRead = async (notificationId: string | number) => {
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
    const deleteNotification = async (notificationId: string) => {
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
    const handleViewDetail = (notification: any) => {
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
    const handleWhatsAppMessage = (notification: any) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <AdminHeaderCard
                    title="Notifikasi Forgot Passcode"
                    subtitle="Kelola permintaan reset passcode dari pengguna"
                    actions={
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
                <ForgotPasscodeStats stats={stats} />
                {/* Table */}
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <BellOutlined style={{ color: '#219ebc', fontSize: 18 }} />
                            <span>Daftar Permintaan Reset Passcode</span>
                        </div>
                    }
                >
                    <Table
                        columns={getForgotPasscodeColumns({
                            formatPhoneNumberDisplay,
                            handleWhatsAppMessage,
                            handleViewDetail,
                            markAsRead,
                            deleteNotification,
                            deleteLoading: deleteLoading as any
                        })}
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

            {/* Zero Code Duplication Helper for Detail Notifikasi Forgot Passcode */}
            <ForgotPasscodeDetailModal
                visible={detailModalVisible}
                onClose={() => {
                    setDetailModalVisible(false);
                    setSelectedNotification(null);
                }}
                notification={selectedNotification}
                onMarkAsRead={markAsRead}
                onWhatsAppMessage={handleWhatsAppMessage}
            />
            <style jsx global>{`
                .ant-table-row-unread {
                    background-color: #f8f9fa !important;
                    border-left: 3px solid #219ebc !important;
                }
                .ant-table-row-read {
                    opacity: 0.7;
                }
            `}</style>
        </>
    );
}
