"use client";

import { useEffect, useState } from "react";
import { Card, Progress, Typography, List, Tag, Button, Empty, Spin, Space, Select, DatePicker, Input, Statistic, Row, Col, Tabs } from "antd";
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
  SearchOutlined, 
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  DashboardOutlined,
  HistoryOutlined,
  SettingOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import { DetailHafalanModal } from "@/components/santri/hafalan/DetailHafalanModal";
import { TargetHafalanDetail } from "@/components/santri/hafalan/TargetHafalanDetail";
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

interface HafalanProgress {
  date: string;
  ziyadah: number;
  murajaah: number;
  total: number;
  cumulative: number;
}

interface RecentHafalan {
  id: number;
  tanggal: string;
  jenis: 'ziyadah' | 'murajaah';
  surah: string;
  ayat: string;
  guru: string;
  nilai?: number;
  catatan?: string;
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
  createdBy: string;
  priority: 'high' | 'medium' | 'low';
}

interface DashboardStats {
  totalAyat: number;
  totalSetoran: number;
  streakDays: number;
  averageDaily: number;
  monthlyProgress: number;
  targetCompletion: number;
}

export default function SantriHafalanPage() {
  const [hafalanProgress, setHafalanProgress] = useState<HafalanProgress[]>([]);
  const [recentHafalan, setRecentHafalan] = useState<RecentHafalan[]>([]);
  const [targets, setTargets] = useState<TargetHafalan[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('7days');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  
  // Modal state
  const [selectedHafalan, setSelectedHafalan] = useState<RecentHafalan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/santri/hafalan');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setHafalanProgress(result.data.hafalanProgress || []);
            setRecentHafalan(result.data.recentHafalan || []);
            setTargets(result.data.targets || []);
            setStats(result.data.stats || null);
          } else {
            throw new Error(result.message);
          }
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty data
        setHafalanProgress([]);
        setRecentHafalan([]);
        setTargets([]);
        setStats({
          totalAyat: 0,
          totalSetoran: 0,
          streakDays: 0,
          averageDaily: 0,
          monthlyProgress: 0,
          targetCompletion: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter functions
  const filteredHafalan = recentHafalan.filter(item => {
    const matchesJenis = filterJenis === 'all' || item.jenis === filterJenis;
    const matchesSearch = searchTerm === '' || 
      item.surah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ayat.includes(searchTerm) ||
      item.guru.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesJenis && matchesSearch;
  });

  const filteredTargets = targets.filter(target => {
    return selectedTarget === 'all' || target.status === selectedTarget;
  });

  const getJenisColor = (jenis: string) => {
    return jenis === 'ziyadah' ? '#1890ff' : '#52c41a';
  };

  const getJenisIcon = (jenis: string) => {
    return jenis === 'ziyadah' ? <FireOutlined /> : <BookOutlined />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getNilaiColor = (nilai: number) => {
    if (nilai >= 90) return '#52c41a';
    if (nilai >= 80) return '#1890ff';
    if (nilai >= 70) return '#faad14';
    return '#ff4d4f';
  };

  if (loading) {
    return (
      <LayoutApp>
        <div className="flex justify-center items-center min-h-[60vh] flex-col gap-4">
          <Spin size="large" />
          <Text type="secondary">Memuat data hafalan Anda...</Text>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <BookOutlined className="text-3xl" />
                  Dashboard Hafalan
                </h1>
                <p className="text-blue-100 text-lg">
                  Pantau progress hafalan dan pencapaian target Anda
                </p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-2xl font-bold">{stats?.streakDays || 0}</div>
                  <div className="text-sm text-blue-100">Hari Berturut</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <Statistic
              title="Total Ayat Dihafal"
              value={stats?.totalAyat || 0}
              prefix={<BookOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
            />
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <RiseOutlined className="text-green-500 mr-1" />
              +15 ayat minggu ini
            </div>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <Statistic
              title="Total Setoran"
              value={stats?.totalSetoran || 0}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
            />
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <RiseOutlined className="text-green-500 mr-1" />
              +3 setoran minggu ini
            </div>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <Statistic
              title="Rata-rata Harian"
              value={stats?.averageDaily || 0}
              precision={1}
              suffix="ayat"
              prefix={<BarChartOutlined className="text-purple-500" />}
              valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
            />
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <RiseOutlined className="text-green-500 mr-1" />
              Konsisten baik
            </div>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <Statistic
              title="Progress Target"
              value={stats?.targetCompletion || 0}
              suffix="%"
              prefix={<AimOutlined className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16', fontSize: '28px', fontWeight: 'bold' }}
            />
            <div className="mt-2">
              <Progress 
                percent={stats?.targetCompletion || 0} 
                size="small" 
                strokeColor="#fa8c16"
                showInfo={false}
              />
            </div>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          className="custom-tabs"
          items={[
            {
              key: 'dashboard',
              label: (
                <span className="flex items-center gap-2">
                  <DashboardOutlined />
                  Dashboard
                </span>
              ),
              children: (
                <div className="space-y-6">
                  {/* Main Content */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Progress Chart */}
                    <div className="xl:col-span-2">
                      <Card 
                        title={
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold flex items-center gap-2">
                              <LineChartOutlined className="text-blue-500" />
                              Grafik Progress Hafalan
                            </span>
                            <Select
                              value={filterPeriod}
                              onChange={setFilterPeriod}
                              size="small"
                              className="w-32"
                            >
                              <Option value="7days">7 Hari</Option>
                              <Option value="30days">30 Hari</Option>
                              <Option value="90days">90 Hari</Option>
                            </Select>
                          </div>
                        }
                        className="border-0 shadow-lg h-full"
                      >
                        <ResponsiveContainer width="100%" height={400}>
                          <AreaChart data={hafalanProgress}>
                            <defs>
                              <linearGradient id="ziyadahGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="murajaahGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => dayjs(value).format('DD/MM')}
                              stroke="#666"
                            />
                            <YAxis stroke="#666" />
                            <Tooltip
                              contentStyle={{
                                background: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                              }}
                              labelFormatter={(value) => `Tanggal: ${dayjs(value).format('DD/MM/YYYY')}`}
                            />
                            <Area
                              type="monotone"
                              dataKey="ziyadah"
                              stackId="1"
                              stroke="#1890ff"
                              fill="url(#ziyadahGradient)"
                              strokeWidth={2}
                              name="Ziyadah"
                            />
                            <Area
                              type="monotone"
                              dataKey="murajaah"
                              stackId="1"
                              stroke="#52c41a"
                              fill="url(#murajaahGradient)"
                              strokeWidth={2}
                              name="Murajaah"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Card>
                    </div>

                    {/* Target Progress */}
                    <div>
                      <Card
                        title={
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold flex items-center gap-2">
                              <AimOutlined className="text-green-500" />
                              Target Hafalan
                            </span>
                            <Select
                              value={selectedTarget}
                              onChange={setSelectedTarget}
                              size="small"
                              className="w-24"
                            >
                              <Option value="all">Semua</Option>
                              <Option value="active">Aktif</Option>
                              <Option value="completed">Selesai</Option>
                            </Select>
                          </div>
                        }
                        className="border-0 shadow-lg h-full"
                      >
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {filteredTargets.slice(0, 5).map((target) => {
                            const progress = Math.round((target.currentAyat / target.targetAyat) * 100);
                            const daysLeft = dayjs(target.deadline).diff(dayjs(), 'day');
                            
                            return (
                              <div key={target.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">{target.judul}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{target.deskripsi}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Tag color={getPriorityColor(target.priority)} size="small">
                                      {target.priority.toUpperCase()}
                                    </Tag>
                                    <Tag color={target.kategori === 'ziyadah' ? 'blue' : 'green'} size="small">
                                      {target.kategori}
                                    </Tag>
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">
                                      {target.currentAyat} / {target.targetAyat} ayat
                                    </span>
                                    <span className="text-sm font-semibold text-blue-600">
                                      {progress}%
                                    </span>
                                  </div>
                                  <Progress 
                                    percent={progress} 
                                    size="small" 
                                    strokeColor={target.kategori === 'ziyadah' ? '#1890ff' : '#52c41a'}
                                    showInfo={false}
                                  />
                                </div>
                                
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-gray-500">
                                    <CalendarOutlined className="mr-1" />
                                    {dayjs(target.deadline).format('DD/MM/YYYY')}
                                  </span>
                                  <span className={`font-medium ${
                                    daysLeft < 0 ? 'text-red-500' : 
                                    daysLeft <= 3 ? 'text-orange-500' : 'text-green-500'
                                  }`}>
                                    {daysLeft < 0 ? `${Math.abs(daysLeft)} hari terlambat` :
                                     daysLeft === 0 ? 'Hari ini' :
                                     `${daysLeft} hari lagi`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </div>
                  </div>


                </div>
              )
            },

            {
              key: 'targets',
              label: (
                <span className="flex items-center gap-2">
                  <AimOutlined />
                  Target Hafalan
                </span>
              ),
              children: (
                <TargetHafalanDetail 
                  targets={targets}
                  onTargetSelect={(target) => {
                    console.log('Selected target:', target);
                    // TODO: Handle target selection (show detail modal, etc.)
                  }}
                />
              )
            },
            {
              key: 'history',
              label: (
                <span className="flex items-center gap-2">
                  <HistoryOutlined />
                  Riwayat Setoran
                </span>
              ),
              children: (
                <Card
                  title={
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold flex items-center gap-2">
                        <ClockCircleOutlined className="text-purple-500" />
                        Riwayat Setoran Lengkap
                      </span>
                      <div className="flex gap-2">
                        <Search
                          placeholder="Cari surah, ayat..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ width: 200 }}
                          size="small"
                        />
                        <Select
                          value={filterJenis}
                          onChange={setFilterJenis}
                          size="small"
                          className="w-32"
                        >
                          <Option value="all">Semua</Option>
                          <Option value="ziyadah">Ziyadah</Option>
                          <Option value="murajaah">Murajaah</Option>
                        </Select>
                      </div>
                    </div>
                  }
                  className="border-0 shadow-lg"
                >
                  {filteredHafalan.length > 0 ? (
                    <List
                      dataSource={filteredHafalan}
                      renderItem={(item) => (
                        <List.Item className="hover:bg-gray-50 rounded-lg transition-colors px-4">
                          <List.Item.Meta
                            avatar={
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold`}
                                   style={{ backgroundColor: getJenisColor(item.jenis) }}>
                                {getJenisIcon(item.jenis)}
                              </div>
                            }
                            title={
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-gray-800">
                                    {item.surah} <span className="text-gray-500">({item.ayat})</span>
                                  </span>
                                  <div className="flex gap-2 mt-1">
                                    <Tag color={item.jenis === 'ziyadah' ? 'blue' : 'green'} size="small">
                                      {item.jenis === 'ziyadah' ? 'Ziyadah' : 'Murajaah'}
                                    </Tag>
                                    {item.nilai && (
                                      <Tag color={getNilaiColor(item.nilai)} size="small">
                                        Nilai: {item.nilai}
                                      </Tag>
                                    )}
                                  </div>
                                </div>
                                <Button 
                                  type="text" 
                                  size="small" 
                                  icon={<EyeOutlined />}
                                  onClick={() => {
                                    setSelectedHafalan(item);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  Detail
                                </Button>
                              </div>
                            }
                            description={
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">
                                    <CalendarOutlined className="mr-1" />
                                    {dayjs(item.tanggal).format('DD/MM/YYYY')}
                                  </span>
                                  <span className="text-gray-500">
                                    <UserOutlined className="mr-1" />
                                    {item.guru}
                                  </span>
                                </div>
                                {item.catatan && (
                                  <div className="text-sm text-gray-600 bg-gray-100 rounded-lg p-2 mt-2">
                                    <strong>Catatan:</strong> {item.catatan}
                                  </div>
                                )}
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} setoran`
                      }}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div>
                          <Text type="secondary">
                            {searchTerm || filterJenis !== 'all' 
                              ? 'Tidak ada setoran yang sesuai dengan filter'
                              : 'Belum ada setoran hafalan'
                            }
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Setoran akan diinput oleh guru Anda
                          </Text>
                        </div>
                      }
                    />
                  )}
                </Card>
              )
            }
          ]}
        />

        {/* Detail Modal */}
        <DetailHafalanModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedHafalan(null);
          }}
          hafalan={selectedHafalan}
        />
      </div>
    </LayoutApp>
  );
}