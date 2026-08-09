import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, UserOutlined, TrophyOutlined } from '@ant-design/icons';

interface SantriAbsensiStatsProps {
  stats: any;
}

export const SantriAbsensiStats: React.FC<SantriAbsensiStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <Row gutter={[20, 20]} style={{ marginBottom: '40px' }}>
      <Col xs={24} lg={6}>
        <Card
          style={{
            borderRadius: '20px',
            background: '#219ebc',
            border: 'none',
            boxShadow: '0 15px 45px rgba(82, 196, 26, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}
          styles={{ body: { padding: '28px', position: 'relative', zIndex: 2 } }}
          hoverable
        >
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 1
          }} />
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', fontWeight: '600' }}>Total Hadir</span>}
            value={stats.totalHadir}
            valueStyle={{ color: 'white', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}
            prefix={<CheckCircleOutlined style={{ color: 'white', fontSize: '22px', marginRight: '8px' }} />}
          />
        </Card>
      </Col>

      <Col xs={24} lg={6}>
        <Card
          style={{
            borderRadius: '20px',
            background: '#ffb703',
            border: 'none',
            boxShadow: '0 15px 45px rgba(250, 140, 22, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}
          styles={{ body: { padding: '28px', position: 'relative', zIndex: 2 } }}
          hoverable
        >
          <div style={{
            position: 'absolute',
            bottom: '-15px',
            right: '-15px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 1
          }} />
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', fontWeight: '600' }}>Total Izin</span>}
            value={stats.totalIzin}
            valueStyle={{ color: 'white', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}
            prefix={<ClockCircleOutlined style={{ color: 'white', fontSize: '22px', marginRight: '8px' }} />}
          />
        </Card>
      </Col>

      <Col xs={24} lg={6}>
        <Card
          style={{
            borderRadius: '20px',
            background: '#fb8500',
            border: 'none',
            boxShadow: '0 15px 45px rgba(245, 34, 45, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}
          styles={{ body: { padding: '28px', position: 'relative', zIndex: 2 } }}
          hoverable
        >
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '-20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 1
          }} />
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', fontWeight: '600' }}>Total Alpha</span>}
            value={stats.totalAlpha}
            valueStyle={{ color: 'white', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}
            prefix={<UserOutlined style={{ color: 'white', fontSize: '22px', marginRight: '8px' }} />}
          />
        </Card>
      </Col>

      <Col xs={24} lg={6}>
        <Card
          style={{
            borderRadius: '20px',
            background: '#219ebc',
            border: 'none',
            boxShadow: '0 15px 45px rgba(33, 158, 188, 0.3)',
            transition: 'all 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}
          styles={{ body: { padding: '28px', position: 'relative', zIndex: 2 } }}
          hoverable
        >
          <div style={{
            position: 'absolute',
            bottom: '-15px',
            left: '-15px',
            width: '55px',
            height: '55px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 1
          }} />
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '15px', fontWeight: '600' }}>Tingkat Kehadiran</span>}
            value={stats.attendanceRate}
            suffix="%"
            valueStyle={{ color: 'white', fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px' }}
            prefix={<TrophyOutlined style={{ color: 'white', fontSize: '22px', marginRight: '8px' }} />}
          />
        </Card>
      </Col>
    </Row>
  );
};
