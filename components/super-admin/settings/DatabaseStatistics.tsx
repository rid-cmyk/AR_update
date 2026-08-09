import React from "react";
import { Row, Col, Card, Statistic, Typography } from "antd";
import { DatabaseOutlined, FileExcelOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface TableInfo {
  name: string;
  recordCount: number;
  category: 'core' | 'data' | 'system' | 'logs';
}

interface BackupHistory {
  id: string;
}

interface DatabaseStatisticsProps {
  tables: TableInfo[];
  selectedTables: string[];
  backupHistory: BackupHistory[];
  getCategoryStats: () => any[];
}

export default function DatabaseStatistics({
  tables,
  selectedTables,
  backupHistory,
  getCategoryStats
}: DatabaseStatisticsProps) {
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
              valueStyle={{ color: '#219ebc' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Records"
              value={tables.reduce((sum, t) => sum + t.recordCount, 0)}
              prefix={<FileExcelOutlined />}
              valueStyle={{ color: '#219ebc' }}
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
              valueStyle={{ color: '#ffb703' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Backup History"
              value={backupHistory.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#8ecae6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Category Overview */}
      <Card title="Kategori Tabel" size="small" style={{ marginTop: 24, marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {getCategoryStats().map(({ category, count, color }: any) => (
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
    </>
  );
}
