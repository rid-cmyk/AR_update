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
  Typography,
  Progress,
  message,
  Tag,
  Tooltip,
  Tabs,
  Badge,
} from "antd";
import {
  FileTextOutlined,
  BarChartOutlined,
  DownloadOutlined,
  CalendarOutlined,
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs, { Dayjs } from "dayjs";

interface ReportData {
  halaqahReports: Array<{
    id: number;
    namaHalaqah: string;
    namaGuru: string;
    totalSantri: number;
    totalHafalan: number;
    totalUjian: number;
    attendanceRate: number;
    hafalanRate: number;
  }>;
  santriReports: Array<{
    id: number;
    namaLengkap: string;
    halaqah: string;
    totalHafalan: number;
    totalUjian: number;
    targetAktif: number;
    attendanceRate: number;
    lastActivity: string | null;
  }>;
  guruReports: Array<{
    id: number;
    namaLengkap: string;
    halaqahCount: number;
    totalSantri: number;
    averageAttendance: number;
    permissionCount: number;
  }>;
  ujianReports?: Array<{
    id: number;
    santri: string;
    halaqah: string;
    jenisUjian: string;
    templateUjian: string;
    nilaiAkhir: number;
    status: string;
    tanggal: string;
    verifier: string;
    keterangan: string | null;
  }>;
  targetReports?: Array<{
    id: number;
    santri: string;
    halaqah: string;
    surat: string;
    ayatTarget: number;
    deadline: string;
    status: string;
    progress: number;
  }>;
  tahfidzReports?: Array<{
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
  }>;
  summary: {
    totalHalaqah: number;
    totalSantri: number;
    totalGuru: number;
    overallAttendance: number;
    overallHafalanProgress: number;
    totalHafalanRecords: number;
    totalUjian: number;
    totalTarget: number;
    targetProgress: number;
    totalRaport: number;
    totalPrestasi: number;
    totalPengumuman: number;
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
  const [reportType, setReportType] = useState<'halaqah' | 'santri' | 'guru' | 'ujian' | 'target' | 'tahfidz'>('halaqah');
  const [selectedSemester, setSelectedSemester] = useState<'S1' | 'S2'>('S1');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string>('2024/2025');

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      // Fetch main reports
      const res = await fetch(`/api/analytics/reports?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch report data");

      const data = await res.json();

      // Fetch additional reports based on type
      if (reportType === 'ujian' || reportType === 'target') {
        const ujianRes = await fetch(`/api/analytics/ujian-reports?startDate=${startDate}&endDate=${endDate}`);
        if (ujianRes.ok) {
          const ujianData = await ujianRes.json();
          data.ujianReports = ujianData.ujianReports;
          data.targetReports = ujianData.targetReports;
        }
      }

      if (reportType === 'tahfidz') {
        const tahfidzRes = await fetch(`/api/analytics/tahfidz-reports?semester=${selectedSemester}&tahunAjaran=${selectedTahunAjaran}`);
        if (tahfidzRes.ok) {
          const tahfidzData = await tahfidzRes.json();
          data.tahfidzReports = tahfidzData.reports;
        }
      }

      // Enhanced summary data
      data.summary = {
        ...data.summary,
        totalRaport: 0,
        totalPrestasi: 0,
        totalPengumuman: 0,
      };

      setReportData(data);
    } catch (error) {
      console.error("Report error:", error);
      message.error("Gagal memuat data laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType, selectedSemester, selectedTahunAjaran]);

  // Export functions
  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const data = getDataSource();
      const columns = getColumns();

      let csvContent = "data:text/csv;charset=utf-8,";
      const headers = columns.map(col => col.title).join(",");
      csvContent += headers + "\n";

      data.forEach((row: any) => {
        const values = columns.map(col => {
          const value = row[col.dataIndex as string];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(",");
        csvContent += values + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `laporan_${reportType}_${dayjs().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success("Laporan CSV berhasil diexport!");
    } catch (error) {
      message.error("Gagal export laporan CSV");
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration
  const getColumns = () => {
    switch (reportType) {
      case 'halaqah':
        return [
          {
            title: "Halaqah",
            dataIndex: "namaHalaqah",
            key: "namaHalaqah",
            render: (text: string) => <strong>{text}</strong>,
            sorter: (a: any, b: any) => a.namaHalaqah.localeCompare(b.namaHalaqah),
          },
          {
            title: "Guru Pembimbing",
            dataIndex: "namaGuru",
            key: "namaGuru",
            render: (text: string) => (
              <Tag icon={<UserOutlined />} color="blue">{text}</Tag>
            ),
          },
          {
            title: "Santri",
            dataIndex: "totalSantri",
            key: "totalSantri",
            render: (value: number) => (
              <Badge count={value} showZero color="#52c41a" />
            ),
            sorter: (a: any, b: any) => a.totalSantri - b.totalSantri,
          },
          {
            title: "Total Hafalan",
            dataIndex: "totalHafalan",
            key: "totalHafalan",
            render: (value: number) => (
              <Tag icon={<BookOutlined />} color="cyan">{value} record</Tag>
            ),
            sorter: (a: any, b: any) => a.totalHafalan - b.totalHafalan,
          },
          {
            title: "Total Ujian",
            dataIndex: "totalUjian",
            key: "totalUjian",
            render: (value: number) => (
              <Tag icon={<TrophyOutlined />} color="orange">{value} ujian</Tag>
            ),
            sorter: (a: any, b: any) => a.totalUjian - b.totalUjian,
          },
          {
            title: "Attendance Rate",
            dataIndex: "attendanceRate",
            key: "attendanceRate",
            render: (value: number) => (
              <Progress
                percent={value}
                size="small"
                status={value >= 80 ? "success" : value >= 60 ? "normal" : "exception"}
                format={(percent) => `${percent}%`}
              />
            ),
            sorter: (a: any, b: any) => a.attendanceRate - b.attendanceRate,
          },
          {
            title: "Hafalan Rate",
            dataIndex: "hafalanRate",
            key: "hafalanRate",
            render: (value: number) => (
              <Progress
                percent={value}
                size="small"
                status={value >= 75 ? "success" : value >= 50 ? "normal" : "exception"}
                format={(percent) => `${percent}%`}
              />
            ),
            sorter: (a: any, b: any) => a.hafalanRate - b.hafalanRate,
          },
        ];

      case 'santri':
        return [
          {
            title: "Nama Santri",
            dataIndex: "namaLengkap",
            key: "namaLengkap",
            render: (text: string) => <strong>{text}</strong>,
            sorter: (a: any, b: any) => a.namaLengkap.localeCompare(b.namaLengkap),
          },
          {
            title: "Halaqah",
            dataIndex: "halaqah",
            key: "halaqah",
            render: (text: string) => <Tag color="green">{text}</Tag>,
          },
          {
            title: "Total Hafalan",
            dataIndex: "totalHafalan",
            key: "totalHafalan",
            render: (value: number) => (
              <Tag icon={<BookOutlined />} color="blue">{value} record</Tag>
            ),
            sorter: (a: any, b: any) => a.totalHafalan - b.totalHafalan,
          },
          {
            title: "Total Ujian",
            dataIndex: "totalUjian",
            key: "totalUjian",
            render: (value: number) => (
              <Tag icon={<TrophyOutlined />} color="orange">{value} ujian</Tag>
            ),
            sorter: (a: any, b: any) => a.totalUjian - b.totalUjian,
          },
          {
            title: "Target Aktif",
            dataIndex: "targetAktif",
            key: "targetAktif",
            render: (value: number) => (
              <Tag icon={<ClockCircleOutlined />} color="purple">{value} target</Tag>
            ),
            sorter: (a: any, b: any) => a.targetAktif - b.targetAktif,
          },
          {
            title: "Attendance Rate",
            dataIndex: "attendanceRate",
            key: "attendanceRate",
            render: (value: number) => (
              <Progress
                percent={value}
                size="small"
                status={value >= 80 ? "success" : value >= 60 ? "normal" : "exception"}
              />
            ),
            sorter: (a: any, b: any) => a.attendanceRate - b.attendanceRate,
          },
          {
            title: "Last Activity",
            dataIndex: "lastActivity",
            key: "lastActivity",
            render: (date: string | null) =>
              date ? (
                <Tag color="green">{dayjs(date).format("DD/MM/YYYY")}</Tag>
              ) : (
                <Tag color="red" icon={<ExclamationCircleOutlined />}>Tidak ada</Tag>
              )
          },
        ];

      case 'guru':
        return [
          {
            title: "Nama Guru",
            dataIndex: "namaLengkap",
            key: "namaLengkap",
            render: (text: string) => <strong>{text}</strong>,
            sorter: (a: any, b: any) => a.namaLengkap.localeCompare(b.namaLengkap),
          },
          {
            title: "Halaqah",
            dataIndex: "halaqahCount",
            key: "halaqahCount",
            render: (value: number) => (
              <Tag icon={<TeamOutlined />} color="blue">{value} halaqah</Tag>
            ),
            sorter: (a: any, b: any) => a.halaqahCount - b.halaqahCount,
          },
          {
            title: "Total Santri",
            dataIndex: "totalSantri",
            key: "totalSantri",
            render: (value: number) => (
              <Badge count={value} showZero color="#52c41a" />
            ),
            sorter: (a: any, b: any) => a.totalSantri - b.totalSantri,
          },
          {
            title: "Permission",
            dataIndex: "permissionCount",
            key: "permissionCount",
            render: (value: number) => (
              <Tag icon={<CheckCircleOutlined />} color="green">{value} akses</Tag>
            ),
            sorter: (a: any, b: any) => a.permissionCount - b.permissionCount,
          },
          {
            title: "Avg Attendance",
            dataIndex: "averageAttendance",
            key: "averageAttendance",
            render: (value: number) => (
              <Progress
                percent={value}
                size="small"
                status={value >= 80 ? "success" : value >= 60 ? "normal" : "exception"}
              />
            ),
            sorter: (a: any, b: any) => a.averageAttendance - b.averageAttendance,
          },
        ];

      case 'ujian':
        return [
          {
            title: "Santri",
            dataIndex: "santri",
            key: "santri",
            render: (text: string) => <strong>{text}</strong>,
          },
          {
            title: "Halaqah",
            dataIndex: "halaqah",
            key: "halaqah",
            render: (text: string) => <Tag color="blue">{text}</Tag>,
          },
          {
            title: "Jenis Ujian",
            dataIndex: "jenisUjian",
            key: "jenisUjian",
            render: (text: string) => <Tag color="purple">{text.toUpperCase()}</Tag>,
          },
          {
            title: "Template",
            dataIndex: "templateUjian",
            key: "templateUjian",
          },
          {
            title: "Nilai Akhir",
            dataIndex: "nilaiAkhir",
            key: "nilaiAkhir",
            render: (value: number) => (
              <Tag color={value >= 80 ? "green" : value >= 60 ? "orange" : "red"}>
                {value.toFixed(1)}
              </Tag>
            ),
            sorter: (a: any, b: any) => a.nilaiAkhir - b.nilaiAkhir,
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
              const colors = {
                draft: "default",
                submitted: "processing",
                verified: "success",
                rejected: "error"
              };
              return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
            },
          },
          {
            title: "Tanggal",
            dataIndex: "tanggal",
            key: "tanggal",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
          },
          {
            title: "Verifier",
            dataIndex: "verifier",
            key: "verifier",
          },
        ];

      case 'target':
        return [
          {
            title: "Santri",
            dataIndex: "santri",
            key: "santri",
            render: (text: string) => <strong>{text}</strong>,
          },
          {
            title: "Halaqah",
            dataIndex: "halaqah",
            key: "halaqah",
            render: (text: string) => <Tag color="blue">{text}</Tag>,
          },
          {
            title: "Surat",
            dataIndex: "surat",
            key: "surat",
            render: (text: string) => <Tag color="green">{text}</Tag>,
          },
          {
            title: "Target Ayat",
            dataIndex: "ayatTarget",
            key: "ayatTarget",
            render: (value: number) => `${value} ayat`,
          },
          {
            title: "Deadline",
            dataIndex: "deadline",
            key: "deadline",
            render: (date: string) => {
              const isOverdue = dayjs(date).isBefore(dayjs());
              return (
                <Tag color={isOverdue ? "red" : "blue"}>
                  {dayjs(date).format("DD/MM/YYYY")}
                </Tag>
              );
            },
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
              const colors = {
                belum: "default",
                proses: "processing",
                selesai: "success"
              };
              return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
            },
          },
          {
            title: "Progress",
            dataIndex: "progress",
            key: "progress",
            render: (value: number) => (
              <Progress percent={value} size="small" />
            ),
          },
        ];

      case 'tahfidz':
        return [
          {
            title: "Nama Santri",
            dataIndex: "namaSantri",
            key: "namaSantri",
            render: (text: string) => <strong>{text}</strong>,
          },
          {
            title: "Halaqah",
            dataIndex: "halaqah",
            key: "halaqah",
            render: (text: string) => <Tag color="blue">{text}</Tag>,
          },
          {
            title: "Guru",
            dataIndex: "guru",
            key: "guru",
          },
          {
            title: "Total Hafalan",
            dataIndex: ["hafalan", "total"],
            key: "totalHafalan",
            render: (value: number, record: any) => (
              <Tooltip title={`Ziyadah: ${record.hafalan.ziyadah}, Murojaah: ${record.hafalan.murojaah}`}>
                <Tag color="cyan">{value} record</Tag>
              </Tooltip>
            ),
          },
          {
            title: "Total Ayat",
            dataIndex: ["hafalan", "totalAyat"],
            key: "totalAyat",
            render: (value: number) => <Tag color="green">{value} ayat</Tag>,
          },
          {
            title: "Kehadiran",
            dataIndex: ["absensi", "rate"],
            key: "attendanceRate",
            render: (value: number) => (
              <Progress percent={Math.round(value)} size="small" />
            ),
          },
          {
            title: "Target",
            dataIndex: ["target", "rate"],
            key: "targetRate",
            render: (value: number) => (
              <Progress percent={Math.round(value)} size="small" />
            ),
          },
          {
            title: "Prestasi",
            dataIndex: "prestasi",
            key: "prestasi",
            render: (value: number) => <Badge count={value} showZero />,
          },
          {
            title: "Nilai Akhir",
            dataIndex: "nilaiAkhir",
            key: "nilaiAkhir",
            render: (value: number) => (
              <Tag color={value >= 80 ? "green" : value >= 60 ? "orange" : "red"}>
                {value}
              </Tag>
            ),
          },
          {
            title: "Status",
            dataIndex: "statusAkhir",
            key: "statusAkhir",
            render: (status: string) => {
              const colors: Record<string, "success" | "warning" | "error" | "default" | "processing"> = {
                Hijau: "success",
                Kuning: "warning",
                Merah: "error"
              };
              return <Badge status={colors[status] || "default"} text={status} />;
            },
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
      case 'ujian':
        return reportData.ujianReports || [];
      case 'target':
        return reportData.targetReports || [];
      case 'tahfidz':
        return reportData.tahfidzReports || [];
      default:
        return [];
    }
  };

  const getReportTitle = () => {
    const titles = {
      halaqah: 'Laporan Kinerja Halaqah',
      santri: 'Laporan Progress Santri',
      guru: 'Laporan Kinerja Guru',
      ujian: 'Laporan Ujian',
      target: 'Laporan Target Hafalan',
      tahfidz: 'Laporan Tahfidz Komprehensif',
    };
    return titles[reportType];
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <FileTextOutlined style={{ marginRight: 12 }} />
            Sistem Laporan Komprehensif
          </Title>
          <Text type="secondary">
            Laporan lengkap untuk semua aspek sistem hafalan Al-Quran
          </Text>
        </div>

        {/* Enhanced Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Halaqah"
                value={reportData?.summary?.totalHalaqah || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Santri"
                value={reportData?.summary?.totalSantri || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Guru"
                value={reportData?.summary?.totalGuru || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
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
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
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
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Hafalan Records"
                value={reportData?.summary?.totalHafalanRecords || 0}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: "#13c2c2" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Ujian"
                value={reportData?.summary?.totalUjian || 0}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#f5222d" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Target Progress"
                value={reportData?.summary?.targetProgress || 0}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#389e0d" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Enhanced Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong>Jenis Laporan:</Text>
                <Select
                  value={reportType}
                  onChange={setReportType}
                  style={{ width: '100%', marginTop: 4 }}
                  size="large"
                >
                  <Select.Option value="halaqah">
                    <TeamOutlined /> Laporan Halaqah
                  </Select.Option>
                  <Select.Option value="santri">
                    <UserOutlined /> Laporan Santri
                  </Select.Option>
                  <Select.Option value="guru">
                    <UserOutlined /> Laporan Guru
                  </Select.Option>
                  <Select.Option value="ujian">
                    <TrophyOutlined /> Laporan Ujian
                  </Select.Option>
                  <Select.Option value="target">
                    <CheckCircleOutlined /> Laporan Target
                  </Select.Option>
                  <Select.Option value="tahfidz">
                    <BookOutlined /> Laporan Tahfidz
                  </Select.Option>
                </Select>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong>Periode Tanggal:</Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([dates[0], dates[1]]);
                    }
                  }}
                  format="DD/MM/YYYY"
                  style={{ width: '100%', marginTop: 4 }}
                  size="large"
                />
              </div>
            </Col>

            {reportType === 'tahfidz' && (
              <>
                <Col xs={24} sm={12} md={4}>
                  <div>
                    <Text strong>Semester:</Text>
                    <Select
                      value={selectedSemester}
                      onChange={setSelectedSemester}
                      style={{ width: '100%', marginTop: 4 }}
                      size="large"
                    >
                      <Select.Option value="S1">Semester 1</Select.Option>
                      <Select.Option value="S2">Semester 2</Select.Option>
                    </Select>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={4}>
                  <div>
                    <Text strong>Tahun Ajaran:</Text>
                    <Select
                      value={selectedTahunAjaran}
                      onChange={setSelectedTahunAjaran}
                      style={{ width: '100%', marginTop: 4 }}
                      size="large"
                    >
                      <Select.Option value="2024/2025">2024/2025</Select.Option>
                      <Select.Option value="2023/2024">2023/2024</Select.Option>
                    </Select>
                  </div>
                </Col>
              </>
            )}

            <Col xs={24} sm={12} md={4}>
              <div>
                <br />
                <Space>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    onClick={handleExportCSV}
                    loading={loading}
                  >
                    Export CSV
                  </Button>
                  <Button
                    icon={<FilePdfOutlined />}
                    onClick={() => message.info("Fitur PDF dalam pengembangan")}
                  >
                    Export PDF
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Report Table */}
        <Card
          title={
            <Space>
              <BarChartOutlined />
              {getReportTitle()}
            </Space>
          }
        >
          <Table
            dataSource={getDataSource() as any}
            columns={getColumns()}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} data`,
            }}
          />
        </Card>

        {/* Performance Overview */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Card title="Ringkasan Kehadiran" variant="borderless">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Progress
                  type="circle"
                  percent={reportData?.summary?.overallAttendance || 0}
                  format={(percent) => `${percent}%`}
                  strokeColor="#1890ff"
                  size={120}
                />
                <p style={{ marginTop: 16, color: '#666' }}>
                  Rata-rata kehadiran di semua halaqah
                </p>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Ringkasan Progress Hafalan" variant="borderless">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Progress
                  type="circle"
                  percent={reportData?.summary?.overallHafalanProgress || 0}
                  format={(percent) => `${percent}%`}
                  strokeColor="#52c41a"
                  size={120}
                />
                <p style={{ marginTop: 16, color: '#666' }}>
                  Rata-rata progress hafalan semua santri
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}