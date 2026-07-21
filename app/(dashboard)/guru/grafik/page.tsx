/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Select,
  Tabs,
  Row,
  Col,
  Empty,
  Space,
  Table,
  Input,
  Statistic,
  Tag,
  Avatar,
} from "antd";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import {
  TrophyOutlined,
  BookOutlined,
  SearchOutlined,
  FireOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import dynamic from "next/dynamic";

const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Legend = dynamic<any>(() => import("recharts").then(mod => mod.Legend as any), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });

const { Option } = Select;
const { TabPane } = Tabs;

interface Halaqah {
  id: number;
  namaHalaqah: string;
  jumlahSantri: number;
  santri: Array<{
    id: number;
    namaLengkap: string;
    username: string;
  }>;
}

interface HafalanData {
  tanggal: string;
  ziyadah: number;
  murojaah: number;
  total: number;
}

interface TopSantri {
  id: number;
  namaLengkap: string;
  username: string;
  totalAyat: number;
  ziyadahCount: number;
  murojaahCount: number;
  lastHafalan: string;
}

interface HafalanStats {
  totalZiyadah: number;
  totalMurojaah: number;
  totalAyat: number;
  avgPerDay: number;
}

const COLORS = ['#52c41a', '#1890ff', '#faad14', '#f5222d', '#722ed1'];

