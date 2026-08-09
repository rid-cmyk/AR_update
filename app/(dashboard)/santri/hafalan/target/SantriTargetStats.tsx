import React from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { AimOutlined, CheckCircleOutlined, ExclamationCircleOutlined, TrophyOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SantriTargetStatsProps {
  activeTargets: number;
  completedTargets: number;
  overdueTargets: number;
  totalProgress: number;
}

export const SantriTargetStats: React.FC<SantriTargetStatsProps> = ({
  activeTargets,
  completedTargets,
  overdueTargets,
  totalProgress
}) => {
  return (
    <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
      <Col xs={24} sm={12} lg={6}>
        <Card
          style={{
            borderRadius: '16px',
            background: '#4A90E2',
            border: 'none',
            boxShadow: '0 12px 40px rgba(74, 144, 226, 0.25)',
            transition: 'transform 0.3s ease',
            cursor: 'default'
          }}
          styles={{ body: { padding: "24px" } }}
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
            background: '#50E3C2',
            border: 'none',
            boxShadow: '0 12px 40px rgba(80, 227, 194, 0.25)',
            transition: 'transform 0.3s ease',
            cursor: 'default'
          }}
          styles={{ body: { padding: "24px" } }}
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
            background: '#fb8500',
            border: 'none',
            boxShadow: '0 12px 40px rgba(245, 34, 45, 0.25)',
            transition: 'transform 0.3s ease',
            cursor: 'default'
          }}
          styles={{ body: { padding: "24px" } }}
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
            background: '#74B9FF',
            border: 'none',
            boxShadow: '0 12px 40px rgba(116, 185, 255, 0.25)',
            transition: 'transform 0.3s ease',
            cursor: 'default'
          }}
          styles={{ body: { padding: "24px" } }}
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
  );
};
