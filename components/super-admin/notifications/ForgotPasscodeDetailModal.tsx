import React from "react";
import { Avatar, Descriptions, Tag, Button, Space, Modal } from "antd";
import { UserOutlined, QuestionCircleOutlined, WhatsAppOutlined, EyeOutlined } from "@ant-design/icons";
import WebSideDrawer from "@/components/ui/WebSideDrawer";
import { formatPhoneNumberDisplay } from "@/lib/utils/phoneFormatter";

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

interface ForgotPasscodeDetailModalProps {
    visible: boolean;
    onClose: () => void;
    notification: ForgotPasscodeNotification | null;
    onMarkAsRead: (id: number) => void;
    onWhatsAppMessage: (notification: ForgotPasscodeNotification) => void;
}

export default function ForgotPasscodeDetailModal({
    visible,
    onClose,
    notification,
    onMarkAsRead,
    onWhatsAppMessage,
}: ForgotPasscodeDetailModalProps) {
    const renderContent = () => (
        notification ? (
            <div>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Avatar
                        size={100}
                        src={notification.user?.foto}
                        icon={notification.isRegistered ? <UserOutlined /> : <QuestionCircleOutlined />}
                        style={{
                            backgroundColor: notification.isRegistered ? '#219ebc' : '#ffb703'
                        }}
                    />
                </div>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Status Baca">
                        {notification.isRead ? (
                            <Tag color="green">✓ Sudah Dibaca</Tag>
                        ) : (
                            <Tag color="orange">● Belum Dibaca</Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nomor Telepon">
                        {formatPhoneNumberDisplay(notification.phoneNumber)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status Registrasi">
                        <Tag color={notification.isRegistered ? 'blue' : 'red'}>
                            {notification.isRegistered ? 'Terdaftar' : 'Tidak Terdaftar'}
                        </Tag>
                    </Descriptions.Item>
                    {notification.user && (
                        <>
                            <Descriptions.Item label="Nama">
                                {notification.user.namaLengkap}
                            </Descriptions.Item>
                            <Descriptions.Item label="Username">
                                @{notification.user.username}
                            </Descriptions.Item>
                        </>
                    )}
                    <Descriptions.Item label="Pesan">
                        {notification.message || 'Tidak ada pesan'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Waktu Permintaan">
                        {new Date(notification.createdAt).toLocaleString('id-ID')}
                    </Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Space>
                        <Button
                            icon={<WhatsAppOutlined />}
                            style={{ color: '#25D366', borderColor: '#25D366' }}
                            onClick={() => onWhatsAppMessage(notification)}
                        >
                            Kirim WhatsApp
                        </Button>
                        {!notification.isRead && (
                            <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                onClick={() => {
                                    onMarkAsRead(notification.id);
                                    onClose();
                                }}
                            >
                                Tandai Dibaca
                            </Button>
                        )}
                    </Space>
                </div>
            </div>
        ) : null
    );

    return (
        <>
            {/* Mobile Modal (< 1024px) */}
            <Modal
                title="Detail Notifikasi"
                open={visible}
                onCancel={onClose}
                footer={[
                    <Button key="close" onClick={onClose}>
                        Tutup
                    </Button>
                ]}
                width={600}
                className="lg:hidden"
            >
                {renderContent()}
            </Modal>

            {/* Desktop WebSideDrawer (>= 1024px) */}
            <WebSideDrawer
                isOpen={visible}
                onClose={onClose}
                title="Detail Permintaan Reset Passcode"
                subtitle="Informasi verifikasi nomor WhatsApp dan identitas akun santri/pengguna"
                size="md"
                footer={
                    <div className="flex justify-end">
                        <Button onClick={onClose}>Tutup</Button>
                    </div>
                }
            >
                {renderContent()}
            </WebSideDrawer>
        </>
    );
}