export default function GrafikPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState<number | null>(null);
  const [hafalanData, setHafalanData] = useState<HafalanData[]>([]);
  const [topSantriList, setTopSantriList] = useState<TopSantri[]>([]);
  const [filteredSantri, setFilteredSantri] = useState<TopSantri[]>([]);
  const [hafalanStats, setHafalanStats] = useState<HafalanStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [periodFilter, setPeriodFilter] = useState<string>("7"); // days

  // Fetch halaqah milik guru
  const fetchHalaqah = useCallback(async () => {
    try {
      const res = await fetch("/api/guru/dashboard");
      if (res.ok) {
        const data = await res.json();
        setHalaqahList(data.halaqah || []);
        if (data.halaqah && data.halaqah.length > 0 && !selectedHalaqah) {
          setSelectedHalaqah(data.halaqah[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching halaqah:", error);
    }
  }, [selectedHalaqah]);

  // Fetch data grafik hafalan per halaqah
  const fetchHafalanData = useCallback(async (halaqahId: number, days: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/guru/grafik/hafalan?halaqahId=${halaqahId}&days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setHafalanData(data.chartData || []);
        setHafalanStats(data.stats || null);
      }
    } catch (error) {
      console.error("Error fetching hafalan data:", error);
      setHafalanData([]);
      setHafalanStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch top santri berdasarkan hafalan
  const fetchTopSantri = useCallback(async (halaqahId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/guru/grafik/top-santri?halaqahId=${halaqahId}`);
      
      if (res.ok) {
        const data = await res.json();
        setTopSantriList(data.data || []);
        setFilteredSantri(data.data || []);
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        setTopSantriList([]);
        setFilteredSantri([]);
      }
    } catch (error) {
      console.error("Error fetching top santri:", error);
      setTopSantriList([]);
      setFilteredSantri([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHalaqah();
  }, [fetchHalaqah]);

  useEffect(() => {
    if (selectedHalaqah) {
      fetchHafalanData(selectedHalaqah, periodFilter);
      fetchTopSantri(selectedHalaqah);
    }
  }, [selectedHalaqah, periodFilter, fetchHafalanData, fetchTopSantri]);

  // Filter santri berdasarkan search
  useEffect(() => {
    if (searchText) {
      const filtered = topSantriList.filter(santri =>
        santri.namaLengkap.toLowerCase().includes(searchText.toLowerCase()) ||
        santri.username.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSantri(filtered);
    } else {
      setFilteredSantri(topSantriList);
    }
  }, [searchText, topSantriList]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '12px',
          border: '1px solid #d9d9d9',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {dayjs(label).format('DD MMM YYYY')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {`${entry.name}: ${entry.value} ayat`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const columns = [
    {
      title: "Rank",
      key: "rank",
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Avatar
          style={{
            backgroundColor: index < 3 ? COLORS[index] : '#d9d9d9',
            fontWeight: 'bold'
          }}
        >
          {index + 1}
        </Avatar>
      ),
    },
    {
      title: "Nama Santri",
      dataIndex: "namaLengkap",
      key: "namaLengkap",
      render: (text: string, record: TopSantri) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>@{record.username}</div>
        </div>
      ),
    },
    {
      title: "Total Ayat",
      dataIndex: "totalAyat",
      key: "totalAyat",
      sorter: (a: TopSantri, b: TopSantri) => a.totalAyat - b.totalAyat,
      render: (value: number) => (
        <Tag color="blue" icon={<BookOutlined />}>
          {value} ayat
        </Tag>
      ),
    },
    {
      title: "Ziyadah",
      dataIndex: "ziyadahCount",
      key: "ziyadahCount",
      sorter: (a: TopSantri, b: TopSantri) => a.ziyadahCount - b.ziyadahCount,
      render: (value: number) => (
        <Tag color="green" icon={<FireOutlined />}>
          {value}x
        </Tag>
      ),
    },
    {
      title: "Murojaah",
      dataIndex: "murojaahCount",
      key: "murojaahCount",
      sorter: (a: TopSantri, b: TopSantri) => a.murojaahCount - b.murojaahCount,
      render: (value: number) => (
        <Tag color="cyan" icon={<CheckCircleOutlined />}>
          {value}x
        </Tag>
      ),
    },
    {
      title: "Hafalan Terakhir",
      dataIndex: "lastHafalan",
      key: "lastHafalan",
      render: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : '-',
    },
  ];

  const selectedHalaqahData = halaqahList.find(h => h.id === selectedHalaqah);

  // Data untuk pie chart
  const pieData = hafalanStats ? [
    { name: 'Ziyadah', value: hafalanStats.totalZiyadah },
    { name: 'Murojaah', value: hafalanStats.totalMurojaah },
  ] : [];

  return (
    <>
      <div style={{ padding: "24px 0" }}>
        {/* Header */}
        <AdminHeaderCard
          title="Grafik Perkembangan Hafalan"
          subtitle="Analisis perkembangan hafalan santri di halaqah Anda"
        />

        {/* Filter */}
        <Card style={{ marginBottom: 24 }}>
          <Space wrap>
            <Select
              placeholder="Pilih Halaqah"
              style={{ width: 250 }}
              value={selectedHalaqah}
              onChange={(value) => setSelectedHalaqah(value)}
            >
              {halaqahList.map((halaqah) => (
                <Option key={halaqah.id} value={halaqah.id}>
                  {halaqah.namaHalaqah} ({halaqah.jumlahSantri} santri)
                </Option>
              ))}
            </Select>
            <Select
              value={periodFilter}
              onChange={setPeriodFilter}
              style={{ width: 150 }}
              disabled={!selectedHalaqah}
            >
              <Option value="7">7 Hari Terakhir</Option>
              <Option value="14">14 Hari Terakhir</Option>
              <Option value="30">30 Hari Terakhir</Option>
              <Option value="60">60 Hari Terakhir</Option>
            </Select>
          </Space>
        </Card>

        {selectedHalaqah ? (
          <>
            {/* Statistics Cards */}
            {hafalanStats && (
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Ziyadah"
                      value={hafalanStats.totalZiyadah}
                      prefix={<FireOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                      suffix="ayat"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Murojaah"
                      value={hafalanStats.totalMurojaah}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                      suffix="ayat"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Total Ayat"
                      value={hafalanStats.totalAyat}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                      suffix="ayat"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="Rata-rata/Hari"
                      value={hafalanStats.avgPerDay}
                      prefix={<TrophyOutlined />}
                      valueStyle={{ color: '#fa8c16' }}
                      suffix="ayat"
                      precision={1}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            <Tabs defaultActiveKey="grafik" type="card">
              {/* Tab Grafik */}
              <TabPane tab="📊 Grafik Hafalan" key="grafik">
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={16}>
                    <Card title={`Perkembangan Hafalan - ${selectedHalaqahData?.namaHalaqah}`}>
                      {hafalanData && hafalanData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={hafalanData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="tanggal"
                              tickFormatter={(value) => dayjs(value).format('DD/MM')}
                            />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="ziyadah"
                              stroke="#52c41a"
                              strokeWidth={3}
                              name="Ziyadah"
                              dot={{ fill: '#52c41a', strokeWidth: 2, r: 6 }}
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="murojaah"
                              stroke="#1890ff"
                              strokeWidth={3}
                              name="Murojaah"
                              dot={{ fill: '#1890ff', strokeWidth: 2, r: 6 }}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                          <Empty description="Belum ada data grafik" />
                        </div>
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card title="Distribusi Hafalan">
                      {pieData && pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                          <Empty description="Belum ada data distribusi" />
                        </div>
                      )}
                    </Card>
                  </Col>
                </Row>

                {/* Bar Chart */}
                <Card title="Perbandingan Ziyadah vs Murojaah" style={{ marginTop: 16 }}>
                  {hafalanData && hafalanData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={hafalanData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="tanggal"
                          tickFormatter={(value) => dayjs(value).format('DD/MM')}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="ziyadah" fill="#52c41a" name="Ziyadah" />
                        <Bar dataKey="murojaah" fill="#1890ff" name="Murojaah" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                      <Empty description="Belum ada data grafik" />
                    </div>
                  )}
                </Card>
              </TabPane>

              {/* Tab Top Santri */}
              <TabPane tab="🏆 Top Santri" key="top-santri">
                <Card
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <span>Ranking Santri Berdasarkan Hafalan ({topSantriList.length} santri)</span>
                      <Input
                        placeholder="Cari nama santri..."
                        prefix={<SearchOutlined />}
                        style={{ width: 300 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                      />
                    </div>
                  }
                >
                  {filteredSantri.length === 0 && !loading ? (
                    <Empty
                      description={
                        searchText 
                          ? "Tidak ada santri yang cocok dengan pencarian"
                          : "Belum ada data hafalan untuk santri di halaqah ini"
                      }
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={filteredSantri}
                      rowKey="id"
                      loading={loading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} dari ${total} santri`,
                      }}
                      rowClassName={(record, index) => {
                        if (index === 0) return 'gold-row';
                        if (index === 1) return 'silver-row';
                        if (index === 2) return 'bronze-row';
                        return '';
                      }}
                    />
                  )}
                </Card>
              </TabPane>
            </Tabs>
          </>
        ) : (
          <Card>
            <Empty
              description="Pilih halaqah untuk melihat grafik perkembangan"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        )}
      </div>

      <style jsx global>{`
        .gold-row {
          background-color: #fff7e6 !important;
        }
        .silver-row {
          background-color: #f0f0f0 !important;
        }
        .bronze-row {
          background-color: #fff1e6 !important;
        }
      `}</style>
    </>
  );
}
