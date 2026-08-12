"use client";

import { useEffect, useState } from "react";
import { Card, Button, message, Table, Space, Badge, Empty, Row, Col } from "antd";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Pengumuman,
  buildPengumumanColumns,
} from "@/components/pengumuman/pengumumanColumns";
import { PengumumanStatsCards } from "@/components/pengumuman/PengumumanStatsCards";
import { PengumumanDetailDrawer } from "@/components/pengumuman/PengumumanDetailDrawer";

export default function GuruPengumumanPage() {
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPengumuman, setSelectedPengumuman] = useState<Pengumuman | null>(null);

  // Fetch data
  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/guru/pengumuman");
      if (!res.ok) throw new Error("Failed to fetch pengumuman");
      const data = await res.json();
      const pengumumanData = data.data || data;
      setPengumuman(Array.isArray(pengumumanData) ? pengumumanData : []);
    } catch (error: any) {
      console.error("Error fetching pengumuman:", error);
      message.error("Error fetching pengumuman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const handleRead = async (pengumumanItem: Pengumuman) => {
    setSelectedPengumuman(pengumumanItem);
    setIsModalOpen(true);

    // Mark as read if not already read
    if (!pengumumanItem.isRead) {
      try {
        const res = await fetch(`/api/pengumuman/${pengumumanItem.id}/read`, {
          method: "POST",
        });

        if (res.ok) {
          // Update local state
          setPengumuman(prev =>
            prev.map(p =>
              p.id === pengumumanItem.id ? { ...p, isRead: true } : p
            )
          );
        }
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  const columns = buildPengumumanColumns(handleRead);
  const unreadCount = pengumuman.filter(p => !p.isRead).length;

  return (
    <>
      <div style={{ padding: "24px 0" }}>
        <AdminHeaderCard
          title="Pengumuman"
          subtitle="Lihat pengumuman terbaru dari admin"
        />

        <PengumumanStatsCards pengumuman={pengumuman} />

        {/* Unread Announcements */}
        {unreadCount > 0 && (
          <Card
            title={
              <Space>
                <Badge status="processing" />
                Pengumuman Belum Dibaca ({unreadCount})
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={[16, 16]}>
              {pengumuman.filter(p => !p.isRead).slice(0, 3).map((p) => (
                <Col xs={24} md={8} key={p.id}>
                  <Card
                    size="small"
                    style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591', cursor: 'pointer' }}
                    onClick={() => handleRead(p)}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: 8 }}>
                        {p.judul}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                        {p.isi.length > 60 ? `${p.isi.substring(0, 60)}...` : p.isi}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {dayjs(p.tanggal).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Main Content */}
        <Card title="Semua Pengumuman">
          {pengumuman.length === 0 ? (
            <Empty
              description="Belum ada pengumuman"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              dataSource={pengumuman}
              columns={columns}
              rowKey="id"
              loading={loading}
              size="small"
              scroll={{ x: 800 }}
              pagination={{ pageSize: 10 }}
              rowClassName={(record) => record.isRead ? '' : 'unread-row'}
            />
          )}
        </Card>

        <PengumumanDetailDrawer
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pengumuman={selectedPengumuman}
        />

        <style jsx>{`
          .unread-row {
            background-color: #f6ffed !important;
          }
        `}</style>
      </div>
    </>
  );
}
