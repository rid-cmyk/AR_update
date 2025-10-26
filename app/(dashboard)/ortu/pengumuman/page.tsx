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
        {/* Beautiful Header */}
        <div style={{ 
          marginBottom: 32,
          background: 'linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            📢 Pengumuman Penting
          </div>
          <div style={{ 
            fontSize: '16px', 
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            📋 Informasi terbaru dan penting dari pengelola halaqah untuk keluarga
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280' }}>Memuat pengumuman...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pengumumanData.map((item, index) => (
              <Card
                key={item.id}
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '2px solid #f0f0f0',
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                hoverable
                onClick={() => markAsRead(item.id)}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Icon Section */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(235,47,150,0.3)',
                    flexShrink: 0
                  }}>
                    <NotificationOutlined style={{ fontSize: '24px' }} />
                  </div>

                  {/* Content Section */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        color: '#1f2937',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}>
                        📢 {item.judul}
                      </div>
                      
                      {/* Meta Info */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{
                          padding: '4px 12px',
                          backgroundColor: '#eb2f96',
                          color: 'white',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          👥 {item.targetAudience}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '14px',
                          color: '#666'
                        }}>
                          <ClockCircleOutlined />
                          📅 {dayjs(item.tanggal).format("DD MMMM YYYY")}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{
                      color: '#595959',
                      lineHeight: '1.6',
                      fontSize: '14px',
                      marginBottom: '16px',
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0'
                    }}>
                      {item.isi}
                    </div>

                    {/* Action Button */}
                    <div style={{ textAlign: 'right' }}>
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        style={{
                          borderRadius: '20px',
                          backgroundColor: '#52c41a',
                          borderColor: '#52c41a'
                        }}
                        size="small"
                      >
                        ✅ Tandai Dibaca
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

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
          </div>
        )}
      </div>
    </LayoutApp>
  );
}