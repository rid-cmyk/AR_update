import { Row, Col, Card, Badge } from 'antd';
import {
  NotificationOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Pengumuman } from './pengumumanColumns';

interface PengumumanStatsCardsProps {
  pengumuman: Pengumuman[];
}

export function PengumumanStatsCards({ pengumuman }: PengumumanStatsCardsProps) {
  const unreadCount = pengumuman.filter(p => !p.isRead).length;
  const todayCount = pengumuman.filter(p => dayjs(p.tanggal).isSame(dayjs(), 'day')).length;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <NotificationOutlined style={{ fontSize: '24px', color: '#219ebc', marginRight: 12 }} />
            <div>
              <div style={{ fontSize: '14px', color: '#666' }}>Total Pengumuman</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#219ebc' }}>
                {pengumuman.length}
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Badge status="processing" style={{ marginRight: 12 }} />
            <div>
              <div style={{ fontSize: '14px', color: '#666' }}>Belum Dibaca</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffb703' }}>
                {unreadCount}
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ fontSize: '24px', color: '#219ebc', marginRight: 12 }} />
            <div>
              <div style={{ fontSize: '14px', color: '#666' }}>Hari Ini</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#219ebc' }}>
                {todayCount}
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlined style={{ fontSize: '24px', color: '#8ecae6', marginRight: 12 }} />
            <div>
              <div style={{ fontSize: '14px', color: '#666' }}>Sudah Dibaca</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8ecae6' }}>
                {pengumuman.length - unreadCount}
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
