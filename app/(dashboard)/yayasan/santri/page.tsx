"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Input, Select, Button, Table, Avatar, Tag, Progress, Spin, Statistic, Tabs, Descriptions, Badge, Modal, Space } from "antd";
import {
  UserOutlined,
  SearchOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  PieChartOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PageHeader from "@/components/layout/PageHeader";
import { useRouter } from "next/navigation";

const { Option } = Select;
const { Search } = Input;

interface SantriData {
  id: number;
  namaLengkap: string;
  namaPanggilan?: string;
  username: string;
  role: string;
  foto?: string;
  halaqah: Array<{
    id: number;
    namaHalaqah: string;
    guru: {
      namaLengkap: string;
      username: string;
    };
    jadwal: Array<{
      hari: string;
      waktuMulai: string;
      waktuSelesai: string;
    }>;
  }>;
  orangTua?: Array<{
    id: number;
    namaLengkap: string;
    username: string;
    noTlp?: string;
  }>;
  statistics: {
    totalAyatHafal: number;
    hafalanByType: Array<{ status: string; _count: { status: number } }>;
    attendanceRate: number;
    attendanceStats: Array<{ status: string; _count: { status: number } }>;
    totalTargets: number;
    completedTargets: number;
    totalAchievements: number;
    rankingHafalan?: number;
    totalSantri?: number;
  };
  recentHafalan: Array<{
    id: number;
    tanggal: string;
    jenis: string;
    surah: string;
    ayat: string;
    guru: string;
    status: string;
    catatan?: string;
  }>;
  allHafalan: Array<{
    id: number;
    tanggal: string;
    jenis: string;
    surah: string;
    ayatMulai: number;
    ayatSelesai: number;
    status: string;
    catatan?: string;
    guru: {
      namaLengkap: string;
    };
  }>;
  targets: Array<{
    id: number;
    surah: string;
    ayatMulai: number;
    ayatSelesai: number;
    targetSelesai: string;
    status: string;
    progress: number;
  }>;
  absensi: Array<{
    id: number;
    tanggal: string;
    status: string;
    keterangan?: string;
    halaqah: {
      namaHalaqah: string;
    };
  }>;
  ujian: Array<{
    id: number;
    tanggal: string;
    jenis: string;
    surah: string;
    ayatMulai: number;
    ayatSelesai: number;
    nilai: number;
    catatan?: string;
    penguji: {
      namaLengkap: string;
    };
  }>;
  rapot: Array<{
    id: number;
    periode: string;
    semester: string;
    tahunAjaran: string;
    totalHafalan: number;
    nilaiRataRata: number;
    kehadiran: number;
    catatan?: string;
  }>;
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
  const [modalVisible, setModalVisible] = useState(false);
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
      setModalVisible(true);
      console.log('🔄 Fetching santri detail for ID:', santriId);
      
      const res = await fetch(`/api/analytics/santri-detail?santriId=${santriId}`);
      console.log('📡 Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', errorData);
        alert(`Error: ${errorData.error || 'Failed to fetch santri details'}\nDetails: ${errorData.details || 'No details'}`);
        throw new Error(errorData.error || 'Failed to fetch santri details');
      }
      
      const data = await res.json();
      console.log('✅ Santri detail data received:', data);
      setSelectedSantri(data);
    } catch (error: any) {
      console.error('❌ Error fetching santri details:', error);
      setModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSantri(null);
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

    const getStatusColor = (status: string) => {
      const statusColors: Record<string, string> = {
        'ziyadah': 'green',
        'muraja\'ah': 'blue',
        'masuk': 'green',
        'izin': 'orange',
        'sakit': 'orange',
        'alpha': 'red',
        'selesai': 'green',
        'berlangsung': 'blue',
        'tertunda': 'orange',
      };
      return statusColors[status.toLowerCase()] || 'default';
    };

    const getStatusIcon = (status: string) => {
      const statusIcons: Record<string, any> = {
        'masuk': <CheckCircleOutlined />,
        'izin': <ClockCircleOutlined />,
        'sakit': <ExclamationCircleOutlined />,
        'alpha': <CloseCircleOutlined />,
        'selesai': <CheckCircleOutlined />,
        'berlangsung': <ClockCircleOutlined />,
      };
      return statusIcons[status.toLowerCase()] || null;
    };

    const tabItems = [
      {
        key: '1',
        label: (
          <span>
            <TeamOutlined /> Halaqah
          </span>
        ),
        children: (
          <Card>
            {selectedSantri.halaqah && selectedSantri.halaqah.length > 0 ? (
              selectedSantri.halaqah.map((h) => (
                <Card key={h.id} size="small" style={{ marginBottom: 16 }}>
                  <Descriptions title={h.namaHalaqah} bordered column={2}>
                    <Descriptions.Item label="Guru">
                      {h.guru.namaLengkap} (@{h.guru.username})
                    </Descriptions.Item>
                    <Descriptions.Item label="Jadwal">
                      {h.jadwal && h.jadwal.length > 0 ? (
                        <div>
                          {h.jadwal.map((j, idx) => (
                            <Tag key={idx} color="blue">
                              {j.hari}: {j.waktuMulai} - {j.waktuSelesai}
                            </Tag>
                          ))}
                        </div>
                      ) : (
                        'Belum ada jadwal'
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                Belum terdaftar di halaqah manapun
              </div>
            )}
          </Card>
        ),
      },
      {
        key: '2',
        label: (
          <span>
            <BookOutlined /> Hafalan ({selectedSantri.allHafalan?.length || 0})
          </span>
        ),
        children: (
          <Table
            dataSource={selectedSantri.allHafalan || []}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Tanggal',
                dataIndex: 'tanggal',
                key: 'tanggal',
                render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
                sorter: (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
              },
              {
                title: 'Jenis',
                dataIndex: 'jenis',
                key: 'jenis',
                render: (jenis: string) => (
                  <Tag color={jenis === 'ziyadah' ? 'green' : 'blue'}>
                    {jenis.toUpperCase()}
                  </Tag>
                ),
                filters: [
                  { text: 'Ziyadah', value: 'ziyadah' },
                  { text: 'Muraja\'ah', value: 'muraja\'ah' },
                ],
                onFilter: (value, record) => record.jenis === value,
              },
              {
                title: 'Surah',
                dataIndex: 'surah',
                key: 'surah',
              },
              {
                title: 'Ayat',
                key: 'ayat',
                render: (record: any) => `${record.ayatMulai} - ${record.ayatSelesai}`,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                    {status.toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Guru',
                dataIndex: ['guru', 'namaLengkap'],
                key: 'guru',
              },
              {
                title: 'Catatan',
                dataIndex: 'catatan',
                key: 'catatan',
                render: (catatan: string) => catatan || '-',
              },
            ]}
          />
        ),
      },
      {
        key: '3',
        label: (
          <span>
            <StarOutlined /> Target ({selectedSantri.targets?.length || 0})
          </span>
        ),
        children: (
          <Table
            dataSource={selectedSantri.targets || []}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Surah',
                dataIndex: 'surah',
                key: 'surah',
              },
              {
                title: 'Ayat',
                key: 'ayat',
                render: (record: any) => `${record.ayatMulai} - ${record.ayatSelesai}`,
              },
              {
                title: 'Target Selesai',
                dataIndex: 'targetSelesai',
                key: 'targetSelesai',
                render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
                sorter: (a, b) => new Date(a.targetSelesai).getTime() - new Date(b.targetSelesai).getTime(),
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                  </Tag>
                ),
                filters: [
                  { text: 'Selesai', value: 'selesai' },
                  { text: 'Berlangsung', value: 'berlangsung' },
                  { text: 'Tertunda', value: 'tertunda' },
                ],
                onFilter: (value, record) => record.status === value,
              },
              {
                title: 'Progress',
                dataIndex: 'progress',
                key: 'progress',
                render: (progress: number) => (
                  <Progress percent={progress} size="small" />
                ),
                sorter: (a, b) => a.progress - b.progress,
              },
            ]}
          />
        ),
      },
      {
        key: '4',
        label: (
          <span>
            <CalendarOutlined /> Absensi ({selectedSantri.absensi?.length || 0})
          </span>
        ),
        children: (
          <Table
            dataSource={selectedSantri.absensi || []}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Tanggal',
                dataIndex: 'tanggal',
                key: 'tanggal',
                render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
                sorter: (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
              },
              {
                title: 'Halaqah',
                dataIndex: ['halaqah', 'namaHalaqah'],
                key: 'halaqah',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                    {status.toUpperCase()}
                  </Tag>
                ),
                filters: [
                  { text: 'Masuk', value: 'masuk' },
                  { text: 'Izin', value: 'izin' },
                  { text: 'Sakit', value: 'sakit' },
                  { text: 'Alpha', value: 'alpha' },
                ],
                onFilter: (value, record) => record.status === value,
              },
              {
                title: 'Keterangan',
                dataIndex: 'keterangan',
                key: 'keterangan',
                render: (keterangan: string) => keterangan || '-',
              },
            ]}
          />
        ),
      },
      {
        key: '5',
        label: (
          <span>
            <TrophyOutlined /> Ujian ({selectedSantri.ujian?.length || 0})
          </span>
        ),
        children: (
          <Table
            dataSource={selectedSantri.ujian || []}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Tanggal',
                dataIndex: 'tanggal',
                key: 'tanggal',
                render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
                sorter: (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
              },
              {
                title: 'Jenis',
                dataIndex: 'jenis',
                key: 'jenis',
                render: (jenis: string) => (
                  <Tag color="purple">{jenis.toUpperCase()}</Tag>
                ),
              },
              {
                title: 'Surah',
                dataIndex: 'surah',
                key: 'surah',
              },
              {
                title: 'Ayat',
                key: 'ayat',
                render: (record: any) => `${record.ayatMulai} - ${record.ayatSelesai}`,
              },
              {
                title: 'Nilai',
                dataIndex: 'nilai',
                key: 'nilai',
                render: (nilai: number) => (
                  <Badge
                    count={nilai}
                    style={{
                      backgroundColor: nilai >= 80 ? '#52c41a' : nilai >= 60 ? '#fa8c16' : '#ff4d4f',
                    }}
                  />
                ),
                sorter: (a, b) => a.nilai - b.nilai,
              },
              {
                title: 'Penguji',
                dataIndex: ['penguji', 'namaLengkap'],
                key: 'penguji',
              },
              {
                title: 'Catatan',
                dataIndex: 'catatan',
                key: 'catatan',
                render: (catatan: string) => catatan || '-',
              },
            ]}
          />
        ),
      },
      {
        key: '6',
        label: (
          <span>
            <FileDoneOutlined /> Rapot ({selectedSantri.rapot?.length || 0})
          </span>
        ),
        children: (
          <div>
            {selectedSantri.rapot && selectedSantri.rapot.length > 0 ? (
              selectedSantri.rapot.map((r) => (
                <Card key={r.id} style={{ marginBottom: 16 }}>
                  <Descriptions
                    title={`${r.periode} - ${r.semester} (${r.tahunAjaran})`}
                    bordered
                    column={2}
                  >
                    <Descriptions.Item label="Total Hafalan">
                      <Badge count={r.totalHafalan} style={{ backgroundColor: '#1890ff' }} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Nilai Rata-rata">
                      <Badge
                        count={r.nilaiRataRata}
                        style={{
                          backgroundColor:
                            r.nilaiRataRata >= 80 ? '#52c41a' : r.nilaiRataRata >= 60 ? '#fa8c16' : '#ff4d4f',
                        }}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Kehadiran">
                      <Progress percent={r.kehadiran} size="small" />
                    </Descriptions.Item>
                    <Descriptions.Item label="Catatan">
                      {r.catatan || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                Belum ada data rapot
              </div>
            )}
          </div>
        ),
      },
    ];

    return (
      <>
        {/* Statistics Summary */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Total Ayat Hafal"
                value={selectedSantri.statistics.totalAyatHafal}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
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
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Target Selesai"
                value={selectedSantri.statistics.completedTargets}
                suffix={`/ ${selectedSantri.statistics.totalTargets}`}
                prefix={<StarOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Total Prestasi"
                value={selectedSantri.statistics.totalAchievements}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Detailed Tabs */}
        <Tabs defaultActiveKey="1" items={tabItems} />
      </>
    );
  };

  return (
    <LayoutApp>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Header */}
        <PageHeader
          title="Detail Per Santri"
          subtitle="Comprehensive individual santri performance and progress tracking"
          breadcrumbs={[
            { title: "Yayasan Dashboard", href: "/yayasan/dashboard" },
            { title: "Detail Santri" }
          ]}
          extra={
            <Tag icon={<UserOutlined />} color="green" style={{ padding: '8px 16px', fontSize: 14 }}>
              Yayasan Panel
            </Tag>
          }
        />

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
        <Card title={`Daftar Santri (${filteredSantri.length})`} variant="borderless">
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

        {/* Modal Detail Santri */}
        <Modal
          title={
            selectedSantri ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 16,
                padding: '8px 0'
              }}>
                <Avatar
                  size={80}
                  src={selectedSantri.foto}
                  icon={<UserOutlined />}
                  style={{ flexShrink: 0 }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Nama Lengkap */}
                  <div>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Nama Lengkap</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
                      {selectedSantri.namaLengkap}
                    </div>
                  </div>
                  
                  {/* Nama Panggilan */}
                  <div>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Nama Panggilan</div>
                    <div style={{ fontSize: 14, color: '#666' }}>
                      {selectedSantri.namaPanggilan || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Data kosong</span>}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Halaqah */}
                  <div>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Halaqah</div>
                    <div>
                      {selectedSantri.halaqah && selectedSantri.halaqah.length > 0 ? (
                        selectedSantri.halaqah.map((h, idx) => (
                          <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
                            {h.namaHalaqah}
                          </Tag>
                        ))
                      ) : (
                        <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: 14 }}>Data kosong</span>
                      )}
                    </div>
                  </div>

                  {/* Peringkat Hafalan */}
                  <div>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Peringkat Hafalan</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {selectedSantri.statistics.rankingHafalan && selectedSantri.statistics.totalSantri ? (
                        <>
                          <TrophyOutlined style={{ 
                            color: selectedSantri.statistics.rankingHafalan === 1 ? '#faad14' : 
                                   selectedSantri.statistics.rankingHafalan === 2 ? '#d9d9d9' : 
                                   selectedSantri.statistics.rankingHafalan === 3 ? '#cd7f32' : '#1890ff',
                            fontSize: 18 
                          }} />
                          <span style={{ 
                            fontSize: 16, 
                            fontWeight: 600, 
                            color: selectedSantri.statistics.rankingHafalan === 1 ? '#faad14' : 
                                   selectedSantri.statistics.rankingHafalan === 2 ? '#8c8c8c' : 
                                   selectedSantri.statistics.rankingHafalan === 3 ? '#cd7f32' : '#1890ff'
                          }}>
                            Peringkat #{selectedSantri.statistics.rankingHafalan}
                          </span>
                          <span style={{ fontSize: 12, color: '#999' }}>
                            dari {selectedSantri.statistics.totalSantri} santri
                          </span>
                        </>
                      ) : (
                        <>
                          <BookOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                          <span style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
                            {selectedSantri.statistics.totalAyatHafal || 0} Ayat
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Orang Tua */}
                  <div>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Orang Tua Terhubung</div>
                    <div>
                      {selectedSantri.orangTua && selectedSantri.orangTua.length > 0 ? (
                        selectedSantri.orangTua.map((ortu, idx) => (
                          <div key={idx} style={{ marginBottom: 4 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: '#52c41a' }}>
                              {ortu.namaLengkap}
                            </div>
                            <div style={{ fontSize: 12, color: '#999' }}>
                              @{ortu.username}
                              {ortu.noTlp && ` • ${ortu.noTlp}`}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#ccc', fontStyle: 'italic', fontSize: 14 }}>Data kosong</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : 'Detail Santri'
          }
          open={modalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width="90%"
          style={{ top: 20, maxWidth: 1400 }}
          styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
        >
          {detailLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: '#666' }}>Memuat detail santri...</p>
            </div>
          ) : (
            renderSantriDetail()
          )}
        </Modal>

        {/* Footer */}
        <Card style={{ marginTop: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h4 style={{ margin: 0, color: "#1e293b", fontWeight: 600 }}>Sistem AR-Hafalan v2.0</h4>
              <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Detail Per Santri - Individual Performance Tracking</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Auto-refresh: 30s • Last updated</p>
              <p style={{ margin: 0, color: "#1e293b", fontWeight: 500, fontSize: 14 }}>{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </Card>
      </div>
    </LayoutApp>
  );
}