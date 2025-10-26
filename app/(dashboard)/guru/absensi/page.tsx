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
  santri: Santri[];
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
  // Removed selectedHalaqah state - tidak diperlukan lagi
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);

  // Fetch guru's own halaqah (tidak perlu pilih halaqah)
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

  // Fetch absensi data (otomatis untuk semua halaqah guru)
  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('tanggal', selectedDate.format('YYYY-MM-DD'));
      // Tidak perlu halaqahId karena API akan otomatis ambil semua halaqah guru

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

  // Save absensi dengan validasi waktu
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
        // Tampilkan error yang lebih spesifik untuk validasi waktu/jadwal
        if (errorData.error.includes('rentang waktu') || errorData.error.includes('masa depan') || errorData.error.includes('tidak sesuai')) {
          Modal.error({
            title: 'Validasi Jadwal',
            content: errorData.error,
            okText: 'Mengerti'
          });
        } else {
          message.error(errorData.error || "Gagal menyimpan absensi");
        }
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
  }, [selectedDate]); // Hanya depend pada selectedDate

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
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>Pilih Tanggal Absensi:</strong>
              </div>
              <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date || dayjs())}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Pilih tanggal"
              />
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: 8 }}>
                <strong>Hari & Tanggal:</strong>
              </div>
              <div style={{ 
                padding: '12px 16px', 
                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)', 
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'white',
                fontSize: '16px',
                marginBottom: '8px'
              }}>
                {selectedDate.format('dddd, DD MMMM YYYY')}
              </div>
              
              {/* Waktu saat ini */}
              <div style={{ 
                padding: '8px 12px', 
                background: '#f0f0f0', 
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#666'
              }}>
                🕐 Waktu sekarang: {dayjs().format('HH:mm:ss')}
              </div>
            </Col>
          </Row>
          
          {/* Info halaqah guru */}
          {halaqahList.length > 0 && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: '6px' 
            }}>
              <div style={{ fontWeight: 'bold', color: '#52c41a', marginBottom: '8px' }}>
                📚 Halaqah yang Anda Ampu:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {halaqahList.map((halaqah) => (
                  <Tag key={halaqah.id} color="green" style={{ margin: 0 }}>
                    {halaqah.namaHalaqah} ({halaqah.jumlahSantri} santri)
                  </Tag>
                ))}
              </div>
            </div>
          )}
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

        {/* Info untuk guru dengan validasi waktu */}
        <Alert
          message="Absensi Santri Halaqah Anda"
          description={
            <div>
              <div>Anda dapat mengisi absensi untuk santri sesuai dengan jadwal yang telah ditentukan admin.</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                ⏰ <strong>Penting:</strong> Absensi hanya dapat diisi pada hari dan waktu sesuai jadwal halaqah.
              </div>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>
                📅 Tidak dapat mengisi absensi untuk tanggal masa depan.
              </div>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

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
        {jadwals.map((jadwal) => {
          // Hitung status waktu untuk jadwal ini
          const currentTime = dayjs();
          const selectedDateStr = selectedDate.format('YYYY-MM-DD');
          const todayStr = dayjs().format('YYYY-MM-DD');
          const isToday = selectedDateStr === todayStr;
          
          let timeStatus = 'normal';
          let timeStatusText = '';
          let timeStatusColor = '#666';
          
          if (isToday) {
            const jamMulai = dayjs(`${selectedDateStr} ${jadwal.jamMulai}`);
            const jamSelesai = dayjs(`${selectedDateStr} ${jadwal.jamSelesai}`);
            const toleransiMulai = jamMulai.subtract(30, 'minute');
            const toleransiSelesai = jamSelesai.add(2, 'hour');
            
            if (currentTime.isBefore(toleransiMulai)) {
              timeStatus = 'early';
              timeStatusText = `Belum waktunya (mulai ${toleransiMulai.format('HH:mm')})`;
              timeStatusColor = '#fa8c16';
            } else if (currentTime.isAfter(toleransiSelesai)) {
              timeStatus = 'late';
              timeStatusText = `Waktu absensi telah berakhir (berakhir ${toleransiSelesai.format('HH:mm')})`;
              timeStatusColor = '#ff4d4f';
            } else {
              timeStatus = 'active';
              timeStatusText = 'Waktu absensi aktif';
              timeStatusColor = '#52c41a';
            }
          } else if (selectedDate.isAfter(dayjs(), 'day')) {
            timeStatus = 'future';
            timeStatusText = 'Tanggal masa depan';
            timeStatusColor = '#ff4d4f';
          } else {
            timeStatus = 'past';
            timeStatusText = 'Tanggal lampau';
            timeStatusColor = '#666';
          }

          return (
            <Card
              key={jadwal.id}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <BookOutlined style={{ marginRight: 8 }} />
                    {jadwal.halaqah.namaHalaqah}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {jadwal.jamMulai} - {jadwal.jamSelesai}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: timeStatusColor,
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: timeStatus === 'active' ? '#f6ffed' : 
                                 timeStatus === 'early' ? '#fff7e6' :
                                 timeStatus === 'late' || timeStatus === 'future' ? '#fff2f0' : '#f5f5f5'
                    }}>
                      {timeStatusText}
                    </div>
                  </div>
                </div>
              }
              style={{ 
                marginBottom: 16,
                border: timeStatus === 'active' ? '2px solid #52c41a' :
                       timeStatus === 'late' || timeStatus === 'future' ? '2px solid #ff4d4f' :
                       '1px solid #d9d9d9'
              }}
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
          );
        })}

        {/* Bulk Actions dengan validasi waktu */}
        {jadwals.length > 0 && (
          <Card title="Aksi Massal" style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 12, fontSize: '12px', color: '#666' }}>
              ⚠️ Aksi massal hanya akan berhasil jika dalam rentang waktu yang diizinkan
            </div>
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Tandai Semua Hadir',
                    content: (
                      <div>
                        <div>Apakah Anda yakin ingin menandai semua santri sebagai hadir?</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                          Hanya santri yang belum diabsen dan sesuai jadwal yang akan diproses.
                        </div>
                      </div>
                    ),
                    onOk: async () => {
                      let successCount = 0;
                      let errorCount = 0;
                      
                      for (const record of absensiData) {
                        if (!record.status) {
                          try {
                            await saveAbsensi(record.santriId, record.jadwalId, 'masuk');
                            successCount++;
                          } catch (error) {
                            errorCount++;
                          }
                        }
                      }
                      
                      if (successCount > 0) {
                        message.success(`${successCount} santri berhasil ditandai hadir`);
                      }
                      if (errorCount > 0) {
                        message.warning(`${errorCount} santri gagal diproses (mungkin di luar waktu yang diizinkan)`);
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
                    content: (
                      <div>
                        <div>Apakah Anda yakin ingin menandai semua santri sebagai izin?</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                          Hanya santri yang belum diabsen dan sesuai jadwal yang akan diproses.
                        </div>
                      </div>
                    ),
                    onOk: async () => {
                      let successCount = 0;
                      let errorCount = 0;
                      
                      for (const record of absensiData) {
                        if (!record.status) {
                          try {
                            await saveAbsensi(record.santriId, record.jadwalId, 'izin');
                            successCount++;
                          } catch (error) {
                            errorCount++;
                          }
                        }
                      }
                      
                      if (successCount > 0) {
                        message.success(`${successCount} santri berhasil ditandai izin`);
                      }
                      if (errorCount > 0) {
                        message.warning(`${errorCount} santri gagal diproses (mungkin di luar waktu yang diizinkan)`);
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