"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Select,
  Input,
  Statistic
} from "antd";
import {
  BookOutlined,
  SearchOutlined,
  CalendarOutlined,
  FireOutlined
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

interface HafalanRecord {
  id: number;
  tanggal: string;
  jenis: 'ziyadah' | 'murajaah';
  surah: string;
  ayatMulai: number;
  ayatSelesai: number;
  catatan: string;
  guru: string;
  createdAt: string;
  status?: string;
  nilai?: number;
  feedback?: string;
}

export default function RekapHafalanPage() {
  const [hafalanList, setHafalanList] = useState<HafalanRecord[]>([]);
  const [filteredData, setFilteredData] = useState<HafalanRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [santriId, setSantriId] = useState<number | null>(null);

  // Mock data
  const mockData: HafalanRecord[] = [
    {
      id: 1,
      tanggal: '2024-01-07',
      jenis: 'ziyadah',
      surah: 'Al-Baqarah',
      ayatMulai: 1,
      ayatSelesai: 5,
      catatan: 'Hafalan lancar, perlu perbaikan tajwid',
      guru: 'Ustadz Ahmad',
      createdAt: '2024-01-07 08:00:00'
    },
    {
      id: 2,
      tanggal: '2024-01-07',
      jenis: 'murajaah',
      surah: 'Al-Fatihah',
      ayatMulai: 1,
      ayatSelesai: 7,
      catatan: 'Muraja\'ah rutin',
      guru: 'Ustadz Ahmad',
      createdAt: '2024-01-07 08:15:00'
    },
    {
      id: 3,
      tanggal: '2024-01-06',
      jenis: 'ziyadah',
      surah: 'Al-Baqarah',
      ayatMulai: 6,
      ayatSelesai: 10,
      catatan: 'Masih ada kesalahan bacaan',
      guru: 'Ustadz Ahmad',
      createdAt: '2024-01-06 08:00:00'
    },
    {
      id: 4,
      tanggal: '2024-01-05',
      jenis: 'ziyadah',
      surah: 'Al-Baqarah',
      ayatMulai: 11,
      ayatSelesai: 15,
      catatan: 'Setoran baru',
      guru: 'Ustadz Ahmad',
      createdAt: '2024-01-05 08:00:00'
    },
    {
      id: 5,
      tanggal: '2024-01-04',
      jenis: 'murajaah',
      surah: 'An-Nas',
      ayatMulai: 1,
      ayatSelesai: 6,
      catatan: 'Muraja\'ah surat pendek',
      guru: 'Ustadz Ahmad',
      createdAt: '2024-01-04 08:00:00'
    },
    {
      id: 6,
      tanggal: '2024-01-03',
      jenis: 'ziyadah',
      surah: 'Al-Baqarah',
      ayatMulai: 16,
      ayatSelesai: 20,
      catatan: 'Hafalan pertama minggu ini',
      guru: 'Ustadz Ahmad',
      createdAt: '2024-01-03 08:00:00'
    },
    {
      id: 7,
      tanggal: '2024-01-02',
      jenis: 'murajaah',
      surah: 'Al-Ikhlas',
      ayatMulai: 1,
      ayatSelesai: 4,
      catatan: 'Perlu lebih lancar',
      guru: 'Ustadz Ahmad',
      createdAt: '2024-01-02 08:00:00'
    }
  ];

  useEffect(() => {
    // Get current santri ID from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setSantriId(userData.id);
    }
  }, []);

  useEffect(() => {
    if (!santriId) return;

    const fetchHafalanData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/santri/hafalan?santriId=${santriId}`);
        if (response.ok) {
          const data = await response.json();
          // Transform API data to match interface
          const transformedData = data.map((item: any) => ({
            id: item.id,
            tanggal: item.tanggal,
            jenis: item.jenis,
            surah: item.surah,
            ayatMulai: item.ayatMulai,
            ayatSelesai: item.ayatSelesai,
            catatan: item.catatan,
            guru: item.guru?.namaLengkap || 'Ustadz Ahmad',
            createdAt: item.createdAt
          }));
          setHafalanList(transformedData);
          setFilteredData(transformedData);
        } else {
          // Fallback to mock data if API fails
          setHafalanList(mockData);
          setFilteredData(mockData);
        }
      } catch (error) {
        console.error('Error fetching hafalan data:', error);
        // Fallback to mock data
        setHafalanList(mockData);
        setFilteredData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchHafalanData();
  }, [santriId]);

  // Filter data
  useEffect(() => {
    let filtered = hafalanList;

    if (filterJenis !== 'all') {
      filtered = filtered.filter(item => item.jenis === filterJenis);
    }

    if (searchText) {
      filtered = filtered.filter(item =>
        item.surah.toLowerCase().includes(searchText.toLowerCase()) ||
        item.catatan.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [filterJenis, searchText, hafalanList]);



  const columns = [
    {
      title: 'Tanggal',
      dataIndex: 'tanggal',
      key: 'tanggal',
      render: (tanggal: string) => (
        <span>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {dayjs(tanggal).format('DD/MM/YYYY')}
        </span>
      ),
      sorter: (a: HafalanRecord, b: HafalanRecord) =>
        dayjs(a.tanggal).unix() - dayjs(b.tanggal).unix(),
    },
    {
      title: 'Jenis',
      dataIndex: 'jenis',
      key: 'jenis',
      render: (jenis: string) => (
        <Tag
          color={jenis === 'ziyadah' ? 'blue' : 'purple'}
          icon={jenis === 'ziyadah' ? <FireOutlined /> : <BookOutlined />}
        >
          {jenis === 'ziyadah' ? 'Ziyadah' : 'Murajaah'}
        </Tag>
      ),
      filters: [
        { text: 'Ziyadah', value: 'ziyadah' },
        { text: 'Murajaah', value: 'murajaah' },
      ],
      onFilter: (value: any, record: HafalanRecord) => record.jenis === value,
    },
    {
      title: 'Surah & Ayat',
      key: 'surahAyat',
      render: (record: HafalanRecord) => (
        <div>
          <Text strong>{record.surah}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Ayat {record.ayatMulai}-{record.ayatSelesai}
          </Text>
        </div>
      ),
    },
    {
      title: 'Catatan',
      dataIndex: 'catatan',
      key: 'catatan',
      render: (catatan: string) => (
        <Text ellipsis={{ tooltip: catatan }} style={{ maxWidth: 200 }}>
          {catatan || '-'}
        </Text>
      ),
    }
  ];

  // Calculate statistics
  const totalSetoran = hafalanList.length;

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        {/* Header */}
        <Row justify="start" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{
              background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              <BookOutlined style={{ marginRight: 12, color: '#4A90E2' }} />
              Rekap Hafalan
            </Title>
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '4px',
              fontWeight: '500'
            }}>
              Riwayat setoran hafalan
            </div>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(74, 144, 226, 0.2)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Total Setoran</span>}
                value={totalSetoran}
                valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                prefix={<BookOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 16, borderRadius: '12px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Input
                placeholder="Cari surah atau catatan..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Jenis"
                value={filterJenis}
                onChange={setFilterJenis}
                style={{ width: '100%' }}
              >
                <Option value="all">Semua Jenis</Option>
                <Option value="ziyadah">Ziyadah</Option>
                <Option value="murajaah">Murajaah</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
          }}
        >
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} setoran`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>


      </div>
    </LayoutApp>
  );
}