"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Input, Select, Button, Table, Avatar, Tag, Progress, Spin, Statistic } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import { useRouter } from "next/navigation";

const { Option } = Select;
const { Search } = Input;

interface SantriData {
  id: number;
  namaLengkap: string;
  username: string;
  role: string;
  halaqah: Array<{
    id: number;
    namaHalaqah: string;
    guru: string;
    jadwal: any[];
  }>;
  statistics: {
    totalAyatHafal: number;
    hafalanByType: Array<{ status: string; _count: { status: number } }>;
    attendanceRate: number;
    attendanceStats: Array<{ status: string; _count: { status: number } }>;
    totalTargets: number;
    completedTargets: number;
    totalAchievements: number;
  };
  recentHafalan: Array<{
    id: number;
    tanggal: string;
    jenis: string;
    surah: string;
    ayat: string;
    guru: string;
  }>;
  targets: any[];
  achievements: any[];
  monthlyProgress: any[];
}

export default function DetailSantri() {
  const [santriList, setSantriList] = useState<any[]>([]);
  const [filteredSantri, setFilteredSantri] = useState<any[]>([]);
  const [selectedSantri, setSelectedSantri] = useState<SantriData | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [halaqahFilter, setHalaqahFilter] = useState('');
  const router = useRouter();

  // Fetch all santri list
  const fetchSantriList = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users?role=santri');
      if (!res.ok) throw new Error('Failed to fetch santri list');
      const data = await res.json();
      setSantriList(data);
      setFilteredSantri(data);
    } catch (error) {
      console.error('Error fetching santri list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed santri data
  const fetchSantriDetail = async (santriId: number) => {
    try {
      setDetailLoading(true);
      const res = await fetch(`/api/analytics/santri-detail?santriId=${santriId}`);
      if (!res.ok) throw new Error('Failed to fetch santri details');
      const data = await res.json();
      setSelectedSantri(data);
    } catch (error) {
      console.error('Error fetching santri details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchSantriList();
  }, []);

  // Filter santri based on search and halaqah
  useEffect(() => {
    let filtered = santriList;

    if (searchText) {
      filtered = filtered.filter(santri =>
        santri.namaLengkap.toLowerCase().includes(searchText.toLowerCase()) ||
        santri.username.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (halaqahFilter) {
      filtered = filtered.filter(santri =>
        santri.halaqah?.some((h: any) => h.namaHalaqah === halaqahFilter)
      );
    }

    setFilteredSantri(filtered);
  }, [searchText, halaqahFilter, santriList]);

  const santriColumns = [
    {
      title: 'Foto',
      dataIndex: 'foto',
      key: 'foto',
      render: (foto: string) => (
        <Avatar src={foto || undefined} icon={<UserOutlined />} />
      ),
    },
    {
      title: 'Nama Santri',
      dataIndex: 'namaLengkap',
      key: 'namaLengkap',
      sorter: (a: any, b: any) => a.namaLengkap.localeCompare(b.namaLengkap),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Halaqah',
      dataIndex: 'halaqah',
      key: 'halaqah',
      render: (halaqah: any[]) => (
        <div>
          {halaqah?.map((h, index) => (
            <Tag key={index} color="blue">{h.namaHalaqah}</Tag>
          )) || 'Belum ditentukan'}
        </div>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (record: any) => (
        <Button
          type="primary"
          size="small"
          onClick={() => fetchSantriDetail(record.id)}
        >
          Lihat Detail
        </Button>
      ),
    },
  ];

  const renderSantriDetail = () => {
    if (!selectedSantri) return null;

    return (
      <div style={{ marginTop: 24 }}>
        <Card title={`Detail Santri: ${selectedSantri.namaLengkap}`} bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic
                  title="Total Ayat Hafal"
                  value={selectedSantri.statistics.totalAyatHafal}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic
                  title="Tingkat Kehadiran"
                  value={selectedSantri.statistics.attendanceRate}
                  suffix="%"
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic
                  title="Total Prestasi"
                  value={selectedSantri.statistics.totalAchievements}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <Card title="Hafalan Terbaru" size="small">
                <Table
                  dataSource={selectedSantri.recentHafalan.slice(0, 5)}
                  columns={[
                    { title: 'Tanggal', dataIndex: 'tanggal', key: 'tanggal' },
                    { title: 'Surah', dataIndex: 'surah', key: 'surah' },
                    { title: 'Ayat', dataIndex: 'ayat', key: 'ayat' },
                    { title: 'Jenis', dataIndex: 'jenis', key: 'jenis' },
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Target Hafalan" size="small">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Progress
                    type="circle"
                    percent={selectedSantri.statistics.totalTargets > 0 ?
                      (selectedSantri.statistics.completedTargets / selectedSantri.statistics.totalTargets) * 100 : 0}
                    format={(percent) => `${selectedSantri.statistics.completedTargets}/${selectedSantri.statistics.totalTargets}`}
                  />
                  <p style={{ marginTop: 16 }}>Target Tercapai</p>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <Card title="Distribusi Hafalan" size="small">
                {selectedSantri.statistics.hafalanByType.map((item) => (
                  <div key={item.status} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ textTransform: 'capitalize' }}>{item.status}</span>
                      <span>{item._count.status}</span>
                    </div>
                    <Progress
                      percent={selectedSantri.statistics.totalAyatHafal > 0 ?
                        (item._count.status / selectedSantri.statistics.totalAyatHafal) * 100 : 0}
                      size="small"
                      strokeColor={item.status === 'ziyadah' ? '#52c41a' : '#fa8c16'}
                    />
                  </div>
                ))}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Status Kehadiran" size="small">
                {selectedSantri.statistics.attendanceStats.map((item) => (
                  <div key={item.status} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ textTransform: 'capitalize' }}>{item.status}</span>
                      <span>{item._count.status}</span>
                    </div>
                    <Progress
                      percent={100} // This would need total possible attendance
                      size="small"
                      strokeColor={
                        item.status === 'masuk' ? '#52c41a' :
                        item.status === 'izin' ? '#fa8c16' : '#ff4d4f'
                      }
                    />
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    );
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            📖 Detail Per Santri
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Comprehensive individual santri performance and progress tracking
          </p>
        </div>

        {/* Navigation */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/yayasan/dashboard')}
            >
              <BarChartOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#1890ff' }}>Dashboard</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/yayasan/laporan')}
            >
              <PieChartOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#722ed1' }}>📈 Laporan Global</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer', border: '2px solid #52c41a' }}
              onClick={() => router.push('/yayasan/santri')}
            >
              <UserOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#52c41a' }}>📖 Detail Per Santri</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => router.push('/yayasan/raport')}
            >
              <FileTextOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: 8 }} />
              <div style={{ fontWeight: 'bold', color: '#fa8c16' }}>📑 Raport Tahfidz</div>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Search
                placeholder="Cari nama santri atau username..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="Filter berdasarkan halaqah"
                allowClear
                style={{ width: '100%' }}
                onChange={setHalaqahFilter}
              >
                {/* This would be populated with actual halaqah data */}
                <Option value="Halaqah Al-Fatihah">Halaqah Al-Fatihah</Option>
                <Option value="Halaqah Al-Baqarah">Halaqah Al-Baqarah</Option>
                <Option value="Halaqah Al-Imran">Halaqah Al-Imran</Option>
              </Select>
            </Col>
            <Col xs={24} md={8}>
              <Button type="primary" onClick={fetchSantriList} loading={loading}>
                Refresh Data
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Santri List */}
        <Card title={`Daftar Santri (${filteredSantri.length})`} bordered={false}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16 }}>Loading santri data...</p>
            </div>
          ) : (
            <Table
              dataSource={filteredSantri}
              columns={santriColumns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} santri`,
              }}
            />
          )}
        </Card>

        {/* Santri Detail */}
        {detailLoading ? (
          <Card style={{ marginTop: 24, textAlign: 'center' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Loading detail santri...</p>
          </Card>
        ) : (
          renderSantriDetail()
        )}
      </div>
    </LayoutApp>
  );
}