import React from "react";
import { Button, Typography } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import styles from "./ProfileContent.module.css";

const { Text } = Typography;

interface ProfileLogoutSectionProps {
  handleLogout: () => void;
}

export default function ProfileLogoutSection({ handleLogout }: ProfileLogoutSectionProps) {
  return (
    <div className={styles.logoutSection}>
      <div className={styles.logoutBadge}>
        <LogoutOutlined /> Keluar Aplikasi
      </div>

      <Button
        danger
        size="large"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        className={styles.btnLogout}
      >
        Logout dari Ar-Hafalan
      </Button>

      <Text
        type="secondary"
        style={{ display: "block", marginTop: 16, fontSize: 13.5, color: "#94a3b8", fontWeight: 500 }}
      >
        Anda akan diarahkan kembali ke halaman login
      </Text>
    </div>
  );
}
