import React from "react";
import { Card, List, Avatar, Typography, Tag } from "antd";
import { UserOutlined, AimOutlined } from "@ant-design/icons";
import { HalaqahData } from "./guruDashboardTypes";
import {
  filterActiveTargets,
  filterCompletedTargets,
  getTargetMeta,
} from "@/lib/utils/guruDashboardUtils";
import styles from "./GuruDashboard.module.css";

const { Text } = Typography;

interface TargetHafalanCardProps {
  halaqah: HalaqahData;
}

export default function TargetHafalanCard({ halaqah }: TargetHafalanCardProps) {
  const santri = halaqah.santri || [];

  return (
    <Card
      size="small"
      title={
        <div className={styles.cardTitleWrapper}>
          <AimOutlined className={styles.cardTitleIconInfo} />
          <span style={{ fontSize: '14px' }}>Target Hafalan</span>
        </div>
      }
      variant="outlined"
      className={styles.cardFullHeight}
    >
      {santri.length > 0 ? (
        <List
          size="small"
          dataSource={santri.slice(0, 5)}
          renderItem={(santriItem) => {
            const allTargets = santriItem.targets || [];
            const activeTargets = filterActiveTargets(allTargets);
            const completedTargets = filterCompletedTargets(allTargets);
            const hasTargets = allTargets.length > 0;
            return (
              <List.Item className={styles.targetListItem}>
                <div className={styles.targetListWrapper}>
                  <div className={styles.targetUserHeader}>
                    <Avatar size="small" icon={<UserOutlined />} className={styles.avatarSpacing} />
                    <Text className={styles.santriName}>
                      {santriItem.namaLengkap}
                    </Text>
                  </div>
                  {hasTargets ? (
                    <div className={styles.targetContentWrapper}>
                      {activeTargets.length > 0 && activeTargets.slice(0, 2).map((target) => {
                        const { isOverdue, deadlineStr } = getTargetMeta(target.deadline);
                        return (
                          <div
                            key={target.id}
                            className={`${styles.targetItem} ${isOverdue ? styles.targetItemOverdue : styles.targetItemActive}`}
                          >
                            <AimOutlined className={isOverdue ? styles.targetItemIconOverdue : styles.targetItemIconActive} />
                            <Text className={isOverdue ? styles.targetItemTextOverdue : styles.targetItemTextActive}>
                              {target.surat} ({target.ayatTarget} ayat)
                            </Text>
                            <Text className={styles.targetItemSubtext}>
                              • {isOverdue ? 'terlambat' : `s/d ${deadlineStr}`}
                            </Text>
                          </div>
                        );
                      })}
                      {activeTargets.length > 2 && (
                        <Text className={styles.targetMoreText}>
                          +{activeTargets.length - 2} target aktif lainnya
                        </Text>
                      )}
                      {completedTargets.length > 0 && (
                        <Tag color="success" className={styles.targetCompletedTag}>
                          ✓ {completedTargets.length} selesai
                        </Tag>
                      )}
                    </div>
                  ) : (
                    <Text className={styles.targetEmptyText}>
                      Belum ada target
                    </Text>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      ) : (
        <div className={styles.emptyTargetContainer}>
          <AimOutlined className={styles.emptyTargetIcon} />
          <div className={styles.emptyTargetText}>Belum ada data target</div>
        </div>
      )}
    </Card>
  );
}
