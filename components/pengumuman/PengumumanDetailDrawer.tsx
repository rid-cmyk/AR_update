import { Button, Modal, Space, Typography, Tag } from 'antd';
import {
  NotificationOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import WebSideDrawer from '@/components/ui/WebSideDrawer';
import { Pengumuman, getTargetColor, getTargetLabel } from './pengumumanColumns';

interface PengumumanDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  pengumuman: Pengumuman | null;
}

export function PengumumanDetailDrawer({ open, onClose, pengumuman }: PengumumanDetailDrawerProps) {
  return (
    <>
      <Modal
        title={
          <Space>
            <NotificationOutlined />
            Detail Pengumuman
          </Space>
        }
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Tutup
          </Button>
        ]}
        width={700}
        className="lg:hidden"
      >
        <PengumumanDetailContent pengumuman={pengumuman} />
      </Modal>

      <WebSideDrawer
        isOpen={open}
        onClose={onClose}
        title="Detail Pengumuman"
        subtitle="Baca isi lengkap pengumuman, tanggal masa berlaku, dan pengirim pesan"
        size="md"
        footer={
          <div className="flex justify-end">
            <Button type="primary" onClick={onClose}>Tutup</Button>
          </div>
        }
      >
        <PengumumanDetailContent pengumuman={pengumuman} />
      </WebSideDrawer>
    </>
  );
}

function PengumumanDetailContent({ pengumuman }: { pengumuman: Pengumuman | null }) {
  if (!pengumuman) return null;

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        {pengumuman.judul}
      </Typography.Title>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Tag color={getTargetColor(pengumuman.targetAudience)}>
            {getTargetLabel(pengumuman.targetAudience)}
          </Tag>
          <span style={{ color: '#666' }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {dayjs(pengumuman.tanggal).format('DD MMMM YYYY, HH:mm')}
          </span>
          <span style={{ color: '#666' }}>
            <UserOutlined style={{ marginRight: 4 }} />
            {pengumuman.creator.namaLengkap}
          </span>
        </Space>
      </div>

      <div style={{
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px',
        lineHeight: '1.6'
      }}>
        {pengumuman.isi.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>

      {pengumuman.tanggalKadaluarsa && (
        <div style={{ marginTop: 16, color: '#ffb703' }}>
          <CalendarOutlined style={{ marginRight: 4 }} />
          Berlaku hingga: {dayjs(pengumuman.tanggalKadaluarsa).format('DD MMMM YYYY')}
        </div>
      )}
    </div>
  );
}
