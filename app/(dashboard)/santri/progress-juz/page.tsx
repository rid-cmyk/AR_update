"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Tag,
  Statistic,
  Table,
  Tooltip,
  Space,
  Button,
  Modal,
  Timeline,
  Divider,
  Alert
} from "antd";
import {
  TrophyOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  AimOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

interface JuzProgress {
  juz: number;
  totalAyat: number;
  hafalAyat: number;
  progress: number;
  details: Array<{
    surat: string;
    ayatMulai: number;
    ayatSelesai: number;
    jumlahAyat: number;
  }>;
  hasTarget: boolean;
  targetDeadline?: string;
  targetStatus?: 'belum' | 'proses' | 'selesai';
  targetId?: number;
}

interface Statistics {
  totalJuz: number;
  completedJuz: number;
  inProgressJuz: number;
  notStartedJuz: number;
  averageProgress: number;
  totalTargets: number;
  completedTargets: number;
  activeTargets: number;
}

interface RecentHafalan {
  id: number;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  tanggal: string;
  status: string;
}

interface Target {
  id: number;
  juz: number;
  deadline: string;
  status: 'belum' | 'proses' | 'selesai';
}

export default function ProgressJuzPage() {
  const [juzProgress, setJuzProgress] = useState<JuzProgress[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentHafalan, setRecentHafalan] = useState<RecentHafalan[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState<JuzProgress | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/santri/progress-juz");
      if (res.ok) {
        const data = await res.json();
        setJuzProgress(data.data.juzProgress || []);
        setStatistics(data.data.statistics || null);
        setRecentHafalan(data.data.recentHafalan || []);
        setTargets(data.data.targets || []);
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "#52c41a";
    if (progress >= 75) return "#1890ff";
    if (progress >= 50) return "#fa8c16";
    if (progress >= 25) return "#faad14";
    return "#ff4d4f";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selesai': return 'success';
      case 'proses': return 'processing';
      case 'belum': return 'default';
      default: return 'default';
    }
  };

  const showJuzDetail = (juz: JuzProgress) => {
    setSelectedJuz(juz);
    setIsDetailModalOpen(true);
  };

  const juzColumns = [
    {
      title: "Juz",
      dataIndex: "juz",
      key: "juz",
      render: (juz: number, record: JuzProgress) => (
        <div>
          <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
            Juz {juz}
          </Tag>
          {record.hasTarget && (
            <div style={{ marginTop: 4 }}>
              <Tag 
                color={getStatusColor(record.targetStatus || 'belum')} 
                style={{ fontSize: '12px' }}
                icon={<AimOutlined />}
              >
                Target
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: JuzProgress) => (
        <div>
          <Progress 
            percent={record.progress} 
            size="small" 
            strokeColor={getProgressColor(record.progress)}
            format={(percent) => `${percent}%`}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {record.hafalAyat} / {record.totalAyat} ayat
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: JuzProgress) => {
        if (record.progress >= 100) {
          return <Tag color="success" icon={<CheckCircleOutlined />}>Selesai</Tag>;
        } else if (record.progress > 0) {
          return <Tag color="processing" icon={<ClockCircleOutlined />}>Progress</Tag>;
        } else {
          return <Tag color="default">Belum Mulai</Tag>;
        }
      },
    },
    {
      title: "Target Deadline",
      key: "deadline",
      render: (record: JuzProgress) => {
        if (!record.hasTarget || !record.targetDeadline) {
          return <span style={{ color: '#ccc' }}>-</span>;
        }
        
        const deadline = dayjs(record.targetDeadline);
        const isOverdue = deadline.isBefore(dayjs()) && record.targetStatus !== 'selesai';
        
        return (
          <div style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {deadline.format('DD/MM/YYYY')}
            {isOverdue && (
              <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                Terlambat
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Detail",
      key: "action",
      render: (record: JuzProgress) => (
        <Button 
          type="link" 
          size="small"
          icon={<InfoCircleOutlined />}
          onClick={() => showJuzDetail(record)}
        >
          Lihat Detail
        </Button>
      ),
    },
  ];

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
      render: (record: RecentHafalan) => `${record.ayatMulai}-${record.ayatSelesai}`,
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

  return (
    <LayoutApp>
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Progress Hafalan per Juz</h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Pantau progress hafalan Anda berdasarkan pembagian 30 juz Al-Quran
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Juz"
                  value={statistics.totalJuz}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Juz Selesai"
                  value={statistics.completedJuz}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Juz Progress"
                  value={statistics.inProgressJuz}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Rata-rata Progress"
                  value={statistics.averageProgress}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ 
                    color: statistics.averageProgress >= 75 ? '#52c41a' : 
                           statistics.averageProgress >= 50 ? '#fa8c16' : '#ff4d4f' 
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Target Summary */}
        {targets.length > 0 && (
          <Alert
            message={`Anda memiliki ${targets.length} target juz aktif`}
            description={
              <div>
                <strong>Selesai:</strong> {targets.filter(t => t.status === 'selesai').length} | 
                <strong> Progress:</strong> {targets.filter(t => t.status === 'proses').length} | 
                <strong> Belum:</strong> {targets.filter(t => t.status === 'belum').length}
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={[16, 16]}>
          {/* Progress Juz Table */}
          <Col xs={24} lg={16}>
            <Card title="Progress per Juz" loading={loading}>
              <Table
                columns={juzColumns}
                dataSource={juzProgress}
                rowKey="juz"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} juz`,
                }}
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>

          {/* Recent Hafalan */}
          <Col xs={24} lg={8}>
            <Card title="Hafalan Terbaru" loading={loading}>
              <Table
                columns={recentHafalanColumns}
                dataSource={recentHafalan}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 400 }}
              />
            </Card>

            {/* Active Targets */}
            {targets.length > 0 && (
              <Card title="Target Aktif" style={{ marginTop: 16 }}>
                <Timeline
                  items={targets.slice(0, 5).map(target => ({
                    color: getStatusColor(target.status) === 'success' ? 'green' : 
                           getStatusColor(target.status) === 'processing' ? 'blue' : 'gray',
                    children: (
                      <div>
                        <div style={{ fontWeight: 'bold' }}>
                          Juz {target.juz}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Deadline: {dayjs(target.deadline).format('DD/MM/YYYY')}
                        </div>
                        <Tag 
                          color={getStatusColor(target.status)} 
                          style={{ marginTop: 4, fontSize: '12px' }}
                        >
                          {target.status.charAt(0).toUpperCase() + target.status.slice(1)}
                        </Tag>
                      </div>
                    )
                  }))}
                />
              </Card>
            )}
          </Col>
        </Row>

        {/* Detail Modal */}
        <Modal
          title={selectedJuz ? `Detail Juz ${selectedJuz.juz}` : "Detail Juz"}
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={null}
          width={600}
        >
          {selectedJuz && (
            <div>
              {/* Progress Summary */}
              <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Progress"
                      value={selectedJuz.progress}
                      suffix="%"
                      valueStyle={{ color: getProgressColor(selectedJuz.progress) }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Ayat Hafal"
                      value={`${selectedJuz.hafalAyat} / ${selectedJuz.totalAyat}`}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                </Row>
                <Progress 
                  percent={selectedJuz.progress} 
                  strokeColor={getProgressColor(selectedJuz.progress)}
                  style={{ marginTop: 16 }}
                />
              </Card>

              {/* Target Info */}
              {selectedJuz.hasTarget && (
                <Card size="small" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Target Deadline:</strong> {dayjs(selectedJuz.targetDeadline).format('DD MMMM YYYY')}
                    </div>
                    <Tag color={getStatusColor(selectedJuz.targetStatus || 'belum')}>
                      {(selectedJuz.targetStatus || 'belum').charAt(0).toUpperCase() + (selectedJuz.targetStatus || 'belum').slice(1)}
                    </Tag>
                  </div>
                </Card>
              )}

              <Divider>Detail Hafalan</Divider>

              {/* Hafalan Details */}
              {selectedJuz.details.length > 0 ? (
                <div>
                  {selectedJuz.details.map((detail, index) => (
                    <Card key={index} size="small" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{detail.surat}</strong>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Ayat {detail.ayatMulai}-{detail.ayatSelesai}
                          </div>
                        </div>
                        <Tag color="green">{detail.jumlahAyat} ayat</Tag>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  <BookOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <div>Belum ada hafalan untuk juz ini</div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </LayoutApp>
  );
}