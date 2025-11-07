"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Table,
  message,
  Upload,
  Modal,
  Progress,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  Alert,
  Divider,
  List,
  Badge
} from "antd";
import {
  DatabaseOutlined,
  DownloadOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileExcelOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import PageHeader from "@/components/layout/PageHeader";

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

interface TableInfo {
  name: string;
  displayName: string;
  recordCount: number;
  lastUpdated: string;
  size: string;
  description: string;
  category: 'core' | 'data' | 'system' | 'logs';
}

interface BackupHistory {
  id: string;
  timestamp: string;
  type: 'full' | 'partial';
  tables: string[];
  size: string;
  status: 'success' | 'failed' | 'in_progress';
}

export default function DatabaseBackupPage() {
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState<string>('');

  // Fetch database information
  const fetchDatabaseInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/database/info');
      if (!response.ok) throw new Error('Failed to fetch database info');
      const data = await response.json();
      setTables(data.tables);
    } catch (error) {
      console.error('Error fetching database info:', error);
      message.error('Gagal memuat informasi database');
    } finally {
      setLoading(false);
    }
  };

  // Fetch backup history
  const fetchBackupHistory = async () => {
    try {
      const response = await fetch('/api/database/backup-history');
      if (!response.ok) throw new Error('Failed to fetch backup history');
      const data = await response.json();
      setBackupHistory(data.history);
    } catch (error) {
      console.error('Error fetching backup history:', error);
    }
  };

  // Export selected tables to CSV
  const handleExport = async (tableNames?: string[]) => {
    const tablesToExport = tableNames || selectedTables;

    if (tablesToExport.length === 0) {
      message.warning('Pilih minimal satu tabel untuk di-export');
      return;
    }

    confirm({
      title: 'Konfirmasi Export Database',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Anda akan mengexport {tablesToExport.length} tabel:</p>
          <ul>
            {tablesToExport.map(table => (
              <li key={table}>{tables.find(t => t.name === table)?.displayName || table}</li>
            ))}
          </ul>
          <p><strong>Proses ini mungkin memakan waktu beberapa menit.</strong></p>
        </div>
      ),
      onOk: async () => {
        try {
          setLoading(true);
          setProgress(0);
          setCurrentOperation('Mempersiapkan export...');

          const response = await fetch('/api/database/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tables: tablesToExport })
          });

          if (!response.ok) throw new Error('Export failed');

          // Simulate progress for better UX
          const progressInterval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + 10;
            });
          }, 500);

          const blob = await response.blob();
          setProgress(100);
          setCurrentOperation('Download siap...');

          // Create download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `database_backup_${new Date().toISOString().split('T')[0]}.zip`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          message.success('Database berhasil di-export!');
          fetchBackupHistory(); // Refresh history
        } catch (error) {
          console.error('Export error:', error);
          message.error('Gagal mengexport database');
        } finally {
          setLoading(false);
          setProgress(0);
          setCurrentOperation('');
        }
      }
    });
  };

  // Import CSV files
  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    confirm({
      title: 'Konfirmasi Import Database',
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <Alert
            message="PERINGATAN PENTING"
            description="Import database akan mengganti data yang sudah ada. Pastikan Anda sudah membuat backup terlebih dahulu!"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <p>File: <strong>{file.name}</strong></p>
          <p>Ukuran: <strong>{(file.size / 1024 / 1024).toFixed(2)} MB</strong></p>
        </div>
      ),
      okText: 'Ya, Import',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          setUploadLoading(true);
          setProgress(0);
          setCurrentOperation('Mengupload file...');

          const response = await fetch('/api/database/import', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Import failed');
          }

          const result = await response.json();
          setProgress(100);
          setCurrentOperation('Import selesai');

          message.success(`Database berhasil di-import! ${result.recordsImported} record diproses.`);
          fetchDatabaseInfo(); // Refresh table info
          fetchBackupHistory(); // Refresh history
        } catch (error: any) {
          console.error('Import error:', error);
          message.error(`Gagal mengimport database: ${error.message}`);
        } finally {
          setUploadLoading(false);
          setProgress(0);
          setCurrentOperation('');
        }
      }
    });

    return false; // Prevent default upload behavior
  };

  useEffect(() => {
    fetchDatabaseInfo();
    fetchBackupHistory();
  }, []);

  const tableColumns = [
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

  const rowSelection = {
    selectedRowKeys: selectedTables,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedTables(selectedRowKeys as string[]);
    },
    onSelectAll: (selected: boolean, selectedRows: TableInfo[], changeRows: TableInfo[]) => {
      if (selected) {
        setSelectedTables(tables.map(t => t.name));
      } else {
        setSelectedTables([]);
      }
    }
  };

  const getCategoryStats = () => {
    const stats = tables.reduce((acc, table) => {
      acc[table.category] = (acc[table.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([category, count]) => ({
      category,
      count,
      color: {
        core: '#1890ff',
        data: '#52c41a',
        system: '#fa8c16',
        logs: '#722ed1'
      }[category] || '#666'
    }));
  };

  return (
    <LayoutApp>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <PageHeader
          title="Database Backup & Restore"
          subtitle="Export dan import data database dalam format CSV untuk backup dan restore"
          breadcrumbs={[
            { title: "Super Admin Dashboard", href: "/super-admin/dashboard" },
            { title: "Settings" },
            { title: "Database Backup" }
          ]}
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchDatabaseInfo();
                  fetchBackupHistory();
                }}
              >
                Refresh
              </Button>
            </Space>
          }
        />

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
            {getCategoryStats().map(({ category, count, color }) => (
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
        {(loading || uploadLoading) && (
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

        {/* Main Actions */}
        <Card title="Aksi Utama">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                hoverable
                style={{ textAlign: 'center', height: '100%' }}
                bodyStyle={{ padding: '24px' }}
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
                bodyStyle={{ padding: '24px' }}
              >
                <CloudUploadOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
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

        {/* Tables List */}
        <Card title="Daftar Tabel Database">
          <Table
            columns={tableColumns}
            dataSource={tables}
            rowKey="name"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} tabel`
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Backup History */}
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

        {/* Important Notes */}
        <Card title="Catatan Penting">
          <Alert
            message="Panduan Backup & Restore"
            description={
              <div>
                <Paragraph>
                  <strong>Export:</strong>
                  <ul>
                    <li>File akan di-download dalam format ZIP berisi file CSV untuk setiap tabel</li>
                    <li>Proses export mungkin memakan waktu untuk database besar</li>
                    <li>Pastikan koneksi internet stabil selama proses</li>
                  </ul>
                </Paragraph>
                <Paragraph>
                  <strong>Import:</strong>
                  <ul>
                    <li>Hanya menerima file ZIP yang dihasilkan dari export sistem ini</li>
                    <li>Data yang ada akan diganti dengan data dari file backup</li>
                    <li>Selalu buat backup sebelum melakukan import</li>
                    <li>Proses import tidak dapat dibatalkan</li>
                  </ul>
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
          />
        </Card>
      </div>
    </LayoutApp>
  );
}