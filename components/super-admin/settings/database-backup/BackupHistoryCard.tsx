'use client'

import { Card, List, Button, Space, Tag, Badge, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import type { BackupHistory } from "@/lib/services/databaseBackup";

const { Text } = Typography;

interface BackupHistoryCardProps {
  backupHistory: BackupHistory[];
}

export default function BackupHistoryCard({ backupHistory }: BackupHistoryCardProps) {
  return (
    <Card title="Riwayat Backup">
      <List
        dataSource={backupHistory}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="download" size="small" icon={<DownloadOutlined />}>
                Download
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={
                <Badge
                  status={
                    item.status === 'success' ? 'success' :
                      item.status === 'failed' ? 'error' : 'processing'
                  }
                />
              }
              title={
                <Space>
                  <Text strong>
                    {item.type === 'full' ? 'Full Backup' : 'Partial Backup'}
                  </Text>
                  <Tag color={item.type === 'full' ? 'blue' : 'green'}>
                    {item.tables.length} tabel
                  </Tag>
                </Space>
              }
              description={
                <div>
                  <Text type="secondary">
                    {new Date(item.timestamp).toLocaleString('id-ID')} • {item.size}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.tables.slice(0, 3).join(', ')}
                    {item.tables.length > 3 && ` +${item.tables.length - 3} lainnya`}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Belum ada riwayat backup' }}
      />
    </Card>
  );
}
