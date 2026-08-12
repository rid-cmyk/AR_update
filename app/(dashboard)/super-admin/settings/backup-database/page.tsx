 
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Table,
  message,
  Modal,
  Typography,
  Tag,
  Tooltip,
  Alert,
  Statistic
} from "antd";
import {
  DownloadOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  WarningOutlined
} from "@ant-design/icons";
import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";
import DatabaseStatsCards from "@/components/admin/settings/database-backup/DatabaseStatsCards";
import DatabaseActionsCard from "@/components/admin/settings/database-backup/DatabaseActionsCard";
import BackupHistoryCard from "@/components/admin/settings/database-backup/BackupHistoryCard";
import {
  fetchDatabaseInfo,
  fetchBackupHistory,
  exportDatabase,
  importDatabase,
  downloadBlob,
  type TableInfo,
  type BackupHistory
} from "@/lib/services/databaseBackup";

const { Text, Paragraph } = Typography;
const { confirm } = Modal;

const CATEGORY_TAG_COLORS: Record<string, string> = {
  core: 'blue',
  data: 'green',
  system: 'orange',
  logs: 'purple'
};

const getTableColumns = (onExport: (tableName: string) => void) => [
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
    render: (category: string) => (
      <Tag color={CATEGORY_TAG_COLORS[category] || 'default'}>{category.toUpperCase()}</Tag>
    )
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
            onClick={() => onExport(record.name)}
          >
            Export
          </Button>
        </Tooltip>
      </Space>
    )
  }
];

export default function DatabaseBackupPage() {
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState<string>('');

  // Fetch database information
  const loadDatabaseInfo = async () => {
    try {
      setLoading(true);
      setTables(await fetchDatabaseInfo());
    } catch (error) {
      console.error('Error fetching database info:', error);
      message.error('Gagal memuat informasi database');
    } finally {
      setLoading(false);
    }
  };

  // Fetch backup history
  const loadBackupHistory = async () => {
    try {
      setBackupHistory(await fetchBackupHistory());
    } catch (error) {
      console.error('Error fetching backup history:', error);
    }
  };

  // Simulasi progress untuk UX saat blob export sedang diproses
  const simulateExportProgress = () => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);
    return () => clearInterval(progressInterval);
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

          const stopSimulation = simulateExportProgress();
          const blob = await exportDatabase(tablesToExport);
          stopSimulation();

          setProgress(100);
          setCurrentOperation('Download siap...');
          downloadBlob(blob, `database_backup_${new Date().toISOString().split('T')[0]}.zip`);

          message.success('Database berhasil di-export!');
          loadBackupHistory(); // Refresh history
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
  const handleImport = (file: any) => {
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

          const result = await importDatabase(file);
          setProgress(100);
          setCurrentOperation('Import selesai');

          message.success(`Database berhasil di-import! ${result.recordsImported} record diproses.`);
          loadDatabaseInfo(); // Refresh table info
          loadBackupHistory(); // Refresh history
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
    loadDatabaseInfo();
    loadBackupHistory();
  }, []);

  const tableColumns = getTableColumns((tableName) => handleExport([tableName]));

  const rowSelection = {
    selectedRowKeys: selectedTables,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedTables(selectedRowKeys as string[]);
    },
    onSelectAll: (selected: boolean) => {
      if (selected) {
        setSelectedTables(tables.map(t => t.name));
      } else {
        setSelectedTables([]);
      }
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <AdminHeaderCard
          title="Database Backup & Restore"
          subtitle="Export dan import data database dalam format CSV untuk backup dan restore"
          actions={
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchDatabaseInfo();
                fetchBackupHistory();
              }}
            >
              Refresh
            </Button>
          }
        />

        <DatabaseStatsCards
          tables={tables}
          selectedTables={selectedTables}
          backupHistory={backupHistory}
          progress={progress}
          currentOperation={currentOperation}
          isBusy={loading || uploadLoading}
        />

        <DatabaseActionsCard
          tables={tables}
          selectedTables={selectedTables}
          loading={loading}
          uploadLoading={uploadLoading}
          onExport={handleExport}
          onImport={handleImport}
        />

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

        <BackupHistoryCard backupHistory={backupHistory} />

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
    </>
  );
}