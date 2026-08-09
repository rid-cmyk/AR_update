import React from 'react';
import { Card, Timeline, Typography, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

interface SantriTargetMilestonesProps {
  targets: any[];
  milestones: any[];
}

export const SantriTargetMilestones: React.FC<SantriTargetMilestonesProps> = ({ targets, milestones }) => {
  if (targets.filter(t => t.status === 'active').length === 0 || milestones.length === 0) {
    return null;
  }

  return (
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
            background: '#00B894',
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
        background: '#ffffff',
        marginTop: '32px'
      }}
      styles={{ body: {
        padding: '32px',
        background: 'transparent'
      } }}
    >
      <Timeline mode="left">
        {milestones
          .filter(m => m.targetId === targets.find(t => t.status === 'active')?.id)
          .map((milestone) => (
            <Timeline.Item
              key={milestone.id}
              color={
                milestone.status === 'completed' ? '#219ebc' :
                milestone.status === 'overdue' ? '#fb8500' :
                '#4A90E2'
              }
              dot={
                milestone.status === 'completed' ?
                  <CheckCircleOutlined style={{ color: '#219ebc', fontSize: '16px' }} /> :
                milestone.status === 'overdue' ?
                  <ExclamationCircleOutlined style={{ color: '#fb8500', fontSize: '16px' }} /> :
                  <ClockCircleOutlined style={{ color: '#4A90E2', fontSize: '16px' }} />
              }
              style={{ paddingBottom: '24px' }}
            >
              <div style={{
                background: '#f8f9fa',
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
                    <Text style={{ fontSize: '12px', color: '#219ebc', fontWeight: '600' }}>
                      ✅ Selesai: {dayjs(milestone.completedAt).format('DD/MM/YYYY')}
                    </Text>
                  )}
                </div>
              </div>
            </Timeline.Item>
          ))}
      </Timeline>
    </Card>
  );
};
