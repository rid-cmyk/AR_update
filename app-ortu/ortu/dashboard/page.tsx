"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Space, Button, message, Select, Avatar, Badge, Progress, List, Tag } from "antd";
import { UserOutlined, BookOutlined, CalendarOutlined, TrophyOutlined, BellOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import LayoutApp from "@/components/LayoutApp";

interface Anak {
  id: number;
  namaLengkap: string;
  username: string;
  Hafalan: Array<{
    id: number;
    tanggal: string;
    surat: string;
    ayatMulai: number;
    ayatSelesai: number;
    status: string;
  }>;
  TargetHafalan: Array<{
    id: number;
    surat: string;
    ayatTarget: number;
    deadline: string;
    status: string;
  }>;
  Absensi: Array<{
    id: number;
    status: string;
    tanggal: string;
    jadwal: {
      halaqah: {
        namaHalaqah: string;
      };
    };
  }>;
  Prestasi: Array<{
    id: number;
    namaPrestasi: string;
    keterangan: string;
    tahun: number;
    validated: boolean;
  }>;
  Ujian: Array<{
    id: number;
    jenis: string;
    nilai: number;
    tanggal: string;
  }>;
}

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  targetAudience: string;
}

export default function OrangTuaDashboard() {
  const [anakList, setAnakList] = useState<Anak[]>([]);
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnakId, setSelectedAnakId] = useState<number | null>(null);

  // Fetch data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/ortu");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setAnakList(data.anakList || []);
      setPengumuman(data.pengumuman || []);
    } catch (error) {
      console.error("Dashboard error:", error);
      message.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Set selected anak to first one if not set and anakList is loaded
  useEffect(() => {
    if (anakList.length > 0 && selectedAnakId === null) {
      setSelectedAnakId(anakList[0].id);
    }
  }, [anakList, selectedAnakId]);

  // Get selected anak data
  const anakData = anakList.find(anak => anak.id === selectedAnakId) || null;

  // Calculate statistics for anak
  const hafalanStats = anakData ? {
    totalHafalan: anakData.Hafalan.length,
    completedTargets: anakData.TargetHafalan.filter(t => t.status === 'selesai').length,
    totalTargets: anakData.TargetHafalan.length,
    attendanceRate: anakData.Absensi.length > 0 ?
      Math.round((anakData.Absensi.filter(a => a.status === 'masuk').length / anakData.Absensi.length) * 100) : 0
  } : null;

  const recentAbsensi = anakData?.Absensi?.slice(0, 5) || [];
  const validatedPrestasi = anakData?.Prestasi?.filter(p => p.validated) || [];
  const unreadPengumuman = pengumuman.filter(p => !p.dibacaOleh?.some((d: any) => d.userId === anakData?.id));

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0 }}>Dashboard Orang Tua</h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>
              Monitoring perkembangan anak di pesantren
            </p>
          </div>
          <Space>
            <Badge count={unreadPengumuman.length} showZero={false}>
              <Button icon={<BellOutlined />} type="primary">
                Pengumuman
              </Button>
            </Badge>
          </Space>
        </div>

        {/* Anak Selector */}
        {anakList.length > 1 && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card bordered={false}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: 0, marginBottom: 8 }}>Pilih Anak</h3>
                  <Select
                    style={{ width: '100%', maxWidth: 300 }}
                    placeholder="Pilih anak"
                    value={selectedAnakId}
                    onChange={(value) => setSelectedAnakId(value)}
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

        {/* Anak Info */}
        {anakData && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card bordered={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
                    {anakData.namaLengkap.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <h2 style={{ margin: 0, color: '#1890ff' }}>{anakData.namaLengkap}</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                      Santri • Username: @{anakData.username}
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Statistics Cards */}
        {hafalanStats && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Hafalan"
                  value={hafalanStats.totalHafalan}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Target Selesai"
                  value={`${hafalanStats.completedTargets}/${hafalanStats.totalTargets}`}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Kehadiran"
                  value={hafalanStats.attendanceRate}
                  suffix="%"
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: hafalanStats.attendanceRate >= 80 ? "#52c41a" : "#fa8c16" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Prestasi"
                  value={validatedPrestasi.length}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Main Content */}
        <Row gutter={[16, 16]}>
          {/* Hafalan Progress */}
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <BookOutlined />
                  Progres Hafalan {anakData?.namaLengkap}
                </Space>
              }
              bordered={false}
            >
              {anakData?.TargetHafalan && anakData.TargetHafalan.length > 0 ? (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {anakData.TargetHafalan.map((target: any) => (
                    <div key={target.id} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>{target.surat}</span>
                        <Tag color={
                          target.status === 'selesai' ? 'green' :
                          target.status === 'proses' ? 'blue' : 'orange'
                        }>
                          {target.status}
                        </Tag>
                      </div>
                      <Progress
                        percent={target.status === 'selesai' ? 100 : target.status === 'proses' ? 50 : 0}
                        status={target.status === 'selesai' ? 'success' : 'active'}
                        size="small"
                      />
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        Target: {target.ayatTarget} ayat • Deadline: {new Date(target.deadline).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  Belum ada target hafalan
                </div>
              )}
            </Card>
          </Col>

          {/* Recent Absensi */}
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  Absensi Terbaru
                </Space>
              }
              bordered={false}
            >
              {recentAbsensi.length > 0 ? (
                <List
                  size="small"
                  dataSource={recentAbsensi}
                  renderItem={(absensi) => (
                    <List.Item>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {new Date(absensi.tanggal).toLocaleDateString('id-ID')}
                          </div>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {absensi.jadwal.halaqah.namaHalaqah}
                          </div>
                        </div>
                        <Tag color={
                          absensi.status === 'masuk' ? 'green' :
                          absensi.status === 'izin' ? 'orange' : 'red'
                        }>
                          {absensi.status}
                        </Tag>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  Belum ada data absensi
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Prestasi & Pengumuman */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <TrophyOutlined />
                  Prestasi Tervalidasi
                </Space>
              }
              bordered={false}
            >
              {validatedPrestasi.length > 0 ? (
                <List
                  size="small"
                  dataSource={validatedPrestasi}
                  renderItem={(prestasi) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<TrophyOutlined style={{ color: '#fa8c16' }} />}
                        title={prestasi.namaPrestasi}
                        description={`${prestasi.keterangan} • Tahun ${prestasi.tahun}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  Belum ada prestasi tervalidasi
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <BellOutlined />
                  Pengumuman Terbaru
                </Space>
              }
              bordered={false}
            >
              {pengumuman.length > 0 ? (
                <List
                  size="small"
                  dataSource={pengumuman.slice(0, 5)}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.judul}
                        description={`${item.isi.substring(0, 100)}... • ${new Date(item.tanggal).toLocaleDateString('id-ID')}`}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  Belum ada pengumuman
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}