"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Select, Button, Table, Tag, Spin, Statistic, Progress } from "antd";
import {
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
  UserOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import { useRouter } from "next/navigation";

const { Option } = Select;

interface TahfidzReport {
  santriId: number;
  namaSantri: string;
  halaqah: string;
  guru: string;
  hafalan: {
    total: number;
    ziyadah: number;
    murojaah: number;
    totalAyat: number;
  };
  absensi: {
    total: number;
    present: number;
    rate: number;
  };
  target: {
    total: number;
    completed: number;
    rate: number;
  };
  prestasi: number;
  nilaiAkhir: number;
  statusAkhir: string;
  catatan: string;
}

interface ReportSummary {
  semester: string;
  tahunAjaran: string;
  halaqahId: string;
  totalSantri: number;
  reports: TahfidzReport[];
  summary: {
    averageNilaiAkhir: number;
    statusDistribution: {
      hijau: number;
      kuning: number;
      merah: number;
    };
  };
}

export default function RaportTahfidz() {
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [semester, setSemester] = useState('S1');
  const [tahunAjaran, setTahunAjaran] = useState('2024');
  const [halaqahId, setHalaqahId] = useState('');
  const router = useRouter();

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        semester,
        tahunAjaran,
        ...(halaqahId && { halaqahId })
      });

      const res = await fetch(`/api/analytics/tahfidz-reports?${params}`);
      if (!res.ok) throw new Error('Failed to fetch tahfidz reports');
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [semester, tahunAjaran, halaqahId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hijau': return 'green';
      case 'Kuning': return 'orange';
      case 'Merah': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'No',
      key: 'index',
      render: (text: any, record: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: 'Nama Santri',
      dataIndex: 'namaSantri',
      key: 'namaSantri',
      sorter: (a: TahfidzReport, b: TahfidzReport) => a.namaSantri.localeCompare(b.namaSantri),
    },
    {
      title: 'Halaqah',
      dataIndex: 'halaqah',
      key: 'halaqah',
      filters: reportData?.reports.reduce((acc: any[], report) => {
        if (!acc.find(item => item.text === report.halaqah)) {
          acc.push({ text: report.halaqah, value: report.halaqah });
        }
        return acc;
      }, []),
      onFilter: (value: any, record: TahfidzReport) => record.halaqah === value,
    },
    {
      title: 'Guru',
      dataIndex: 'guru',
      key: 'guru',
    },
    {
      title: 'Hafalan',
      children: [
        {
          title: 'Total',
          dataIndex: ['hafalan', 'total'],
          key: 'hafalanTotal',
          width: 80,
        },
        {
          title: 'Ayat',
          dataIndex: ['hafalan', 'totalAyat'],
          key: 'totalAyat',
          width: 80,
        },
      ],
    },
    {
      title: 'Absensi',
      children: [
        {
          title: 'Present',
          dataIndex: ['absensi', 'present'],
          key: 'absensiPresent',
          width: 80,
        },
        {
          title: 'Rate (%)',
          dataIndex: ['absensi', 'rate'],
          key: 'absensiRate',
          width: 100,
          render: (rate: number) => `${rate}%`,
        },
      ],
    },
    {
      title: 'Target',
      children: [
        {
          title: 'Completed',
          dataIndex: ['target', 'completed'],
          key: 'targetCompleted',
          width: 100,
        },
        {
          title: 'Rate (%)',
          dataIndex: ['target', 'rate'],
          key: 'targetRate',
          width: 100,
          render: (rate: number) => `${rate}%`,
        },
      ],
    },
    {
      title: 'Prestasi',
      dataIndex: 'prestasi',
      key: 'prestasi',
      width: 80,
    },
    {
      title: 'Nilai Akhir',
      dataIndex: 'nilaiAkhir',
      key: 'nilaiAkhir',
      sorter: (a: TahfidzReport, b: TahfidzReport) => b.nilaiAkhir - a.nilaiAkhir,
      render: (nilai: number) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{nilai}</div>
          <Progress
            percent={nilai}
            size="small"
            strokeColor={
              nilai >= 80 ? '#52c41a' :
              nilai >= 60 ? '#fa8c16' : '#ff4d4f'
            }
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statusAkhir',
      key: 'statusAkhir',
      filters: [
        { text: 'Hijau', value: 'Hijau' },
        { text: 'Kuning', value: 'Kuning' },
        { text: 'Merah', value: 'Merah' },
      ],
      onFilter: (value: any, record: TahfidzReport) => record.statusAkhir === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Catatan',
      dataIndex: 'catatan',
      key: 'catatan',
      ellipsis: true,
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            📑 Raport Tahfidz
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Semester-based tahfidz performance reports and assessments
          </p>
        </div>

        {/* Navigation */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/yayasan/dashboard')}
            >
              <BarChartOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#1890ff' }}>Dashboard</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/yayasan/laporan')}
            >
              <PieChartOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#722ed1' }}>📈 Laporan Global</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/yayasan/santri')}
            >
              <UserOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#52c41a' }}>📖 Detail Per Santri</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid #fa8c16' }}
              onClick={() => router.push('/yayasan/raport')}
            >
              <FileTextOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#fa8c16' }}>📑 Raport Tahfidz</div>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>Semester</div>
              <Select value={semester} onChange={setSemester} style={{ width: '100%' }}>
                <Option value="S1">Semester 1</Option>
                <Option value="S2">Semester 2</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>Tahun Ajaran</div>
              <Select value={tahunAjaran} onChange={setTahunAjaran} style={{ width: '100%' }}>
                <Option value="2024">2024</Option>
                <Option value="2023">2023</Option>
                <Option value="2025">2025</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>Halaqah (Opsional)</div>
              <Select
                placeholder="Semua Halaqah"
                allowClear
                style={{ width: '100%' }}
                onChange={setHalaqahId}
              >
                <Option value="">Semua Halaqah</Option>
                {/* This would be populated with actual halaqah data */}
                <Option value="1">Halaqah Al-Fatihah</Option>
                <Option value="2">Halaqah Al-Baqarah</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button icon={<ReloadOutlined />} onClick={fetchReportData} loading={loading}>
                  Refresh
                </Button>
                <Button type="primary" icon={<DownloadOutlined />}>
                  Export PDF
                </Button>
                <Button icon={<DownloadOutlined />}>
                  Export Excel
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Summary Statistics */}
        {reportData && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Santri"
                  value={reportData.totalSantri}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Rata-rata Nilai"
                  value={reportData.summary.averageNilaiAkhir}
                  suffix="/100"
                  precision={1}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Status Hijau"
                  value={reportData.summary.statusDistribution.hijau}
                  suffix={`/ ${reportData.totalSantri}`}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Perlu Perhatian"
                  value={reportData.summary.statusDistribution.merah}
                  suffix={`/ ${reportData.totalSantri}`}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Report Table */}
        <Card title={`Raport Tahfidz - ${semester} ${tahunAjaran}`} bordered={false}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: '#6b7280' }}>Loading report data...</p>
            </div>
          ) : reportData ? (
            <Table
              dataSource={reportData.reports}
              columns={columns}
              rowKey="santriId"
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 25,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} santri`,
              }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <strong>Ringkasan</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>
                      {reportData.reports.reduce((sum, r) => sum + r.hafalan.total, 0)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong>
                      {reportData.reports.reduce((sum, r) => sum + r.hafalan.totalAyat, 0)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <strong>
                      {reportData.reports.reduce((sum, r) => sum + r.absensi.present, 0)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <strong>
                      {((reportData.reports.reduce((sum, r) => sum + r.absensi.rate, 0) / reportData.reports.length) || 0).toFixed(1)}%
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <strong>
                      {reportData.reports.reduce((sum, r) => sum + r.target.completed, 0)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6}>
                    <strong>
                      {((reportData.reports.reduce((sum, r) => sum + r.target.rate, 0) / reportData.reports.length) || 0).toFixed(1)}%
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7}>
                    <strong>
                      {reportData.reports.reduce((sum, r) => sum + r.prestasi, 0)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={8}>
                    <strong>
                      {(reportData.summary.averageNilaiAkhir).toFixed(1)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={9} colSpan={2}>
                    <div>
                      <Tag color="green">Hijau: {reportData.summary.statusDistribution.hijau}</Tag>
                      <Tag color="orange">Kuning: {reportData.summary.statusDistribution.kuning}</Tag>
                      <Tag color="red">Merah: {reportData.summary.statusDistribution.merah}</Tag>
                    </div>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No data available for the selected filters.</p>
            </div>
          )}
        </Card>
      </div>
    </LayoutApp>
  );
}