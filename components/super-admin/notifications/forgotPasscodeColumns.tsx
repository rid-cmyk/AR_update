import React from "react";
import { Avatar, Space, Tag, Button, Tooltip, Popconfirm, Typography } from "antd";
import { 
    UserOutlined, 
    QuestionCircleOutlined, 
    PhoneOutlined, 
    WhatsAppOutlined, 
    InfoCircleOutlined, 
    EyeOutlined, 
    DeleteOutlined 
} from "@ant-design/icons";

const { Text } = Typography;

export interface ForgotPasscodeNotification {
    id: string;
    phoneNumber: string;
    isRegistered: boolean;
    isRead: boolean;
    createdAt: string;
    userId?: string;
    user?: {
        id: string;
        namaLengkap: string;
        foto?: string;
        role: string;
    };
}

interface ForgotPasscodeColumnsProps {
    formatPhoneNumberDisplay: (phone: string) => string;
    handleWhatsAppMessage: (record: ForgotPasscodeNotification) => void;
    handleViewDetail: (record: ForgotPasscodeNotification) => void;
    markAsRead: (id: string) => void;
    deleteNotification: (id: string) => void;
    deleteLoading: string | null;
}

export const getForgotPasscodeColumns = ({
    formatPhoneNumberDisplay,
    handleWhatsAppMessage,
    handleViewDetail,
    markAsRead,
    deleteNotification,
    deleteLoading
}: ForgotPasscodeColumnsProps) => [
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
                        backgroundColor: record.isRegistered ? '#219ebc' : '#ffb703'
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
