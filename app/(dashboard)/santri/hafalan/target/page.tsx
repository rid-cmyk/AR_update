"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Progress,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Statistic,
  Timeline,
  Empty,
  Spin,
  Divider
} from "antd";
import {
  AimOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  BookOutlined,
  FireOutlined,
  UserOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

interface Target {
  id: number;
  judul: string;
  deskripsi: string;
  targetAyat: number;
  currentAyat: number;
  tanggalMulai: string;
  tanggalTarget: string;
  status: 'active' | 'completed' | 'overdue' | 'paused';
  prioritas: 'tinggi' | 'sedang' | 'rendah';
  kategori: 'ziyadah' | 'murajaah' | 'tilawah';
  surahList: string[];
  createdAt: string;
  guru: string;
}

interface Milestone {
  id: number;
  targetId: number;
  judul: string;
  targetAyat: number;
  tanggalTarget: string;
  status: 'completed' | 'pending' | 'overdue';
  completedAt?: string;
}

export default function TargetHafalanPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - target yang diinput oleh guru
  const mockTargets: Target[] = [
    {
      id: 1,
      judul: 'Hafal Juz 1 Lengkap',
      deskripsi: 'Target hafalan Juz 1 dari Al-Fatihah sampai Al-Baqarah ayat 141',
      targetAyat: 148,
      currentAyat: 111,
      tanggalMulai: '2024-01-01',
      tanggalTarget: '2024-02-01',
      status: 'active',
      prioritas: 'tinggi',
      kategori: 'ziyadah',
      surahList: ['Al-Fatihah', 'Al-Baqarah (1-141)'],
      createdAt: '2024-01-01',
      guru: 'Ustadz Ahmad'
    },
    {
      id: 2,
      judul: 'Muraja\'ah Juz 30',
      deskripsi: 'Mengulang dan memantapkan hafalan Juz 30 (Juz Amma)',
      targetAyat: 564,
      currentAyat: 508,
      tanggalMulai: '2024-01-01',
      tanggalTarget: '2024-01-15',
      status: 'active',
      prioritas: 'sedang',
      kategori: 'murajaah',
      surahList: ['An-Naba\'', 'An-Nazi\'at', 'Abasa', 'At-Takwir', 'Al-Infitar'],
      createdAt: '2024-01-01',
      guru: 'Ustadz Ahmad'
    },
    {
      id: 3,
      judul: 'Hafal Surah Al-Kahf',
      deskripsi: 'Target khusus hafalan Surah Al-Kahf untuk bacaan Jumat',
      targetAyat: 110,
      currentAyat: 110,
      tanggalMulai: '2023-12-01',
      tanggalTarget: '2023-12-31',
      status: 'completed',
      prioritas: 'tinggi',
      kategori: 'ziyadah',
      surahList: ['Al-Kahf'],
      createdAt: '2023-12-01',
      guru: 'Ustadz Ahmad'
    }
  ];

  const mockMilestones: Milestone[] = [
    {
      id: 1,
      targetId: 1,
      judul: 'Al-Fatihah Lengkap',
      targetAyat: 7,
      tanggalTarget: '2024-01-03',
      status: 'completed',
      completedAt: '2024-01-02'
    },
    {
      id: 2,
      targetId: 1,
      judul: 'Al-Baqarah 1-50',
      targetAyat: 50,
      tanggalTarget: '2024-01-10',
      status: 'completed',
      completedAt: '2024-01-09'
    },
    {
      id: 3,
      targetId: 1,
      judul: 'Al-Baqarah 51-100',
      targetAyat: 50,
      tanggalTarget: '2024-01-20',
      status: 'pending'
    },
    {
      id: 4,
      targetId: 1,
      judul: 'Al-Baqarah 101-141',
      targetAyat: 41,
      tanggalTarget: '2024-01-30',
      status: 'pending'
    }
  ];

  useEffect(() => {
    // Simulate API call to get teacher-input targets
    const fetchTargets = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setTargets(mockTargets);
          setMilestones(mockMilestones);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching targets:', error);
        setLoading(false);
      }
    };

    fetchTargets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#52c41a';
      case 'active': return '#4A90E2';
      case 'overdue': return '#f5222d';
      case 'paused': return '#fa8c16';
      default: return '#d9d9d9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'active': return 'Aktif';
      case 'overdue': return 'Terlambat';
      case 'paused': return 'Dijeda';
      default: return status;
    }
  };

  const getPriorityColor = (prioritas: string) => {
    switch (prioritas) {
      case 'tinggi': return 'red';
      case 'sedang': return 'orange';
      case 'rendah': return 'green';
      default: return 'default';
    }
  };

  const getCategoryIcon = (kategori: string) => {
    switch (kategori) {
      case 'ziyadah': return <FireOutlined />;
      case 'murajaah': return <BookOutlined />;
      case 'tilawah': return <CalendarOutlined />;
      default: return <BookOutlined />;
    }
  };

  const getCategoryColor = (kategori: string) => {
    switch (kategori) {
      case 'ziyadah': return '#4A90E2';
      case 'murajaah': return '#50E3C2';
      case 'tilawah': return '#74B9FF';
      default: return '#d9d9d9';
    }
  };

  // Calculate statistics
  const activeTargets = targets.filter(t => t.status === 'active').length;
  const completedTargets = targets.filter(t => t.status === 'completed').length;
  const overdueTargets = targets.filter(t => t.status === 'overdue').length;
  const totalProgress = targets.length > 0
    ? Math.round(targets.reduce((sum, t) => sum + (t.currentAyat / t.targetAyat * 100), 0) / targets.length)
    : 0;

  if (loading) {
    return (
      <LayoutApp>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Spin size="large" />
          <Text type="secondary">Memuat target hafalan Anda...</Text>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '120px',
            height: '120px',
            position: 'absolute',
            top: '-30px',
            right: '-30px'
          }} />
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            position: 'absolute',
            bottom: '-20px',
            left: '20px'
          }} />

          <Row align="middle" gutter={24}>
            <Col xs={24} md={18}>
              <Title level={1} style={{
                color: 'white',
                margin: 0,
                fontSize: '36px',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                <AimOutlined style={{ marginRight: 16 }} />
                Target Hafalan
              </Title>
              <Paragraph style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '18px',
                margin: 0,
                fontWeight: '400'
              }}>
                Pantau target hafalan yang telah ditetapkan oleh guru Anda dan lihat progress pencapaian Anda
              </Paragraph>
            </Col>
            <Col xs={24} md={6} style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Target dari Guru
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>
                  {activeTargets}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  Target Aktif
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Statistics Overview */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                border: 'none',
                boxShadow: '0 12px 40px rgba(74, 144, 226, 0.25)',
                transition: 'transform 0.3s ease',
                cursor: 'default'
              }}
              bodyStyle={{ padding: '24px' }}
              hoverable
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Target Aktif</span>}
                value={activeTargets}
                valueStyle={{ color: 'white', fontSize: '32px', fontWeight: '800' }}
                prefix={<AimOutlined style={{ color: 'white', fontSize: '20px' }} />}
              />
              <div style={{ marginTop: '8px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                  Target yang sedang berjalan
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #50E3C2 0%, #4ECDC4 100%)',
                border: 'none',
                boxShadow: '0 12px 40px rgba(80, 227, 194, 0.25)',
                transition: 'transform 0.3s ease',
                cursor: 'default'
              }}
              bodyStyle={{ padding: '24px' }}
              hoverable
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Selesai</span>}
                value={completedTargets}
                valueStyle={{ color: 'white', fontSize: '32px', fontWeight: '800' }}
                prefix={<CheckCircleOutlined style={{ color: 'white', fontSize: '20px' }} />}
              />
              <div style={{ marginTop: '8px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                  Target yang telah tercapai
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)',
                border: 'none',
                boxShadow: '0 12px 40px rgba(245, 34, 45, 0.25)',
                transition: 'transform 0.3s ease',
                cursor: 'default'
              }}
              bodyStyle={{ padding: '24px' }}
              hoverable
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Terlambat</span>}
                value={overdueTargets}
                valueStyle={{ color: 'white', fontSize: '32px', fontWeight: '800' }}
                prefix={<ExclamationCircleOutlined style={{ color: 'white', fontSize: '20px' }} />}
              />
              <div style={{ marginTop: '8px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                  Target yang melewati deadline
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #74B9FF 0%, #0984E3 100%)',
                border: 'none',
                boxShadow: '0 12px 40px rgba(116, 185, 255, 0.25)',
                transition: 'transform 0.3s ease',
                cursor: 'default'
              }}
              bodyStyle={{ padding: '24px' }}
              hoverable
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Progress Rata-rata</span>}
                value={totalProgress}
                suffix="%"
                valueStyle={{ color: 'white', fontSize: '32px', fontWeight: '800' }}
                prefix={<TrophyOutlined style={{ color: 'white', fontSize: '20px' }} />}
              />
              <div style={{ marginTop: '8px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                  Pencapaian keseluruhan
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Target Cards */}
        <Row gutter={[24, 24]}>
          {targets.length > 0 ? targets.map((target) => {
            const progress = Math.round((target.currentAyat / target.targetAyat) * 100);
            const daysLeft = dayjs(target.tanggalTarget).diff(dayjs(), 'day');
            const isOverdue = daysLeft < 0 && target.status !== 'completed';

            return (
              <Col xs={24} xl={12} key={target.id}>
                <Card
                  style={{
                    borderRadius: '20px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
                    border: `1px solid ${getStatusColor(target.status)}20`,
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)',
                    height: '100%',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  bodyStyle={{
                    padding: '32px',
                    background: 'transparent'
                  }}
                  hoverable
                >
                  {/* Header */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <Title level={3} style={{
                          margin: 0,
                          color: '#333',
                          fontSize: '20px',
                          fontWeight: '700',
                          marginBottom: '8px'
                        }}>
                          {target.judul}
                        </Title>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: `${getCategoryColor(target.kategori)}15`,
                            color: getCategoryColor(target.kategori),
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {getCategoryIcon(target.kategori)}
                            {target.kategori.charAt(0).toUpperCase() + target.kategori.slice(1)}
                          </div>
                          <Tag
                            color={getPriorityColor(target.prioritas)}
                            style={{ fontSize: '11px' }}
                          >
                            {target.prioritas.toUpperCase()}
                          </Tag>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Tag
                          color={getStatusColor(target.status)}
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '4px 12px',
                            borderRadius: '20px'
                          }}
                        >
                          {getStatusText(target.status)}
                        </Tag>
                      </div>
                    </div>

                    <Paragraph style={{
                      color: '#666',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {target.deskripsi}
                    </Paragraph>
                  </div>

                  {/* Progress Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <Text style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                        Progress Hafalan
                      </Text>
                      <Text style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: progress >= 80 ? '#52c41a' : progress >= 60 ? '#fa8c16' : '#4A90E2'
                      }}>
                        {progress}%
                      </Text>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <Text style={{ fontSize: '14px', color: '#666' }}>
                        {target.currentAyat} dari {target.targetAyat} ayat
                      </Text>
                    </div>

                    <Progress
                      percent={progress}
                      strokeColor={{
                        '0%': getCategoryColor(target.kategori),
                        '100%': getCategoryColor(target.kategori),
                      }}
                      strokeWidth={12}
                      showInfo={false}
                      status={progress === 100 ? 'success' : 'active'}
                    />
                  </div>

                  {/* Timeline */}
                  <div style={{ marginBottom: '24px' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{
                          textAlign: 'center',
                          padding: '16px',
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          borderRadius: '12px',
                          border: '1px solid #dee2e6'
                        }}>
                          <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px', fontWeight: '600' }}>
                            Tanggal Mulai
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#495057' }}>
                            {dayjs(target.tanggalMulai).format('DD/MM/YYYY')}
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{
                          textAlign: 'center',
                          padding: '16px',
                          background: isOverdue
                            ? 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)'
                            : 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
                          borderRadius: '12px',
                          border: `1px solid ${isOverdue ? '#feb2b2' : '#9ae6b4'}`
                        }}>
                          <div style={{
                            fontSize: '12px',
                            color: isOverdue ? '#c53030' : '#22543d',
                            marginBottom: '8px',
                            fontWeight: '600'
                          }}>
                            Deadline
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: isOverdue ? '#c53030' : '#22543d'
                          }}>
                            {dayjs(target.tanggalTarget).format('DD/MM/YYYY')}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Surah List */}
                  <div style={{ marginBottom: '24px' }}>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px', display: 'block' }}>
                      Daftar Surah:
                    </Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {target.surahList.map((surah, index) => (
                        <Tag
                          key={index}
                          style={{
                            background: `${getCategoryColor(target.kategori)}15`,
                            color: getCategoryColor(target.kategori),
                            border: `1px solid ${getCategoryColor(target.kategori)}30`,
                            borderRadius: '20px',
                            fontSize: '12px',
                            padding: '4px 12px'
                          }}
                        >
                          {surah}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  {/* Status & Guru Info */}
                  <Divider style={{ margin: '20px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserOutlined style={{ color: '#666', fontSize: '14px' }} />
                      <Text style={{ fontSize: '13px', color: '#666' }}>
                        Ditentukan oleh: <strong>{target.guru}</strong>
                      </Text>
                    </div>

                    {target.status !== 'completed' && (
                      <div style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        background: isOverdue
                          ? 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)'
                          : daysLeft <= 7
                            ? 'linear-gradient(135deg, #fef5e7 0%, #f6ad55 100%)'
                            : 'linear-gradient(135deg, #e6fffa 0%, #81e6d9 100%)',
                        border: `1px solid ${isOverdue ? '#e53e3e' : daysLeft <= 7 ? '#dd6b20' : '#319795'}`
                      }}>
                        <Text style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: isOverdue ? '#c53030' : daysLeft <= 7 ? '#9c4221' : '#234e52'
                        }}>
                          {isOverdue
                            ? `Terlambat ${Math.abs(daysLeft)} hari`
                            : daysLeft === 0
                              ? 'Deadline hari ini!'
                              : `${daysLeft} hari lagi`
                          }
                        </Text>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            );
          }) : (
            <Col xs={24}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ color: '#666', marginBottom: '8px' }}>
                      Belum ada target hafalan
                    </Title>
                    <Paragraph style={{ color: '#999', fontSize: '14px' }}>
                      Target hafalan akan ditentukan oleh guru Anda. Silakan tunggu pemberitahuan selanjutnya.
                    </Paragraph>
                  </div>
                }
                style={{ margin: '60px 0' }}
              />
            </Col>
          )}
        </Row>

        {/* Milestones Timeline for Active Target */}
        {targets.filter(t => t.status === 'active').length > 0 && milestones.length > 0 && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#00B894'
                }} />
                <span style={{
                  background: 'linear-gradient(135deg, #00B894 0%, #00CEC9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  📋 Milestone Target Aktif
                </span>
              </div>
            }
            style={{
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 184, 148, 0.1)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)',
              marginTop: '32px'
            }}
            bodyStyle={{
              padding: '32px',
              background: 'transparent'
            }}
          >
            <Timeline mode="left">
              {milestones
                .filter(m => m.targetId === targets.find(t => t.status === 'active')?.id)
                .map((milestone) => (
                  <Timeline.Item
                    key={milestone.id}
                    color={
                      milestone.status === 'completed' ? '#52c41a' :
                      milestone.status === 'overdue' ? '#f5222d' :
                      '#4A90E2'
                    }
                    dot={
                      milestone.status === 'completed' ?
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} /> :
                      milestone.status === 'overdue' ?
                        <ExclamationCircleOutlined style={{ color: '#f5222d', fontSize: '16px' }} /> :
                        <ClockCircleOutlined style={{ color: '#4A90E2', fontSize: '16px' }} />
                    }
                    style={{ paddingBottom: '24px' }}
                  >
                    <div style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <Text strong style={{ fontSize: '16px', color: '#333', display: 'block', marginBottom: '4px' }}>
                            {milestone.judul}
                          </Text>
                          <Text style={{ fontSize: '14px', color: '#666' }}>
                            Target: {milestone.targetAyat} ayat
                          </Text>
                        </div>
                        <Tag
                          color={
                            milestone.status === 'completed' ? 'green' :
                            milestone.status === 'overdue' ? 'red' :
                            'blue'
                          }
                          style={{ fontSize: '12px', fontWeight: '600' }}
                        >
                          {milestone.status === 'completed' ? 'Selesai' :
                           milestone.status === 'overdue' ? 'Terlambat' :
                           'Pending'}
                        </Tag>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: '13px', color: '#666' }}>
                          <CalendarOutlined style={{ marginRight: '6px' }} />
                          Deadline: {dayjs(milestone.tanggalTarget).format('DD/MM/YYYY')}
                        </Text>
                        {milestone.completedAt && (
                          <Text style={{ fontSize: '12px', color: '#52c41a', fontWeight: '600' }}>
                            ✅ Selesai: {dayjs(milestone.completedAt).format('DD/MM/YYYY')}
                          </Text>
                        )}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
            </Timeline>
          </Card>
        )}

      </div>
    </LayoutApp>
  );
}