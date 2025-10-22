"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Timeline,
  Alert,
  Spin,
  Empty
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

interface Anak {
  id: number;
  namaLengkap: string;
  username: string;
  halaqah?: {
    id: number;
    namaHalaqah: string;
    guru: {
      namaLengkap: string;
    };
  };
}

interface HafalanProgress {
  totalSurat: number;
  totalAyat: number;
  progress: number;
  recentHafalan: Array<{
    id: number;
    surat: string;
    ayatMulai: number;
    ayatSelesai: number;
    tanggal: string;
    status: string;
  }>;
}

interface AbsensiSummary {
  totalHadir: number;
  totalIzin: number;
  totalAlpha: number;
  recentAbsensi: Array<{
    id: number;
    tanggal: string;
    status: string;
    jadwal: {
      hari: string;
      jamMulai: string;
      jamSelesai: string;
      halaqah: {
        namaHalaqah: string;
      };
    };
  }>;
}

interface Target {
  id: number;
  surat: string;
  ayatTarget: number;
  deadline: string;
  status: string;
  progress: number;
}

export default function OrtuDashboardPage() {
  const [anakList, setAnakList] = useState<Anak[]>([]);
  const [selectedAnak, setSelectedAnak] = useState<Anak | null>(null);
  const [hafalanProgress, setHafalanProgress] = useState<HafalanProgress | null>(null);
  const [absensiSummary, setAbsensiSummary] = useState<AbsensiSummary | null>(null);
  const [targetList, setTargetList] = useState<Target[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch anak list
  const fetchAnakList = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ortu/anak");
      if (res.ok) {
        const data = await res.json();
        setAnakList(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedAnak(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching anak list:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch hafalan progress
  const fetchHafalanProgress = async (anakId: number) => {
    try {
      const res = await fetch(`/api/ortu/hafalan-progress?anakId=${anakId}`);
      if (res.ok) {
        const data = await res.json();
        setHafalanProgress(data.data);
      }
    } catch (error) {
      console.error("Error fetching hafalan progress:", error);
    }
  };

  // Fetch absensi summary
  const fetchAbsensiSummary = async (anakId: number) => {
    try {
      const res = await fetch(`/api/ortu/absensi-summary?anakId=${anakId}`);
      if (res.ok) {
        const data = await res.json();
        setAbsensiSummary(data.data);
      }
    } catch (error) {
      console.error("Error fetching absensi summary:", error);
    }
  };

  // Fetch target list
  const fetchTargetList = async (anakId: number) => {
    try {
      const res = await fetch(`/api/ortu/target?anakId=${anakId}`);
      if (res.ok) {
        const data = await res.json();
        setTargetList(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching target list:", error);
    }
  };

  useEffect(() => {
    fetchAnakList();
  }, []);

  useEffect(() => {
    if (selectedAnak) {
      fetchHafalanProgress(selectedAnak.id);
      fetchAbsensiSummary(selectedAnak.id);
      fetchTargetList(selectedAnak.id);
    }
  }, [selectedAnak]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'masuk': return 'success';
      case 'izin': return 'warning';
      case 'alpha': return 'error';
      case 'selesai': return 'success';
      case 'proses': return 'processing';
      case 'belum': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'masuk': return 'Hadir';
      case 'izin': return 'Izin';
      case 'alpha': return 'Alpha';
      case 'selesai': return 'Selesai';
      case 'proses': return 'Progress';
      case 'belum': return 'Belum';
      default: return status;
    }
  };

  const recentHafalanColumns = [
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (tanggal: string) => dayjs(tanggal).format('DD/MM/YYYY'),
    },
    {
      title: "Surat",
      dataIndex: "surat",
      key: "surat",
    },
    {
      title: "Ayat",
      key: "ayat",
      render: (record: any) => `${record.ayatMulai}-${record.ayatSelesai}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === 'ziyadah' ? 'green' : 'blue'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
  ];

  const targetColumns = [
    {
      title: "Surat",
      dataIndex: "surat",
      key: "surat",
    },
    {
      title: "Target Ayat",
      dataIndex: "ayatTarget",
      key: "ayatTarget",
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: Target) => (
        <Progress 
          percent={record.progress} 
          size="small" 
          status={record.progress >= 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (deadline: string) => {
        const date = dayjs(deadline);
        const isOverdue = date.isBefore(dayjs());
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
            {date.format('DD/MM/YYYY')}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <LayoutApp>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      </LayoutApp>
    );
  }

  if (anakList.length === 0) {
    return (
      <LayoutApp>
        <div style={{ padding: "24px" }}>
          <Alert
            message="Tidak ada data anak"
            description="Belum ada anak yang terdaftar dalam sistem. Silakan hubungi admin untuk mendaftarkan anak Anda."
            type="info"
            showIcon
          />
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Dashboard Orang Tua</h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Pantau perkembangan hafalan dan kehadiran anak Anda
          </p>
        </div>

        {/* Anak Selection */}
        {anakList.length > 1 && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <strong>Pilih Anak:</strong>
            </div>
            <Row gutter={[16, 16]}>
              {anakList.map((anak) => (
                <Col key={anak.id} xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    hoverable
                    style={{
                      border: selectedAnak?.id === anak.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedAnak(anak)}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <UserOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                      <div style={{ fontWeight: 'bold' }}>{anak.namaLengkap}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>@{anak.username}</div>
                      {anak.halaqah && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          {anak.halaqah.namaHalaqah}
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {selectedAnak && (
          <>
            {/* Selected Anak Info */}
            <Card style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col>
                  <UserOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                </Col>
                <Col flex={1}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {selectedAnak.namaLengkap}
                  </div>
                  <div style={{ color: '#666' }}>@{selectedAnak.username}</div>
                  {selectedAnak.halaqah && (
                    <div style={{ color: '#666', marginTop: '4px' }}>
                      <BookOutlined style={{ marginRight: '4px' }} />
                      {selectedAnak.halaqah.namaHalaqah} - Guru: {selectedAnak.halaqah.guru.namaLengkap}
                    </div>
                  )}
                </Col>
              </Row>
            </Card>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Total Hafalan"
                    value={hafalanProgress?.totalAyat || 0}
                    suffix="ayat"
                    prefix={<BookOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Progress Hafalan"
                    value={hafalanProgress?.progress || 0}
                    suffix="%"
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Kehadiran"
                    value={absensiSummary?.totalHadir || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Target Aktif"
                    value={targetList.filter(t => t.status !== 'selesai').length}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              {/* Recent Hafalan */}
              <Col xs={24} lg={12}>
                <Card title="Hafalan Terbaru" style={{ height: '400px' }}>
                  {hafalanProgress?.recentHafalan && hafalanProgress.recentHafalan.length > 0 ? (
                    <Table
                      columns={recentHafalanColumns}
                      dataSource={hafalanProgress.recentHafalan}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      scroll={{ y: 280 }}
                    />
                  ) : (
                    <Empty description="Belum ada data hafalan" />
                  )}
                </Card>
              </Col>

              {/* Recent Absensi */}
              <Col xs={24} lg={12}>
                <Card title="Kehadiran Terbaru" style={{ height: '400px' }}>
                  {absensiSummary?.recentAbsensi && absensiSummary.recentAbsensi.length > 0 ? (
                    <Timeline
                      style={{ maxHeight: '320px', overflowY: 'auto' }}
                      items={absensiSummary.recentAbsensi.map(absensi => ({
                        color: getStatusColor(absensi.status) === 'success' ? 'green' : 
                               getStatusColor(absensi.status) === 'warning' ? 'orange' : 'red',
                        children: (
                          <div>
                            <div style={{ fontWeight: 'bold' }}>
                              {dayjs(absensi.tanggal).format('DD/MM/YYYY')}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {absensi.jadwal.hari} {absensi.jadwal.jamMulai}-{absensi.jadwal.jamSelesai}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {absensi.jadwal.halaqah.namaHalaqah}
                            </div>
                            <Tag 
                              color={getStatusColor(absensi.status)} 
                              size="small"
                              style={{ marginTop: '4px' }}
                            >
                              {getStatusText(absensi.status)}
                            </Tag>
                          </div>
                        )
                      }))}
                    />
                  ) : (
                    <Empty description="Belum ada data absensi" />
                  )}
                </Card>
              </Col>
            </Row>

            {/* Target Hafalan */}
            {targetList.length > 0 && (
              <Card title="Target Hafalan" style={{ marginTop: 16 }}>
                <Table
                  columns={targetColumns}
                  dataSource={targetList}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            )}
          </>
        )}
      </div>
    </LayoutApp>
  );
}