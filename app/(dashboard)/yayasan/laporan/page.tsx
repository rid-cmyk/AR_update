 
"use client";

import { useEffect, useState, Suspense } from "react";
import { Row, Col, Card, Statistic, Button, Spin, Progress, Table, Select } from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  DownloadOutlined,
  ReloadOutlined,
  PieChartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import { useSearchParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Option } = Select;

interface GlobalReportData {
  totalHafalan?: number;
  hafalanByStatus?: Array<{ status: string; _count: { status: number } }>;
  topSantri?: Array<{ namaLengkap: string; _count: { Hafalan: number } }>;
  monthlyProgress?: Array<{ month: string; total_hafalan: number; total_ayat: number }>;
  totalAbsensi?: number;
  absensiByStatus?: Array<{ status: string; _count: { status: number } }>;
  attendanceByHalaqah?: Array<{
    namaHalaqah: string;
    attendanceRate: number;
    totalSantri: number;
  }>;
  totalPrestasi?: number;
  prestasiByCategory?: Array<{ kategori: string; _count: { kategori: number } }>;
  topAchievers?: Array<{ namaLengkap: string; _count: { Prestasi: number } }>;
  halaqahStats?: Array<{
    namaHalaqah: string;
    santriCount: number;
    attendanceRate: number;
    totalPrestasi: number;
  }>;
}

