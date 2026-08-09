 
"use client";

import { useEffect, useState, useCallback } from "react";
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
  Badge,
} from "antd";
import {
  FileTextOutlined,
  BarChartOutlined,
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
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import AdminLaporanPerformance from "@/components/admin/laporan/AdminLaporanPerformance";
import dayjs, { Dayjs } from "dayjs";
import styles from "./LaporanClient.module.css";
import { getColumns } from "./components/LaporanColumns";
import LaporanSummaryCards from "./components/LaporanSummaryCards";

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

export default function LaporanClient() {
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
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      // Fetch main reports and additional reports in parallel
      const fetchMain = fetch(`/api/analytics/reports?startDate=${startDate}&endDate=${endDate}`).then(res => {
        if (!res.ok) throw new Error("Failed to fetch report data");
        return res.json();
      });

      const promises = [fetchMain];
      let ujianIndex = -1;
      let tahfidzIndex = -1;

      if (reportType === 'ujian' || reportType === 'target') {
        ujianIndex = promises.length;
        promises.push(fetch(`/api/analytics/ujian-reports?startDate=${startDate}&endDate=${endDate}`).then(res => res.ok ? res.json() : null));
      }

      if (reportType === 'tahfidz') {
        tahfidzIndex = promises.length;
        promises.push(fetch(`/api/analytics/tahfidz-reports?semester=${selectedSemester}&tahunAjaran=${selectedTahunAjaran}`).then(res => res.ok ? res.json() : null));
      }

      const results = await Promise.all(promises);
      const data = results[0];

      if (ujianIndex !== -1 && results[ujianIndex]) {
        data.ujianReports = results[ujianIndex].ujianReports;
        data.targetReports = results[ujianIndex].targetReports;
      }

      if (tahfidzIndex !== -1 && results[tahfidzIndex]) {
        data.tahfidzReports = results[tahfidzIndex].reports;
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
  }, [dateRange, reportType, selectedSemester, selectedTahunAjaran]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Export functions
  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const data = getDataSource();
      const columns = getColumns(reportType);

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
    } catch {
      message.error("Gagal export laporan CSV");
    } finally {
      setLoading(false);
    }
  };

  // Columns are imported from components/LaporanColumns.tsx

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
    <>
      <div className={styles.container}>
        <AdminHeaderCard
          title="Laporan"
          subtitle="Laporan lengkap untuk semua aspek sistem hafalan Al-Quran"
        />

        <LaporanSummaryCards summary={reportData?.summary} />

        {/* Enhanced Filters */}
        <Card className={styles.filterCard}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong>Jenis Laporan:</Text>
                <Select
                  value={reportType}
                  onChange={setReportType}
                  className={styles.filterSelect}
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
                  className={styles.filterSelect}
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
                      className={styles.filterSelect}
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
                      className={styles.filterSelect}
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
              <div className={styles.exportButtons}>
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
                    onClick={() => window.print()}
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
            dataSource={getDataSource()}
            columns={getColumns(reportType)}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} data`,
            }}
            scroll={{ x: 1000 }}
            className={styles.reportTable}
          />
        </Card>

        {/* Performance Overview */}
        <AdminLaporanPerformance reportData={reportData} />
      </div>
    </>
  );
}