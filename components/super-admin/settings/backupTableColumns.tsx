import React from "react";
import { Tag, Statistic, Space, Tooltip, Button, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface TableInfo {
  name: string;
  displayName: string;
  recordCount: number;
  lastUpdated: string;
  size: string;
  description: string;
  category: 'core' | 'data' | 'system' | 'logs';
}

export const getBackupTableColumns = (handleExport: (tables?: string[]) => void) => [
  {
    title: 'Tabel',
    dataIndex: 'displayName',
    key: 'displayName',
    render: (text: string, record: TableInfo) => (
      <div>
        <Text strong>{text}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {record.name}
        </Text>
      </div>
    )
  },
  {
    title: 'Kategori',
    dataIndex: 'category',
    key: 'category',
    render: (category: string) => {
      const colors = {
        core: 'blue',
        data: 'green',
        system: 'orange',
        logs: 'purple'
      };
      return <Tag color={colors[category as keyof typeof colors]}>{category.toUpperCase()}</Tag>;
    }
  },
  {
    title: 'Jumlah Record',
    dataIndex: 'recordCount',
    key: 'recordCount',
    render: (count: number) => (
      <Statistic
        value={count}
        valueStyle={{ fontSize: 14 }}
        formatter={(value) => value?.toLocaleString()}
      />
    )
  },
  {
    title: 'Ukuran',
    dataIndex: 'size',
    key: 'size'
  },
  {
    title: 'Terakhir Diupdate',
    dataIndex: 'lastUpdated',
    key: 'lastUpdated',
    render: (date: string) => new Date(date).toLocaleString('id-ID')
  },
  {
    title: 'Aksi',
    key: 'actions',
    render: (record: TableInfo) => (
      <Space>
        <Tooltip title="Export tabel ini saja">
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleExport([record.name])}
          >
            Export
          </Button>
        </Tooltip>
      </Space>
    )
  }
];
