import React from "react";
import { Card, Row, Col, Button, Space, Typography, Upload } from "antd";
import { CloudDownloadOutlined, DownloadOutlined, DatabaseOutlined, CloudUploadOutlined, UploadOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

interface TableInfo {
  name: string;
}

interface BackupActionsProps {
  handleExport: (tables?: string[]) => void;
  selectedTables: string[];
  tables: TableInfo[];
  loading: boolean;
  uploadLoading: boolean;
  handleImport: (file: any) => boolean;
}

export default function BackupActions({
  handleExport,
  selectedTables,
  tables,
  loading,
  uploadLoading,
  handleImport
}: BackupActionsProps) {
  return (
    <Card title="Aksi Utama">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ textAlign: 'center', height: '100%' }}
            styles={{ body: {} }}
          >
            <CloudDownloadOutlined style={{ fontSize: 48, color: '#219ebc', marginBottom: 16 }} />
            <Title level={4}>Export Database</Title>
            <Paragraph type="secondary">
              Export data tabel yang dipilih ke format CSV untuk backup
            </Paragraph>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                onClick={() => handleExport()}
                disabled={selectedTables.length === 0 || loading}
                style={{ width: '100%' }}
              >
                Export Tabel Terpilih ({selectedTables.length})
              </Button>
              <Button
                size="large"
                icon={<DatabaseOutlined />}
                onClick={() => handleExport(tables.map(t => t.name))}
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
            <CloudUploadOutlined style={{ fontSize: 48, color: '#219ebc', marginBottom: 16 }} />
            <Title level={4}>Import Database</Title>
            <Paragraph type="secondary">
              Import data dari file backup CSV ke database
            </Paragraph>
            <Upload
              accept=".zip,.csv"
              beforeUpload={handleImport}
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
