 
"use client";

import { useEffect, useState, useCallback } from "react";
import { Row, Col, Card, Select, Button, Table, Tag, Spin, Statistic, Progress, Modal, Descriptions } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import WebSideDrawer from "@/components/ui/WebSideDrawer";

const { Option } = Select;

interface TahfidzReport {
  santriId: number;
  namaSantri: string;
  halaqah: string;
  guru: string;
  hafalan: {
    total: number;
    ziyadah: number;
    murojaah: number;
    totalAyat: number;
  };
  absensi: {
    total: number;
    present: number;
    rate: number;
  };
  target: {
    total: number;
    completed: number;
    rate: number;
  };
  prestasi: number;
  nilaiAkhir: number;
  statusAkhir: string;
  catatan: string;
}

interface ReportSummary {
  semester: string;
  tahunAjaran: string;
  halaqahId: string;
  totalSantri: number;
  reports: TahfidzReport[];
  summary: {
    averageNilaiAkhir: number;
    statusDistribution: {
      hijau: number;
      kuning: number;
      merah: number;
    };
  };
}

export default function RaportTahfidz() {
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [semester, setSemester] = useState('S1');
  const [tahunAjaran, setTahunAjaran] = useState('2024');
  const [halaqahId, setHalaqahId] = useState('');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TahfidzReport | null>(null);

  const showDetailModal = (record: TahfidzReport) => {
    setSelectedReport(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedReport(null);
  };

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        semester,
        tahunAjaran,
        ...(halaqahId && { halaqahId })
      });

      const res = await fetch(`/api/analytics/tahfidz-reports?${params}`);
      if (!res.ok) throw new Error('Failed to fetch tahfidz reports');
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [semester, tahunAjaran, halaqahId]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hijau': return 'green';
      case 'Kuning': return 'orange';
      case 'Merah': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'No',
      key: 'index',
      render: (text: any, record: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: 'Nama Santri',
      dataIndex: 'namaSantri',
      key: 'namaSantri',
      sorter: (a: TahfidzReport, b: TahfidzReport) => a.namaSantri.localeCompare(b.namaSantri),
    },
    {
      title: 'Halaqah',
      dataIndex: 'halaqah',
      key: 'halaqah',
      filters: (reportData?.reports || []).reduce((acc: any[], report) => {
        if (!acc.find(item => item.text === report.halaqah)) {
          acc.push({ text: report.halaqah, value: report.halaqah });
        }
        return acc;
      }, []),
      onFilter: (value: any, record: TahfidzReport) => record.halaqah === value,
    },
    {
      title: 'Nilai Akhir',
      dataIndex: 'nilaiAkhir',
      key: 'nilaiAkhir',
      sorter: (a: TahfidzReport, b: TahfidzReport) => b.nilaiAkhir - a.nilaiAkhir,
      render: (nilai: number) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{nilai}</div>
          <Progress
            percent={nilai}
            size="small"
            strokeColor={
              nilai >= 80 ? '#219ebc' :
              nilai >= 60 ? '#ffb703' : '#fb8500'
            }
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statusAkhir',
      key: 'statusAkhir',
      filters: [
        { text: 'Hijau', value: 'Hijau' },
        { text: 'Kuning', value: 'Kuning' },
        { text: 'Merah', value: 'Merah' },
      ],
      onFilter: (value: any, record: TahfidzReport) => record.statusAkhir === value,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'aksi',
      render: (_: any, record: TahfidzReport) => (
        <Button type="primary" size="small" onClick={() => showDetailModal(record)}>
          Detail
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Header */}
        <AdminHeaderCard
          title="Raport Tahfidz"
          subtitle="Semester-based tahfidz performance reports and assessments"
          tags={[
            { label: "Yayasan Panel", icon: <FileTextOutlined /> },
            { label: "Online", icon: <ClockCircleOutlined /> }
          ]}
        />

        {/* Filters */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>Semester</div>
              <Select value={semester} onChange={setSemester} style={{ width: '100%' }}>
                <Option value="S1">Semester 1</Option>
                <Option value="S2">Semester 2</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>Tahun Ajaran</div>
              <Select value={tahunAjaran} onChange={setTahunAjaran} style={{ width: '100%' }}>
                <Option value="2024">2024</Option>
                <Option value="2023">2023</Option>
                <Option value="2025">2025</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <div style={{ marginBottom: 8 }}>Halaqah (Opsional)</div>
              <Select
                placeholder="Semua Halaqah"
                allowClear
                style={{ width: '100%' }}
                onChange={setHalaqahId}
              >
                <Option value="">Semua Halaqah</Option>
                {/* This would be populated with actual halaqah data */}
                <Option value="1">Halaqah Al-Fatihah</Option>
                <Option value="2">Halaqah Al-Baqarah</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button icon={<ReloadOutlined />} onClick={fetchReportData} loading={loading}>
                  Refresh
                </Button>
                <Button type="primary" icon={<DownloadOutlined />}>
                  Export PDF
                </Button>
                <Button icon={<DownloadOutlined />}>
                  Export Excel
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Summary Statistics */}
        {reportData && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Santri"
                  value={reportData.totalSantri}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#219ebc' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Rata-rata Nilai"
                  value={reportData.summary?.averageNilaiAkhir || 0}
                  suffix="/100"
                  precision={1}
                  valueStyle={{ color: '#219ebc' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Status Hijau"
                  value={reportData.summary?.statusDistribution?.hijau || 0}
                  suffix={`/ ${reportData.totalSantri}`}
                  valueStyle={{ color: '#219ebc' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Perlu Perhatian"
                  value={reportData.summary?.statusDistribution?.merah || 0}
                  suffix={`/ ${reportData.totalSantri}`}
                  valueStyle={{ color: '#fb8500' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Report Table */}
        <Card title={`Raport Tahfidz - ${semester} ${tahunAjaran}`} variant="borderless">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <Spin size="large" />
              <p style={{ marginTop: 16, color: '#6b7280' }}>Loading report data...</p>
            </div>
          ) : reportData ? (
            <Table
              dataSource={reportData?.reports || []}
              columns={columns}
              rowKey="santriId"
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 25,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} santri`,
              }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>Ringkasan</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>
                      {(reportData.summary?.averageNilaiAkhir || 0).toFixed(1)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={2}>
                    <div>
                      <Tag color="green">Hijau: {reportData.summary?.statusDistribution?.hijau || 0}</Tag>
                      <Tag color="orange">Kuning: {reportData.summary?.statusDistribution?.kuning || 0}</Tag>
                      <Tag color="red">Merah: {reportData.summary?.statusDistribution?.merah || 0}</Tag>
                    </div>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No data available for the selected filters.</p>
            </div>
          )}
        </Card>

      </div>

      {/* Zero Code Duplication Helper for Raport Detail */}
      {(() => {
        const renderRaportContent = () => (
          selectedReport ? (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Halaqah">{selectedReport.halaqah}</Descriptions.Item>
              <Descriptions.Item label="Guru">{selectedReport.guru}</Descriptions.Item>
              <Descriptions.Item label="Hafalan">
                Total: {selectedReport.hafalan.total} <br />
                Ziyadah: {selectedReport.hafalan.ziyadah} <br />
                Murojaah: {selectedReport.hafalan.murojaah} <br />
                Total Ayat: {selectedReport.hafalan.totalAyat}
              </Descriptions.Item>
              <Descriptions.Item label="Absensi">
                Total Pertemuan: {selectedReport.absensi.total} <br />
                Hadir: {selectedReport.absensi.present} <br />
                Rate: {selectedReport.absensi.rate}%
              </Descriptions.Item>
              <Descriptions.Item label="Target">
                Target Ditetapkan: {selectedReport.target.total} <br />
                Selesai: {selectedReport.target.completed} <br />
                Rate: {selectedReport.target.rate}%
              </Descriptions.Item>
              <Descriptions.Item label="Prestasi">{selectedReport.prestasi}</Descriptions.Item>
              <Descriptions.Item label="Nilai Akhir">
                <span style={{ fontWeight: 'bold' }}>{selectedReport.nilaiAkhir}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Status Akhir">
                <Tag color={getStatusColor(selectedReport.statusAkhir)}>
                  {selectedReport.statusAkhir}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Catatan">{selectedReport.catatan || '-'}</Descriptions.Item>
            </Descriptions>
          ) : null
        );

        return (
          <>
            {/* Mobile Modal Raport (< 1024px) */}
            <Modal
              title={`Detail Raport - ${selectedReport?.namaSantri}`}
              open={isModalVisible}
              onCancel={handleModalClose}
              footer={[
                <Button key="close" onClick={handleModalClose}>
                  Tutup
                </Button>
              ]}
              width={700}
              className="lg:hidden"
            >
              {renderRaportContent()}
            </Modal>

            {/* Desktop WebSideDrawer Raport (>= 1024px) - Panel Eksekutif Yayasan */}
            <WebSideDrawer
              isOpen={isModalVisible}
              onClose={handleModalClose}
              title={`Inspeksi Rapor Tahfidz — ${selectedReport?.namaSantri || ''}`}
              subtitle="Panel eksekutif pencapaian hafalan, absensi, target, prestasi, dan evaluasi KKM santri"
              size="xl"
              footer={
                <div className="flex justify-end">
                  <Button type="primary" onClick={handleModalClose}>Tutup</Button>
                </div>
              }
            >
              {renderRaportContent()}
            </WebSideDrawer>
          </>
        );
      })()}
    </>
  );
}