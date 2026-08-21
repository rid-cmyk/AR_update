'use client'

import { Card, Row, Col, Statistic, Progress, Typography } from "antd";
import {
  DatabaseOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { getCategoryStats, type TableInfo, type BackupHistory } from "@/lib/services/databaseBackup";

const { Text } = Typography;

interface DatabaseStatsCardsProps {
  tables: TableInfo[];
  selectedTables: string[];
  backupHistory: BackupHistory[];
  progress: number;
  currentOperation: string;
  isBusy: boolean;
}

export default function DatabaseStatsCards({
  tables,
  selectedTables,
  backupHistory,
  progress,
  currentOperation,
  isBusy
}: DatabaseStatsCardsProps) {
  return (
    <>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Tabel"
              value={tables.length}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Records"
              value={tables.reduce((sum, t) => sum + t.recordCount, 0)}
              prefix={<FileExcelOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tabel Dipilih"
              value={selectedTables.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Backup History"
              value={backupHistory.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Category Overview */}
      <Card title="Kategori Tabel" size="small">
        <Row gutter={[16, 16]}>
          {getCategoryStats(tables).map(({ category, count, color }) => (
            <Col key={category} xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  fontSize: 18,
                  fontWeight: 'bold'
                }}>
                  {count}
                </div>
                <Text strong style={{ textTransform: 'capitalize' }}>{category}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Progress Indicator */}
      {isBusy && (
        <Card>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Progress
              type="circle"
              percent={progress}
              format={() => `${progress}%`}
              style={{ marginBottom: 16 }}
            />
            <div>
              <Text strong>{currentOperation}</Text>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
