import React from "react";
import { Card, Button, Space, Typography, Tag, Progress, Empty } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import styles from "@/app/(dashboard)/santri/dashboard/SantriDashboard.module.css";

const { Text } = Typography;

interface TargetHafalan {
  id: number;
  judul: string;
  deskripsi: string;
  targetAyat: number;
  currentAyat: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  kategori: 'ziyadah' | 'murajaah';
  progress?: number;
}

interface TargetHafalanCardProps {
  targets: TargetHafalan[];
}

export default function TargetHafalanCard({ targets }: TargetHafalanCardProps) {
  const router = useRouter();

  return (
    <Card
      title={
        <div className={styles.chartCardTitleWrapper}>
          <div className={styles.targetTitleDot} />
          <span className={styles.targetTitleText}>
            🎯 Target Hafalan Aktif
          </span>
        </div>
      }
      className={styles.targetCard}
      styles={{
        body: {
          padding: '32px',
          background: 'transparent',
          position: 'relative',
          zIndex: 2
        }
      }}
      extra={
        <Button
          type="link"
          onClick={() => router.push('/santri/hafalan/target')}
          style={{
            color: '#00B894',
            fontWeight: '700',
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '20px',
            transition: 'all 0.3s ease'
          }}
          className="hover:bg-green-50"
        >
          Lihat Detail →
        </Button>
      }
    >
      <div className={styles.targetBgCircle} />
      {targets.length > 0 ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          {targets.slice(0, 2).map((target) => {
            const progress = target.progress || Math.round((target.currentAyat / target.targetAyat) * 100);
            const daysLeft = dayjs(target.deadline).diff(dayjs(), 'day');

            return (
              <div key={target.id} className={styles.targetItemWrapper}>
                <div style={{ marginBottom: '12px' }}>
                  <div className={styles.targetItemHeader}>
                    <Text strong className={styles.targetItemTitle}>
                      {target.judul}
                    </Text>
                    <Tag
                      color={target.status === 'active' ? 'green' : 'orange'}
                      style={{ fontSize: '11px' }}
                    >
                      {target.status === 'active' ? 'Aktif' : 'Selesai'}
                    </Tag>
                  </div>
                  <Text type="secondary" className={styles.targetItemDesc}>
                    {target.deskripsi}
                  </Text>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div className={styles.targetProgressInfo}>
                    <Text className={styles.targetProgressText}>
                      {target.currentAyat} / {target.targetAyat} ayat
                    </Text>
                    <Text className={styles.targetProgressPercent}>
                      {progress}%
                    </Text>
                  </div>
                  <Progress
                    percent={progress}
                    strokeColor={{
                      '0%': '#00B894',
                      '100%': '#00CEC9',
                    }}
                    size="small"
                    showInfo={false}
                  />
                </div>

                <div className={styles.targetFooter}>
                  <Text className={styles.targetDeadline}>
                    <CalendarOutlined style={{ marginRight: '4px' }} />
                    Deadline: {dayjs(target.deadline).format('DD/MM/YYYY')}
                  </Text>
                  <Text style={{
                    fontSize: '11px',
                    color: daysLeft < 0 ? '#fb8500' : daysLeft <= 7 ? '#ffb703' : '#00B894',
                    fontWeight: '600'
                  }}>
                    {daysLeft < 0 ? `${Math.abs(daysLeft)} hari terlambat` :
                     daysLeft === 0 ? 'Hari ini' :
                     `${daysLeft} hari lagi`}
                  </Text>
                </div>
              </div>
            );
          })}
        </Space>
      ) : (
        <Empty description="Belum ada target hafalan aktif" />
      )}
    </Card>
  );
}
