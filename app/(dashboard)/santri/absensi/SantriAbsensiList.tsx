import React from 'react';
import { Card, List, Tag, Typography, Empty } from 'antd';
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

interface SantriAbsensiListProps {
  absensiData: any[];
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusText: (status: string) => string;
}

export const SantriAbsensiList: React.FC<SantriAbsensiListProps> = ({
  absensiData,
  getStatusColor,
  getStatusIcon,
  getStatusText,
}) => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#219ebc',
            boxShadow: '0 0 15px rgba(82, 196, 26, 0.4)'
          }} />
          <span style={{
            background: '#219ebc',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '20px',
            fontWeight: '800',
            letterSpacing: '-0.3px'
          }}>
            📋 Riwayat Kehadiran
          </span>
        </div>
      }
      style={{
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(82, 196, 26, 0.08)',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}
      styles={{ body: {
        padding: '32px',
        background: 'transparent',
        position: 'relative',
        zIndex: 2
      } }}
    >
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: 'rgba(82, 196, 26, 0.05))',
        zIndex: 1
      }} />
      {absensiData.length > 0 ? (
        <List
          dataSource={absensiData.slice(0, 10)}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '16px 0',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: `${getStatusColor(item.status)}dd`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '16px',
                      boxShadow: `0 4px 12px ${getStatusColor(item.status)}40`
                    }}
                  >
                    {getStatusIcon(item.status)}
                  </div>
                }
                title={
                  <div>
                    <Text strong style={{ fontSize: '15px', color: '#333' }}>
                      {getStatusText(item.status)}
                    </Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag
                        color={item.status === 'hadir' ? 'green' : item.status === 'izin' ? 'orange' : 'red'}
                        style={{ fontSize: '11px' }}
                      >
                        {item.halaqah}
                      </Tag>
                    </div>
                  </div>
                }
                description={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <Text style={{ color: '#666', fontSize: '13px' }}>
                      <CalendarOutlined style={{ marginRight: '6px' }} />
                      {dayjs(item.tanggal).format('DD/MM/YYYY')}
                    </Text>
                    <Text style={{ color: '#999', fontSize: '12px' }}>
                      <UserOutlined style={{ marginRight: '4px' }} />
                      {item.guru}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text type="secondary">Belum ada data absensi</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Data absensi akan diinput oleh guru Anda
              </Text>
            </div>
          }
        />
      )}
    </Card>
  );
};
