"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, List, Tag, Button, message, Badge, Empty, Skeleton } from 'antd';
import { BellOutlined, EyeOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

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
  /** Tujuan link "Lihat Semua Pengumuman"; bila tidak diset, tombol tidak tampil */
  viewAllHref?: string;
}

export default function AnnouncementList({
  userId,
  maxItems = 5,
  showHeader = true,
  compact = false,
  viewAllHref
}: AnnouncementListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({
        userId: userId || '',
        limit: maxItems.toString()
      });

      const response = await fetch(`/api/pengumuman?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.data || []);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Gagal memuat pengumuman:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId, maxItems]);

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
        setAnnouncements(prev =>
          prev.map(ann =>
            ann.id === announcementId ? { ...ann, isRead: true } : ann
          )
        );
        message.success('Berhasil ditandai sudah dibaca');
      }
    } catch (err) {
      console.error('Gagal menandai sudah dibaca:', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  if (loading) {
    return (
      <Card
        title={
          showHeader ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BellOutlined />
                Pengumuman
              </span>
            </div>
          ) : undefined
        }
        size={compact ? 'small' : 'default'}
      >
        <div aria-busy="true" aria-label="Memuat pengumuman" className="py-2">
          <Skeleton active paragraph={{ rows: compact ? 2 : 3 }} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card size={compact ? 'small' : 'default'}>
        <div className="py-6 text-center">
          <p className="mb-2 text-sm text-slate-500">Gagal memuat pengumuman</p>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={fetchAnnouncements}
          >
            Coba Lagi
          </Button>
        </div>
      </Card>
    );
  }

  const unreadCount = announcements.filter(a => !a.isRead).length;

  return (
    <Card
      title={
        showHeader ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BellOutlined />
              Pengumuman
            </span>
            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                className="bg-blue-500"
              />
            )}
          </div>
        ) : undefined
      }
      size={compact ? 'small' : 'default'}
    >
      {announcements.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Belum ada pengumuman"
        />
      ) : (
        <List
          size="small"
          dataSource={announcements}
          renderItem={(item) => (
            <List.Item
              className={compact ? 'py-2 border-b border-slate-100' : 'py-3 border-b border-slate-100'}
              actions={
                !item.isRead
                  ? [
                      <Button
                        key="mark-read"
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => markAsRead(item.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {!compact && 'Tandai Dibaca'}
                      </Button>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center gap-2">
                    {!item.isRead && <Badge status="processing" />}
                    <span
                      className={`${
                        item.isRead ? 'font-normal' : 'font-semibold'
                      } ${compact ? 'text-sm' : 'text-base'} text-slate-900 dark:text-white`}
                    >
                      {item.judul}
                    </span>
                    <Tag
                      color={
                        item.targetAudience === 'semua'
                          ? 'blue'
                          : item.targetAudience === 'guru'
                          ? 'green'
                          : item.targetAudience === 'santri'
                          ? 'orange'
                          : 'purple'
                      }
                    >
                      {item.targetAudience}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div
                      className={`mb-1 leading-snug ${
                        compact ? 'text-xs' : 'text-sm'
                      } ${item.isRead ? 'text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}
                    >
                      {item.isi.length > (compact ? 80 : 120)
                        ? `${item.isi.substring(0, compact ? 80 : 120)}...`
                        : item.isi}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Oleh {item.creator.namaLengkap}</span>
                      <span>{dayjs(item.tanggal).fromNow()}</span>
                      {item.tanggalKadaluarsa && (
                        <span className="flex items-center gap-1">
                          <ClockCircleOutlined />
                          Berakhir {dayjs(item.tanggalKadaluarsa).fromNow()}
                        </span>
                      )}
                      <span>{item.readCount} kali dibaca</span>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {announcements.length > 0 && viewAllHref && (
        <div className="mt-4 text-center">
          <Button type="link" size="small" href={viewAllHref}>
            Lihat Semua Pengumuman
          </Button>
        </div>
      )}
    </Card>
  );
}