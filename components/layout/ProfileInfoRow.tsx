import React from "react";
import { Typography } from "antd";
import styles from "./ProfileContent.module.css";

const { Text } = Typography;

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}

export default function InfoRow({ label, value, last = false }: InfoRowProps) {
  return (
    <div className={`${styles.infoRow} ${last ? '' : styles.infoRowBorder}`}>
      <Text strong className={styles.infoLabel}>
        {label}
      </Text>
      {typeof value === "string" ? (
        <Text className={styles.infoValue}>
          {value}
        </Text>
      ) : (
        value
      )}
    </div>
  );
}
