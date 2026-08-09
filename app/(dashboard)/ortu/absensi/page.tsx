 
"use client";

import React, { useEffect, useState } from "react";
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
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined,
  UserOutlined,
  HeartOutlined
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import OrtuAbsensiProgress from "@/components/ortu/absensi/OrtuAbsensiProgress";
import OrtuAbsensiStatCards from "@/components/ortu/absensi/OrtuAbsensiStatCards";
import dayjs from "dayjs";
import styles from "./AbsensiAnak.module.css";
import { useOrtuChildDashboard } from "@/hooks/useOrtuChildDashboard";
import { useStatusTag, ABSENSI_STATUS_TAGS } from "@/hooks/useStatusTag";
import { useTablePagination } from "@/hooks/useTablePagination";
import SemesterSummaryCards from "@/components/ortu/absensi/SemesterSummaryCards";

interface AbsensiData {
  id: number;
  status: string;
  tanggal: string;
  catatan?: string;
  santri: {
    namaLengkap: string;
    username: string;
  };
  jadwal: {
    halaqah: {
      namaHalaqah: string;
    };
  };
}

interface ChildAttendanceStats {
  namaLengkap: string;
  totalKehadiran: number;
  totalIzin: number;
  totalAlpha: number;
  totalSakit: number;
  totalAbsensi: number;
  persentaseKehadiran: number;
  persentaseAlpha: number;
  streakHadir: number;
  bulanIni: {
    hadir: number;
    izin: number;
    alpha: number;
    sakit: number;
  };
  semesterIni: {
    hadir: number;
    izin: number;
    alpha: number;
    sakit: number;
  };
}

