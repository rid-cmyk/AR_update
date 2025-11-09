"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Button, Spin, Progress, Table, Select, DatePicker, Tag, Space } from "antd";
import {
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  TeamOutlined,
  DownloadOutlined,
  ReloadOutlined,
  PieChartOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PageHeader from "@/components/layout/PageHeader";
import { useRouter, useSearchParams } from "next/navigation";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface GlobalReportData {
  totalHafalan?: number;
  hafalanByStatus?: Array<{ status: string; _count: { status: number } }>;
  topSantri?: Array<{ namaLengkap: string; _count: { Hafalan: number } }>;
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

export default function LaporanGlobal() {
  const [reportData, setReportData] = useState<GlobalReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('hafalan');
  const router = useRouter();
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

  const renderHafalanReport = () => (
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
        <Col xs={24} md={12}>
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
        <Col xs={24} md={12}>
          <Card title="Distribusi Hafalan" variant="borderless">
            {reportData?.hafalanByStatus?.map((item) => (
              <div key={item.status} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ textTransform: 'capitalize' }}>{item.status}</span>
                  <span>{item._count.status}</span>
                </div>
                <Progress
                  percent={reportData.totalHafalan ? (item._count.status / reportData.totalHafalan) * 100 : 0}
                  size="small"
                  strokeColor={item.status === 'ziyadah' ? '#52c41a' : '#fa8c16'}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );

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
    <LayoutApp>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Header */}
        <PageHeader
          title="Laporan Global"
          subtitle="Comprehensive reports across all halaqah activities"
          breadcrumbs={[
            { title: "Yayasan Dashboard", href: "/yayasan/dashboard" },
            { title: "Laporan Global" }
          ]}
          extra={
            <Tag icon={<PieChartOutlined />} color="purple" style={{ padding: '8px 16px', fontSize: 14 }}>
              Yayasan Panel
            </Tag>
          }
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
    </LayoutApp>
  );
}