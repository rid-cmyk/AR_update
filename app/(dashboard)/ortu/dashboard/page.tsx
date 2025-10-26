"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Timeline,
  Alert,
  Spin,
  Empty,
  Select,
  Typography,
  Space,
  Avatar,
  Divider
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  HeartOutlined,
  StarOutlined,
  TeamOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface Anak {
  id: number;
  namaLengkap: string;
  username: string;
  halaqah?: {
    id: number;
    namaHalaqah: string;
    guru: {
      namaLengkap: string;
    };
  };
}

interface HafalanProgress {
  totalSurat: number;
  totalAyat: number;
  progress: number;
  recentHafalan: Array<{
    id: number;
    surat: string;
    ayatMulai: number;
    ayatSelesai: number;
    tanggal: string;
    status: string;
  }>;
}

interface AbsensiSummary {
  totalHadir: number;
  totalIzin: number;
  totalAlpha: number;
  recentAbsensi: Array<{
    id: number;
    tanggal: string;
    status: string;
    jadwal: {
      hari: string;
      jamMulai: string;
      jamSelesai: string;
      halaqah: {
        namaHalaqah: string;
      };
    };
  }>;
}

interface Target {
  id: number;
  surat: string;
  ayatTarget: number;
  deadline: string;
  status: string;
  progress: number;
}

