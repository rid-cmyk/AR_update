import React from "react";
import { Tag, Progress, Button } from "antd";
import { 
  AimOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined, 
  InfoCircleOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";

export interface JuzProgress {
  juz: number;
  totalAyat: number;
  hafalAyat: number;
  progress: number;
  hasTarget?: boolean;
  targetDeadline?: string;
  targetStatus?: string;
}

export interface RecentHafalan {
  id: number;
  tanggal: string;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: 'ziyadah' | 'murojaah';
}

interface GetJuzColumnsProps {
  getStatusColor: (status: string) => string;
  getProgressColor: (progress: number) => string;
  showJuzDetail: (juz: JuzProgress) => void;
}

export const getJuzColumns = ({
  getStatusColor,
  getProgressColor,
  showJuzDetail
}: GetJuzColumnsProps) => [
  {
    title: "Juz",
    dataIndex: "juz",
    key: "juz",
    render: (juz: number, record: JuzProgress) => (
      <div>
        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
          Juz {juz}
        </Tag>
        {record.hasTarget && (
          <div style={{ marginTop: 4 }}>
            <Tag 
              color={getStatusColor(record.targetStatus || 'belum')} 
              style={{ fontSize: '12px' }}
              icon={<AimOutlined />}
            >
              Target
            </Tag>
          </div>
        )}
      </div>
    ),
  },
  {
    title: "Progress",
    key: "progress",
    render: (record: JuzProgress) => (
      <div>
        <Progress 
          percent={record.progress} 
          size="small" 
          strokeColor={getProgressColor(record.progress)}
          format={(percent) => `\${percent}%`}
        />
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          {record.hafalAyat} / {record.totalAyat} ayat
        </div>
      </div>
    ),
  },
  {
    title: "Status",
    key: "status",
    render: (record: JuzProgress) => {
      if (record.progress >= 100) {
        return <Tag color="success" icon={<CheckCircleOutlined />}>Selesai</Tag>;
      } else if (record.progress > 0) {
        return <Tag color="processing" icon={<ClockCircleOutlined />}>Progress</Tag>;
      } else {
        return <Tag color="default">Belum Mulai</Tag>;
      }
    },
  },
  {
    title: "Target Deadline",
    key: "deadline",
    render: (record: JuzProgress) => {
      if (!record.hasTarget || !record.targetDeadline) {
        return <span style={{ color: '#ccc' }}>-</span>;
      }
      
      const deadline = dayjs(record.targetDeadline);
      const isOverdue = deadline.isBefore(dayjs()) && record.targetStatus !== 'selesai';
      
      return (
        <div style={{ color: isOverdue ? '#fb8500' : 'inherit' }}>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {deadline.format('DD/MM/YYYY')}
          {isOverdue && (
            <div style={{ fontSize: '12px', color: '#fb8500' }}>
              Terlambat
            </div>
          )}
        </div>
      );
    },
  },
  {
    title: "Detail",
    key: "action",
    render: (record: JuzProgress) => (
      <Button 
        type="link" 
        size="small"
        icon={<InfoCircleOutlined />}
        onClick={() => showJuzDetail(record)}
      >
        Lihat Detail
      </Button>
    ),
  },
];

export const recentHafalanColumns = [
  {
    title: "Tanggal",
    dataIndex: "tanggal",
    key: "tanggal",
    render: (tanggal: string) => dayjs(tanggal).format('DD/MM/YYYY'),
  },
  {
    title: "Surat",
    dataIndex: "surat",
    key: "surat",
  },
  {
    title: "Ayat",
    key: "ayat",
    render: (record: RecentHafalan) => `\${record.ayatMulai}-\${record.ayatSelesai}`,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Tag color={status === 'ziyadah' ? 'green' : 'blue'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    ),
  },
];
