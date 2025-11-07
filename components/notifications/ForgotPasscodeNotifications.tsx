"use client";

import { useState, useEffect } from "react";
import {
  Badge,
  Dropdown,
  Button,
  List,
  Typography,
  Avatar,
  Space,
  Empty,
  Spin,
  message
} from "antd";
import {
  BellOutlined,
  PhoneOutlined,
  UserOutlined,
  EyeOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { formatPhoneNumberDisplay } from "@/lib/utils/phoneFormatter";

const { Text, Title } = Typography;

interface ForgotPasscodeNotification {
  id: number;
  phoneNumber: string;
  message?: string;
  isRead: boolean;
  isRegistered: boolean;
  userId?: number;
  createdAt: string;
  user?: {
    id: number;
    namaLengkap: string;
    username: string;
    foto?: string;
  };
}

interface ForgotPasscodeNotificationsProps {
  userRole: string;
  onCountChange?: (count: number) => void;
}

export default function ForgotPasscodeNotifications({ userRole, onCountChange }: ForgotPasscodeNotificationsProps) {
  const [notifications, setNotifications] = useState<ForgotPasscodeNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();

  // Check if user is super admin
  const isSuperAdmin = userRole.toLowerCase() === 'super-admin';

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
        const newUnreadCount = data.filter((n: ForgotPasscodeNotification) => !n.isRead).length;
        setUnreadCount(newUnreadCount);
        
        // Notify parent component about count change
        if (onCountChange) {
          onCountChange(newUnreadCount);
        }
      } else {
        console.warn('Invalid data format received:', data);
        setNotifications([]);
        setUnreadCount(0);
        
        if (onCountChange) {
          onCountChange(0);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Gagal memuat notifikasi: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setNotifications([]);
      setUnreadCount(0);
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

      // Update local state - remove the notification from the list since it's now read
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, isRead: true }
            : n
        )
      );

      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      
      // Notify parent component about count change
      if (onCountChange) {
        onCountChange(newCount);
      }

      // Close dropdown if no more unread notifications
      if (newCount === 0) {
        setTimeout(() => setDropdownVisible(false), 500);
      }
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

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      // Notify parent component about count change
      if (onCountChange) {
        onCountChange(0);
      }
      
      message.success('Semua notifikasi ditandai sebagai dibaca');
      
      // Close dropdown after marking all as read
      setTimeout(() => setDropdownVisible(false), 1000);
    } catch (error) {
      console.error('Error marking all as read:', error);
      message.error('Gagal menandai semua sebagai dibaca');
    }
  };

  // View all notifications
  const viewAllNotifications = () => {
    setDropdownVisible(false);
    router.push('/super-admin/notifications/forgot-passcode');
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchNotifications();

      // Auto refresh every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isSuperAdmin]);

  const dropdownContent = (
    <div style={{ width: 350, maxHeight: 400, overflow: 'hidden' }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Title level={5} style={{ margin: 0 }}>
          Permintaan Reset Passcode
        </Title>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={markAllAsRead}
          >
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : notifications.filter(n => !n.isRead).length === 0 ? (
          <Empty
            description="Tidak ada permintaan reset passcode"
            style={{ padding: 20 }}
          />
        ) : (
          <List
            dataSource={notifications.filter(n => !n.isRead).slice(0, 5)} // Show only 5 recent unread
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  backgroundColor: item.isRead ? 'transparent' : '#f6ffed',
                  borderLeft: item.isRead ? 'none' : '3px solid #52c41a',
                  cursor: 'pointer'
                }}
                onClick={() => markAsRead(item.id)}
              >
                <List.Item.Meta
                  avatar={
                    item.isRegistered && item.user ? (
                      <Avatar
                        src={item.user.foto || undefined}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    ) : (
                      <Avatar
                        icon={<QuestionCircleOutlined />}
                        style={{ backgroundColor: '#fa8c16' }}
                      />
                    )
                  }
                  title={
                    <div>
                      <Text strong>
                        {item.isRegistered && item.user
                          ? item.user.namaLengkap
                          : 'Orang Tidak Dikenali'
                        }
                      </Text>
                      {!item.isRead && (
                        <Badge
                          status="processing"
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Space>
                        <PhoneOutlined style={{ color: '#1890ff' }} />
                        <Text type="secondary">{formatPhoneNumberDisplay(item.phoneNumber)}</Text>
                      </Space>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(item.createdAt).toLocaleString('id-ID')}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #f0f0f0',
        textAlign: 'center'
      }}>
        <Button
          type="primary"
          onClick={viewAllNotifications}
          icon={<EyeOutlined />}
          block
        >
          Lihat Semua Notifikasi
        </Button>
      </div>
    </div>
  );

  // Only show for super admin
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
    >
      <Badge 
        count={unreadCount} 
        size="small" 
        showZero={false}
        style={{
          boxShadow: unreadCount > 0 ? "0 2px 8px rgba(24, 144, 255, 0.3)" : "none"
        }}
      >
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{
            fontSize: "16px",
            width: 44,
            height: 44,
            color: "#fff",
            borderRadius: 12,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "rgba(255, 255, 255, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "scale(1.05) translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
            e.currentTarget.style.transform = "scale(1) translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
          }}
        />
      </Badge>
    </Dropdown>
  );
}