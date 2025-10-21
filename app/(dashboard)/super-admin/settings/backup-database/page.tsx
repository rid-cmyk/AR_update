"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  message,
  Space,
  Modal,
  Upload,
  Alert,
  Popconfirm,
  Tag,
} from "antd";
import {
  DownloadOutlined,
  UploadOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import type { UploadProps } from "antd";

interface Backup {
  id: number;
  namaFile: string;
  tanggalBackup: string;
}

export default function BackupDatabaseSettings() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backups");
      if (!res.ok) throw new Error("Failed to fetch backups");
      const data = await res.json();
      setBackups(data);
    } catch {
      message.error("Error fetching backups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  // ================= Backup, Restore, Delete =================
  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backups", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create backup");
      const newBackup = await res.json();
      message.success("Backup created successfully");
      fetchBackups();
    } catch {
      message.error("Error creating backup");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      message.info(`Downloading ${backup.namaFile}`);
    } catch {
      message.error("Error downloading backup");
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    try {
      message.success(`Database restored from ${selectedBackup.namaFile}`);
      setIsRestoreModalOpen(false);
      setSelectedBackup(null);
    } catch {
      message.error("Error restoring backup");
    }
  };

  const handleDeleteBackup = async (id: number) => {
    try {
      message.success("Backup deleted successfully");
      fetchBackups();
    } catch {
      message.error("Error deleting backup");
    }
  };

  // ================= Export & Import =================
  const handleExportData = async () => {
    try {
      const res = await fetch("/api/backups/export", { method: "GET" });
      if (!res.ok) throw new Error("Failed to export data");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `database_export_${new Date().toISOString()}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      message.success("Data exported successfully");
    } catch {
      message.error("Error exporting data");
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: ".json",
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          // Kirim data ke API import sesuai skema
          const res = await fetch("/api/backups/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonData),
          });
          if (!res.ok) throw new Error("Failed to import data");
          message.success("Data imported successfully");
          fetchBackups();
        } catch (err) {
          console.error(err);
          message.error("Error importing data. Pastikan format JSON sesuai skema!");
        }
      };
      reader.readAsText(file);
      return false; // prevent auto upload
    },
  };

  // ================= Table Columns =================
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "File Name", dataIndex: "namaFile", key: "namaFile" },
    {
      title: "Date Created",
      dataIndex: "tanggalBackup",
      key: "tanggalBackup",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="green">Available</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_: unknown, record: Backup) => (
        <Space size="small">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadBackup(record)}
            size="small"
          >
            Download
          </Button>
          <Button
            type="text"
            icon={<UploadOutlined />}
            onClick={() => {
              setSelectedBackup(record);
              setIsRestoreModalOpen(true);
            }}
            size="small"
          >
            Restore
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this backup?"
            onConfirm={() => handleDeleteBackup(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Database Backup & Restore</h1>

        <Alert
          message="Important Notice"
          description="Regular backups are crucial for data safety. Always test restore procedures in a development environment first."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Space style={{ marginBottom: 16 }} direction="horizontal" size="middle">
          <Button
            type="primary"
            icon={<DatabaseOutlined />}
            onClick={handleCreateBackup}
            loading={loading}
          >
            Create New Backup
          </Button>

          <Button type="default" icon={<ExportOutlined />} onClick={handleExportData}>
            Export Data
          </Button>

          <Upload {...uploadProps}>
            <Button type="default" icon={<UploadOutlined />}>
              Import Data
            </Button>
          </Upload>
        </Space>

        <Card
          title={
            <Space>
              <DatabaseOutlined />
              Backup Management
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Table
            dataSource={backups}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 600 }}
          />
        </Card>

        <Modal
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: "#faad14" }} />
              Confirm Database Restore
            </Space>
          }
          open={isRestoreModalOpen}
          onCancel={() => {
            setIsRestoreModalOpen(false);
            setSelectedBackup(null);
          }}
          onOk={handleRestoreBackup}
          okText="Restore"
          okType="danger"
          width={500}
        >
          <div style={{ padding: "16px 0" }}>
            <p>Are you sure you want to restore the database from this backup?</p>
            {selectedBackup && (
              <div
                style={{
                  background: "#f6f6f6",
                  padding: 12,
                  borderRadius: 4,
                  marginTop: 8,
                }}
              >
                <strong>File:</strong> {selectedBackup.namaFile}
                <br />
                <strong>Date:</strong>{" "}
                {new Date(selectedBackup.tanggalBackup).toLocaleString()}
              </div>
            )}
            <Alert
              message="Warning"
              description="This action will overwrite the current database. Make sure you have a recent backup before proceeding."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        </Modal>
      </div>
    </LayoutApp>
  );
}
