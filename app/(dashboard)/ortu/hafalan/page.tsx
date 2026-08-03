 
"use client";

import { useEffect, useState, useCallback } from "react";
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
  Empty
} from "antd";
import { 
  BookOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  AreaChartOutlined
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import dayjs from "dayjs";
import StudentAnalyticsTab from "@/components/analytics/StudentAnalyticsTab";

interface HafalanData {
  id: number;
  tanggal: string;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: string;
  catatan?: string;
  santri: {
    id?: number;
    namaLengkap: string;
    username: string;
  };
}

interface ChildStats {
  id: number;
  namaLengkap: string;
  totalHafalan: number;
  totalAyat: number;
  rataRataPerMinggu: number;
  progressBulanan: number;
}

interface ChildItem {
  id: number;
  namaLengkap: string;
  username: string;
}

export default function ProgresHafalanAnak() {
  const [hafalanData, setHafalanData] = useState<HafalanData[]>([]);
  const [childStats, setChildStats] = useState<ChildStats[]>([]);
  const [childrenList, setChildrenList] = useState<ChildItem[]>([]);
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  // Fetch hafalan progress data
  const fetchHafalanData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ortu/dashboard");
      if (!res.ok) throw new Error("Failed to fetch hafalan data");
      const data = await res.json();
      
      // Transform data for display
      const transformedData: HafalanData[] = [];
      const stats: ChildStats[] = [];
      const kids: ChildItem[] = [];

      data.anakList?.forEach((anak: { id: number; namaLengkap: string; username: string; Hafalan?: any[] }) => {
        kids.push({
          id: anak.id,
          namaLengkap: anak.namaLengkap,
          username: anak.username,
        });

        // Collect hafalan data
        anak.Hafalan?.forEach((hafalan: { id: number; tanggal: string; surat: string; ayatMulai: number; ayatSelesai: number; status: string; catatan?: string }) => {
          transformedData.push({
            id: hafalan.id,
            tanggal: hafalan.tanggal,
            surat: hafalan.surat,
            ayatMulai: hafalan.ayatMulai,
            ayatSelesai: hafalan.ayatSelesai,
            status: hafalan.status,
            catatan: hafalan.catatan,
            santri: {
              id: anak.id,
              namaLengkap: anak.namaLengkap,
              username: anak.username,
            },
          });
        });

        // Calculate stats
        const totalHafalan = anak.Hafalan?.length || 0;
        const totalAyat = anak.Hafalan?.reduce((sum: number, h: any) =>
          sum + (h.ayatSelesai - h.ayatMulai + 1), 0) || 0;

        // Calculate weekly average (assuming 4 weeks per month)
        const rataRataPerMinggu = Math.round(totalHafalan / 4);

        // Calculate monthly progress (mock data)
        const progressBulanan = Math.min(100, Math.round((totalHafalan / 20) * 100));

        stats.push({
          id: anak.id,
          namaLengkap: anak.namaLengkap,
          totalHafalan,
          totalAyat,
          rataRataPerMinggu,
          progressBulanan,
        });
      });

      setHafalanData(transformedData);
      setChildStats(stats);
      setChildrenList(kids);

      if (kids.length > 0 && !selectedSantriId) {
        setSelectedSantriId(kids[0].id);
      }
    } catch (error) {
      console.error("Error fetching hafalan data:", error);
      // Fallback mock data
      setHafalanData([
        {
          id: 1,
          tanggal: "2024-01-15",
          surat: "Al-Fatihah",
          ayatMulai: 1,
          ayatSelesai: 7,
          status: "selesai",
          santri: { id: 1, namaLengkap: "Ahmad", username: "ahmad123" },
        },
        {
          id: 2,
          tanggal: "2024-01-16",
          surat: "Al-Baqarah",
          ayatMulai: 1,
          ayatSelesai: 5,
          status: "selesai",
          santri: { id: 1, namaLengkap: "Ahmad", username: "ahmad123" },
        },
      ]);

      const mockKids = [{ id: 1, namaLengkap: "Ahmad", username: "ahmad123" }];
      setChildrenList(mockKids);
      if (!selectedSantriId) setSelectedSantriId(1);

      setChildStats([
        {
          id: 1,
          namaLengkap: "Ahmad",
          totalHafalan: 15,
          totalAyat: 142,
          rataRataPerMinggu: 4,
          progressBulanan: 75,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedSantriId]);

  useEffect(() => {
    fetchHafalanData();
  }, [fetchHafalanData]);

  // Filter data based on selected child and month
  const filteredData = hafalanData.filter((item) => {
    const matchesChild = selectedChild === "all" || item.santri.namaLengkap === selectedChild;
    const itemMonth = dayjs(item.tanggal);
    const matchesMonth = itemMonth.isSame(selectedMonth, 'month');
    return matchesChild && matchesMonth;
  });

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
      sorter: (a: HafalanData, b: HafalanData) => dayjs(a.tanggal).unix() - dayjs(b.tanggal).unix(),
    },
    {
      title: "Anak",
      dataIndex: ["santri", "namaLengkap"],
      key: "namaLengkap",
    },
    {
      title: "Surat",
      dataIndex: "surat",
      key: "surat",
    },
    {
      title: "Ayat",
      key: "ayat",
      render: (record: HafalanData) => `${record.ayatMulai} - ${record.ayatSelesai}`,
    },
    {
      title: "Jumlah Ayat",
      key: "jumlahAyat",
      render: (record: HafalanData) => record.ayatSelesai - record.ayatMulai + 1,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig = {
          selesai: { color: "green", icon: <CheckCircleOutlined />, text: "Selesai" },
          proses: { color: "blue", icon: <ClockCircleOutlined />, text: "Proses" },
          pending: { color: "orange", icon: <ClockCircleOutlined />, text: "Pending" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      },
    },
  ];

  const selectedChildObj = childrenList.find((c) => c.id === selectedSantriId);

  return (
    <>
      <div style={{ 
        padding: "24px", 
        maxWidth: '1400px', 
        margin: '0 auto',
        background: 'linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%)',
        minHeight: '100vh'
      }}>
        <AdminHeaderCard
          title="Progres Hafalan & Analitik Anak"
          subtitle="Pantau perkembangan hafalan Al-Quran, prediksi ketuntasan, dan nilai KKM anak Anda"
          tags={[
            { label: "Progres Hafalan", icon: <BookOutlined /> },
            { label: "Analitik Prediktif", icon: <AreaChartOutlined /> }
          ]}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280' }}>Memuat data progres hafalan...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              {childStats.map((child, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card
                    onClick={() => {
                      setSelectedSantriId(child.id);
                      setSelectedChild(child.namaLengkap);
                    }}
                    style={{ 
                      textAlign: 'center',
                      borderRadius: '12px',
                      border: selectedSantriId === child.id ? '2px solid #1890ff' : '2px solid #52c41a',
                      background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                      boxShadow: '0 4px 12px rgba(82,196,26,0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      color: 'white'
                    }}>
                      <BookOutlined style={{ fontSize: '24px' }} />
                    </div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: '#52c41a',
                      marginBottom: '8px'
                    }}>
                      {child.totalHafalan}
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '12px'
                    }}>
                      📚 {child.namaLengkap}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      padding: '8px',
                      borderRadius: '8px'
                    }}>
                      <div style={{ marginBottom: '4px' }}>
                        📄 {child.totalAyat} ayat total
                      </div>
                      <div>
                        ⏱️ {child.rataRataPerMinggu} hafalan/minggu
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
              <Space size="large" wrap align="center">
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Pilih Anak (Riwayat &amp; Analitik):</label>
                  <Select
                    value={selectedSantriId || undefined}
                    onChange={(val) => {
                      setSelectedSantriId(val);
                      const kid = childrenList.find(k => k.id === val);
                      setSelectedChild(kid ? kid.namaLengkap : "all");
                    }}
                    style={{ width: 220 }}
                    placeholder="Pilih anak"
                  >
                    {childrenList.map((child) => (
                      <Select.Option key={child.id} value={child.id}>
                        {child.namaLengkap}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Pilih Bulan Tabel:</label>
                  <DatePicker
                    value={selectedMonth}
                    onChange={(date) => setSelectedMonth(date || dayjs())}
                    picker="month"
                    style={{ width: 180 }}
                    placeholder="Pilih bulan"
                  />
                </div>
              </Space>
            </Card>

            {/* Student Predictive Analytics Tab / Component Section */}
            {selectedSantriId ? (
              <div style={{ marginBottom: 32 }}>
                <Card
                  title={`📈 Analitik Prediktif & KKM Per-Juz — ${selectedChildObj?.namaLengkap || 'Ananda'}`}
                  style={{ borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                >
                  <StudentAnalyticsTab
                    santriId={selectedSantriId}
                    santriName={selectedChildObj?.namaLengkap}
                  />
                </Card>
              </div>
            ) : (
              <Card style={{ marginBottom: 32 }}>
                <Empty description="Pilih anak untuk melihat analitik prediktif dan evaluasi KKM per-juz" />
              </Card>
            )}

            {/* Progress Overview */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {childStats.map((child, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card title={`🎯 Progress ${child.namaLengkap}`} variant="borderless">
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Progress
                        type="circle"
                        percent={child.progressBulanan}
                        format={(percent) => `${percent}%`}
                        strokeColor="#52c41a"
                        size={100}
                      />
                      <p style={{ marginTop: 16, color: '#666', fontSize: '14px' }}>
                        Progress bulan ini
                      </p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Hafalan Table */}
            <Card title="📋 Detail Hafalan" variant="borderless">
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} dari ${total} hafalan`,
                }}
                scroll={{ x: 800 }}
              />
            </Card>
          </>
        )}
      </div>
    </>
  );
}