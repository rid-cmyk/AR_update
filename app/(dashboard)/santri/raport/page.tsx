"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Progress, Typography, List, Avatar, Tag, Button, Empty, Spin, Table, Divider } from "antd";
import { UserOutlined, BookOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined, AimOutlined, LineChartOutlined, FilterOutlined, StarOutlined, FileTextOutlined } from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

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

export default function SantriRaportPage() {
  const [raportData, setRaportData] = useState<RaportData[]>([]);
  const [prestasiData, setPrestasiData] = useState<PrestasiData[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - data yang diinput oleh guru/admin
  const mockRaportData: RaportData[] = [
    {
      id: 1,
      semester: 'S1',
      tahunAkademik: '2024/2025',
      nilaiAkhir: 85,
      catatan: 'Santri yang rajin dan memiliki potensi yang baik dalam menghafal Al-Quran. Perlu ditingkatkan lagi konsistensinya.',
      tanggalCetak: '2024-01-15',
      details: [
        { mataPelajaran: 'Hafalan Al-Quran', nilai: 90, keterangan: 'Sangat baik' },
        { mataPelajaran: 'Tajwid', nilai: 85, keterangan: 'Baik' },
        { mataPelajaran: 'Akhlak', nilai: 80, keterangan: 'Baik' },
        { mataPelajaran: 'Kehadiran', nilai: 85, keterangan: 'Baik' }
      ]
    },
    {
      id: 2,
      semester: 'S2',
      tahunAkademik: '2023/2024',
      nilaiAkhir: 82,
      catatan: 'Perkembangan yang baik, namun perlu lebih fokus pada hafalan.',
      tanggalCetak: '2024-07-15',
      details: [
        { mataPelajaran: 'Hafalan Al-Quran', nilai: 85, keterangan: 'Baik' },
        { mataPelajaran: 'Tajwid', nilai: 80, keterangan: 'Baik' },
        { mataPelajaran: 'Akhlak', nilai: 85, keterangan: 'Baik' },
        { mataPelajaran: 'Kehadiran', nilai: 80, keterangan: 'Baik' }
      ]
    }
  ];

  const mockPrestasiData: PrestasiData[] = [
    {
      id: 1,
      namaPrestasi: 'Juara 1 Hafalan Juz 1',
      keterangan: 'Memenangkan lomba hafalan Juz 1 tingkat kecamatan',
      kategori: 'Akademik',
      tahun: 2024,
      validated: true
    },
    {
      id: 2,
      namaPrestasi: 'Santri Teladan',
      keterangan: 'Diberikan penghargaan sebagai santri teladan bulan Desember',
      kategori: 'Akhlak',
      tahun: 2024,
      validated: true
    },
    {
      id: 3,
      namaPrestasi: 'Peserta MTQ Tingkat Kabupaten',
      keterangan: 'Berhasil lolos ke babak final MTQ tingkat kabupaten',
      kategori: 'Akademik',
      tahun: 2023,
      validated: true
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
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
        // Fallback to mock data if API fails
        setRaportData(mockRaportData);
        setPrestasiData(mockPrestasiData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRaportNilaiColor = (nilai: number) => {
    if (nilai >= 90) return '#52c41a';
    if (nilai >= 80) return '#1890ff';
    if (nilai >= 70) return '#fa8c16';
    return '#f5222d';
  };

  const getNilaiGrade = (nilai: number) => {
    if (nilai >= 90) return 'A';
    if (nilai >= 80) return 'B';
    if (nilai >= 70) return 'C';
    if (nilai >= 60) return 'D';
    return 'E';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: getRaportNilaiColor(nilai) }}>
            {nilai}
          </span>
          <Tag color={getRaportNilaiColor(nilai)} style={{ fontSize: '12px', fontWeight: 'bold' }}>
            {getNilaiGrade(nilai)}
          </Tag>
        </div>
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
      <LayoutApp>
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
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #722ed1 0%, #9c27b0 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '120px',
            height: '120px',
            position: 'absolute',
            top: '-30px',
            right: '-30px'
          }} />
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            position: 'absolute',
            bottom: '-20px',
            left: '20px'
          }} />

          <Row align="middle" gutter={24}>
            <Col xs={24} md={16}>
              <Title level={1} style={{
                color: 'white',
                margin: 0,
                fontSize: '36px',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                <FileTextOutlined style={{ marginRight: 16 }} />
                Raport Saya
              </Title>
              <Paragraph style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '18px',
                margin: 0,
                fontWeight: '400'
              }}>
                Lihat hasil evaluasi dan pencapaian akademik Anda
              </Paragraph>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(10px)'
              }}>
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #eb2f96, #f759ab)',
                    marginBottom: '12px'
                  }}
                />
                <div style={{ fontSize: '16px', fontWeight: '600' }}>Santri Raport</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Data dari Guru</div>
              </div>
            </Col>
          </Row>
        </div>

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
                          background: 'linear-gradient(135deg, #722ed1, #9c27b0)',
                          boxShadow: '0 0 15px rgba(114, 46, 209, 0.4)'
                        }} />
                        <span style={{
                          background: 'linear-gradient(135deg, #722ed1 0%, #9c27b0 100%)',
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
                    background: 'linear-gradient(145deg, #ffffff 0%, #faf7ff 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  bodyStyle={{
                    padding: '32px',
                    background: 'transparent',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(114, 46, 209, 0.05), rgba(156, 39, 176, 0.03))',
                    zIndex: 1
                  }} />

                  {/* Overall Grade */}
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${getRaportNilaiColor(raport.nilaiAkhir)}, ${getRaportNilaiColor(raport.nilaiAkhir)}dd)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      boxShadow: `0 8px 24px ${getRaportNilaiColor(raport.nilaiAkhir)}40`
                    }}>
                      <div style={{ textAlign: 'center', color: 'white' }}>
                        <div style={{ fontSize: '32px', fontWeight: '900' }}>{raport.nilaiAkhir}</div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{getNilaiGrade(raport.nilaiAkhir)}</div>
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
                        background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(114, 46, 209, 0.1)'
                      }}>
                        <Text style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                          "{raport.catatan}"
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
                    background: 'linear-gradient(135deg, #fa8c16, #ffb347)',
                    boxShadow: '0 0 15px rgba(250, 140, 22, 0.4)'
                  }} />
                  <span style={{
                    background: 'linear-gradient(135deg, #fa8c16 0%, #ffb347 100%)',
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
                background: 'linear-gradient(145deg, #ffffff 0%, #fff8f0 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}
              bodyStyle={{
                padding: '32px',
                background: 'transparent',
                position: 'relative',
                zIndex: 2
              }}
            >
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(250, 140, 22, 0.05), rgba(255, 179, 71, 0.03))',
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
                            ? 'linear-gradient(135deg, #fff8f0 0%, #fff2e8 100%)'
                            : 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
                          border: `1px solid ${prestasi.validated ? 'rgba(250, 140, 22, 0.2)' : 'rgba(114, 46, 209, 0.2)'}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        bodyStyle={{ padding: '20px' }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: prestasi.validated ? '#52c41a' : '#fa8c16',
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
                            color: prestasi.validated ? '#fa8c16' : '#722ed1',
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
    </LayoutApp>
  );
}