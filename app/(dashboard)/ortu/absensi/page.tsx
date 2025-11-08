"use client";

import React, { useEffect, useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Spin, 
  Select, 
  DatePicker, 
  Space, 
  Progress, 
  Statistic,
  Typography,
  Timeline,
  Empty
} from "antd";
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined,
  HeartOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import OrtuPageHeader from "@/components/ortu/OrtuPageHeader";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface AbsensiData {
  id: number;
  status: string;
  tanggal: string;
  catatan?: string;
  santri: {
    namaLengkap: string;
    username: string;
  };
  jadwal: {
    halaqah: {
      namaHalaqah: string;
    };
  };
}

interface ChildAttendanceStats {
  namaLengkap: string;
  totalKehadiran: number;
  totalIzin: number;
  totalAlpha: number;
  totalSakit: number;
  totalAbsensi: number;
  persentaseKehadiran: number;
  persentaseAlpha: number;
  streakHadir: number;
  bulanIni: {
    hadir: number;
    izin: number;
    alpha: number;
    sakit: number;
  };
  semesterIni: {
    hadir: number;
    izin: number;
    alpha: number;
    sakit: number;
  };
}

export default function AbsensiAnak() {
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [childStats, setChildStats] = useState<ChildAttendanceStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string>(""); // Will be set to first child
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  // Fetch attendance data
  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ortu/dashboard");
      const data = await res.json();
      
      if (!data.success && data.success !== undefined) {
        throw new Error(data.error || "Failed to fetch attendance data");
      }

      // Transform data for display
      const transformedData: AbsensiData[] = [];
      const stats: ChildAttendanceStats[] = [];

      data.anakList?.forEach((anak: any) => {
        // Collect attendance data
        anak.Absensi?.forEach((absensi: any) => {
          transformedData.push({
            id: absensi.id,
            status: absensi.status,
            tanggal: absensi.tanggal,
            catatan: absensi.catatan,
            santri: {
              namaLengkap: anak.namaLengkap,
              username: anak.username,
            },
            jadwal: absensi.jadwal,
          });
        });

        // Calculate detailed attendance stats
        const absensiList = anak.Absensi || [];
        const totalAbsensi = absensiList.length;
        
        // Count by status
        const totalKehadiran = absensiList.filter((a: any) => a.status === 'masuk' || a.status === 'hadir').length;
        const totalIzin = absensiList.filter((a: any) => a.status === 'izin').length;
        const totalAlpha = absensiList.filter((a: any) => a.status === 'alpha').length;
        const totalSakit = absensiList.filter((a: any) => a.status === 'sakit').length;
        
        // Calculate percentages
        const persentaseKehadiran = totalAbsensi > 0 ? Math.round((totalKehadiran / totalAbsensi) * 100) : 0;
        const persentaseAlpha = totalAbsensi > 0 ? Math.round((totalAlpha / totalAbsensi) * 100) : 0;

        // Calculate current month stats
        const currentMonth = dayjs();
        const bulanIniData = absensiList.filter((a: any) => 
          dayjs(a.tanggal).isSame(currentMonth, 'month')
        );
        
        const bulanIni = {
          hadir: bulanIniData.filter((a: any) => a.status === 'masuk' || a.status === 'hadir').length,
          izin: bulanIniData.filter((a: any) => a.status === 'izin').length,
          alpha: bulanIniData.filter((a: any) => a.status === 'alpha').length,
          sakit: bulanIniData.filter((a: any) => a.status === 'sakit').length,
        };

        // Calculate semester stats (last 6 months)
        const semesterStart = dayjs().subtract(6, 'month');
        const semesterData = absensiList.filter((a: any) => 
          dayjs(a.tanggal).isAfter(semesterStart)
        );
        
        const semesterIni = {
          hadir: semesterData.filter((a: any) => a.status === 'masuk' || a.status === 'hadir').length,
          izin: semesterData.filter((a: any) => a.status === 'izin').length,
          alpha: semesterData.filter((a: any) => a.status === 'alpha').length,
          sakit: semesterData.filter((a: any) => a.status === 'sakit').length,
        };

        // Calculate attendance streak
        const sortedAbsensi = absensiList
          .sort((a: any, b: any) => dayjs(b.tanggal).unix() - dayjs(a.tanggal).unix());
        
        let streakHadir = 0;
        for (const absensi of sortedAbsensi) {
          if (absensi.status === 'masuk' || absensi.status === 'hadir') {
            streakHadir++;
          } else {
            break;
          }
        }

        stats.push({
          namaLengkap: anak.namaLengkap,
          totalKehadiran,
          totalIzin,
          totalAlpha,
          totalSakit,
          totalAbsensi,
          persentaseKehadiran,
          persentaseAlpha,
          streakHadir,
          bulanIni,
          semesterIni,
        });
      });

      setAbsensiData(transformedData);
      setChildStats(stats);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      // Set mock data for demo
      setAbsensiData([
        {
          id: 1,
          status: "hadir",
          tanggal: "2024-01-15",
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
          jadwal: { halaqah: { namaHalaqah: "Halaqah Al-Fatihah" } },
        },
        {
          id: 2,
          status: "hadir",
          tanggal: "2024-01-16",
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
          jadwal: { halaqah: { namaHalaqah: "Halaqah Al-Fatihah" } },
        },
        {
          id: 3,
          status: "sakit",
          tanggal: "2024-01-17",
          catatan: "Demam",
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
          jadwal: { halaqah: { namaHalaqah: "Halaqah Al-Fatihah" } },
        },
      ]);

      setChildStats([
        {
          namaLengkap: "Ahmad",
          totalKehadiran: 45,
          totalIzin: 3,
          totalAlpha: 2,
          totalSakit: 1,
          totalAbsensi: 51,
          persentaseKehadiran: 88,
          persentaseAlpha: 4,
          streakHadir: 7,
          bulanIni: {
            hadir: 12,
            izin: 1,
            alpha: 0,
            sakit: 0,
          },
          semesterIni: {
            hadir: 45,
            izin: 3,
            alpha: 2,
            sakit: 1,
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique children for filter - use childStats instead of absensiData
  const children = childStats.map(child => child.namaLengkap);

  // Filter data based on selected child and month
  const filteredData = absensiData.filter((item) => {
    const matchesChild = !selectedChild || item.santri.namaLengkap === selectedChild;
    const itemMonth = dayjs(item.tanggal);
    const matchesMonth = itemMonth.isSame(selectedMonth, 'month');
    return matchesChild && matchesMonth;
  });

  // Calculate filtered stats based on selected month and child
  const filteredStats = childStats
    .filter(child => !selectedChild || child.namaLengkap === selectedChild)
    .map(child => {
      // Filter absensi data for this child and selected month
      const childAbsensiData = absensiData.filter(item => 
        item.santri.namaLengkap === child.namaLengkap &&
        dayjs(item.tanggal).isSame(selectedMonth, 'month')
      );

      const totalAbsensi = childAbsensiData.length;
      const totalKehadiran = childAbsensiData.filter(a => a.status === 'masuk' || a.status === 'hadir').length;
      const totalIzin = childAbsensiData.filter(a => a.status === 'izin').length;
      const totalAlpha = childAbsensiData.filter(a => a.status === 'alpha').length;
      const totalSakit = childAbsensiData.filter(a => a.status === 'sakit').length;
      const persentaseKehadiran = totalAbsensi > 0 ? Math.round((totalKehadiran / totalAbsensi) * 100) : 0;

      // Calculate streak for selected month
      const sortedAbsensi = childAbsensiData
        .sort((a, b) => dayjs(b.tanggal).unix() - dayjs(a.tanggal).unix());
      
      let streakHadir = 0;
      for (const absensi of sortedAbsensi) {
        if (absensi.status === 'masuk' || absensi.status === 'hadir') {
          streakHadir++;
        } else {
          break;
        }
      }

      return {
        namaLengkap: child.namaLengkap,
        totalKehadiran,
        totalIzin,
        totalAlpha,
        totalSakit,
        totalAbsensi,
        persentaseKehadiran,
        persentaseAlpha: totalAbsensi > 0 ? Math.round((totalAlpha / totalAbsensi) * 100) : 0,
        streakHadir,
        bulanIni: child.bulanIni,
        semesterIni: child.semesterIni,
      };
    });

  useEffect(() => {
    fetchAbsensiData();
  }, []);

  // Set default selected child to first child when data loads
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    }
  }, [children, selectedChild]);

  // Debug: Log children data
  useEffect(() => {
    console.log('👶 Children data:', children);
    console.log('📊 Child stats:', childStats);
    console.log('📋 Absensi data:', absensiData.length);
    console.log('🎯 Selected child:', selectedChild);
  }, [children.length, childStats.length, absensiData.length, selectedChild]);

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
      sorter: (a: AbsensiData, b: AbsensiData) => dayjs(a.tanggal).unix() - dayjs(b.tanggal).unix(),
    },
    {
      title: "Halaqah",
      dataIndex: ["jadwal", "halaqah", "namaHalaqah"],
      key: "halaqah",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig = {
          hadir: { color: "green", icon: <CheckCircleOutlined />, text: "Hadir" },
          sakit: { color: "orange", icon: <CloseCircleOutlined />, text: "Sakit" },
          izin: { color: "blue", icon: <ClockCircleOutlined />, text: "Izin" },
          alpha: { color: "red", icon: <CloseCircleOutlined />, text: "Alpha" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.alpha;
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      },
    },
    {
      title: "Catatan",
      dataIndex: "catatan",
      key: "catatan",
      render: (catatan: string) => catatan || "-",
    },
  ];

  return (
    <LayoutApp>
      <div style={{ 
        padding: "24px", 
        maxWidth: '1400px', 
        margin: '0 auto',
        background: 'linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%)',
        minHeight: '100vh'
      }}>
        <OrtuPageHeader
          title="Kehadiran Anak"
          subtitle="📅 Pantau kedisiplinan dan kehadiran anak di halaqah dengan penuh perhatian"
          icon="📊"
          badge={{
            text: `👨‍👩‍👧‍👦 ${children.length} Anak Terdaftar`,
            show: children.length > 1
          }}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280' }}>Memuat data absensi...</p>
          </div>
        ) : (
          <>
            {/* Filters - MOVED TO TOP */}
            <Card 
              title={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <CalendarOutlined style={{ fontSize: '20px' }} />
                  </div>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Filter Data Absensi
                  </span>
                </div>
              }
              style={{ 
                marginBottom: 24,
                borderRadius: '16px',
                border: '2px solid #e6e6fa',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)'
              }}
            >
              <Space size="large" wrap>
                {/* Show dropdown if there are children */}
                {children.length > 0 && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: 8, 
                      fontWeight: 'bold',
                      color: '#1890ff'
                    }}>
                      👶 Pilih Anak:
                    </label>
                    {children.length > 1 ? (
                      <Select
                        value={selectedChild}
                        onChange={setSelectedChild}
                        style={{ width: 250 }}
                        placeholder="Pilih anak"
                        size="large"
                      >
                        {children.map(child => (
                          <Select.Option key={child} value={child}>
                            <UserOutlined /> {child}
                          </Select.Option>
                        ))}
                      </Select>
                    ) : (
                      <div style={{
                        padding: '8px 16px',
                        backgroundColor: '#e6f7ff',
                        border: '1px solid #91d5ff',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#0050b3',
                        minWidth: '250px'
                      }}>
                        <UserOutlined /> {children[0]}
                      </div>
                    )}
                  </div>
                )}
                {children.length === 0 && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                      👶 Anak:
                    </label>
                    <div style={{
                      padding: '8px 16px',
                      backgroundColor: '#fff7e6',
                      border: '1px solid #ffd591',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#d46b08'
                    }}>
                      Belum ada data anak
                    </div>
                  </div>
                )}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: 'bold',
                    color: '#1890ff'
                  }}>
                    📅 Pilih Bulan:
                  </label>
                  <DatePicker
                    value={selectedMonth}
                    onChange={(date) => setSelectedMonth(date || dayjs())}
                    picker="month"
                    style={{ width: 200 }}
                    placeholder="Pilih bulan"
                    size="large"
                    format="MMMM YYYY"
                  />
                </div>
              </Space>
            </Card>

            {/* Info Card - Selected Filters */}
            {selectedChild && (
              <Card style={{ 
                marginBottom: 24,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '32px',
                  flexWrap: 'wrap',
                  padding: '8px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <UserOutlined style={{ fontSize: '18px' }} />
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '2px'
                      }}>
                        Anak
                      </div>
                      <div style={{ 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {selectedChild}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <CalendarOutlined style={{ fontSize: '18px' }} />
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '2px'
                      }}>
                        Periode
                      </div>
                      <div style={{ 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {selectedMonth.format('MMMM YYYY')}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Detailed Statistics Cards - Filtered by Month */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              {filteredStats.map((child, index) => (
                <React.Fragment key={index}>
                  {/* Kehadiran Card */}
                  <Col xs={24} sm={12} md={6}>
                    <Card style={{ 
                      textAlign: 'center',
                      borderRadius: '16px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                      boxShadow: '0 8px 24px rgba(82,196,26,0.25)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(82,196,26,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(82,196,26,0.25)';
                    }}>
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <CheckCircleOutlined style={{ fontSize: '32px' }} />
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                        {child.totalKehadiran}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                        ✅ Hadir
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                        Dari {child.totalAbsensi} total hari
                      </div>
                    </Card>
                  </Col>

                  {/* Alpha Card */}
                  <Col xs={24} sm={12} md={6}>
                    <Card style={{ 
                      textAlign: 'center',
                      borderRadius: '16px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                      boxShadow: '0 8px 24px rgba(255,77,79,0.25)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,77,79,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,77,79,0.25)';
                    }}>
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <CloseCircleOutlined style={{ fontSize: '32px' }} />
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                        {child.totalAlpha}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                        ❌ Alpha
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                        Perlu perhatian khusus
                      </div>
                    </Card>
                  </Col>

                  {/* Izin Card */}
                  <Col xs={24} sm={12} md={6}>
                    <Card style={{ 
                      textAlign: 'center',
                      borderRadius: '16px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                      boxShadow: '0 8px 24px rgba(24,144,255,0.25)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(24,144,255,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(24,144,255,0.25)';
                    }}>
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <ClockCircleOutlined style={{ fontSize: '32px' }} />
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                        {child.totalIzin}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                        📝 Izin
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                        Dengan keterangan
                      </div>
                    </Card>
                  </Col>

                  {/* Sakit Card */}
                  <Col xs={24} sm={12} md={6}>
                    <Card style={{ 
                      textAlign: 'center',
                      borderRadius: '16px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
                      boxShadow: '0 8px 24px rgba(250,140,22,0.25)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(250,140,22,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(250,140,22,0.25)';
                    }}>
                      <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <HeartOutlined style={{ fontSize: '32px' }} />
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                        {child.totalSakit}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                        🤒 Sakit
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                        Kondisi tidak sehat
                      </div>
                    </Card>
                  </Col>
                </React.Fragment>
              ))}
            </Row>

            {/* Semester Summary */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              {childStats
                .filter(child => !selectedChild || child.namaLengkap === selectedChild)
                .map((child, index) => (
                <Col xs={24} key={index}>
                  <Card style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e8e8e8'
                  }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                      margin: '-24px -24px 20px -24px',
                      padding: '20px',
                      borderRadius: '12px 12px 0 0',
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                        📊 Ringkasan Kehadiran {child.namaLengkap}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        Statistik lengkap semester ini
                      </div>
                    </div>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <div style={{ 
                          padding: '16px',
                          backgroundColor: '#f0f9ff',
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff', marginBottom: '12px' }}>
                            📅 Bulan Ini ({dayjs().format('MMMM YYYY')})
                          </div>
                          <Row gutter={[8, 8]}>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                                  {child.bulanIni.hadir}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Hadir</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
                                  {child.bulanIni.alpha}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Alpha</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                                  {child.bulanIni.izin}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Izin</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                                  {child.bulanIni.sakit}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Sakit</div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </Col>

                      <Col xs={24} md={12}>
                        <div style={{ 
                          padding: '16px',
                          backgroundColor: '#f6ffed',
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a', marginBottom: '12px' }}>
                            📈 Semester Ini (6 Bulan Terakhir)
                          </div>
                          <Row gutter={[8, 8]}>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                                  {child.semesterIni.hadir}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Hadir</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
                                  {child.semesterIni.alpha}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Alpha</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                                  {child.semesterIni.izin}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Izin</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                                  {child.semesterIni.sakit}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Sakit</div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>

                    {/* Achievement Badge */}
                    <div style={{ 
                      textAlign: 'center',
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                        🏆 Pencapaian Kehadiran
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{
                          padding: '8px 16px',
                          backgroundColor: child.totalKehadiran >= 40 ? '#52c41a' : child.totalKehadiran >= 30 ? '#fa8c16' : '#ff4d4f',
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          📊 {child.totalKehadiran} Hari Hadir
                        </div>
                        <div style={{
                          padding: '8px 16px',
                          backgroundColor: '#1890ff',
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          🔥 Streak {child.streakHadir} hari
                        </div>
                        {child.totalAlpha <= 2 && (
                          <div style={{
                            padding: '8px 16px',
                            backgroundColor: '#722ed1',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            ⭐ Alpha Rendah
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Progress Overview - Filtered by Month */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {filteredStats.map((child, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card title={`🎯 Kehadiran ${child.namaLengkap}`} variant="borderless">
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Progress
                        type="circle"
                        percent={child.persentaseKehadiran}
                        format={(percent) => `${percent}%`}
                        strokeColor="#1890ff"
                        size={100}
                      />
                      <p style={{ marginTop: 16, color: '#666', fontSize: '14px' }}>
                        Persentase kehadiran bulan ini
                      </p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Attendance Table */}
            <Card title="📋 Detail Absensi" variant="borderless">
              {filteredData.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Tidak ada data absensi
                      </div>
                      <div style={{ color: '#666' }}>
                        {selectedChild 
                          ? `Belum ada data absensi untuk ${selectedChild} pada ${selectedMonth.format('MMMM YYYY')}`
                          : `Belum ada data absensi pada ${selectedMonth.format('MMMM YYYY')}`
                        }
                      </div>
                    </div>
                  }
                  style={{ padding: '60px 20px' }}
                />
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} dari ${total} absensi`,
                  }}
                  scroll={{ x: 800 }}
                />
              )}
            </Card>
          </>
        )}
      </div>
    </LayoutApp>
  );
}