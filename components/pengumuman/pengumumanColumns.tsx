import { Button, Tag, Badge } from 'antd';
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';

export interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  tanggalKadaluarsa?: string;
  targetAudience: string;
  creator: {
    id: number;
    namaLengkap: string;
    role: {
      name: string;
    };
  };
  isRead: boolean;
  createdAt: string;
}

export function getTargetColor(target: string): string {
  const colors: Record<string, string> = {
    semua: 'blue',
    guru: 'green',
    santri: 'orange',
    ortu: 'purple',
    admin: 'red'
  };
  return colors[target] || 'default';
}

export function getTargetLabel(target: string): string {
  const labels: Record<string, string> = {
    semua: 'Semua',
    guru: 'Guru',
    santri: 'Santri',
    ortu: 'Orang Tua',
    admin: 'Admin'
  };
  return labels[target] || target;
}

export function buildPengumumanColumns(
  handleRead: (pengumuman: Pengumuman) => void
): ColumnsType<Pengumuman> {
  return [
    {
      title: 'Status',
      key: 'status',
      width: 80,
      render: (_: unknown, record: Pengumuman) => (
        <div style={{ textAlign: 'center' }}>
          {record.isRead ? (
            <CheckCircleOutlined style={{ color: '#219ebc', fontSize: '16px' }} />
          ) : (
            <Badge status="processing" />
          )}
        </div>
      ),
    },
    {
      title: 'Judul',
      dataIndex: 'judul',
      key: 'judul',
      render: (text: string, record: Pengumuman) => (
        <div>
          <div style={{
            fontWeight: record.isRead ? 'normal' : 'bold',
            color: record.isRead ? '#666' : '#000'
          }}>
            {text}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {record.isi.length > 80 ? `${record.isi.substring(0, 80)}...` : record.isi}
          </div>
        </div>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'tanggal',
      key: 'tanggal',
      width: 120,
      render: (tanggal: string) => (
        <div>
          <div>{dayjs(tanggal).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {dayjs(tanggal).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Target',
      dataIndex: 'targetAudience',
      key: 'targetAudience',
      width: 100,
      render: (target: string) => (
        <Tag color={getTargetColor(target)}>
          {getTargetLabel(target)}
        </Tag>
      ),
    },
    {
      title: 'Dari',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
      render: (creator: Pengumuman['creator']) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
            {creator?.namaLengkap || 'Unknown'}
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>
            {creator?.role?.name || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: Pengumuman) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleRead(record)}
          size="small"
        >
          Baca
        </Button>
      ),
    },
  ];
}
