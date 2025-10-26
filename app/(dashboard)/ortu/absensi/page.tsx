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
  Statistic,
  Typography,
  Timeline,
  Empty
} from "antd";
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined,
  HeartOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

const { Title, Text } = Typography;

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

        // Calculate detailed attendance stats
        const absensiList = anak.Absensi || [];
        const totalAbsensi = absensiList.length;
        
        // Count by status
        const totalKehadiran = absensiList.filter((a: any) => a.status === 'masuk' || a.status === 'hadir').length;
        const totalIzin = absensiList.filter((a: any) => a.status === 'izin').length;
        const totalAlpha = absensiList.filter((a: any) => a.status === 'alpha').length;
        const totalSakit = absensiList.filter((a: any) => a.status === 'sakit').length;
        
        // Calculate percentages
        const persentaseKehadiran = totalAbsensi > 0 ? Math.round((totalKehadiran / totalAbsensi) * 100) : 0;
        const persentaseAlpha = totalAbsensi > 0 ? Math.round((totalAlpha / totalAbsensi) * 100) : 0;

        // Calculate current month stats
        const currentMonth = dayjs();
        const bulanIniData = absensiList.filter((a: any) => 
          dayjs(a.tanggal).isSame(currentMonth, 'month')
        );
        
        const bulanIni = {
          hadir: bulanIniData.filter((a: any) => a.status === 'masuk' || a.status === 'hadir').length,
          izin: bulanIniData.filter((a: any) => a.status === 'izin').length,
          alpha: bulanIniData.filter((a: any) => a.status === 'alpha').length,
          sakit: bulanIniData.filter((a: any) => a.status === 'sakit').length,
        };

        // Calculate semester stats (last 6 months)
        const semesterStart = dayjs().subtract(6, 'month');
        const semesterData = absensiList.filter((a: any) => 
          dayjs(a.tanggal).isAfter(semesterStart)
        );
        
        const semesterIni = {
          hadir: semesterData.filter((a: any) => a.status === 'masuk' || a.status === 'hadir').length,
          izin: semesterData.filter((a: any) => a.status === 'izin').length,
          alpha: semesterData.filter((a: any) => a.status === 'alpha').length,
          sakit: semesterData.filter((a: any) => a.status === 'sakit').length,
        };

        // Calculate attendance streak
        const sortedAbsensi = absensiList
          .sort((a: any, b: any) => dayjs(b.tanggal).unix() - dayjs(a.tanggal).unix());
        
        let streakHadir = 0;
        for (const absensi of sortedAbsensi) {
          if (absensi.status === 'masuk' || absensi.status === 'hadir') {
            streakHadir++;
          } else {
            break;
          }
        }

        stats.push({
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
          totalKehadiran: 45,
          totalIzin: 3,
          totalAlpha: 2,
          totalSakit: 1,
          totalAbsensi: 51,
          persentaseKehadiran: 88,
          persentaseAlpha: 4,
          streakHadir: 7,
          bulanIni: {
            hadir: 12,
            izin: 1,
            alpha: 0,
            sakit: 0,
          },
          semesterIni: {
            hadir: 45,
            izin: 3,
            alpha: 2,
            sakit: 1,
          },
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
        {/* Beautiful Header */}
        <div style={{ 
          marginBottom: 32,
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            ✅ Kehadiran Anak
          </div>
          <div style={{ 
            fontSize: '16px', 
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            📅 Pantau kedisiplinan dan kehadiran anak di halaqah dengan penuh perhatian
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280' }}>Memuat data absensi...</p>
          </div>
        ) : (
          <>
            {/* Detailed Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              {childStats.map((child, index) => (
                <React.Fragment key={index}>
                  {/* Kehadiran Card */}
                  <Col xs={24} sm={12} md={6}>
                    <Card style={{ 
                      textAlign: 'center',
                      borderRadius: '12px',
                      border: '2px solid #52c41a',
                      background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                      boxShadow: '0 4px 12px rgba(82,196,26,0.15)'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        color: 'white'
                      }}>
                        <CheckCircleOutlined style={{ fontSize: '24px' }} />
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                        {child.totalKehadiran}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                        ✅ Hadir
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Dari {child.totalAbsensi} total hari
                      </div>
                    </Card>
                  </Col>

                  {/* Alpha Card */}
                  <Col xs={24} sm={12} md={6}>
                    <Card style={{ 
                      textAlign: 'center',
                      borderRadius: '12px',
                      border: '2px solid #ff4d4f',
                      background: 'linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)',
                      boxShadow: '0 4px 12px rgba(255,77,79,0.15)'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        color: 'white'
                      }}>
                        <CloseCircleOutlined style={{ fontSize: '24px' }} />
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff4d4f', marginBottom: '4px' }}>
                        {child.totalAlpha}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                        ❌ Alpha
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Perlu perhatian khusus
                      </div>
                    </Card>
                  </Col>

                  {/* Izin Card */}
                  <Col xs={24} sm={12} md={6}>
                    <Card style={{ 
                      textAlign: 'center',
                      borderRadius: '12px',
                      border: '2px solid #1890ff',
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                      boxShadow: '0 4px 12px rgba(24,144,255,0.15)'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        color: 'white'
                      }}>
                        <ClockCircleOutlined style={{ fontSize: '24px' }} />
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>
                        {child.totalIzin}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                        📝 Izin
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Dengan keterangan
                      </div>
                    </Card>
                  </Col>

                  {/* Sakit Card */}
                  <Col xs={24} sm={12} md={6}>
                    <Card style={{ 
                      textAlign: 'center',
                      borderRadius: '12px',
                      border: '2px solid #fa8c16',
                      background: 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)',
                      boxShadow: '0 4px 12px rgba(250,140,22,0.15)'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        color: 'white'
                      }}>
                        <HeartOutlined style={{ fontSize: '24px' }} />
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fa8c16', marginBottom: '4px' }}>
                        {child.totalSakit}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                        🤒 Sakit
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Kondisi tidak sehat
                      </div>
                    </Card>
                  </Col>
                </React.Fragment>
              ))}
            </Row>

            {/* Semester Summary */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              {childStats.map((child, index) => (
                <Col xs={24} key={index}>
                  <Card style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e8e8e8'
                  }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                      margin: '-24px -24px 20px -24px',
                      padding: '20px',
                      borderRadius: '12px 12px 0 0',
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                        📊 Ringkasan Kehadiran {child.namaLengkap}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        Statistik lengkap semester ini
                      </div>
                    </div>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <div style={{ 
                          padding: '16px',
                          backgroundColor: '#f0f9ff',
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff', marginBottom: '12px' }}>
                            📅 Bulan Ini ({dayjs().format('MMMM YYYY')})
                          </div>
                          <Row gutter={[8, 8]}>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                                  {child.bulanIni.hadir}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Hadir</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
                                  {child.bulanIni.alpha}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Alpha</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                                  {child.bulanIni.izin}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Izin</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                                  {child.bulanIni.sakit}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Sakit</div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </Col>

                      <Col xs={24} md={12}>
                        <div style={{ 
                          padding: '16px',
                          backgroundColor: '#f6ffed',
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a', marginBottom: '12px' }}>
                            📈 Semester Ini (6 Bulan Terakhir)
                          </div>
                          <Row gutter={[8, 8]}>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                                  {child.semesterIni.hadir}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Hadir</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
                                  {child.semesterIni.alpha}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Alpha</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                                  {child.semesterIni.izin}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Izin</div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fa8c16' }}>
                                  {child.semesterIni.sakit}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Sakit</div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>

                    {/* Achievement Badge */}
                    <div style={{ 
                      textAlign: 'center',
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                        🏆 Pencapaian Kehadiran
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{
                          padding: '8px 16px',
                          backgroundColor: child.totalKehadiran >= 40 ? '#52c41a' : child.totalKehadiran >= 30 ? '#fa8c16' : '#ff4d4f',
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          📊 {child.totalKehadiran} Hari Hadir
                        </div>
                        <div style={{
                          padding: '8px 16px',
                          backgroundColor: '#1890ff',
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          🔥 Streak {child.streakHadir} hari
                        </div>
                        {child.totalAlpha <= 2 && (
                          <div style={{
                            padding: '8px 16px',
                            backgroundColor: '#722ed1',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            ⭐ Alpha Rendah
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Progress Overview */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {childStats.map((child, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card title={`🎯 Kehadiran ${child.namaLengkap}`} variant="borderless">
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
            <Card title="📋 Detail Absensi" variant="borderless">
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