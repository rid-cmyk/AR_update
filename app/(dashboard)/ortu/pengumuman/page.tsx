"use client";

import { useEffect, useState } from "react";
import { Card, List, Spin, Tag, Avatar, Space, Button, message } from "antd";
import { NotificationOutlined, UserOutlined, ClockCircleOutlined, EyeOutlined } from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

interface PengumumanData {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  targetAudience: string;
  dibacaOleh: any[];
  dibacaCount: number;
  totalTarget: number;
}

export default function PengumumanOrtu() {
  const [pengumumanData, setPengumumanData] = useState<PengumumanData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch pengumuman data
  const fetchPengumumanData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/ortu");
      if (!res.ok) throw new Error("Failed to fetch pengumuman data");
      const data = await res.json();

      // Transform pengumuman data
      const transformedData: PengumumanData[] = data.pengumuman?.map((item: any) => ({
        id: item.id,
        judul: item.judul,
        isi: item.isi,
        tanggal: item.tanggal,
        targetAudience: item.targetAudience,
        dibacaOleh: item.dibacaOleh || [],
        dibacaCount: item.dibacaOleh?.length || 0,
        totalTarget: item.totalTarget || 50, // Mock total target
      })) || [];

      setPengumumanData(transformedData);
    } catch (error) {
      console.error("Error fetching pengumuman data:", error);
      // Set mock data for demo
      setPengumumanData([
        {
          id: 1,
          judul: "Jadwal Ujian Tengah Semester",
          isi: "Pengumuman penting! Ujian tengah semester akan dilaksanakan pada tanggal 15-20 Februari 2024. Silakan persiapkan diri dengan baik.",
          tanggal: "2024-01-25",
          targetAudience: "Semua Orang Tua",
          dibacaOleh: [],
          dibacaCount: 0,
          totalTarget: 50,
        },
        {
          id: 2,
          judul: "Lomba Hafalan Santri Berprestasi",
          isi: "Dalam rangka memotivasi santri untuk meningkatkan hafalan Al-Quran, akan diadakan lomba hafalan tingkat kecamatan.",
          tanggal: "2024-01-20",
          targetAudience: "Orang Tua Santri",
          dibacaOleh: [],
          dibacaCount: 0,
          totalTarget: 45,
        },
        {
          id: 3,
          judul: "Perubahan Jadwal Halaqah",
          isi: "Informasi perubahan jadwal halaqah untuk bulan Februari 2024. Silakan cek jadwal terbaru di aplikasi.",
          tanggal: "2024-01-18",
          targetAudience: "Semua Orang Tua",
          dibacaOleh: [],
          dibacaCount: 0,
          totalTarget: 50,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumumanData();
  }, []);

  // Mark as read function
  const markAsRead = async (pengumumanId: number) => {
    try {
      // In a real app, this would call an API to mark as read
      message.success("Pengumuman telah ditandai sebagai dibaca");
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            📢 Pengumuman
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Informasi penting dari pengelola halaqah
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280' }}>Memuat pengumuman...</p>
          </div>
        ) : (
          <Card bordered={false}>
            <List
              dataSource={pengumumanData}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '24px',
                    marginBottom: '16px',
                    background: '#fafafa',
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0'
                  }}
                  actions={[
                    <Button
                      key="mark-read"
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => markAsRead(item.id)}
                      size="small"
                    >
                      Tandai Dibaca
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<NotificationOutlined />}
                        style={{
                          backgroundColor: '#1890ff',
                          border: '2px solid #e6f7ff'
                        }}
                        size={48}
                      />
                    }
                    title={
                      <div style={{ marginBottom: '8px' }}>
                        <h3 style={{
                          margin: 0,
                          color: '#1f2937',
                          fontSize: '18px',
                          fontWeight: 'bold'
                        }}>
                          {item.judul}
                        </h3>
                        <Space size="small" style={{ marginTop: '4px' }}>
                          <Tag color="blue">{item.targetAudience}</Tag>
                          <span style={{
                            fontSize: '14px',
                            color: '#8c8c8c',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <ClockCircleOutlined />
                            {dayjs(item.tanggal).format("DD MMMM YYYY")}
                          </span>
                        </Space>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{
                          color: '#595959',
                          lineHeight: '1.6',
                          marginBottom: '12px',
                          fontSize: '15px'
                        }}>
                          {item.isi}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '14px',
                          color: '#8c8c8c'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <EyeOutlined />
                            Dibaca: {item.dibacaCount}/{item.totalTarget}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <UserOutlined />
                            Target: {item.targetAudience}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

            {pengumumanData.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#8c8c8c'
              }}>
                <NotificationOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px', margin: 0 }}>
                  Belum ada pengumuman untuk saat ini
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </LayoutApp>
  );
}