import React from "react";
import { Card, Button, List, Typography, Tag } from "antd";
import { FireOutlined, BookOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import styles from "@/app/(dashboard)/santri/dashboard/SantriDashboard.module.css";

const { Text } = Typography;

interface RecentHafalan {
  id: number;
  tanggal: string;
  jenis: 'ziyadah' | 'murajaah';
  surah: string;
  ayat: string;
  guru: string;
}

interface RecentActivityCardProps {
  recentHafalan: RecentHafalan[];
}

export default function RecentActivityCard({ recentHafalan }: RecentActivityCardProps) {
  const router = useRouter();

  return (
    <Card
      title={
        <div className={styles.chartCardTitleWrapper}>
          <div className={styles.activityTitleDot} />
          <span className={styles.activityTitleText}>
            📝 Aktivitas Terakhir
          </span>
        </div>
      }
      className={styles.activityCard}
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
          onClick={() => router.push('/santri/hafalan')}
          style={{
            color: '#6C5CE7',
            fontWeight: '700',
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: '20px',
            transition: 'all 0.3s ease'
          }}
          className="hover:bg-purple-50"
        >
          Lihat Semua →
        </Button>
      }
    >
      <div className={styles.activityBgCircle} />
      <List
        dataSource={recentHafalan.slice(0, 3)}
        renderItem={(item) => (
          <List.Item
            className={styles.activityListItem}
          >
            <List.Item.Meta
              avatar={
                <div className={item.jenis === 'ziyadah' ? styles.activityAvatarZiyadah : styles.activityAvatarMurajaah}>
                  {item.jenis === 'ziyadah' ? <FireOutlined /> : <BookOutlined />}
                </div>
              }
              title={
                <div className={styles.activityHeader}>
                  <Text strong className={styles.activitySurah}>{item.surah}</Text>
                  <Tag
                    color={item.jenis === 'ziyadah' ? 'blue' : 'green'}
                    className={styles.activityTag}
                  >
                    {item.jenis.charAt(0).toUpperCase() + item.jenis.slice(1)}
                  </Tag>
                </div>
              }
              description={
                <div style={{ marginTop: '8px' }}>
                  <div className={styles.activityAyatRow}>
                    <BookOutlined className={styles.activityAyatIcon} />
                    <Text className={styles.activityAyatText}>Ayat: {item.ayat}</Text>
                  </div>
                  <div className={styles.activityFooterRow}>
                    <Text className={styles.activityGuruText}>
                      <UserOutlined style={{ marginRight: '4px' }} />
                      {item.guru}
                    </Text>
                    <Text className={styles.activityDateText}>
                      {dayjs(item.tanggal).format('DD/MM/YYYY')}
                    </Text>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Belum ada aktivitas hafalan' }}
      />
    </Card>
  );
}
