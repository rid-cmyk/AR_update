"use client";

import { useEffect, useState, useCallback } from "react";
import { Row, Col, Card, Typography, Avatar, Tag, Empty, Spin, Table } from "antd";
import { UserOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined, FileTextOutlined } from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import dayjs from "dayjs";
import { GradeBadge } from "@/components/ui/grade-badge";
import { calculateGradeLetter } from "@/lib/utils/hafalanAssessment";

const { Title, Text } = Typography;

interface RaportData {
  id: number;
  semester: string;
  tahunAkademik: string;
  nilaiAkhir: number;
  catatan: string;
  tanggalCetak: string;
  details: Array<{
    mataPelajaran: string;
    nilai: number;
    keterangan: string;
  }>;
}

interface PrestasiData {
  id: number;
  namaPrestasi: string;
  keterangan: string;
  kategori: string;
  tahun: number;
  validated: boolean;
}

// Mock data removed

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

  const getRaportNilaiColor = (nilai: number) => {
    if (nilai >= 90) return '#219ebc';
    if (nilai >= 80) return '#219ebc';
    if (nilai >= 70) return '#ffb703';
    return '#fb8500';
  };

  const columns = [
    {
      title: 'Mata Pelajaran',
      dataIndex: 'mataPelajaran',
      key: 'mataPelajaran',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Nilai',
      dataIndex: 'nilai',
      key: 'nilai',
      render: (nilai: number) => (
        <GradeBadge nilai={nilai} showNilai />
      )
    },
    {
      title: 'Keterangan',
      dataIndex: 'keterangan',
      key: 'keterangan',
      render: (keterangan: string) => (
        <Text type="secondary">{keterangan}</Text>
      )
    }
  ];

  if (loading) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
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
              <Col xs={24} lg={12} key={raport.id}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#8ecae6',
                          boxShadow: '0 0 15px rgba(114, 46, 209, 0.4)'
                        }} />
                        <span style={{
                          background: '#8ecae6',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontSize: '18px',
                          fontWeight: '800'
                        }}>
                          {raport.semester} - {raport.tahunAkademik}
                        </span>
                      </div>
                      <Tag
                        color={raport.nilaiAkhir >= 80 ? 'green' : raport.nilaiAkhir >= 70 ? 'orange' : 'red'}
                        style={{ fontSize: '14px', fontWeight: 'bold', padding: '4px 12px' }}
                      >
                        {raport.nilaiAkhir}/100
                      </Tag>
                    </div>
                  }
                  style={{
                    borderRadius: '24px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(114, 46, 209, 0.08)',
                    background: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  styles={{ body: {
                    padding: '32px',
                    background: 'transparent',
                    position: 'relative',
                    zIndex: 2
                  } }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(114, 46, 209, 0.05))',
                    zIndex: 1
                  }} />

                  {/* Overall Grade */}
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: `${getRaportNilaiColor(raport.nilaiAkhir)}}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: `0 8px 24px ${getRaportNilaiColor(raport.nilaiAkhir)}40`
                    }}>
                      <div style={{ textAlign: 'center', color: 'white' }}>
                        <div style={{ fontSize: '32px', fontWeight: '900' }}>{raport.nilaiAkhir}</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{calculateGradeLetter(raport.nilaiAkhir)}</div>
                      </div>
                    </div>
                    <Text style={{ fontSize: '16px', color: '#666' }}>Nilai Akhir</Text>
                  </div>

                  {/* Subject Details */}
                  <div style={{ marginBottom: '24px' }}>
                    <Title level={4} style={{ marginBottom: '16px', color: '#333' }}>
                      Detail Nilai
                    </Title>
                    <Table
                      columns={columns}
                      dataSource={raport.details}
                      rowKey="mataPelajaran"
                      pagination={false}
                      size="small"
                      style={{ background: 'transparent' }}
                    />
                  </div>

                  {/* Notes */}
                  {raport.catatan && (
                    <div style={{ marginBottom: '24px' }}>
                      <Title level={4} style={{ marginBottom: '12px', color: '#333' }}>
                        Catatan Guru
                      </Title>
                      <div style={{
                        background: '#f8f9ff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(114, 46, 209, 0.1)'
                      }}>
                        <Text style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                          &quot;{raport.catatan}&quot;
                        </Text>
                      </div>
                    </div>
                  )}

                  {/* Print Date */}
                  <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <CalendarOutlined style={{ marginRight: '6px' }} />
                      Dicetak pada: {dayjs(raport.tanggalCetak).format('DD MMMM YYYY')}
                    </Text>
                  </div>
                </Card>
              </Col>
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
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#ffb703',
                    boxShadow: '0 0 15px rgba(250, 140, 22, 0.4)'
                  }} />
                  <span style={{
                    background: '#ffb703',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '-0.3px'
                  }}>
                    🏆 Prestasi & Penghargaan
                  </span>
                </div>
              }
              style={{
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(250, 140, 22, 0.08)',
                background: '#ffffff',
                position: 'relative',
                overflow: 'hidden'
              }}
              styles={{ body: {
                padding: '32px',
                background: 'transparent',
                position: 'relative',
                zIndex: 2
              } }}
            >
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(250, 140, 22, 0.05))',
                zIndex: 1
              }} />
              {prestasiData.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {prestasiData.map((prestasi) => (
                    <Col xs={24} md={12} lg={8} key={prestasi.id}>
                      <Card
                        size="small"
                        style={{
                          borderRadius: '16px',
                          background: prestasi.validated
                            ? '#fff8f0'
                            : '#f8f9ff',
                          border: `1px solid ${prestasi.validated ? 'rgba(250, 140, 22, 0.2)' : 'rgba(114, 46, 209, 0.2)'}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        styles={{ body: { padding: "20px" } }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: prestasi.validated ? '#219ebc' : '#ffb703',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {prestasi.validated ? (
                            <CheckCircleOutlined style={{ fontSize: '10px', color: 'white' }} />
                          ) : (
                            <ClockCircleOutlined style={{ fontSize: '10px', color: 'white' }} />
                          )}
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <TrophyOutlined style={{
                            fontSize: '24px',
                            color: prestasi.validated ? '#ffb703' : '#8ecae6',
                            marginBottom: '8px'
                          }} />
                        </div>

                        <div>
                          <Text strong style={{ fontSize: '14px', color: '#333', display: 'block', marginBottom: '4px' }}>
                            {prestasi.namaPrestasi}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.4', display: 'block', marginBottom: '8px' }}>
                            {prestasi.keterangan}
                          </Text>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Tag
                              color={prestasi.kategori === 'Akademik' ? 'blue' : 'green'}
                              style={{ fontSize: '10px' }}
                            >
                              {prestasi.kategori}
                            </Tag>
                            <Text style={{ fontSize: '11px', color: '#999' }}>
                              {prestasi.tahun}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">Belum ada data prestasi</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Prestasi akan dicatat oleh guru/admin
                      </Text>
                    </div>
                  }
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}