import React from "react";
import { Avatar, Typography, Card } from "antd";
import {
  UserOutlined,
  CheckCircleFilled,
  IdcardOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { UserProfile, formatRoleName } from "./profileContentTypes";
import InfoRow from "./ProfileInfoRow";
import styles from "./ProfileContent.module.css";

const { Title, Text } = Typography;

interface ProfileViewProps {
  profile: UserProfile;
}

export default function ProfileView({ profile }: ProfileViewProps) {
  const roleName = formatRoleName(profile.role.name);

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <div className={styles.avatarWrapper}>
          <Avatar
            size={160}
            src={profile.foto}
            icon={!profile.foto ? <UserOutlined /> : undefined}
            className={styles.avatarImage}
          />
          <div className={styles.verifiedBadge}>
            <CheckCircleFilled style={{ color: "white", fontSize: 18 }} />
          </div>
        </div>

        <Title level={2} className={styles.profileName}>
          {profile.namaLengkap}
        </Title>

        <div className={styles.roleBadge}>
          <Text className={styles.roleText}>
            @{profile.username} · {roleName}
          </Text>
        </div>
      </div>

      <div className={styles.infoCardsGrid}>
        <Card
          className={styles.infoCard}
          styles={{ body: { padding: 28 } }}
        >
          <Title level={4} className={styles.cardTitle}>
            <IdcardOutlined /> Informasi Personal
          </Title>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <InfoRow label="Nama Lengkap" value={profile.namaLengkap} />
            <InfoRow label="Username" value={`@${profile.username}`} />
            <InfoRow
              label="Role"
              value={
                <Text className={styles.roleTag}>
                  {roleName}
                </Text>
              }
            />
            <InfoRow label="No. Telepon" value={profile.noTlp || "-"} last />
          </div>
        </Card>

        <Card
          className={styles.infoCard}
          styles={{ body: { padding: 28 } }}
        >
          <Title level={4} className={styles.cardTitle}>
            <BarChartOutlined /> Aktivitas Akun
          </Title>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <InfoRow
              label="Bergabung Sejak"
              value={new Date(profile.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            />
            <InfoRow
              label="Terakhir Update"
              value={new Date(profile.updatedAt).toLocaleDateString("id-ID", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            <InfoRow
              label="Status Akun"
              value={
                <div className={styles.statusActive}>
                  <CheckCircleFilled /> Aktif
                </div>
              }
              last
            />
          </div>
        </Card>
      </div>
    </>
  );
}
