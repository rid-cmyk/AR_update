"use client";

import { useEffect, useState } from "react";
import { useAbsensiGuru } from "@/hooks/useAbsensiGuru";
import {
  Card,
  Table,
  Button,
  DatePicker,
  Tag,
  Space,
  Row,
  Col,
  Statistic,
  message,
  Alert,
  Modal
} from "antd";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import AbsensiBulkActions from "@/components/guru/absensi/AbsensiBulkActions";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  BookOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./AbsensiClient.module.css";

export default function AbsensiClient({
  initialJadwals,
  initialAbsensi,
  initialSummary,
  initialHalaqahList,
}: any) {
  const {
    jadwals,
    absensiData,
    summary,
    loading,
    selectedDate,
    setSelectedDate,
    halaqahList,
    fetchAbsensiData,
    saveAbsensi
  } = useAbsensiGuru({
    initialJadwals,
    initialAbsensi,
    initialSummary,
    initialHalaqahList,
  });

  const [hasMounted, setHasMounted] = useState(false);

  const handleSaveAbsensi = async (santriId: string | number, jadwalId: string | number, status: string) => {
    try {
      await saveAbsensi(Number(santriId), Number(jadwalId), status);
      message.success("Absensi berhasil disimpan");
      fetchAbsensiData(selectedDate);
    } catch (error: any) {
      let errorMsg = error.message;
      try {
        const parsed = JSON.parse(error.message);
        errorMsg = parsed.error || parsed.message || errorMsg;
      } catch (e) {}
      if (errorMsg.includes('rentang waktu') || errorMsg.includes('masa depan') || errorMsg.includes('tidak sesuai')) {
        Modal.error({
          title: 'Validasi Jadwal',
          content: errorMsg,
          okText: 'Mengerti'
        });
      }
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  const groupedAbsensi = jadwals.reduce((acc, jadwal) => {
    acc[jadwal.id] = absensiData.filter(a => a.jadwalId === jadwal.id);
    return acc;
  }, {} as Record<number, any[]>);

  const columns = [
    {
      title: "Santri",
      dataIndex: ["santri", "namaLengkap"],
      key: "santri",
      render: (text: string, record: any) => (
        <div>
          <div className={styles.boldText}>{text}</div>
          <div className={styles.subText}>@{record.santri.username}</div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: any) => (
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
      render: (record: any) => (
        <Space>
          <Button
            size="small"
            type={record.status === 'masuk' ? 'primary' : 'default'}
            icon={<CheckCircleOutlined />}
            onClick={() => handleSaveAbsensi(record.santriId, record.jadwalId, 'masuk')}
          >
            Hadir
          </Button>
          <Button
            size="small"
            type={record.status === 'izin' ? 'primary' : 'default'}
            icon={<ExclamationCircleOutlined />}
            onClick={() => handleSaveAbsensi(record.santriId, record.jadwalId, 'izin')}
          >
            Izin
          </Button>
          <Button
            size="small"
            type={record.status === 'alpha' ? 'primary' : 'default'}
            danger={record.status === 'alpha'}
            icon={<CloseCircleOutlined />}
            onClick={() => handleSaveAbsensi(record.santriId, record.jadwalId, 'alpha')}
          >
            Alpha
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className={styles.container}>
        <AdminHeaderCard
          title="Absensi Santri"
          subtitle="Kelola absensi santri berdasarkan jadwal halaqah"
        />

        <Card className={styles.marginB16}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12}>
              <div className={styles.marginB8}>
                <strong>Pilih Tanggal Absensi:</strong>
              </div>
              {hasMounted && (
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date || dayjs())}
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Pilih tanggal"
                />
              )}
            </Col>
            <Col xs={24} sm={12}>
              <div className={styles.marginB8}>
                <strong>Hari & Tanggal:</strong>
              </div>
              <div className={styles.dateDisplay}>
                {selectedDate.format('dddd, DD MMMM YYYY')}
              </div>
              
              <div className={styles.timeDisplay}>
                🕐 Waktu sekarang: {dayjs().format('HH:mm:ss')}
              </div>
            </Col>
          </Row>
          
          {halaqahList.length > 0 && (
            <div className={styles.halaqahContainer}>
              <div className={styles.halaqahTitle}>
                📚 Halaqah yang Anda Ampu:
              </div>
              <div className={styles.halaqahTags}>
                {halaqahList.map((halaqah) => (
                  <Tag key={halaqah.id} color="green" style={{ margin: 0 }}>
                    {halaqah.namaHalaqah} ({halaqah.jumlahSantri} santri)
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Card>

        {summary && (
          <Row gutter={[16, 16]} className={styles.marginB24}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Total Jadwal"
                  value={summary.totalJadwal}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#219ebc' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Hadir"
                  value={summary.hadir}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#219ebc' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Izin"
                  value={summary.izin}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#ffb703' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Alpha"
                  value={summary.alpha}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#fb8500' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Alert
          message="Absensi Santri Halaqah Anda"
          description={
            <div>
              <div>Anda dapat mengisi absensi untuk santri sesuai dengan jadwal yang telah ditentukan admin.</div>
              <div className={styles.alertDesc}>
                ⏰ <strong>Penting:</strong> Absensi hanya dapat diisi pada hari dan waktu sesuai jadwal halaqah.
              </div>
              <div className={styles.alertSubDesc}>
                📅 Tidak dapat mengisi absensi untuk tanggal masa depan.
              </div>
            </div>
          }
          type="warning"
          showIcon
          className={styles.marginB16}
        />

        {jadwals.length === 0 && !loading && (
          <Alert
            message="Tidak ada jadwal"
            description={`Tidak ada jadwal halaqah pada hari ${selectedDate.format('dddd, DD MMMM YYYY')}. Pastikan jadwal sudah dibuat oleh admin.`}
            type="info"
            showIcon
            className={styles.marginB16}
          />
        )}

        {jadwals.map((jadwal) => {
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
              timeStatusColor = '#ffb703';
            } else if (currentTime.isAfter(toleransiSelesai)) {
              timeStatus = 'late';
              timeStatusText = `Waktu absensi telah berakhir (berakhir ${toleransiSelesai.format('HH:mm')})`;
              timeStatusColor = '#fb8500';
            } else {
              timeStatus = 'active';
              timeStatusText = 'Waktu absensi aktif';
              timeStatusColor = '#219ebc';
            }
          } else if (selectedDate.isAfter(dayjs(), 'day')) {
            timeStatus = 'future';
            timeStatusText = 'Tanggal masa depan';
            timeStatusColor = '#fb8500';
          } else {
            timeStatus = 'past';
            timeStatusText = 'Tanggal lampau';
            timeStatusColor = '#666';
          }

          return (
            <Card
              key={jadwal.id}
              title={
                <div className={styles.cardTitle}>
                  <div>
                    <BookOutlined style={{ marginRight: 8 }} />
                    {jadwal.halaqah.namaHalaqah}
                  </div>
                  <div className={styles.timeInfo}>
                    <div className={styles.timeText}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {jadwal.jamMulai} - {jadwal.jamSelesai}
                    </div>
                    <div className={styles.statusTag} style={{ 
                      color: timeStatusColor,
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
                border: timeStatus === 'active' ? '2px solid #219ebc' :
                       timeStatus === 'late' || timeStatus === 'future' ? '2px solid #fb8500' :
                       '1px solid #d9d9d9'
              }}
            >
              {groupedAbsensi[jadwal.id]?.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={groupedAbsensi[jadwal.id]}
                  rowKey={(record: any) => `${record.santriId}-${record.jadwalId}`}
                  loading={loading}
                  pagination={false}
                  size="small"
                />
              ) : (
                <div className={styles.emptyState}>
                  <UserOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <div>Tidak ada santri terdaftar di halaqah ini</div>
                </div>
              )}
            </Card>
          );
        })}

        <AbsensiBulkActions jadwalsLength={jadwals.length} absensiData={absensiData} handleSaveAbsensi={handleSaveAbsensi} />
      </div>
    </>
  );
}
