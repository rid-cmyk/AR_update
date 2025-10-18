"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Progress, List, Tag, Statistic, Select, Avatar, Table } from "antd";
import { FileTextOutlined, TrophyOutlined, BookOutlined, CalendarOutlined, DownloadOutlined } from "@ant-design/icons";
import LayoutApp from "../../../components/LayoutApp";

interface RaportData {
  id: number;
  semester: string;
  tahunAkademik: string;
  validated: boolean;
  details?: {
    nilaiAkhir: number;
    catatan: string;
    tanggalCetak: string;
  };
  ujian: Array<{
    jenis: string;
    nilai: number;
    tanggal: string;
  }>;
}

interface HafalanData {
  id: number;
  tanggal: string;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: string;
}

interface PrestasiData {
  id: number;
  namaPrestasi: string;
  keterangan: string;
  tahun: number;
  validated: boolean;
}

export default function OrtuRaportPage() {
  const [raportData, setRaportData] = useState<RaportData[]>([]);
  const [hafalanData, setHafalanData] = useState<HafalanData[]>([]);
  const [prestasiData, setPrestasiData] = useState<PrestasiData[]>([]);
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

  // Fetch raport data for selected santri
  const fetchRaportData = async (santriId: number) => {
    try {
      const res = await fetch(`/api/users/${santriId}`);
      if (res.ok) {
        const userData = await res.json();
        setRaportData(userData.Raport || []);
        setHafalanData(userData.Hafalan || []);
        setPrestasiData(userData.Prestasi || []);
      }
    } catch (error) {
      console.error("Error fetching raport data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedSantriId) {
      fetchRaportData(selectedSantriId);
    }
  }, [selectedSantriId]);

  // Calculate semester statistics
  const getSemesterStats = (semester: string, tahunAkademik: string) => {
    const semesterHafalan = hafalanData.filter(h =>
      h.tanggal.includes(tahunAkademik.split('/')[0])
    );

    const semesterPrestasi = prestasiData.filter(p =>
      p.tahun.toString() === tahunAkademik.split('/')[0] && p.validated
    );

    const avgNilai = semesterHafalan.length > 0 ?
      Math.round(semesterHafalan.reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0) / semesterHafalan.length) : 0;

    return {
      totalHafalan: semesterHafalan.length,
      totalAyat: semesterHafalan.reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0),
      avgNilai,
      prestasiCount: semesterPrestasi.length
    };
  };

  const columns = [
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      render: (semester: string, record: RaportData) => `${semester} ${record.tahunAkademik}`
    },
    {
      title: 'Status',
      dataIndex: 'validated',
      key: 'validated',
      render: (validated: boolean) => (
        <Tag color={validated ? 'green' : 'orange'}>
          {validated ? 'Tervalidasi' : 'Menunggu Validasi'}
        </Tag>
      )
    },
    {
      title: 'Nilai Akhir',
      dataIndex: 'details',
      key: 'nilaiAkhir',
      render: (details: any) => details?.nilaiAkhir || '-'
    },
    {
      title: 'Catatan',
      dataIndex: 'details',
      key: 'catatan',
      render: (details: any) => details?.catatan || '-'
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_: any, record: RaportData) => (
        <DownloadOutlined
          style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
          onClick={() => handleDownloadRaport(record)}
        />
      )
    }
  ];

  const handleDownloadRaport = (raport: RaportData) => {
    // Implement PDF download functionality
    console.log('Download raport:', raport);
  };

  const selectedSantri = anakList.find(anak => anak.id === selectedSantriId);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0 }}>Raport Anak</h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>
              Laporan akademik dan hafalan anak Anda
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

        {/* Raport Table */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              title="Daftar Raport"
              bordered={false}
            >
              <Table
                columns={columns}
                dataSource={raportData}
                rowKey="id"
                loading={loading}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>

        {/* Semester Overview */}
        {raportData.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {raportData.map((raport) => {
              const stats = getSemesterStats(raport.semester, raport.tahunAkademik);
              return (
                <Col xs={24} md={12} key={raport.id}>
                  <Card
                    title={`Semester ${raport.semester} ${raport.tahunAkademik}`}
                    bordered={false}
                  >
                    <Row gutter={[16, 8]}>
                      <Col xs={12}>
                        <Statistic
                          title="Total Hafalan"
                          value={stats.totalHafalan}
                          prefix={<BookOutlined />}
                          valueStyle={{ fontSize: 16 }}
                        />
                      </Col>
                      <Col xs={12}>
                        <Statistic
                          title="Total Ayat"
                          value={stats.totalAyat}
                          valueStyle={{ fontSize: 16 }}
                        />
                      </Col>
                      <Col xs={12}>
                        <Statistic
                          title="Rata-rata Ayat"
                          value={stats.avgNilai}
                          suffix="/sesi"
                          valueStyle={{ fontSize: 16 }}
                        />
                      </Col>
                      <Col xs={12}>
                        <Statistic
                          title="Prestasi"
                          value={stats.prestasiCount}
                          prefix={<TrophyOutlined />}
                          valueStyle={{ fontSize: 16 }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Prestasi */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              title="Prestasi Tervalidasi"
              bordered={false}
            >
              {prestasiData.filter(p => p.validated).length > 0 ? (
                <List
                  size="small"
                  dataSource={prestasiData.filter(p => p.validated)}
                  renderItem={(prestasi) => (
                    <List.Item>
                      <List.Item.Meta
                        title={prestasi.namaPrestasi}
                        description={`${prestasi.keterangan} • Tahun ${prestasi.tahun}`}
                      />
                      <Tag color="gold">Tervalidasi</Tag>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  Belum ada prestasi yang tervalidasi
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Progress Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title="Ringkasan Perkembangan"
              bordered={false}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Progress
                  type="circle"
                  percent={raportData.filter(r => r.validated).length > 0 ?
                    Math.round((raportData.filter(r => r.validated).length / raportData.length) * 100) : 0}
                  format={() => `${raportData.filter(r => r.validated).length}/${raportData.length}`}
                  width={120}
                  status="active"
                />
                <div>
                  <h3 style={{ margin: 0, marginBottom: 8 }}>Raport Tervalidasi</h3>
                  <p style={{ margin: 0, color: '#666' }}>
                    {raportData.filter(r => r.validated).length === raportData.length && raportData.length > 0
                      ? "🎉 Semua raport telah tervalidasi!"
                      : `${raportData.filter(r => !r.validated).length} raport menunggu validasi`}
                  </p>
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: 14 }}>
                    Total hafalan: {hafalanData.length} sesi
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}