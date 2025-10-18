"use client";

import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, message, Badge, Empty, Spin } from 'antd';
import { BellOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

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
    namaLengkap: string;
    role: { name: string };
  };
}

interface AnnouncementListProps {
  userId?: string;
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export default function AnnouncementList({
  userId,
  maxItems = 5,
  showHeader = true,
  compact = false
}: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: userId || '',
        limit: maxItems.toString()
      });

      const response = await fetch(`/api/pengumuman?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId: number) => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const response = await fetch(`/api/pengumuman/${announcementId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setAnnouncements(prev =>
          prev.map(ann =>
            ann.id === announcementId ? { ...ann, isRead: true } : ann
          )
        );
        message.success('Marked as read');
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [userId, maxItems]);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  const unreadCount = announcements.filter(a => !a.isRead).length;

  return (
    <Card
      title={showHeader ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            <BellOutlined style={{ marginRight: 8 }} />
            Announcements
          </span>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: '#1890ff' }} />
          )}
        </div>
      ) : undefined}
      size={compact ? 'small' : 'default'}
    >
      {announcements.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No announcements"
        />
      ) : (
        <List
          size="small"
          dataSource={announcements}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: compact ? '8px 0' : '12px 0',
                borderBottom: '1px solid #f0f0f0'
              }}
              actions={[
                !item.isRead && (
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => markAsRead(item.id)}
                    style={{ color: '#1890ff' }}
                  >
                    {!compact && 'Mark Read'}
                  </Button>
                )
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!item.isRead && <Badge status="processing" />}
                    <span style={{
                      fontWeight: item.isRead ? 'normal' : 'bold',
                      fontSize: compact ? '14px' : '16px'
                    }}>
                      {item.judul}
                    </span>
                    <Tag color={
                      item.targetAudience === 'semua' ? 'blue' :
                      item.targetAudience === 'guru' ? 'green' :
                      item.targetAudience === 'santri' ? 'orange' : 'purple'
                    }>
                      {item.targetAudience}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div style={{
                      marginBottom: 4,
                      color: item.isRead ? '#666' : '#000',
                      fontSize: compact ? '12px' : '14px',
                      lineHeight: 1.4
                    }}>
                      {item.isi.length > (compact ? 80 : 120)
                        ? `${item.isi.substring(0, compact ? 80 : 120)}...`
                        : item.isi
                      }
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}>
                      <span>By {item.creator.namaLengkap}</span>
                      <span>{dayjs(item.tanggal).fromNow()}</span>
                      {item.tanggalKadaluarsa && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ClockCircleOutlined />
                          Expires {dayjs(item.tanggalKadaluarsa).fromNow()}
                        </span>
                      )}
                      <span>{item.readCount} reads</span>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {announcements.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button type="link" size="small">
            View All Announcements
          </Button>
        </div>
      )}
    </Card>
  );
}