function LaporanGlobalContent() {
  const [reportData, setReportData] = useState<GlobalReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('hafalan');
  const searchParams = useSearchParams();

  const fetchReportData = async (type: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/global-reports?type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch report data");
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error("Report fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle query params from URL
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl && ['hafalan', 'absensi', 'prestasi', 'halaqah'].includes(typeFromUrl)) {
      setReportType(typeFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchReportData(reportType);
  }, [reportType]);

  const renderHafalanReport = () => {
    const pieData = reportData?.hafalanByStatus?.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item._count.status
    })) || [];
    
    // Format monthly progress data
    const chartData = reportData?.monthlyProgress?.map(item => ({
      name: new Date(item.month).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      Total: Number(item.total_hafalan),
      Ayat: Number(item.total_ayat)
    })).reverse() || [];

    const absensiData = reportData?.absensiByStatus?.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item._count.status
    })) || [];

    return (
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Hafalan"
                value={reportData?.totalHafalan || 0}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ziyadah"
                value={reportData?.hafalanByStatus?.find(s => s.status === 'ziyadah')?._count.status || 0}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Murojaah"
                value={reportData?.hafalanByStatus?.find(s => s.status === 'murojaah')?._count.status || 0}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Grafik Perkembangan Hafalan" variant="borderless" style={{ height: '100%' }}>
              {chartData.length > 0 ? (
                <div style={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="Total" stroke="#1890ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" dataKey="Ayat" stroke="#52c41a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
                  Belum ada data perkembangan
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={6}>
            <Card title="Distribusi Hafalan" variant="borderless" style={{ height: '100%' }}>
              {pieData.length > 0 ? (
                <div style={{ height: 300, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name.toLowerCase() === 'ziyadah' ? '#52c41a' : '#fa8c16'} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
                  Belum ada data hafalan
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={6}>
            <Card title="Overview Absensi" variant="borderless" style={{ height: '100%' }}>
              {absensiData.length > 0 ? (
                <div style={{ height: 300, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={absensiData}
                        cx="50%"
                        cy="45%"
                        innerRadius={0}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {absensiData.map((entry, index) => {
                          let color = '#d9d9d9';
                          if (entry.name.toLowerCase() === 'masuk') color = '#52c41a';
                          else if (entry.name.toLowerCase() === 'izin') color = '#fa8c16';
                          else if (entry.name.toLowerCase() === 'sakit') color = '#1890ff';
                          else if (entry.name.toLowerCase() === 'alpha') color = '#ff4d4f';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
                  Belum ada data absensi
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card title="Top 10 Santri Hafalan" variant="borderless">
              <Table
                dataSource={reportData?.topSantri?.slice(0, 10) || []}
                rowKey="id"
                columns={[
                  {
                    title: 'Nama Santri',
                    dataIndex: 'namaLengkap',
                    key: 'namaLengkap',
                  },
                  {
                    title: 'Total Hafalan',
                    dataIndex: ['_count', 'Hafalan'],
                    key: 'totalHafalan',
                  },
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderAbsensiReport = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Absensi"
              value={reportData?.totalAbsensi || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Masuk"
              value={reportData?.absensiByStatus?.find(s => s.status === 'masuk')?._count.status || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Izin"
              value={reportData?.absensiByStatus?.find(s => s.status === 'izin')?._count.status || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Alpha"
              value={reportData?.absensiByStatus?.find(s => s.status === 'alpha')?._count.status || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Tingkat Kehadiran Per Halaqah" variant="borderless">
            <Table
              rowKey="halaqahId"
              dataSource={reportData?.attendanceByHalaqah || []}
              columns={[
                {
                  title: 'Nama Halaqah',
                  dataIndex: 'namaHalaqah',
                  key: 'namaHalaqah',
                },
                {
                  title: 'Jumlah Santri',
                  dataIndex: 'totalSantri',
                  key: 'totalSantri',
                },
                {
                  title: 'Tingkat Kehadiran',
                  dataIndex: 'attendanceRate',
                  key: 'attendanceRate',
                  render: (rate: number) => (
                    <div>
                      <Progress percent={rate} size="small" />
                      <span>{rate.toFixed(1)}%</span>
                    </div>
                  ),
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderPrestasiReport = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Prestasi"
              value={reportData?.totalPrestasi || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Top 10 Pencapaian Santri" variant="borderless">
            <Table
              rowKey="id"
              dataSource={reportData?.topAchievers?.slice(0, 10) || []}
              columns={[
                {
                  title: 'Nama Santri',
                  dataIndex: 'namaLengkap',
                  key: 'namaLengkap',
                },
                {
                  title: 'Total Prestasi',
                  dataIndex: ['_count', 'Prestasi'],
                  key: 'totalPrestasi',
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Distribusi Prestasi" variant="borderless">
            {reportData?.prestasiByCategory?.map((item) => (
              <div key={item.kategori || 'Uncategorized'} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{item.kategori || 'Uncategorized'}</span>
                  <span>{item._count.kategori}</span>
                </div>
                <Progress
                  percent={reportData.totalPrestasi ? (item._count.kategori / reportData.totalPrestasi) * 100 : 0}
                  size="small"
                  strokeColor="#fa8c16"
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderHalaqahReport = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Performa Halaqah" variant="borderless">
            <Table
              rowKey="halaqahId"
              dataSource={reportData?.halaqahStats || []}
              columns={[
                {
                  title: 'Nama Halaqah',
                  dataIndex: 'namaHalaqah',
                  key: 'namaHalaqah',
                },
                {
                  title: 'Jumlah Santri',
                  dataIndex: 'santriCount',
                  key: 'santriCount',
                },
                {
                  title: 'Kehadiran',
                  dataIndex: 'attendanceRate',
                  key: 'attendanceRate',
                  render: (rate: number) => `${rate.toFixed(1)}%`,
                },
                {
                  title: 'Total Prestasi',
                  dataIndex: 'totalPrestasi',
                  key: 'totalPrestasi',
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Header */}
        <AdminHeaderCard
          title="Laporan Global"
          subtitle="Comprehensive reports across all halaqah activities"
          tags={[
            { label: "Yayasan Panel", icon: <PieChartOutlined /> },
            { label: "Online", icon: <ClockCircleOutlined /> }
          ]}
        />

        {/* Report Type Selector */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ margin: 0 }}>Pilih Jenis Laporan</h3>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Select
                value={reportType}
                onChange={setReportType}
                style={{ width: 200 }}
              >
                <Option value="hafalan">📖 Hafalan Santri</Option>
                <Option value="absensi">📅 Absensi</Option>
                <Option value="prestasi">🏆 Prestasi</Option>
                <Option value="halaqah">👥 Per Halaqah</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchReportData(reportType)}
                loading={loading}
              >
                Refresh
              </Button>
              <Button icon={<DownloadOutlined />} type="primary">
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Report Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280' }}>Loading report data...</p>
          </div>
        ) : (
          <>
            {reportType === 'hafalan' && renderHafalanReport()}
            {reportType === 'absensi' && renderAbsensiReport()}
            {reportType === 'prestasi' && renderPrestasiReport()}
            {reportType === 'halaqah' && renderHalaqahReport()}
          </>
        )}

        {/* Footer */}
        <Card style={{ marginTop: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h4 style={{ margin: 0, color: "#1e293b", fontWeight: 600 }}>Sistem AR-Hafalan v2.0</h4>
              <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Laporan Global - Comprehensive Reports</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Auto-refresh: 30s • Last updated</p>
              <p style={{ margin: 0, color: "#1e293b", fontWeight: 500, fontSize: 14 }}>{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export default function LaporanGlobal() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Spin size="large" />
        </div>
      }
    >
      <LaporanGlobalContent />
    </Suspense>
  );
}