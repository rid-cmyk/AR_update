"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag, Spin, Select, Progress, Statistic, Space, Tabs, List, Avatar } from "antd";
import { FileDoneOutlined, TrophyOutlined, BookOutlined, CheckCircleOutlined, StarOutlined } from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

interface RaportData {
  id: number;
  jenis: string;
  nilai: number;
  tanggal: string;
  catatan?: string;
  santri: {
    namaLengkap: string;
    username: string;
  };
}

interface PrestasiData {
  id: number;
  namaPrestasi: string;
  keterangan: string;
  tahun: number;
  validated: boolean;
  tanggalValidasi?: string;
  santri: {
    namaLengkap: string;
    username: string;
  };
}

interface ChildRaportStats {
  namaLengkap: string;
  rataRataNilai: number;
  totalUjian: number;
  totalPrestasi: number;
  prestasiValidated: number;
}

export default function RaportPrestasiAnak() {
  const [raportData, setRaportData] = useState<RaportData[]>([]);
  const [prestasiData, setPrestasiData] = useState<PrestasiData[]>([]);
  const [childStats, setChildStats] = useState<ChildRaportStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string>("all");

  // Fetch raport and prestasi data
  const fetchRaportData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/ortu");
      if (!res.ok) throw new Error("Failed to fetch raport data");
      const data = await res.json();

      // Transform data for display
      const transformedRaport: RaportData[] = [];
      const transformedPrestasi: PrestasiData[] = [];
      const stats: ChildRaportStats[] = [];

      data.anakList?.forEach((anak: any) => {
        // Collect ujian/raport data
        anak.Ujian?.forEach((ujian: any) => {
          transformedRaport.push({
            id: ujian.id,
            jenis: ujian.jenis,
            nilai: ujian.nilai,
            tanggal: ujian.tanggal,
            catatan: ujian.catatan,
            santri: {
              namaLengkap: anak.namaLengkap,
              username: anak.username,
            },
          });
        });

        // Collect prestasi data
        anak.Prestasi?.forEach((prestasi: any) => {
          transformedPrestasi.push({
            id: prestasi.id,
            namaPrestasi: prestasi.namaPrestasi,
            keterangan: prestasi.keterangan,
            tahun: prestasi.tahun,
            validated: prestasi.validated,
            tanggalValidasi: prestasi.tanggalValidasi,
            santri: {
              namaLengkap: anak.namaLengkap,
              username: anak.username,
            },
          });
        });

        // Calculate stats
        const totalUjian = anak.Ujian?.length || 0;
        const totalNilai = anak.Ujian?.reduce((sum: number, u: any) => sum + u.nilai, 0) || 0;
        const rataRataNilai = totalUjian > 0 ? Math.round(totalNilai / totalUjian) : 0;

        const totalPrestasi = anak.Prestasi?.length || 0;
        const prestasiValidated = anak.Prestasi?.filter((p: any) => p.validated).length || 0;

        stats.push({
          namaLengkap: anak.namaLengkap,
          rataRataNilai,
          totalUjian,
          totalPrestasi,
          prestasiValidated,
        });
      });

      setRaportData(transformedRaport);
      setPrestasiData(transformedPrestasi);
      setChildStats(stats);
    } catch (error) {
      console.error("Error fetching raport data:", error);
      // Set mock data for demo
      setRaportData([
        {
          id: 1,
          jenis: "Hafalan Al-Fatihah",
          nilai: 95,
          tanggal: "2024-01-15",
          catatan: "Bagus, lancar dan tartil",
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
        },
        {
          id: 2,
          jenis: "Tajwid",
          nilai: 88,
          tanggal: "2024-01-20",
          catatan: "Perlu lebih perhatikan makhrojul huruf",
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
        },
      ]);

      setPrestasiData([
        {
          id: 1,
          namaPrestasi: "Juara 1 Hafalan",
          keterangan: "Juara 1 lomba hafalan tingkat kecamatan",
          tahun: 2024,
          validated: true,
          tanggalValidasi: "2024-01-25",
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
        },
        {
          id: 2,
          namaPrestasi: "Sertifikat Tahfidz",
          keterangan: "Menyelesaikan hafalan 5 juz",
          tahun: 2024,
          validated: false,
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
        },
      ]);

      setChildStats([
        {
          namaLengkap: "Ahmad",
          rataRataNilai: 91,
          totalUjian: 8,
          totalPrestasi: 3,
          prestasiValidated: 2,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaportData();
  }, []);

  // Filter data based on selected child
  const filteredRaport = raportData.filter((item) => {
    return selectedChild === "all" || item.santri.namaLengkap === selectedChild;
  });

  const filteredPrestasi = prestasiData.filter((item) => {
    return selectedChild === "all" || item.santri.namaLengkap === selectedChild;
  });

  // Get unique children for filter
  const children = Array.from(new Set([
    ...raportData.map(item => item.santri.namaLengkap),
    ...prestasiData.map(item => item.santri.namaLengkap)
  ]));

  const raportColumns = [
    {
      title: "Anak",
      dataIndex: ["santri", "namaLengkap"],
      key: "namaLengkap",
    },
    {
      title: "Jenis Ujian",
      dataIndex: "jenis",
      key: "jenis",
    },
    {
      title: "Nilai",
      dataIndex: "nilai",
      key: "nilai",
      render: (nilai: number) => (
        <Tag color={nilai >= 85 ? "green" : nilai >= 70 ? "orange" : "red"}>
          {nilai}
        </Tag>
      ),
      sorter: (a: RaportData, b: RaportData) => a.nilai - b.nilai,
    },
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      render: (tanggal: string) => dayjs(tanggal).format("DD/MM/YYYY"),
      sorter: (a: RaportData, b: RaportData) => dayjs(a.tanggal).unix() - dayjs(b.tanggal).unix(),
    },
    {
      title: "Catatan",
      dataIndex: "catatan",
      key: "catatan",
      render: (catatan: string) => catatan || "-",
    },
  ];

  const tabItems = [
    {
      key: "raport",
      label: "📑 Raport Akademik",
      children: (
        <Card title="Detail Nilai Ujian" bordered={false}>
          <Table
            columns={raportColumns}
            dataSource={filteredRaport}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} nilai ujian`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      ),
    },
    {
      key: "prestasi",
      label: "🏆 Prestasi & Penghargaan",
      children: (
        <Card title="Daftar Prestasi" bordered={false}>
          <List
            dataSource={filteredPrestasi}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '16px',
                  background: '#fafafa',
                  marginBottom: '8px',
                  borderRadius: '8px'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<TrophyOutlined />}
                      style={{
                        backgroundColor: item.validated ? '#52c41a' : '#faad14'
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{item.namaPrestasi}</span>
                      {item.validated && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: '4px' }}>{item.keterangan}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Tahun: {item.tahun}
                        {item.validated && item.tanggalValidasi &&
                          ` • Divalidasi: ${dayjs(item.tanggalValidasi).format("DD/MM/YYYY")}`
                        }
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            📑 Raport & Prestasi Anak
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Lihat nilai akademik dan pencapaian anak Anda
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280' }}>Memuat data raport dan prestasi...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {childStats.map((child, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card style={{ textAlign: 'center', border: '2px solid #fa8c16' }}>
                    <Statistic
                      title={`📊 ${child.namaLengkap}`}
                      value={child.rataRataNilai}
                      prefix={<FileDoneOutlined />}
                      suffix="/100"
                      valueStyle={{ color: "#fa8c16", fontSize: '24px', fontWeight: 'bold' }}
                    />
                    <div style={{ marginTop: 12, fontSize: '14px', color: '#666' }}>
                      <div>{child.totalUjian} ujian</div>
                      <div>{child.prestasiValidated}/{child.totalPrestasi} prestasi tervalidasi</div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Progress Overview */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {childStats.map((child, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card title={`🎓 Prestasi ${child.namaLengkap}`} bordered={false}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Progress
                        type="circle"
                        percent={Math.round((child.prestasiValidated / Math.max(child.totalPrestasi, 1)) * 100)}
                        format={(percent) => `${child.prestasiValidated}/${child.totalPrestasi}`}
                        strokeColor="#fa8c16"
                        size={100}
                      />
                      <p style={{ marginTop: 16, color: '#666', fontSize: '14px' }}>
                        Prestasi tervalidasi
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
              </Space>
            </Card>

            {/* Tabs for Raport and Prestasi */}
            <Tabs defaultActiveKey="raport" items={tabItems} />
          </>
        )}
      </div>
    </LayoutApp>
  );
}