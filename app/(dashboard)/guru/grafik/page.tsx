 
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
  Button,
} from "antd";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import {
  TrophyOutlined,
  BookOutlined,
  SearchOutlined,
  FireOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import StudentAnalyticsTab from "@/components/analytics/StudentAnalyticsTab";
import GrafikHafalanTab from "@/components/guru/grafik/GrafikHafalanTab";
import TopSantriTab from "@/components/guru/grafik/TopSantriTab";

const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
 
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

const COLORS = ['#219ebc', '#219ebc', '#ffb703', '#fb8500', '#8ecae6'];

export default function GrafikPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState<number | null>(null);
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>("grafik");
  const [hafalanData, setHafalanData] = useState<HafalanData[]>([]);
  const [topSantriList, setTopSantriList] = useState<any[]>([]);
  const [filteredSantri, setFilteredSantri] = useState<any[]>([]);
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
        const list: any[] = data.data || [];
        setTopSantriList(list);
        setFilteredSantri(list);
        if (list.length > 0) {
          setSelectedSantriId((prev) => {
            const exists = list.some((s) => s.id === prev);
            return exists ? prev : list[0].id;
          });
        }
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


  const selectedHalaqahData = halaqahList.find(h => h.id === selectedHalaqah);

  // Available santri for dropdown selection
  const availableSantri = selectedHalaqahData?.santri || topSantriList.map(s => ({
    id: s.id,
    namaLengkap: s.namaLengkap,
    username: s.username
  }));

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
          <Space wrap size="middle">
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
            <Select
              placeholder="Pilih Santri (Analitik)"
              style={{ width: 250 }}
              value={selectedSantriId}
              onChange={(val) => {
                setSelectedSantriId(val);
                if (val) setActiveTabKey("analitik");
              }}
              allowClear
              disabled={!selectedHalaqah || availableSantri.length === 0}
            >
              {availableSantri.map((santri) => (
                <Option key={santri.id} value={santri.id}>
                  {santri.namaLengkap} (@{santri.username})
                </Option>
              ))}
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
                      valueStyle={{ color: '#219ebc' }}
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
                      valueStyle={{ color: '#219ebc' }}
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
                      valueStyle={{ color: '#8ecae6' }}
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
                      valueStyle={{ color: '#ffb703' }}
                      suffix="ayat"
                      precision={1}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} type="card">
              {/* Tab Grafik */}
              <TabPane tab="📊 Grafik Hafalan" key="grafik">
                <GrafikHafalanTab 
                  hafalanData={hafalanData}
                  pieData={pieData}
                  selectedHalaqahData={selectedHalaqahData}
                  CustomTooltip={CustomTooltip}
                />
              </TabPane>

              {/* Tab Top Santri */}
              <TabPane tab="🏆 Top Santri" key="top-santri">
                <TopSantriTab 
                  topSantriList={topSantriList}
                  filteredSantri={filteredSantri}
                  searchText={searchText}
                  setSearchText={setSearchText}
                  loading={loading}
                  setSelectedSantriId={(val: string) => setSelectedSantriId(Number(val))}
                  setActiveTabKey={setActiveTabKey}
                />
              </TabPane>

              {/* Tab Analitik Prediktif & KKM Per-Juz */}
              <TabPane tab="📈 Analitik Prediktif & KKM" key="analitik">
                <Card style={{ marginBottom: 16 }}>
                  <Space align="center" wrap>
                    <span style={{ fontWeight: 'bold' }}>Pilih Santri:</span>
                    <Select
                      placeholder="Pilih santri untuk analisis detail"
                      style={{ width: 280 }}
                      value={selectedSantriId}
                      onChange={(val) => setSelectedSantriId(val)}
                      allowClear
                    >
                      {availableSantri.map((santri) => (
                        <Option key={santri.id} value={santri.id}>
                          {santri.namaLengkap} (@{santri.username})
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </Card>

                {selectedSantriId ? (
                  <StudentAnalyticsTab
                    santriId={selectedSantriId}
                    santriName={
                      availableSantri.find((s) => s.id === selectedSantriId)?.namaLengkap
                    }
                  />
                ) : (
                  <Card>
                    <Empty description="Pilih santri dari dropdown atau tabel Top Santri untuk melihat grafik analitik prediktif dan evaluasi KKM per-juz." />
                  </Card>
                )}
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

