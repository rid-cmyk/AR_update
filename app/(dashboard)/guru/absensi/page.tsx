"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  DatePicker,
  Select,
  Tag,
  Space,
  Row,
  Col,
  Statistic,
  message,
  Alert,
  Tooltip,
  Modal
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  BookOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

const { Option } = Select;

interface Santri {
  id: number;
  namaLengkap: string;
  username: string;
}

interface Halaqah {
  id: number;
  namaHalaqah: string;
  guru: {
    id: number;
    namaLengkap: string;
  };
  jumlahSantri: number;
}

interface Jadwal {
  id: number;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  halaqah: Halaqah;
}

interface AbsensiRecord {
  id: number | null;
  santriId: number;
  jadwalId: number;
  tanggal: string;
  status: 'masuk' | 'izin' | 'alpha' | null;
  santri: Santri;
  jadwal: {
    id: number;
    hari: string;
    jamMulai: string;
    jamSelesai: string;
    halaqah: {
      id: number;
      namaHalaqah: string;
    };
  };
}

interface Summary {
  totalJadwal: number;
  totalSantri: number;
  hadir: number;
  izin: number;
  alpha: number;
  belumAbsen: number;
}

export default function AbsensiGuruPage() {
  const [jadwals, setJadwals] = useState<Jadwal[]>([]);
  const [absensiData, setAbsensiData] = useState<AbsensiRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedHalaqah, setSelectedHalaqah] = useState<number | null>(null);
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);

  // Fetch halaqah list
  const fetchHalaqahList = async () => {
    try {
      const res = await fetch("/api/guru/halaqah");
      if (res.ok) {
        const data = await res.json();
        setHalaqahList(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching halaqah:", error);
    }
  };

  // Fetch absensi data
  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('tanggal', selectedDate.format('YYYY-MM-DD'));
      
      if (selectedHalaqah) {
        params.append('halaqahId', selectedHalaqah.toString());
      }

      const res = await fetch(`/api/guru/absensi?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJadwals(data.data.jadwals || []);
        setAbsensiData(data.data.absensi || []);
        setSummary(data.data.summary || null);
      } else {
        const errorData = await res.json();
        message.error(errorData.error || "Gagal mengambil data absensi");
      }
    } catch (error) {
      console.error("Error fetching absensi:", error);
      message.error("Terjadi kesalahan saat mengambil data absensi");
    } finally {
      setLoading(false);
    }
  };

  // Save absensi
  const saveAbsensi = async (santriId: number, jadwalId: number, status: string) => {
    try {
      const res = await fetch("/api/guru/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          santriId,
          jadwalId,
          tanggal: selectedDate.format('YYYY-MM-DD'),
          status
        }),
      });

      if (res.ok) {
        const data = await res.json();
        message.success(data.message || "Absensi berhasil disimpan");
        fetchAbsensiData(); // Refresh data
      } else {
        const errorData = await res.json();
        message.error(errorData.error || "Gagal menyimpan absensi");
      }
    } catch (error) {
      console.error("Error saving absensi:", error);
      message.error("Terjadi kesalahan saat menyimpan absensi");
    }
  };

  useEffect(() => {
    fetchHalaqahList();
  }, []);

  useEffect(() => {
    fetchAbsensiData();
  }, [selectedDate, selectedHalaqah]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'masuk': return 'success';
      case 'izin': return 'warning';
      case 'alpha': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'masuk': return <CheckCircleOutlined />;
      case 'izin': return <ExclamationCircleOutlined />;
      case 'alpha': return <CloseCircleOutlined />;
      default: return <UserOutlined />;
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'masuk': return 'Hadir';
      case 'izin': return 'Izin';
      case 'alpha': return 'Alpha';
      default: return 'Belum Absen';
    }
  };

  // Group absensi by jadwal
  const groupedAbsensi = jadwals.reduce((acc, jadwal) => {
    acc[jadwal.id] = absensiData.filter(a => a.jadwalId === jadwal.id);
    return acc;
  }, {} as Record<number, AbsensiRecord[]>);

  const columns = [
    {
      title: "Santri",
      dataIndex: ["santri", "namaLengkap"],
      key: "santri",
      render: (text: string, record: AbsensiRecord) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>@{record.santri.username}</div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: AbsensiRecord) => (
        <Tag 
          color={getStatusColor(record.status)} 
          icon={getStatusIcon(record.status)}
        >
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (record: AbsensiRecord) => (
        <Space>
          <Button
            size="small"
            type={record.status === 'masuk' ? 'primary' : 'default'}
            icon={<CheckCircleOutlined />}
            onClick={() => saveAbsensi(record.santriId, record.jadwalId, 'masuk')}
          >
            Hadir
          </Button>
          <Button
            size="small"
            type={record.status === 'izin' ? 'primary' : 'default'}
            icon={<ExclamationCircleOutlined />}
            onClick={() => saveAbsensi(record.santriId, record.jadwalId, 'izin')}
          >
            Izin
          </Button>
          <Button
            size="small"
            type={record.status === 'alpha' ? 'primary' : 'default'}
            danger={record.status === 'alpha'}
            icon={<CloseCircleOutlined />}
            onClick={() => saveAbsensi(record.santriId, record.jadwalId, 'alpha')}
          >
            Alpha
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Absensi Santri</h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Kelola absensi santri berdasarkan jadwal halaqah
          </p>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <div style={{ marginBottom: 8 }}>
                <strong>Tanggal:</strong>
              </div>
              <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date || dayjs())}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ marginBottom: 8 }}>
                <strong>Halaqah:</strong>
              </div>
              <Select
                placeholder="Semua Halaqah"
                style={{ width: '100%' }}
                value={selectedHalaqah}
                onChange={setSelectedHalaqah}
                allowClear
              >
                {halaqahList.map((halaqah) => (
                  <Option key={halaqah.id} value={halaqah.id}>
                    {halaqah.namaHalaqah}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ marginBottom: 8 }}>
                <strong>Hari:</strong>
              </div>
              <div style={{ 
                padding: '8px 12px', 
                background: '#f5f5f5', 
                borderRadius: '6px',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {selectedDate.format('dddd, DD MMMM YYYY')}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Summary Statistics */}
        {summary && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Total Jadwal"
                  value={summary.totalJadwal}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Hadir"
                  value={summary.hadir}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Izin"
                  value={summary.izin}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Alpha"
                  value={summary.alpha}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* No Schedule Alert */}
        {jadwals.length === 0 && !loading && (
          <Alert
            message="Tidak ada jadwal"
            description={`Tidak ada jadwal halaqah pada hari ${selectedDate.format('dddd, DD MMMM YYYY')}. Pastikan jadwal sudah dibuat oleh admin.`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Jadwal and Absensi Tables */}
        {jadwals.map((jadwal) => (
          <Card
            key={jadwal.id}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <BookOutlined style={{ marginRight: 8 }} />
                  {jadwal.halaqah.namaHalaqah}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {jadwal.jamMulai} - {jadwal.jamSelesai}
                </div>
              </div>
            }
            style={{ marginBottom: 16 }}
          >
            {groupedAbsensi[jadwal.id]?.length > 0 ? (
              <Table
                columns={columns}
                dataSource={groupedAbsensi[jadwal.id]}
                rowKey={(record) => `${record.santriId}-${record.jadwalId}`}
                loading={loading}
                pagination={false}
                size="small"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <UserOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>Tidak ada santri terdaftar di halaqah ini</div>
              </div>
            )}
          </Card>
        ))}

        {/* Bulk Actions */}
        {jadwals.length > 0 && (
          <Card title="Aksi Massal" style={{ marginTop: 16 }}>
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Tandai Semua Hadir',
                    content: 'Apakah Anda yakin ingin menandai semua santri sebagai hadir?',
                    onOk: async () => {
                      for (const record of absensiData) {
                        if (!record.status) {
                          await saveAbsensi(record.santriId, record.jadwalId, 'masuk');
                        }
                      }
                    }
                  });
                }}
              >
                Tandai Semua Hadir
              </Button>
              <Button
                icon={<ExclamationCircleOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Tandai Semua Izin',
                    content: 'Apakah Anda yakin ingin menandai semua santri sebagai izin?',
                    onOk: async () => {
                      for (const record of absensiData) {
                        if (!record.status) {
                          await saveAbsensi(record.santriId, record.jadwalId, 'izin');
                        }
                      }
                    }
                  });
                }}
              >
                Tandai Semua Izin
              </Button>
            </Space>
          </Card>
        )}
      </div>
    </LayoutApp>
  );
}