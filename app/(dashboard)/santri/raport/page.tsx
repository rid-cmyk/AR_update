"use client";

import { useCallback, useEffect, useState } from "react";
import { Row, Card, Typography, Avatar, Empty, Spin } from "antd";
import { UserOutlined, ClockCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import { RaportCard } from "@/components/santri/raport/RaportCard";
import { PrestasiSection } from "@/components/santri/raport/PrestasiSection";
import { RaportData, PrestasiData } from "@/components/santri/raport/raportTypes";

const { Text } = Typography;

export default function SantriRaportPage() {
  const [raportData, setRaportData] = useState<RaportData[]>([]);
  const [prestasiData, setPrestasiData] = useState<PrestasiData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/santri');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();

      setRaportData(data.raportData || []);
      setPrestasiData(data.prestasiData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to empty data if API fails
      setRaportData([]);
      setPrestasiData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <Text type="secondary">Memuat data raport Anda...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 0", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <AdminHeaderCard
        title="Raport Saya"
        subtitle="Lihat hasil evaluasi dan pencapaian akademik Anda"
        tags={[
          { label: "Raport", icon: <FileTextOutlined /> },
          { label: "Online", icon: <ClockCircleOutlined /> }
        ]}
        actions={
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <Avatar
              size={64}
              icon={<UserOutlined />}
              style={{
                background: '#eb2f96',
                marginBottom: 8
              }}
            />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Santri Raport</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Data dari Guru</div>
          </div>
        }
      />

      {/* Raport Cards */}
      {raportData.length > 0 ? (
        <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
          {raportData.map((raport) => (
            <RaportCard key={raport.id} raport={raport} />
          ))}
        </Row>
      ) : (
        <Card style={{ marginBottom: '40px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">Belum ada data raport</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Raport akan dibuat oleh guru/admin setelah evaluasi semester
                </Text>
              </div>
            }
          />
        </Card>
      )}

      {/* Prestasi Section */}
      <PrestasiSection prestasiData={prestasiData} />
    </div>
  );
}
