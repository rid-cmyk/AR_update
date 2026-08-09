import React from 'react';
import { Row, Col, Card, Typography, Tag, Progress, Divider, Empty } from 'antd';
import { UserOutlined, CalendarOutlined, BookOutlined, FireOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface SantriTargetCardsProps {
  targets: any[];
}

export const SantriTargetCards: React.FC<SantriTargetCardsProps> = ({ targets }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#219ebc';
      case 'active': return '#4A90E2';
      case 'overdue': return '#fb8500';
      case 'paused': return '#ffb703';
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

  return (
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
                background: '#ffffff',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              styles={{ body: { padding: '32px', background: 'transparent' } }}
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
                    color: progress >= 80 ? '#219ebc' : progress >= 60 ? '#ffb703' : '#4A90E2'
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
                      background: '#f8f9fa',
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
                        ? '#fff5f5'
                        : '#f0fff4',
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
                  {target.surahList.map((surah: string, index: number) => (
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
                      ? '#fed7d7'
                      : daysLeft <= 7
                        ? '#fef5e7'
                        : '#e6fffa',
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
  );
};
