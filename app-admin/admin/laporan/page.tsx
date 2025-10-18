"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Table,
  Select,
  DatePicker,
  Button,
  Space,
  Progress,
  Tag,
} from "antd";
import {
  BarChartOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportData {
  totalSantri: number;
  totalGuru: number;
  totalHalaqah: number;
  totalJadwal: number;
  totalPengumuman: number;
  rataRataHafalan: number;
  tingkatKehadiran: number;
}

export default function LaporanPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);

  // Mock data for demonstration
  const mockReportData: ReportData = {
    totalSantri: 45,
    totalGuru: 8,
    totalHalaqah: 12,
    totalJadwal: 24,
    totalPengumuman: 15,
    rataRataHafalan: 85,
    tingkatKehadiran: 92,
  };

  // Mock table data
  const performanceData = [
    { key: '1', nama: 'Ahmad Rahman', halaqah: 'Halaqah Al-Fatihah', nilai: 95, status: 'Excellent' },
    { key: '2', nama: 'Siti Aminah', halaqah: 'Halaqah Al-Baqarah', nilai: 88, status: 'Good' },
    { key: '3', nama: 'Muhammad Ali', halaqah: 'Halaqah Ali Imran', nilai: 92, status: 'Excellent' },
    { key: '4', nama: 'Fatimah Zahra', halaqah: 'Halaqah An-Nisa', nilai: 78, status: 'Average' },
    { key: '5', nama: 'Hassan Ibrahim', halaqah: 'Halaqah Al-Ma\'idah', nilai: 89, status: 'Good' },
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setReportData(mockReportData);
      setLoading(false);
    }, 1000);
  }, [dateRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'green';
      case 'Good': return 'blue';
      case 'Average': return 'orange';
      default: return 'default';
    }
  };

  const performanceColumns = [
    {
      title: 'Nama Santri',
      dataIndex: 'nama',
      key: 'nama',
    },
    {
      title: 'Halaqah',
      dataIndex: 'halaqah',
      key: 'halaqah',
    },
    {
      title: 'Nilai (%)',
      dataIndex: 'nilai',
      key: 'nilai',
      render: (nilai: number) => (
        <span style={{ fontWeight: 'bold', color: nilai >= 90 ? '#52c41a' : nilai >= 80 ? '#1890ff' : '#fa8c16' }}>
          {nilai}%
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              <BarChartOutlined style={{ marginRight: 12, color: '#667eea' }} />
              Laporan & Analitik
            </Title>
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '4px',
              fontWeight: '500'
            }}>
              Pantau performa dan statistik sistem secara menyeluruh
            </div>
          </Col>
          <Col>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9'
                }}
              />
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={4}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <UserOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {reportData?.totalSantri || 0}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Total Santri
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(245, 87, 108, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <TeamOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {reportData?.totalGuru || 0}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Total Guru
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(79, 172, 254, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <BookOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {reportData?.totalHalaqah || 0}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Total Halaqah
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(67, 233, 123, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <CalendarOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {reportData?.totalJadwal || 0}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Total Jadwal
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(250, 112, 154, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <FileTextOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {reportData?.totalPengumuman || 0}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Pengumuman
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(168, 237, 234, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ textAlign: 'center', color: 'white' }}>
                <TrophyOutlined style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.9 }} />
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {reportData?.rataRataHafalan || 0}%
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Rata-rata Hafalan
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title={
                <span style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  📊 Tingkat Kehadiran
                </span>
              }
              style={{
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
              }}
              bodyStyle={{
                padding: '24px',
                background: 'transparent'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={reportData?.tingkatKehadiran || 0}
                  format={(percent) => `${percent}%`}
                  strokeColor={{
                    '0%': '#667eea',
                    '100%': '#764ba2',
                  }}
                  strokeWidth={12}
                  size={120}
                />
                <div style={{ marginTop: '16px', color: '#666' }}>
                  Tingkat kehadiran bulan ini
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <span style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  🏆 Performa Santri Terbaik
                </span>
              }
              style={{
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
              }}
              bodyStyle={{
                padding: '24px',
                background: 'transparent'
              }}
            >
              <Table
                columns={performanceColumns}
                dataSource={performanceData}
                pagination={false}
                size="small"
                style={{
                  background: 'transparent'
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}