export default function OrtuDashboardPage() {
  const [anakList, setAnakList] = useState<Anak[]>([]);
  const [selectedAnak, setSelectedAnak] = useState<Anak | null>(null);
  const [hafalanProgress, setHafalanProgress] = useState<HafalanProgress | null>(null);
  const [absensiSummary, setAbsensiSummary] = useState<AbsensiSummary | null>(null);
  const [targetList, setTargetList] = useState<Target[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch anak list
  const fetchAnakList = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ortu/anak");
      if (res.ok) {
        const data = await res.json();
        setAnakList(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedAnak(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching anak list:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch hafalan progress
  const fetchHafalanProgress = async (anakId: number) => {
    try {
      const res = await fetch(`/api/ortu/hafalan-progress?anakId=${anakId}`);
      if (res.ok) {
        const data = await res.json();
        setHafalanProgress(data.data);
      }
    } catch (error) {
      console.error("Error fetching hafalan progress:", error);
    }
  };

  // Fetch absensi summary
  const fetchAbsensiSummary = async (anakId: number) => {
    try {
      const res = await fetch(`/api/ortu/absensi-summary?anakId=${anakId}`);
      if (res.ok) {
        const data = await res.json();
        setAbsensiSummary(data.data);
      }
    } catch (error) {
      console.error("Error fetching absensi summary:", error);
    }
  };

  // Fetch target list
  const fetchTargetList = async (anakId: number) => {
    try {
      const res = await fetch(`/api/ortu/target?anakId=${anakId}`);
      if (res.ok) {
        const data = await res.json();
        setTargetList(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching target list:", error);
    }
  };

  useEffect(() => {
    fetchAnakList();
  }, []);

  useEffect(() => {
    if (selectedAnak) {
      fetchHafalanProgress(selectedAnak.id);
      fetchAbsensiSummary(selectedAnak.id);
      fetchTargetList(selectedAnak.id);
    }
  }, [selectedAnak]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'masuk': return 'success';
      case 'izin': return 'warning';
      case 'alpha': return 'error';
      case 'selesai': return 'success';
      case 'proses': return 'processing';
      case 'belum': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'masuk': return 'Hadir';
      case 'izin': return 'Izin';
      case 'alpha': return 'Alpha';
      case 'selesai': return 'Selesai';
      case 'proses': return 'Progress';
      case 'belum': return 'Belum';
      default: return status;
    }
  };

  const recentHafalanColumns = [
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (tanggal: string) => dayjs(tanggal).format('DD/MM/YYYY'),
    },
    {
      title: "Surat",
      dataIndex: "surat",
      key: "surat",
    },
    {
      title: "Ayat",
      key: "ayat",
      render: (record: any) => `${record.ayatMulai}-${record.ayatSelesai}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === 'ziyadah' ? 'green' : 'blue'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
  ];

  const targetColumns = [
    {
      title: "Surat",
      dataIndex: "surat",
      key: "surat",
    },
    {
      title: "Target Ayat",
      dataIndex: "ayatTarget",
      key: "ayatTarget",
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: Target) => (
        <Progress 
          percent={record.progress} 
          size="small" 
          status={record.progress >= 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (deadline: string) => {
        const date = dayjs(deadline);
        const isOverdue = date.isBefore(dayjs());
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
            {date.format('DD/MM/YYYY')}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <LayoutApp>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      </LayoutApp>
    );
  }

  if (anakList.length === 0) {
    return (
      <LayoutApp>
        <div style={{ padding: "24px" }}>
          <Alert
            message="Tidak ada data anak"
            description="Belum ada anak yang terdaftar dalam sistem. Silakan hubungi admin untuk mendaftarkan anak Anda."
            type="info"
            showIcon
          />
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1400px', margin: '0 auto' }}>
        {/* Modern Header */}
        <div style={{ 
          marginBottom: 32,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            👨‍👩‍👧‍👦 Dashboard Orang Tua
          </div>
          <div style={{ 
            fontSize: '16px', 
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            💝 Pantau perkembangan hafalan dan kehadiran anak Anda dengan penuh kasih sayang
          </div>
        </div>

        {/* Anak Selection */}
        {anakList.length > 1 && (
          <Card style={{ 
            marginBottom: 24,
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e8e8e8'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              margin: '-24px -24px 20px -24px',
              padding: '20px',
              borderRadius: '12px 12px 0 0',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                👶 Pilih Anak yang Ingin Dipantau
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Klik pada kartu anak untuk melihat detail perkembangannya
              </div>
            </div>
            <Row gutter={[16, 16]}>
              {anakList.map((anak) => (
                <Col key={anak.id} xs={24} sm={12} md={8}>
                  <Card
                    hoverable
                    style={{
                      border: selectedAnak?.id === anak.id ? '3px solid #1890ff' : '2px solid #f0f0f0',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      background: selectedAnak?.id === anak.id ? '#f0f9ff' : 'white',
                      transform: selectedAnak?.id === anak.id ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: selectedAnak?.id === anak.id ? '0 8px 24px rgba(24,144,255,0.2)' : '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => setSelectedAnak(anak)}
                  >
                    <div style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: selectedAnak?.id === anak.id 
                          ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
                          : 'linear-gradient(135deg, #f0f0f0 0%, #d9d9d9 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px auto',
                        color: selectedAnak?.id === anak.id ? 'white' : '#666'
                      }}>
                        <UserOutlined style={{ fontSize: '24px' }} />
                      </div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '16px',
                        color: selectedAnak?.id === anak.id ? '#1890ff' : '#333',
                        marginBottom: '4px'
                      }}>
                        {anak.namaLengkap}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        @{anak.username}
                      </div>
                      {anak.halaqah && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#666',
                          backgroundColor: '#f5f5f5',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}>
                          📚 {anak.halaqah.namaHalaqah}
                        </div>
                      )}
                      {selectedAnak?.id === anak.id && (
                        <div style={{ 
                          marginTop: '8px',
                          color: '#1890ff',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          ✅ Terpilih
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {selectedAnak && (
          <>
            {/* Selected Anak Info */}
            <Card style={{ 
              marginBottom: 24,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e8e8e8',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)'
            }}>
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(24,144,255,0.3)'
                  }}>
                    <UserOutlined style={{ fontSize: '32px' }} />
                  </div>
                </Col>
                <Col flex={1}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    color: '#1890ff',
                    marginBottom: '4px'
                  }}>
                    {selectedAnak.namaLengkap}
                  </div>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    👤 Username: @{selectedAnak.username}
                  </div>
                  {selectedAnak.halaqah && (
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        backgroundColor: '#52c41a',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <BookOutlined />
                        {selectedAnak.halaqah.namaHalaqah}
                      </div>
                      <div style={{
                        backgroundColor: '#722ed1',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <TeamOutlined />
                        Guru: {selectedAnak.halaqah.guru.namaLengkap}
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
            </Card>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              <Col xs={24} sm={6}>
                <Card style={{ 
                  borderRadius: '12px',
                  border: '2px solid #1890ff',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                  boxShadow: '0 4px 12px rgba(24,144,255,0.15)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                      color: 'white'
                    }}>
                      <BookOutlined style={{ fontSize: '24px' }} />
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>
                      {hafalanProgress?.totalAyat || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                      📖 Total Hafalan Ayat
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card style={{ 
                  borderRadius: '12px',
                  border: '2px solid #52c41a',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                  boxShadow: '0 4px 12px rgba(82,196,26,0.15)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                      color: 'white'
                    }}>
                      <TrophyOutlined style={{ fontSize: '24px' }} />
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                      {hafalanProgress?.progress || 0}%
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                      🏆 Progress Hafalan
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card style={{ 
                  borderRadius: '12px',
                  border: '2px solid #52c41a',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                  boxShadow: '0 4px 12px rgba(82,196,26,0.15)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                      color: 'white'
                    }}>
                      <CheckCircleOutlined style={{ fontSize: '24px' }} />
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                      {absensiSummary?.totalHadir || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                      ✅ Total Kehadiran
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card style={{ 
                  borderRadius: '12px',
                  border: '2px solid #fa8c16',
                  background: 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)',
                  boxShadow: '0 4px 12px rgba(250,140,22,0.15)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                      color: 'white'
                    }}>
                      <CalendarOutlined style={{ fontSize: '24px' }} />
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fa8c16', marginBottom: '4px' }}>
                      {targetList.filter(t => t.status !== 'selesai').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                      🎯 Target Aktif
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Beautiful Activity Timeline */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              {/* Recent Hafalan */}
              <Col xs={24} lg={12}>
                <Card style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #e8e8e8',
                  height: '450px'
                }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    margin: '-24px -24px 20px -24px',
                    padding: '16px 24px',
                    borderRadius: '12px 12px 0 0',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOutlined />
                      📖 Hafalan Terbaru
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                      Progress hafalan Al-Quran terkini
                    </div>
                  </div>
                  
                  <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                    {hafalanProgress?.recentHafalan && hafalanProgress.recentHafalan.length > 0 ? (
                      <Timeline
                        items={hafalanProgress.recentHafalan.map((hafalan, index) => ({
                          color: hafalan.status === 'ziyadah' ? '#52c41a' : '#1890ff',
                          children: (
                            <div style={{ 
                              padding: '12px',
                              backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                              borderRadius: '8px',
                              marginBottom: '8px',
                              border: '1px solid #f0f0f0'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '8px'
                              }}>
                                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                                  📄 {hafalan.surat}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  {dayjs(hafalan.tanggal).format('DD/MM')}
                                </div>
                              </div>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                                📝 Ayat {hafalan.ayatMulai}-{hafalan.ayatSelesai}
                              </div>
                              <Tag 
                                color={hafalan.status === 'ziyadah' ? 'green' : 'blue'}
                                style={{ fontSize: '11px' }}
                              >
                                {hafalan.status === 'ziyadah' ? '🆕 Ziyadah' : '🔄 Murojaah'}
                              </Tag>
                            </div>
                          )
                        }))}
                      />
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '60px 20px',
                        color: '#999'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>Belum ada hafalan</div>
                        <div style={{ fontSize: '12px' }}>Hafalan terbaru akan muncul di sini</div>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Recent Absensi */}
              <Col xs={24} lg={12}>
                <Card style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #e8e8e8',
                  height: '450px'
                }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    margin: '-24px -24px 20px -24px',
                    padding: '16px 24px',
                    borderRadius: '12px 12px 0 0',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarOutlined />
                      📅 Kehadiran Terbaru
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                      Riwayat kehadiran di halaqah
                    </div>
                  </div>
                  
                  <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                    {absensiSummary?.recentAbsensi && absensiSummary.recentAbsensi.length > 0 ? (
                      <Timeline
                        items={absensiSummary.recentAbsensi.map((absensi, index) => ({
                          color: absensi.status === 'masuk' ? '#52c41a' : 
                                 absensi.status === 'izin' ? '#1890ff' : 
                                 absensi.status === 'sakit' ? '#fa8c16' : '#ff4d4f',
                          children: (
                            <div style={{ 
                              padding: '12px',
                              backgroundColor: index % 2 === 0 ? '#f9f9ff' : 'white',
                              borderRadius: '8px',
                              marginBottom: '8px',
                              border: '1px solid #f0f0f0'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '8px'
                              }}>
                                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                                  📅 {dayjs(absensi.tanggal).format('DD/MM/YYYY')}
                                </div>
                                <Tag 
                                  color={absensi.status === 'masuk' ? 'green' : 
                                         absensi.status === 'izin' ? 'blue' : 
                                         absensi.status === 'sakit' ? 'orange' : 'red'}
                                  style={{ fontSize: '11px' }}
                                >
                                  {absensi.status === 'masuk' ? '✅ Hadir' : 
                                   absensi.status === 'izin' ? '📝 Izin' : 
                                   absensi.status === 'sakit' ? '🤒 Sakit' : '❌ Alpha'}
                                </Tag>
                              </div>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                🕐 {absensi.jadwal.hari} {absensi.jadwal.jamMulai}-{absensi.jadwal.jamSelesai}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                📚 {absensi.jadwal.halaqah.namaHalaqah}
                              </div>
                            </div>
                          )
                        }))}
                      />
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '60px 20px',
                        color: '#999'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>Belum ada data absensi</div>
                        <div style={{ fontSize: '12px' }}>Riwayat kehadiran akan muncul di sini</div>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Target Hafalan */}
            {targetList.length > 0 && (
              <Card title="Target Hafalan" style={{ marginTop: 16 }}>
                <Table
                  columns={targetColumns}
                  dataSource={targetList}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            )}
          </>
        )}
      </div>
    </LayoutApp>
  );
}