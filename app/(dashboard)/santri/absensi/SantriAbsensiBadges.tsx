import React from 'react';
import { Row, Col, Typography } from 'antd';
import { CheckCircleOutlined, TrophyOutlined, StarOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface SantriAbsensiBadgesProps {
  stats: any;
}

export const SantriAbsensiBadges: React.FC<SantriAbsensiBadgesProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div style={{ marginBottom: '40px' }}>
      <Title level={3} style={{
        textAlign: 'center',
        marginBottom: '24px',
        background: '#219ebc',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '24px',
        fontWeight: '800'
      }}>
        🏆 Pencapaian Kehadiran
      </Title>
      <Row gutter={[16, 16]} justify="center">
        {stats.attendanceRate >= 80 && (
          <Col>
            <div style={{
              background: '#219ebc',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(82, 196, 26, 0.3)',
              minWidth: '120px'
            }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }} />
              <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                Santri Rajin
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                Kehadiran ≥ 80%
              </div>
            </div>
          </Col>
        )}
        {stats.attendanceRate >= 90 && (
          <Col>
            <div style={{
              background: '#219ebc',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(33, 158, 188, 0.3)',
              minWidth: '120px'
            }}>
              <TrophyOutlined style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }} />
              <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                Santri Teladan
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                Kehadiran ≥ 90%
              </div>
            </div>
          </Col>
        )}
        {stats.currentStreak >= 5 && (
          <Col>
            <div style={{
              background: '#ffb703',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(250, 140, 22, 0.3)',
              minWidth: '120px'
            }}>
              <StarOutlined style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }} />
              <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                Streak Master
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                {stats.currentStreak} hari berturut-turut
              </div>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};
