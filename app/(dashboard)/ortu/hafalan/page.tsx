 
"use client";

import { useEffect, useState } from "react";
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
  AreaChartOutlined
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import dayjs from "dayjs";
import StudentAnalyticsTab from "@/components/analytics/StudentAnalyticsTab";
import { useOrtuChildDashboard } from "@/hooks/useOrtuChildDashboard";
import { useStatusTag, HAFALAN_STATUS_TAGS } from "@/hooks/useStatusTag";
import { useTablePagination } from "@/hooks/useTablePagination";

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

export default function ProgresHafalanAnak() {
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const { data, children, loading, selectedChild, setSelectedChild } = useOrtuChildDashboard<{
    hafalan: HafalanData[];
    stats: ChildStats[];
  }>({
    endpoint: "/api/ortu/dashboard",
    transformAnak: (anak: any) => {
      const hafalan: HafalanData[] = [];
      (anak.Hafalan || []).forEach((h: any) => {
        hafalan.push({
          id: h.id,
          tanggal: h.tanggal,
          surat: h.surat,
          ayatMulai: h.ayatMulai,
          ayatSelesai: h.ayatSelesai,
          status: h.status,
          catatan: h.catatan,
          santri: {
            id: anak.id,
            namaLengkap: anak.namaLengkap,
            username: anak.username,
          },
        });
      });

      const totalHafalan = anak.Hafalan?.length || 0;
      const totalAyat = anak.Hafalan?.reduce((sum: number, h: any) =>
        sum + (h.ayatSelesai - h.ayatMulai + 1), 0) || 0;
      const rataRataPerMinggu = Math.round(totalHafalan / 4);
      const progressBulanan = Math.min(100, Math.round((totalHafalan / 20) * 100));

      return {
        data: {
          hafalan,
          stats: [
            {
              id: anak.id,
              namaLengkap: anak.namaLengkap,
              totalHafalan,
              totalAyat,
              rataRataPerMinggu,
              progressBulanan,
            },
          ],
        },
        child: { id: anak.id, namaLengkap: anak.namaLengkap, username: anak.username },
      };
    },
    initialData: {
      hafalan: [],
      stats: [],
    },
  });

  const hafalanData = data.hafalan;
  const childStats = data.stats;
  const childrenList = children;

  // Set default selected santri to first child when data loads
  useEffect(() => {
    if (childrenList.length > 0 && !selectedSantriId) {
      setSelectedSantriId(childrenList[0].id);
    }
  }, [childrenList, selectedSantriId]);

  // Filter data based on selected child and month
  const filteredData = hafalanData.filter((item) => {
    const matchesChild = selectedChild === "all" || item.santri.namaLengkap === selectedChild;
    const itemMonth = dayjs(item.tanggal);
    const matchesMonth = itemMonth.isSame(selectedMonth, "month");
    return matchesChild && matchesMonth;
  });

  const renderStatus = useStatusTag(HAFALAN_STATUS_TAGS, "pending");
  const pagination = useTablePagination({ totalLabel: "hafalan" });

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
      render: renderStatus,
    },
  ];

  const selectedChildObj = childrenList.find((c) => c.id === selectedSantriId);

  return (
    <>
      <div style={{ 
        padding: "24px", 
        maxWidth: '1400px', 
        margin: '0 auto',
        background: '#f0f9ff',
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
                      border: selectedSantriId === child.id ? '2px solid #219ebc' : '2px solid #219ebc',
                      background: '#f6ffed',
                      boxShadow: '0 4px 12px rgba(82,196,26,0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#219ebc',
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
                      color: '#219ebc',
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
                        strokeColor="#219ebc"
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
                pagination={pagination}
                scroll={{ x: 800 }}
              />
            </Card>
          </>
        )}
      </div>
    </>
  );
}