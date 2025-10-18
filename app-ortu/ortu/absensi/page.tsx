"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Progress, List, Tag, Statistic, Select, Avatar, Calendar } from "antd";
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import LayoutApp from "../../../components/LayoutApp";
import dayjs from 'dayjs';

interface AbsensiData {
  id: number;
  status: string;
  tanggal: string;
  jadwal: {
    halaqah: {
      namaHalaqah: string;
    };
  };
}

export default function OrtuAbsensiPage() {
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [anakList, setAnakList] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  // Fetch dashboard data to get anak list
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/ortu");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setAnakList(data.anakList || []);

      // Set first anak as default
      if (data.anakList && data.anakList.length > 0 && !selectedSantriId) {
        setSelectedSantriId(data.anakList[0].id);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch absensi data for selected santri
  const fetchAbsensiData = async (santriId: number) => {
    try {
      const res = await fetch(`/api/users/${santriId}`);
      if (res.ok) {
        const userData = await res.json();
        setAbsensiData(userData.Absensi || []);
      }
    } catch (error) {
      console.error("Error fetching absensi data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedSantriId) {
      fetchAbsensiData(selectedSantriId);
    }
  }, [selectedSantriId]);

  // Filter data by selected month
  const filteredAbsensi = absensiData.filter(absensi => {
    const absensiDate = dayjs(absensi.tanggal);
    return absensiDate.year() === selectedMonth.year() &&
           absensiDate.month() === selectedMonth.month();
  });

  // Calculate statistics
  const stats = {
    totalDays: filteredAbsensi.length,
    presentDays: filteredAbsensi.filter(a => a.status === 'masuk').length,
    izinDays: filteredAbsensi.filter(a => a.status === 'izin').length,
    alphaDays: filteredAbsensi.filter(a => a.status === 'alpha').length,
    attendanceRate: filteredAbsensi.length > 0 ?
      Math.round((filteredAbsensi.filter(a => a.status === 'masuk').length / filteredAbsensi.length) * 100) : 0,
    recentAbsensi: filteredAbsensi
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, 10)
  };

  // Get attendance status for calendar
  const getAttendanceStatus = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const attendance = absensiData.find(a => dayjs(a.tanggal).format('YYYY-MM-DD') === dateStr);
    return attendance?.status || null;
  };

  // Calendar cell renderer
  const cellRender = (current: dayjs.Dayjs) => {
    const status = getAttendanceStatus(current);
    if (!status) return null;

    const color = status === 'masuk' ? '#52c41a' :
                  status === 'izin' ? '#fa8c16' : '#f5222d';

    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: color
        }} />
      </div>
    );
  };

  const selectedSantri = anakList.find(anak => anak.id === selectedSantriId);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0 }}>Absensi Anak</h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>
              Monitor kehadiran anak dalam kegiatan hafalan
            </p>
          </div>
        </div>

        {/* Santri Selector */}
        {anakList.length > 1 && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card bordered={false}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: 0, marginBottom: 8 }}>Pilih Anak</h3>
                  <Select
                    style={{ width: '100%', maxWidth: 300 }}
                    placeholder="Pilih anak"
                    value={selectedSantriId}
                    onChange={(value) => setSelectedSantriId(value)}
                  >
                    {anakList.map((anak) => (
                      <Select.Option key={anak.id} value={anak.id}>
                        {anak.namaLengkap}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Santri Info */}
        {selectedSantri && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card bordered={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
                    {selectedSantri.namaLengkap.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <h2 style={{ margin: 0, color: '#1890ff' }}>{selectedSantri.namaLengkap}</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                      Santri • Username: @{selectedSantri.username}
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Statistics Overview */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Hari"
                value={stats.totalDays}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hadir"
                value={stats.presentDays}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Izin"
                value={stats.izinDays}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Alpha"
                value={stats.alphaDays}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: "#f5222d" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Attendance Rate */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              title="Tingkat Kehadiran"
              bordered={false}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Progress
                  type="circle"
                  percent={stats.attendanceRate}
                  format={() => `${stats.attendanceRate}%`}
                  width={120}
                  status={stats.attendanceRate >= 80 ? 'success' : stats.attendanceRate >= 60 ? 'normal' : 'exception'}
                />
                <div>
                  <h3 style={{ margin: 0, marginBottom: 8 }}>Kehadiran Bulan Ini</h3>
                  <p style={{ margin: 0, color: '#666' }}>
                    {stats.attendanceRate >= 80 && "🎉 Kehadiran sangat baik! Terus pertahankan!"}
                    {stats.attendanceRate >= 60 && stats.attendanceRate < 80 && "👍 Kehadiran cukup baik, tingkatkan lagi ya!"}
                    {stats.attendanceRate < 60 && "⚠️ Perlu lebih disiplin dalam kehadiran"}
                  </p>
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: 14 }}>
                    {stats.presentDays} hari hadir dari {stats.totalDays} hari kegiatan
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Calendar View */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              title={`Kalender Kehadiran - ${selectedMonth.format('MMMM YYYY')}`}
              bordered={false}
            >
              <Calendar
                value={selectedMonth}
                onChange={(date) => setSelectedMonth(date)}
                cellRender={cellRender}
                fullscreen={false}
              />
              <div style={{ marginTop: 16, display: 'flex', gap: 16, justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#52c41a' }} />
                  <span>Hadir</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#fa8c16' }} />
                  <span>Izin</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f5222d' }} />
                  <span>Alpha</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Attendance */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title="Riwayat Kehadiran Terbaru"
              bordered={false}
            >
              <List
                size="small"
                dataSource={stats.recentAbsensi}
                renderItem={(absensi) => (
                  <List.Item>
                    <List.Item.Meta
                      title={new Date(absensi.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      description={`Halaqah: ${absensi.jadwal.halaqah.namaHalaqah}`}
                    />
                    <Tag color={
                      absensi.status === 'masuk' ? 'green' :
                      absensi.status === 'izin' ? 'orange' : 'red'
                    }>
                      {absensi.status === 'masuk' ? '✓ Hadir' :
                       absensi.status === 'izin' ? '⏳ Izin' : '✗ Alpha'}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}