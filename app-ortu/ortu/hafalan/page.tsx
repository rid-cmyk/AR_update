"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Progress, List, Tag, Statistic, Select, Avatar } from "antd";
import { BookOutlined, CheckCircleOutlined, TrophyOutlined, CalendarOutlined } from "@ant-design/icons";
import LayoutApp from "../../../components/LayoutApp";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HafalanData {
  id: number;
  tanggal: string;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: string;
  santri: {
    namaLengkap: string;
  };
}

interface TargetData {
  id: number;
  surat: string;
  ayatTarget: number;
  deadline: string;
  status: string;
  santri: {
    namaLengkap: string;
  };
}

export default function OrtuHafalanPage() {
  const [hafalanData, setHafalanData] = useState<HafalanData[]>([]);
  const [targetData, setTargetData] = useState<TargetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [anakList, setAnakList] = useState<any[]>([]);

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

  // Fetch hafalan data for selected santri
  const fetchHafalanData = async (santriId: number) => {
    try {
      const res = await fetch(`/api/users/${santriId}`);
      if (res.ok) {
        const userData = await res.json();
        setHafalanData(userData.Hafalan || []);
        setTargetData(userData.TargetHafalan || []);
      }
    } catch (error) {
      console.error("Error fetching hafalan data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedSantriId) {
      fetchHafalanData(selectedSantriId);
    }
  }, [selectedSantriId]);

  // Calculate statistics
  const stats = {
    totalHafalan: hafalanData.length,
    completedTargets: targetData.filter(t => t.status === 'selesai').length,
    totalTargets: targetData.length,
    recentHafalan: hafalanData.slice(0, 10),
    ziyadahCount: hafalanData.filter(h => h.status === 'ziyadah').length,
    murojaahCount: hafalanData.filter(h => h.status === 'murojaah').length
  };

  // Prepare chart data (last 30 days)
  const chartData = hafalanData.slice(0, 30).reverse().map((h, index) => ({
    day: index + 1,
    ayat: h.ayatMulai + h.ayatSelesai,
    surat: h.surat
  }));

  const selectedSantri = anakList.find(anak => anak.id === selectedSantriId);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0 }}>Hafalan Anak</h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>
              Monitor perkembangan hafalan anak Anda
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
                title="Total Hafalan"
                value={stats.totalHafalan}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Target Selesai"
                value={`${stats.completedTargets}/${stats.totalTargets}`}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ziyadah"
                value={stats.ziyadahCount}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Murojaah"
                value={stats.murojaahCount}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Progress Overview */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card
              title="Progres Target Hafalan"
              bordered={false}
            >
              <Progress
                type="circle"
                percent={stats.totalTargets > 0 ? Math.round((stats.completedTargets / stats.totalTargets) * 100) : 0}
                format={() => `${stats.completedTargets}/${stats.totalTargets}`}
                width={120}
                status={stats.completedTargets === stats.totalTargets && stats.totalTargets > 0 ? 'success' : 'active'}
              />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#666' }}>
                  {stats.completedTargets === stats.totalTargets && stats.totalTargets > 0
                    ? "🎉 Semua target hafalan telah tercapai!"
                    : `${stats.totalTargets - stats.completedTargets} target lagi perlu diselesaikan`}
                </p>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Grafik Hafalan 30 Hari Terakhir"
              bordered={false}
            >
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} ayat`,
                      `Surat ${props.payload.surat}`
                    ]}
                    labelFormatter={(label) => `Hari ke-${label}`}
                  />
                  <Line type="monotone" dataKey="ayat" stroke="#1890ff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Recent Hafalan */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title="Hafalan Terbaru"
              bordered={false}
            >
              <List
                size="small"
                dataSource={stats.recentHafalan}
                renderItem={(hafalan) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`Surat ${hafalan.surat} (${hafalan.ayatMulai}-${hafalan.ayatSelesai})`}
                      description={`${new Date(hafalan.tanggal).toLocaleDateString('id-ID')} • ${hafalan.ayatSelesai - hafalan.ayatMulai + 1} ayat`}
                    />
                    <Tag color={
                      hafalan.status === 'ziyadah' ? 'blue' :
                      hafalan.status === 'murojaah' ? 'green' : 'orange'
                    }>
                      {hafalan.status}
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