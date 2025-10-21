"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Select,
  DatePicker,
  Space,
  Table,
  Statistic,
  Divider,
  Typography,
  Progress,
  message,
} from "antd";
import {
  FileTextOutlined,
  BarChartOutlined,
  DownloadOutlined,
  CalendarOutlined,
  TeamOutlined,
  BookOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs, { Dayjs } from "dayjs";

interface ReportData {
  halaqahReports: Array<{
    id: number;
    namaHalaqah: string;
    totalSantri: number;
    totalHafalan: number;
    attendanceRate: number;
    hafalanRate: number;
  }>;
  santriReports: Array<{
    id: number;
    namaLengkap: string;
    halaqah: string;
    totalHafalan: number;
    attendanceRate: number;
    lastActivity: string;
  }>;
  guruReports: Array<{
    id: number;
    namaLengkap: string;
    halaqahCount: number;
    totalSantri: number;
    averageAttendance: number;
  }>;
  summary: {
    totalHalaqah: number;
    totalSantri: number;
    totalGuru: number;
    overallAttendance: number;
    overallHafalanProgress: number;
    totalHafalanRecords: number;
  };
}

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export default function AdminLaporanPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [reportType, setReportType] = useState<'halaqah' | 'santri' | 'guru'>('halaqah');

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      const res = await fetch(`/api/analytics/reports?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch report data");

      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error("Report error:", error);
      // Set mock data for demo
      setReportData({
        halaqahReports: [
          {
            id: 1,
            namaHalaqah: "Halaqah Al-Fatihah",
            totalSantri: 15,
            totalHafalan: 45,
            attendanceRate: 92,
            hafalanRate: 85,
          },
          {
            id: 2,
            namaHalaqah: "Halaqah Al-Baqarah",
            totalSantri: 18,
            totalHafalan: 52,
            attendanceRate: 88,
            hafalanRate: 78,
          },
        ],
        santriReports: [
          {
            id: 1,
            namaLengkap: "Ahmad Rahman",
            halaqah: "Halaqah Al-Fatihah",
            totalHafalan: 12,
            attendanceRate: 95,
            lastActivity: "2024-01-15",
          },
          {
            id: 2,
            namaLengkap: "Fatimah Zahra",
            halaqah: "Halaqah Al-Baqarah",
            totalHafalan: 15,
            attendanceRate: 90,
            lastActivity: "2024-01-14",
          },
        ],
        guruReports: [
          {
            id: 1,
            namaLengkap: "Ust. Muhammad Ali",
            halaqahCount: 2,
            totalSantri: 33,
            averageAttendance: 90,
          },
        ],
        summary: {
          totalHalaqah: 8,
          totalSantri: 120,
          totalGuru: 6,
          overallAttendance: 89,
          overallHafalanProgress: 82,
          totalHafalanRecords: 245,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  // Export report
  const handleExport = () => {
    // In a real app, this would generate and download a PDF/Excel report
    console.log("Exporting report for:", reportType, "Date range:", dateRange);
    // For now, just show a message
    message.success("Report export feature coming soon!");
  };

  // Table columns based on report type
  const getColumns = () => {
    switch (reportType) {
      case 'halaqah':
        return [
          {
            title: "Halaqah",
            dataIndex: "namaHalaqah",
            key: "namaHalaqah",
            render: (text: string) => <strong>{text}</strong>,
          },
          {
            title: "Santri",
            dataIndex: "totalSantri",
            key: "totalSantri",
            render: (value: number) => `${value} orang`,
          },
          {
            title: "Total Hafalan",
            dataIndex: "totalHafalan",
            key: "totalHafalan",
            render: (value: number) => `${value} juz`,
          },
          {
            title: "Attendance Rate",
            dataIndex: "attendanceRate",
            key: "attendanceRate",
            render: (value: number) => (
              <Progress percent={value} size="small" status={value >= 80 ? "success" : "normal"} />
            ),
          },
          {
            title: "Hafalan Rate",
            dataIndex: "hafalanRate",
            key: "hafalanRate",
            render: (value: number) => (
              <Progress percent={value} size="small" status={value >= 75 ? "success" : "normal"} />
            ),
          },
        ];
      case 'santri':
        return [
          {
            title: "Nama Santri",
            dataIndex: "namaLengkap",
            key: "namaLengkap",
            render: (text: string) => <strong>{text}</strong>,
          },
          {
            title: "Halaqah",
            dataIndex: "halaqah",
            key: "halaqah",
          },
          {
            title: "Total Hafalan",
            dataIndex: "totalHafalan",
            key: "totalHafalan",
            render: (value: number) => `${value} juz`,
          },
          {
            title: "Attendance Rate",
            dataIndex: "attendanceRate",
            key: "attendanceRate",
            render: (value: number) => (
              <Progress percent={value} size="small" status={value >= 80 ? "success" : "normal"} />
            ),
          },
          {
            title: "Last Activity",
            dataIndex: "lastActivity",
            key: "lastActivity",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
          },
        ];
      case 'guru':
        return [
          {
            title: "Nama Guru",
            dataIndex: "namaLengkap",
            key: "namaLengkap",
            render: (text: string) => <strong>{text}</strong>,
          },
          {
            title: "Halaqah",
            dataIndex: "halaqahCount",
            key: "halaqahCount",
            render: (value: number) => `${value} halaqah`,
          },
          {
            title: "Total Santri",
            dataIndex: "totalSantri",
            key: "totalSantri",
            render: (value: number) => `${value} orang`,
          },
          {
            title: "Avg Attendance",
            dataIndex: "averageAttendance",
            key: "averageAttendance",
            render: (value: number) => (
              <Progress percent={value} size="small" status={value >= 80 ? "success" : "normal"} />
            ),
          },
        ];
      default:
        return [];
    }
  };

  const getDataSource = () => {
    if (!reportData) return [];
    switch (reportType) {
      case 'halaqah':
        return reportData.halaqahReports;
      case 'santri':
        return reportData.santriReports;
      case 'guru':
        return reportData.guruReports;
      default:
        return [];
    }
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <FileTextOutlined style={{ marginRight: 12 }} />
            Laporan Sistem
          </Title>
          <Text type="secondary">
            Comprehensive reports for halaqah performance and student progress
          </Text>
        </div>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Halaqah"
                value={reportData?.summary?.totalHalaqah || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Santri"
                value={reportData?.summary?.totalSantri || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Guru"
                value={reportData?.summary?.totalGuru || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Overall Attendance"
                value={reportData?.summary?.overallAttendance || 0}
                suffix="%"
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Hafalan Progress"
                value={reportData?.summary?.overallHafalanProgress || 0}
                suffix="%"
                prefix={<BookOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Records"
                value={reportData?.summary?.totalHafalanRecords || 0}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: "#13c2c2" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Space wrap size="large">
            <div>
              <Text strong>Report Type:</Text>
              <br />
              <Select
                value={reportType}
                onChange={setReportType}
                style={{ width: 150, marginTop: 4 }}
              >
                <Select.Option value="halaqah">Halaqah Report</Select.Option>
                <Select.Option value="santri">Santri Report</Select.Option>
                <Select.Option value="guru">Guru Report</Select.Option>
              </Select>
            </div>
            <div>
              <Text strong>Date Range:</Text>
              <br />
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
                format="DD/MM/YYYY"
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <br />
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                style={{ marginTop: 4 }}
              >
                Export Report
              </Button>
            </div>
          </Space>
        </Card>

        {/* Report Table */}
        <Card
          title={
            <Space>
              <BarChartOutlined />
              {reportType === 'halaqah' ? 'Halaqah Performance Report' :
               reportType === 'santri' ? 'Santri Progress Report' :
               'Guru Performance Report'}
            </Space>
          }
        >
          <Table
            dataSource={getDataSource() as any}
            columns={getColumns()}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        </Card>

        {/* Performance Overview */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Card title="Attendance Overview" bordered={false}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Progress
                  type="circle"
                  percent={reportData?.summary?.overallAttendance || 0}
                  format={(percent) => `${percent}%`}
                  strokeColor="#1890ff"
                  size={120}
                />
                <p style={{ marginTop: 16, color: '#666' }}>
                  Average attendance across all halaqah
                </p>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Hafalan Progress Overview" bordered={false}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Progress
                  type="circle"
                  percent={reportData?.summary?.overallHafalanProgress || 0}
                  format={(percent) => `${percent}%`}
                  strokeColor="#52c41a"
                  size={120}
                />
                <p style={{ marginTop: 16, color: '#666' }}>
                  Average hafalan progress across all santri
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}