'use client'

import { Card, Row, Col, Button, Space, Upload, Typography } from "antd";
import {
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  DatabaseOutlined,
  UploadOutlined
} from "@ant-design/icons";
import type { TableInfo } from "@/lib/services/databaseBackup";

const { Title, Paragraph } = Typography;

interface DatabaseActionsCardProps {
  tables: TableInfo[];
  selectedTables: string[];
  loading: boolean;
  uploadLoading: boolean;
  onExport: (tableNames?: string[]) => void;
  onImport: (file: any) => boolean;
}

export default function DatabaseActionsCard({
  tables,
  selectedTables,
  loading,
  uploadLoading,
  onExport,
  onImport
}: DatabaseActionsCardProps) {
  return (
    <Card title="Aksi Utama">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ textAlign: 'center', height: '100%' }}
            styles={{ body: {} }}
          >
            <CloudDownloadOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>Export Database</Title>
            <Paragraph type="secondary">
              Export data tabel yang dipilih ke format CSV untuk backup
            </Paragraph>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={() => onExport()}
                disabled={selectedTables.length === 0 || loading}
                style={{ width: '100%' }}
              >
                Export Tabel Terpilih ({selectedTables.length})
              </Button>
              <Button
                size="large"
                icon={<DatabaseOutlined />}
                onClick={() => onExport(tables.map(t => t.name))}
                disabled={loading}
                style={{ width: '100%' }}
              >
                Export Semua Tabel
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ textAlign: 'center', height: '100%' }}
            styles={{ body: {} }}
          >
            <CloudUploadOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4}>Import Database</Title>
            <Paragraph type="secondary">
              Import data dari file backup CSV ke database
            </Paragraph>
            <Upload
              accept=".zip,.csv"
              beforeUpload={onImport}
              showUploadList={false}
              disabled={uploadLoading}
            >
              <Button
                type="primary"
                size="large"
                icon={<UploadOutlined />}
                loading={uploadLoading}
                style={{ width: '100%' }}
                danger
              >
                Import dari File
              </Button>
            </Upload>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}
