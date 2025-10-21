   "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Typography,
  List,
  Avatar,
  Tag,
  Button,
  Space,
  Select,
  Empty,
  Spin
} from "antd";
import {
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  UserOutlined,
  AimOutlined,
  LineChartOutlined,
  FilterOutlined,
  StarOutlined,
  TeamOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, BarChart, Bar } from "recharts";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface HafalanProgress {
  date: string;
  ziyadah: number;
  murajaah: number;
  total: number;
}

interface RecentHafalan {
  id: number;
  tanggal: string;
  jenis: 'ziyadah' | 'murajaah';
  surah: string;
  ayat: string;
  guru: string;
}

interface TargetHafalan {
  id: number;
  judul: string;
  deskripsi: string;
  targetAyat: number;
  currentAyat: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  kategori: 'ziyadah' | 'murajaah';
}

interface HalaqahInfo {
  namaHalaqah: string;
  guru: string;
  jadwal: Array<{
    id: number;
    hari: string;
    waktuMulai: string;
    waktuSelesai: string;
    materi: string | null;
  }>;
}

export default function SantriDashboard() {
  const router = useRouter();
  const [hafalanProgress, setHafalanProgress] = useState<HafalanProgress[]>([]);
  const [recentHafalan, setRecentHafalan] = useState<RecentHafalan[]>([]);
  const [targets, setTargets] = useState<TargetHafalan[]>([]);
  const [halaqahInfo, setHalaqahInfo] = useState<HalaqahInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterJenis, setFilterJenis] = useState<string>('all');

  // Mock data - data yang diinput oleh guru
  const mockProgressData: HafalanProgress[] = [
    { date: '2024-01-01', ziyadah: 5, murajaah: 10, total: 15 },
    { date: '2024-01-02', ziyadah: 3, murajaah: 12, total: 15 },
    { date: '2024-01-03', ziyadah: 7, murajaah: 8, total: 15 },
    { date: '2024-01-04', ziyadah: 4, murajaah: 11, total: 15 },
    { date: '2024-01-05', ziyadah: 6, murajaah: 9, total: 15 },
    { date: '2024-01-06', ziyadah: 8, murajaah: 7, total: 15 },
    { date: '2024-01-07', ziyadah: 5, murajaah: 10, total: 15 },
  ];

  const mockRecentHafalan: RecentHafalan[] = [
    {
      id: 1,
      tanggal: '2024-01-07',
      jenis: 'ziyadah',
      surah: 'Al-Baqarah',
      ayat: '1-5',
      guru: 'Ustadz Ahmad'
    },
    {
      id: 2,
      tanggal: '2024-01-07',
      jenis: 'murajaah',
      surah: 'Al-Fatihah',
      ayat: '1-7',
      guru: 'Ustadz Ahmad'
    },
    {
      id: 3,
      tanggal: '2024-01-06',
      jenis: 'ziyadah',
      surah: 'Al-Baqarah',
      ayat: '6-10',
      guru: 'Ustadz Ahmad'
    },
    {
      id: 4,
      tanggal: '2024-01-05',
      jenis: 'murajaah',
      surah: 'An-Nas',
      ayat: '1-6',
      guru: 'Ustadz Ahmad'
    }
  ];

  const mockTargets: TargetHafalan[] = [
    {
      id: 1,
      judul: 'Hafal Juz 1 Lengkap',
      deskripsi: 'Target hafalan Juz 1 dari Al-Fatihah sampai Al-Baqarah ayat 141',
      targetAyat: 148,
      currentAyat: 111,
      deadline: '2024-02-01',
      status: 'active',
      kategori: 'ziyadah'
    },
    {
      id: 2,
      judul: 'Muraja\'ah Juz 30',
      deskripsi: 'Mengulang dan memantapkan hafalan Juz 30 (Juz Amma)',
      targetAyat: 564,
      currentAyat: 508,
      deadline: '2024-01-15',
      status: 'active',
      kategori: 'murajaah'
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

        setHafalanProgress(data.hafalanProgress || []);
        setRecentHafalan(data.recentHafalan || []);
        setTargets(data.targets || []);
        setHalaqahInfo(data.halaqahInfo || null);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data if API fails
        setHafalanProgress(mockProgressData);
        setRecentHafalan(mockRecentHafalan);
        setTargets(mockTargets);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const getJenisColor = (jenis: string) => {
    return jenis === 'ziyadah' ? '#4A90E2' : '#50E3C2';
  };

  const getJenisIcon = (jenis: string) => {
    return jenis === 'ziyadah' ? <FireOutlined /> : <BookOutlined />;
  };

  // Filter hafalan berdasarkan jenis
  const filteredHafalan = filterJenis === 'all'
    ? recentHafalan
    : recentHafalan.filter(h => h.jenis === filterJenis);

  // Calculate statistics
  const totalSetoran = recentHafalan.length;
  const activeTargets = targets.filter(t => t.status === 'active').length;
  const totalTargetProgress = targets.length > 0
    ? Math.round(targets.reduce((sum, t) => sum + (t.currentAyat / t.targetAyat * 100), 0) / targets.length)
    : 0;

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
          <Text type="secondary">Memuat data hafalan Anda...</Text>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
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
                <BookOutlined style={{ marginRight: 16 }} />
                Dashboard Santri
              </Title>
              <Paragraph style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '18px',
                margin: 0,
                fontWeight: '400'
              }}>
                Pantau progres hafalan dan pencapaian target yang telah diinput oleh guru Anda
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
                    background: 'linear-gradient(135deg, #50E3C2, #4ECDC4)',
                    marginBottom: '12px'
                  }}
                />
                <div style={{ fontSize: '16px', fontWeight: '600' }}>Santri Dashboard</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Data dari Guru</div>
              </div>
            </Col>
          </Row>
        </div>


        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Setoran"
                value={totalSetoran}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Target Aktif"
                value={activeTargets}
                prefix={<AimOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Progress Target"
                value={totalTargetProgress}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: totalTargetProgress >= 80 ? "#52c41a" : "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Hafalan Rate"
                value={hafalanProgress.length > 0 ? Math.round(hafalanProgress.reduce((sum, day) => sum + day.total, 0) / Math.max(hafalanProgress.length, 1)) : 0}
                suffix="%"
                prefix={<BookOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Achievement"
                value={totalSetoran >= 10 ? 100 : totalSetoran >= 5 ? 75 : totalSetoran >= 1 ? 50 : 0}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Streak Days"
                value={hafalanProgress.filter(day => day.total > 0).length}
                prefix={<FireOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Halaqah Information */}
        {halaqahInfo ? (
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    <span>Informasi Halaqah Anda</span>
                  </div>
                }
                variant="outlined"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12} lg={8}>
                    <Card
                      size="small"
                      title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <BookOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                          <span style={{ fontSize: '14px' }}>{halaqahInfo.namaHalaqah}</span>
                        </div>
                      }
                      variant="outlined"
                    >
                      <div style={{ marginBottom: 12 }}>
                        <Text strong style={{ color: '#1890ff' }}>
                          Guru: {halaqahInfo.guru}
                        </Text>
                      </div>

                      {halaqahInfo.jadwal && halaqahInfo.jadwal.length > 0 && (
                        <div>
                          <Text style={{ fontSize: '12px', color: '#666', marginBottom: 8, display: 'block' }}>
                            Jadwal Halaqah:
                          </Text>
                          <List
                            size="small"
                            dataSource={halaqahInfo.jadwal.slice(0, 3)}
                            renderItem={(jadwal) => (
                              <List.Item style={{ padding: '4px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarOutlined style={{ fontSize: '12px', color: '#1890ff', marginRight: 8 }} />
                                  <div>
                                    <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                      {jadwal.hari}
                                    </Text>
                                    <br />
                                    <Text style={{ fontSize: '11px', color: '#999' }}>
                                      {jadwal.waktuMulai} - {jadwal.waktuSelesai}
                                      {jadwal.materi && ` • ${jadwal.materi}`}
                                    </Text>
                                  </div>
                                </div>
                              </List.Item>
                            )}
                          />
                          {halaqahInfo.jadwal.length > 3 && (
                            <Text style={{ fontSize: '11px', color: '#999' }}>
                              +{halaqahInfo.jadwal.length - 3} jadwal lainnya
                            </Text>
                          )}
                        </div>
                      )}
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    <span>Informasi Halaqah Anda</span>
                  </div>
                }
                variant="outlined"
              >
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">Belum ada halaqah yang ditugaskan</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Admin akan menugaskan Anda ke halaqah
                      </Text>
                    </div>
                  }
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Aksi Cepat"
              variant="outlined"
            >
              <div style={{ marginBottom: 16 }}>
                <BookOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                <Text strong>Lihat Hafalan:</Text>
                <br />
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Pantau perkembangan hafalan Anda
                </Text>
              </div>
              <div style={{ marginBottom: 16 }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text strong>Lihat Absensi:</Text>
                <br />
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Cek kehadiran Anda di halaqah
                </Text>
              </div>
              <div>
                <ClockCircleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                <Text strong>Lihat Target:</Text>
                <br />
                <Text style={{ color: '#666', fontSize: '14px' }}>
                  Pantau progress target hafalan
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Status Hafalan"
              variant="outlined"
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <BookOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                <span>Total Setoran: <strong>{totalSetoran}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <AimOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                <span>Target Aktif: <strong>{activeTargets}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <CheckCircleOutlined style={{ color: "#fa8c16", marginRight: 8 }} />
                <span>Progress Target: <strong>{totalTargetProgress}%</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FireOutlined style={{ color: "#eb2f96", marginRight: 8 }} />
                <span>Streak Days: <strong>{hafalanProgress.filter(day => day.total > 0).length}</strong></span>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row gutter={[32, 32]}>
          {/* Progress Chart */}
          <Col xs={24} xl={14}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4A90E2, #357ABD)',
                    boxShadow: '0 0 15px rgba(74, 144, 226, 0.4)'
                  }} />
                  <span style={{
                    background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '-0.3px'
                  }}>
                    📊 Grafik Progress Hafalan
                  </span>
                  <Tag
                    color="blue"
                    style={{
                      marginLeft: 'auto',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '4px 12px',
                      borderRadius: '20px'
                    }}
                  >
                    7 Hari Terakhir
                  </Tag>
                </div>
              }
              style={{
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(74, 144, 226, 0.08)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
              bodyStyle={{
                padding: '40px',
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
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.05), rgba(53, 122, 189, 0.03))',
                zIndex: 1
              }} />
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={hafalanProgress} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => dayjs(value).format('DD/MM')}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                    labelFormatter={(value) => `Tanggal: ${dayjs(value).format('DD/MM/YYYY')}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="ziyadah"
                    stroke="#4A90E2"
                    strokeWidth={4}
                    name="Ziyadah"
                    dot={{ fill: '#4A90E2', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#4A90E2', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="murajaah"
                    stroke="#50E3C2"
                    strokeWidth={4}
                    name="Murajaah"
                    dot={{ fill: '#50E3C2', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#50E3C2', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4A90E2' }} />
                  <Text style={{ fontSize: '14px', color: '#666' }}>Ziyadah</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#50E3C2' }} />
                  <Text style={{ fontSize: '14px', color: '#666' }}>Murajaah</Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Target Progress & Recent Activity */}
          <Col xs={24} xl={10}>
            {/* Target Progress */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00B894, #00CEC9)',
                    boxShadow: '0 0 15px rgba(0, 184, 148, 0.4)'
                  }} />
                  <span style={{
                    background: 'linear-gradient(135deg, #00B894 0%, #00CEC9 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '-0.3px'
                  }}>
                    🎯 Target Hafalan Aktif
                  </span>
                </div>
              }
              style={{
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 184, 148, 0.08)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden'
              }}
              bodyStyle={{
                padding: '32px',
                background: 'transparent',
                position: 'relative',
                zIndex: 2
              }}
              extra={
                <Button
                  type="link"
                  onClick={() => router.push('/santri/target-hafalan')}
                  style={{
                    color: '#00B894',
                    fontWeight: '700',
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover:bg-green-50"
                >
                  Lihat Detail →
                </Button>
              }
            >
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.05), rgba(0, 206, 201, 0.03))',
                zIndex: 1
              }} />
              {targets.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {targets.slice(0, 2).map((target) => {
                    const progress = Math.round((target.currentAyat / target.targetAyat) * 100);
                    const daysLeft = dayjs(target.deadline).diff(dayjs(), 'day');

                    return (
                      <div key={target.id} style={{
                        background: 'linear-gradient(135deg, #f8fffe 0%, #f0f9f8 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(0, 184, 148, 0.1)'
                      }}>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <Text strong style={{ fontSize: '14px', color: '#333' }}>
                              {target.judul}
                            </Text>
                            <Tag
                              color={target.status === 'active' ? 'green' : 'orange'}
                              style={{ fontSize: '11px' }}
                            >
                              {target.status === 'active' ? 'Aktif' : 'Selesai'}
                            </Tag>
                          </div>
                          <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                            {target.deskripsi}
                          </Text>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <Text style={{ fontSize: '12px', color: '#666' }}>
                              {target.currentAyat} / {target.targetAyat} ayat
                            </Text>
                            <Text style={{ fontSize: '12px', color: '#00B894', fontWeight: '600' }}>
                              {progress}%
                            </Text>
                          </div>
                          <Progress
                            percent={progress}
                            strokeColor={{
                              '0%': '#00B894',
                              '100%': '#00CEC9',
                            }}
                            size="small"
                            showInfo={false}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: '11px', color: '#999' }}>
                            <CalendarOutlined style={{ marginRight: '4px' }} />
                            Deadline: {dayjs(target.deadline).format('DD/MM/YYYY')}
                          </Text>
                          <Text style={{
                            fontSize: '11px',
                            color: daysLeft < 0 ? '#f5222d' : daysLeft <= 7 ? '#fa8c16' : '#00B894',
                            fontWeight: '600'
                          }}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)} hari terlambat` :
                             daysLeft === 0 ? 'Hari ini' :
                             `${daysLeft} hari lagi`}
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </Space>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">Belum ada target hafalan</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Target akan diinput oleh guru Anda
                      </Text>
                    </div>
                  }
                />
              )}
            </Card>

            {/* Recent Activity */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #50E3C2, #4ECDC4)',
                    boxShadow: '0 0 15px rgba(80, 227, 194, 0.4)'
                  }} />
                  <span style={{
                    background: 'linear-gradient(135deg, #50E3C2 0%, #4ECDC4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '-0.3px'
                  }}>
                    📚 Setoran Terbaru
                  </span>
                  <Select
                    value={filterJenis}
                    onChange={setFilterJenis}
                    size="small"
                    style={{
                      width: '130px',
                      marginLeft: 'auto',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    <Option value="all">Semua</Option>
                    <Option value="ziyadah">Ziyadah</Option>
                    <Option value="murajaah">Murajaah</Option>
                  </Select>
                </div>
              }
              style={{
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(80, 227, 194, 0.08)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}
              bodyStyle={{
                padding: '32px',
                background: 'transparent',
                position: 'relative',
                zIndex: 2
              }}
              extra={
                <Button
                  type="link"
                  onClick={() => router.push('/santri/rekap-hafalan')}
                  style={{
                    color: '#50E3C2',
                    fontWeight: '700',
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover:bg-green-50"
                >
                  Lihat Semua →
                </Button>
              }
            >
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(80, 227, 194, 0.05), rgba(78, 205, 196, 0.03))',
                zIndex: 1
              }} />
              {filteredHafalan.length > 0 ? (
                <List
                  dataSource={filteredHafalan.slice(0, 5)}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        padding: '16px 0',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: '12px',
                              background: `linear-gradient(135deg, ${getJenisColor(item.jenis)}, ${getJenisColor(item.jenis)}dd)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '16px',
                              boxShadow: `0 4px 12px ${getJenisColor(item.jenis)}40`
                            }}
                          >
                            {getJenisIcon(item.jenis)}
                          </div>
                        }
                        title={
                          <div>
                            <Text strong style={{ fontSize: '15px', color: '#333' }}>
                              {item.surah} <Text type="secondary">({item.ayat})</Text>
                            </Text>
                            <div style={{ marginTop: '4px' }}>
                              <Tag
                                color={item.jenis === 'ziyadah' ? 'blue' : 'cyan'}
                                style={{ fontSize: '11px' }}
                              >
                                {item.jenis === 'ziyadah' ? 'Ziyadah' : 'Murajaah'}
                              </Tag>
                            </div>
                          </div>
                        }
                        description={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <Text style={{ color: '#666', fontSize: '13px' }}>
                              <CalendarOutlined style={{ marginRight: '6px' }} />
                              {dayjs(item.tanggal).format('DD/MM/YYYY')}
                            </Text>
                            <Text style={{ color: '#999', fontSize: '12px' }}>
                              <UserOutlined style={{ marginRight: '4px' }} />
                              {item.guru}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <Text type="secondary">Belum ada setoran hafalan</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Setoran akan diinput oleh guru Anda
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