export default function AbsensiAnak() {
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const { data, children, loading, selectedChild, setSelectedChild } = useOrtuChildDashboard<{
    absensi: AbsensiData[];
    stats: ChildAttendanceStats[];
  }>({
    endpoint: "/api/ortu/dashboard",
    defaultSelectedChild: "",
    transformAnak: (anak: any) => {
      const absensi: AbsensiData[] = [];
      (anak.Absensi || []).forEach((item: any) => {
        absensi.push({
          id: item.id,
          status: item.status,
          tanggal: item.tanggal,
          catatan: item.catatan,
          santri: {
            namaLengkap: anak.namaLengkap,
            username: anak.username,
          },
          jadwal: item.jadwal,
        });
      });

      const absensiList = anak.Absensi || [];
      const totalAbsensi = absensiList.length;

      const totalKehadiran = absensiList.filter((a: any) => a.status === "masuk" || a.status === "hadir").length;
      const totalIzin = absensiList.filter((a: any) => a.status === "izin").length;
      const totalAlpha = absensiList.filter((a: any) => a.status === "alpha").length;
      const totalSakit = absensiList.filter((a: any) => a.status === "sakit").length;

      const persentaseKehadiran = totalAbsensi > 0 ? Math.round((totalKehadiran / totalAbsensi) * 100) : 0;
      const persentaseAlpha = totalAbsensi > 0 ? Math.round((totalAlpha / totalAbsensi) * 100) : 0;

      const currentMonth = dayjs();
      const bulanIniData = absensiList.filter((a: any) =>
        dayjs(a.tanggal).isSame(currentMonth, "month")
      );
      const bulanIni = {
        hadir: bulanIniData.filter((a: any) => a.status === "masuk" || a.status === "hadir").length,
        izin: bulanIniData.filter((a: any) => a.status === "izin").length,
        alpha: bulanIniData.filter((a: any) => a.status === "alpha").length,
        sakit: bulanIniData.filter((a: any) => a.status === "sakit").length,
      };

      const semesterStart = dayjs().subtract(6, "month");
      const semesterData = absensiList.filter((a: any) =>
        dayjs(a.tanggal).isAfter(semesterStart)
      );
      const semesterIni = {
        hadir: semesterData.filter((a: any) => a.status === "masuk" || a.status === "hadir").length,
        izin: semesterData.filter((a: any) => a.status === "izin").length,
        alpha: semesterData.filter((a: any) => a.status === "alpha").length,
        sakit: semesterData.filter((a: any) => a.status === "sakit").length,
      };

      const sortedAbsensi = [...absensiList]
        .sort((a: any, b: any) => dayjs(b.tanggal).unix() - dayjs(a.tanggal).unix());
      let streakHadir = 0;
      for (const item of sortedAbsensi) {
        if (item.status === "masuk" || item.status === "hadir") {
          streakHadir++;
        } else {
          break;
        }
      }

      return {
        data: {
          absensi,
          stats: [
            {
              namaLengkap: anak.namaLengkap,
              totalKehadiran,
              totalIzin,
              totalAlpha,
              totalSakit,
              totalAbsensi,
              persentaseKehadiran,
              persentaseAlpha,
              streakHadir,
              bulanIni,
              semesterIni,
            },
          ],
        },
        child: { id: anak.id, namaLengkap: anak.namaLengkap, username: anak.username },
      };
    },
    initialData: {
      absensi: [],
      stats: [],
    },
  });

  const absensiData = data.absensi;
  const childStats = data.stats;
  const childNames = children.map((c) => c.namaLengkap);

  // Filter data based on selected child and month
  const filteredData = absensiData.filter((item) => {
    const matchesChild = !selectedChild || item.santri.namaLengkap === selectedChild;
    const itemMonth = dayjs(item.tanggal);
    const matchesMonth = itemMonth.isSame(selectedMonth, "month");
    return matchesChild && matchesMonth;
  });

  // Calculate filtered stats based on selected month and child
  const filteredStats = childStats
    .filter(child => !selectedChild || child.namaLengkap === selectedChild)
    .map(child => {
      // Filter absensi data for this child and selected month
      const childAbsensiData = absensiData.filter(item =>
        item.santri.namaLengkap === child.namaLengkap &&
        dayjs(item.tanggal).isSame(selectedMonth, "month")
      );

      const totalAbsensi = childAbsensiData.length;
      const totalKehadiran = childAbsensiData.filter(a => a.status === "masuk" || a.status === "hadir").length;
      const totalIzin = childAbsensiData.filter(a => a.status === "izin").length;
      const totalAlpha = childAbsensiData.filter(a => a.status === "alpha").length;
      const totalSakit = childAbsensiData.filter(a => a.status === "sakit").length;
      const persentaseKehadiran = totalAbsensi > 0 ? Math.round((totalKehadiran / totalAbsensi) * 100) : 0;

      const sortedAbsensi = [...childAbsensiData]
        .sort((a, b) => dayjs(b.tanggal).unix() - dayjs(a.tanggal).unix());
      let streakHadir = 0;
      for (const item of sortedAbsensi) {
        if (item.status === "masuk" || item.status === "hadir") {
          streakHadir++;
        } else {
          break;
        }
      }

      return {
        namaLengkap: child.namaLengkap,
        totalKehadiran,
        totalIzin,
        totalAlpha,
        totalSakit,
        totalAbsensi,
        persentaseKehadiran,
        persentaseAlpha: totalAbsensi > 0 ? Math.round((totalAlpha / totalAbsensi) * 100) : 0,
        streakHadir,
        bulanIni: child.bulanIni,
        semesterIni: child.semesterIni,
      };
    });

  // Set default selected child to first child when data loads
  useEffect(() => {
    if (childNames.length > 0 && !selectedChild) {
      setSelectedChild(childNames[0]);
    }
  }, [childNames, selectedChild]);

  const renderStatus = useStatusTag(ABSENSI_STATUS_TAGS, "alpha");
  const pagination = useTablePagination({ totalLabel: "absensi" });

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
      sorter: (a: AbsensiData, b: AbsensiData) => dayjs(a.tanggal).unix() - dayjs(b.tanggal).unix(),
    },
    {
      title: "Halaqah",
      dataIndex: ["jadwal", "halaqah", "namaHalaqah"],
      key: "halaqah",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Catatan",
      dataIndex: "catatan",
      key: "catatan",
      render: (catatan: string) => catatan || "-",
    },
  ];

  return (
    <>
      <div className={styles.pageContainer}>
        <AdminHeaderCard
          title="Kehadiran Anak"
          subtitle="Pantau kedisiplinan dan kehadiran anak di halaqah dengan penuh perhatian"
          tags={[
            { label: "Absensi", icon: <CalendarOutlined /> },
            { label: "Online", icon: <ClockCircleOutlined /> }
          ]}
          actions={
            childNames.length > 1 ? (
              <Tag color="blue" style={{ padding: '8px 16px', fontSize: 14 }}>
                {childNames.length} Anak Terdaftar
              </Tag>
            ) : undefined
          }
        />

        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
            <p className={styles.loadingText}>Memuat data absensi...</p>
          </div>
        ) : (
          <>
            {/* Filters - MOVED TO TOP */}
            <Card 
              title={
                <div className={styles.filterTitleWrapper}>
                  <div className={styles.filterIconWrapper}>
                    <CalendarOutlined style={{ fontSize: '20px' }} />
                  </div>
                  <span className={styles.filterTitleText}>
                    Filter Data Absensi
                  </span>
                </div>
              }
              className={styles.filterCard}
            >
              <Space size="large" wrap>
                {/* Show dropdown if there are children */}
                {childNames.length > 0 && (
                  <div>
                    <label className={styles.filterLabel}>
                      👶 Pilih Anak:
                    </label>
                    {childNames.length > 1 ? (
                      <Select
                        value={selectedChild}
                        onChange={setSelectedChild}
                        style={{ width: 250 }}
                        placeholder="Pilih anak"
                        size="large"
                      >
                        {childNames.map(child => (
                          <Select.Option key={child} value={child}>
                            <UserOutlined /> {child}
                          </Select.Option>
                        ))}
                      </Select>
                    ) : (
                      <div className={styles.childLabelWrapper}>
                        <UserOutlined /> {childNames[0]}
                      </div>
                    )}
                  </div>
                )}
                {childNames.length === 0 && (
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                      👶 Anak:
                    </label>
                    <div className={styles.noChildWrapper}>
                      Belum ada data anak
                    </div>
                  </div>
                )}
                <div>
                  <label className={styles.filterLabel}>
                    📅 Pilih Bulan:
                  </label>
                  <DatePicker
                    value={selectedMonth}
                    onChange={(date) => setSelectedMonth(date || dayjs())}
                    picker="month"
                    style={{ width: 200 }}
                    placeholder="Pilih bulan"
                    size="large"
                    format="MMMM YYYY"
                  />
                </div>
              </Space>
            </Card>

            {/* Info Card - Selected Filters */}
            {selectedChild && (
              <Card className={styles.selectedFilterCard}>
                <div className={styles.selectedFilterInner}>
                  <div className={styles.filterItem}>
                    <div className={styles.filterItemIcon}>
                      <UserOutlined style={{ fontSize: '18px' }} />
                    </div>
                    <div>
                      <div className={styles.filterItemSubtitle}>
                        Anak
                      </div>
                      <div className={styles.filterItemTitle}>
                        {selectedChild}
                      </div>
                    </div>
                  </div>
                  <div className={styles.filterItem}>
                    <div className={styles.filterItemIcon}>
                      <CalendarOutlined style={{ fontSize: '18px' }} />
                    </div>
                    <div>
                      <div className={styles.filterItemSubtitle}>
                        Periode
                      </div>
                      <div className={styles.filterItemTitle}>
                        {selectedMonth.format('MMMM YYYY')}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Detailed Statistics Cards - Filtered by Month */}
            <OrtuAbsensiStatCards filteredStats={filteredStats} />

            {/* Semester Summary */}
            <SemesterSummaryCards
              childStats={childStats}
              selectedChild={selectedChild}
            />
            {/* Progress Overview - Filtered by Month */}
            <OrtuAbsensiProgress filteredStats={filteredStats} />

            {/* Attendance Table */}
            <Card title="📋 Detail Absensi" variant="borderless">
              {filteredData.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div>
                      <div className={styles.emptyTitle}>
                        Tidak ada data absensi
                      </div>
                      <div className={styles.emptySubtitle}>
                        {selectedChild 
                          ? `Belum ada data absensi untuk ${selectedChild} pada ${selectedMonth.format('MMMM YYYY')}`
                          : `Belum ada data absensi pada ${selectedMonth.format('MMMM YYYY')}`
                        }
                      </div>
                    </div>
                  }
                  style={{ padding: '60px 20px' }}
                />
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="id"
                  pagination={pagination}
                  scroll={{ x: 800 }}
                />
              )}
            </Card>
          </>
        )}
      </div>
    </>
  );
}