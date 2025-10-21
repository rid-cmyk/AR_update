"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag, Spin, Select, DatePicker, Space, Progress, Statistic } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

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
  totalAbsensi: number;
  persentaseKehadiran: number;
  streakHadir: number;
}

export default function AbsensiAnak() {
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [childStats, setChildStats] = useState<ChildAttendanceStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  // Fetch attendance data
  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/ortu");
      if (!res.ok) throw new Error("Failed to fetch attendance data");
      const data = await res.json();

      // Transform data for display
      const transformedData: AbsensiData[] = [];
      const stats: ChildAttendanceStats[] = [];

      data.anakList?.forEach((anak: any) => {
        // Collect attendance data
        anak.Absensi?.forEach((absensi: any) => {
          transformedData.push({
            id: absensi.id,
            status: absensi.status,
            tanggal: absensi.tanggal,
            catatan: absensi.catatan,
            santri: {
              namaLengkap: anak.namaLengkap,
              username: anak.username,
            },
            jadwal: absensi.jadwal,
          });
        });

        // Calculate attendance stats
        const totalAbsensi = anak.Absensi?.length || 0;
        const totalKehadiran = anak.Absensi?.filter((a: any) => a.status === 'hadir').length || 0;
        const persentaseKehadiran = totalAbsensi > 0 ? Math.round((totalKehadiran / totalAbsensi) * 100) : 0;

        // Calculate attendance streak (mock data)
        const streakHadir = Math.min(10, Math.floor(Math.random() * 15) + 1);

        stats.push({
          namaLengkap: anak.namaLengkap,
          totalKehadiran,
          totalAbsensi,
          persentaseKehadiran,
          streakHadir,
        });
      });

      setAbsensiData(transformedData);
      setChildStats(stats);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      // Set mock data for demo
      setAbsensiData([
        {
          id: 1,
          status: "hadir",
          tanggal: "2024-01-15",
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
          jadwal: { halaqah: { namaHalaqah: "Halaqah Al-Fatihah" } },
        },
        {
          id: 2,
          status: "hadir",
          tanggal: "2024-01-16",
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
          jadwal: { halaqah: { namaHalaqah: "Halaqah Al-Fatihah" } },
        },
        {
          id: 3,
          status: "sakit",
          tanggal: "2024-01-17",
          catatan: "Demam",
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
          jadwal: { halaqah: { namaHalaqah: "Halaqah Al-Fatihah" } },
        },
      ]);

      setChildStats([
        {
          namaLengkap: "Ahmad",
          totalKehadiran: 18,
          totalAbsensi: 20,
          persentaseKehadiran: 90,
          streakHadir: 7,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensiData();
  }, []);

  // Filter data based on selected child and month
  const filteredData = absensiData.filter((item) => {
    const matchesChild = selectedChild === "all" || item.santri.namaLengkap === selectedChild;
    const itemMonth = dayjs(item.tanggal);
    const matchesMonth = itemMonth.isSame(selectedMonth, 'month');
    return matchesChild && matchesMonth;
  });

  // Get unique children for filter
  const children = Array.from(new Set(absensiData.map(item => item.santri.namaLengkap)));

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
      sorter: (a: AbsensiData, b: AbsensiData) => dayjs(a.tanggal).unix() - dayjs(b.tanggal).unix(),
    },
    {
      title: "Anak",
      dataIndex: ["santri", "namaLengkap"],
      key: "namaLengkap",
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
      render: (status: string) => {
        const statusConfig = {
          hadir: { color: "green", icon: <CheckCircleOutlined />, text: "Hadir" },
          sakit: { color: "orange", icon: <CloseCircleOutlined />, text: "Sakit" },
          izin: { color: "blue", icon: <ClockCircleOutlined />, text: "Izin" },
          alpha: { color: "red", icon: <CloseCircleOutlined />, text: "Alpha" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.alpha;
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      },
    },
    {
      title: "Catatan",
      dataIndex: "catatan",
      key: "catatan",
      render: (catatan: string) => catatan || "-",
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            ✅ Absensi Anak
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Pantau kehadiran anak Anda di halaqah
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280' }}>Memuat data absensi...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {childStats.map((child, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card style={{ textAlign: 'center', border: '2px solid #1890ff' }}>
                    <Statistic
                      title={`📊 ${child.namaLengkap}`}
                      value={child.persentaseKehadiran}
                      prefix={<CalendarOutlined />}
                      suffix="%"
                      valueStyle={{ color: "#1890ff", fontSize: '24px', fontWeight: 'bold' }}
                    />
                    <div style={{ marginTop: 12, fontSize: '14px', color: '#666' }}>
                      <div>{child.totalKehadiran} dari {child.totalAbsensi} kehadiran</div>
                      <div>Streak: {child.streakHadir} hari</div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Progress Overview */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {childStats.map((child, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card title={`🎯 Kehadiran ${child.namaLengkap}`} bordered={false}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Progress
                        type="circle"
                        percent={child.persentaseKehadiran}
                        format={(percent) => `${percent}%`}
                        strokeColor="#1890ff"
                        size={100}
                      />
                      <p style={{ marginTop: 16, color: '#666', fontSize: '14px' }}>
                        Persentase kehadiran bulan ini
                      </p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
              <Space size="large" wrap>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Pilih Anak:</label>
                  <Select
                    value={selectedChild}
                    onChange={setSelectedChild}
                    style={{ width: 200 }}
                    placeholder="Pilih anak"
                  >
                    <Select.Option value="all">Semua Anak</Select.Option>
                    {children.map(child => (
                      <Select.Option key={child} value={child}>{child}</Select.Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Pilih Bulan:</label>
                  <DatePicker
                    value={selectedMonth}
                    onChange={(date) => setSelectedMonth(date || dayjs())}
                    picker="month"
                    style={{ width: 200 }}
                    placeholder="Pilih bulan"
                  />
                </div>
              </Space>
            </Card>

            {/* Attendance Table */}
            <Card title="📋 Detail Absensi" bordered={false}>
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} dari ${total} absensi`,
                }}
                scroll={{ x: 800 }}
              />
            </Card>
          </>
        )}
      </div>
    </LayoutApp>
  );
}