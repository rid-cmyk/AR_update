import React from "react";
import { Card, List, Avatar, Typography } from "antd";
import { BookOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { HalaqahData } from "./guruDashboardTypes";
import styles from "./GuruDashboard.module.css";

const { Text } = Typography;

interface HalaqahCardProps {
  halaqah: HalaqahData;
}

export default function HalaqahCard({ halaqah }: HalaqahCardProps) {
  return (
    <Card
      size="small"
      title={
        <div className={styles.cardTitleWrapper}>
          <BookOutlined className={styles.cardTitleIconPrimary} />
          <span style={{ fontSize: '14px' }}>{halaqah.namaHalaqah}</span>
        </div>
      }
      variant="outlined"
    >
      <div className={styles.halaqahSantriCountWrapper}>
        <Text strong className={styles.halaqahSantriCount}>
          {halaqah.jumlahSantri} Santri
        </Text>
      </div>

      {halaqah.santri && halaqah.santri.length > 0 && (
        <div>
          <Text className={styles.listTitle}>
            Santri yang dididik:
          </Text>
          <List
            size="small"
            dataSource={halaqah.santri.slice(0, 5)}
            renderItem={(santri) => (
              <List.Item className={styles.listItem}>
                <div className={styles.listItemInner}>
                  <Avatar size="small" icon={<UserOutlined />} className={styles.avatarSpacing} />
                  <div>
                    <Text className={styles.santriName}>
                      {santri.namaLengkap}
                    </Text>
                    <br />
                    <Text className={styles.santriUsername}>
                      @{santri.username}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
          {halaqah.santri.length > 5 && (
            <Text className={styles.moreText}>
              +{halaqah.santri.length - 5} santri lainnya
            </Text>
          )}
        </div>
      )}

      {halaqah.jadwal && halaqah.jadwal.length > 0 && (
        <div className={styles.jadwalListWrapper}>
          <Text className={styles.listTitle}>
            Jadwal Halaqah:
          </Text>
          <List
            size="small"
            dataSource={halaqah.jadwal.slice(0, 3)}
            renderItem={(jadwal) => (
              <List.Item className={styles.listItem}>
                <div className={styles.listItemInner}>
                  <CalendarOutlined className={styles.jadwalIcon} />
                  <div>
                    <Text className={styles.jadwalDay}>
                      {jadwal.hari}
                    </Text>
                    <br />
                    <Text className={styles.jadwalTime}>
                      {jadwal.waktuMulai} - {jadwal.waktuSelesai}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
          {halaqah.jadwal.length > 3 && (
            <Text className={styles.moreText}>
              +{halaqah.jadwal.length - 3} jadwal lainnya
            </Text>
          )}
        </div>
      )}
    </Card>
  );
}
