"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, Tag, Button, Space, Typography, message, Popconfirm, Empty } from "antd";
import { DeleteOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { PreviewRaportDialog } from "@/components/admin/template-raport/PreviewRaportDialog";

const { Text } = Typography;

interface DaftarTemplateProps {
  type: 'jenis-ujian' | 'template-raport';
  onRefresh?: () => void;
  refreshTrigger?: number;
}

interface JenisUjianItem {
  id: number;
  nama: string;
  kode: string;
  deskripsi: string | null;
  createdAt: string;
  komponenPenilaian: Array<{ id: number; nama: string; bobot: number }>;
  creator?: { namaLengkap: string };
}

interface TemplateRaportItem {
  id: number;
  namaTemplate: string;
  namaLembaga: string;
  status: string;
  createdAt: string;
  tahunAjaran?: { namaLengkap: string };
  creator?: { namaLengkap: string };
  _count?: { raportSantri: number };
}

export function DaftarTemplate({ type, onRefresh, refreshTrigger }: DaftarTemplateProps) {
  const [data, setData] = useState<(JenisUjianItem | TemplateRaportItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRaportItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = type === 'jenis-ujian' ? '/api/admin/jenis-ujian' : '/api/admin/template-raport';
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        const items = Array.isArray(result) ? result : (result.data || []);
        setData(items);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      const url = type === 'jenis-ujian'
        ? `/api/admin/jenis-ujian?id=${id}`
        : `/api/admin/template-raport?id=${id}`;
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        message.success('Berhasil dihapus');
        fetchData();
        onRefresh?.();
      } else {
        const result = await response.json();
        message.error(result.error || 'Gagal menghapus');
      }
    } catch (error) {
      message.error('Terjadi kesalahan saat menghapus');
    } finally {
      setDeleting(null);
    }
  };

  if (type === 'jenis-ujian') {
    const items = data as JenisUjianItem[];
    const columns = [
      {
        title: 'Kode',
        dataIndex: 'kode',
        key: 'kode',
        width: 120,
        render: (kode: string) => (
          <Tag color="blue" style={{ fontFamily: 'monospace' }}>{kode}</Tag>
        )
      },
      {
        title: 'Nama Jenis Ujian',
        dataIndex: 'nama',
        key: 'nama',
        render: (nama: string) => <Text strong>{nama}</Text>
      },
      {
        title: 'Komponen',
        key: 'komponen',
        render: (_: unknown, record: JenisUjianItem) => (
          <Space size={4} wrap>
            {record.komponenPenilaian?.map(k => (
              <Tag key={k.id} color="green" style={{ fontSize: 11 }}>
                {k.nama} ({k.bobot}%)
              </Tag>
            ))}
            {(!record.komponenPenilaian || record.komponenPenilaian.length === 0) && (
              <Text type="secondary" style={{ fontSize: 12 }}>Belum ada komponen</Text>
            )}
          </Space>
        )
      },
      {
        title: 'Dibuat',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 140,
        render: (date: string) => new Date(date).toLocaleDateString('id-ID')
      },
      {
        title: '',
        key: 'actions',
        width: 60,
        render: (_: unknown, record: JenisUjianItem) => (
          <Popconfirm
            title="Hapus jenis ujian ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Hapus"
            cancelText="Batal"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleting === record.id}
              size="small"
            />
          </Popconfirm>
        )
      }
    ];

    return (
      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={items.length > 10 ? { pageSize: 10 } : false}
        locale={{ emptyText: <Empty description="Belum ada jenis ujian" /> }}
        size="small"
      />
    );
  }

  const items = data as TemplateRaportItem[];
  const columns = [
    {
      title: 'Nama Template',
      dataIndex: 'namaTemplate',
      key: 'namaTemplate',
      render: (nama: string) => <Text strong>{nama}</Text>
    },
    {
      title: 'Lembaga',
      dataIndex: 'namaLembaga',
      key: 'namaLembaga',
    },
    {
      title: 'Tahun Ajaran',
      key: 'tahunAjaran',
      render: (_: unknown, record: TemplateRaportItem) => record.tahunAjaran?.namaLengkap || '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const color = status === 'aktif' ? 'green' : status === 'draft' ? 'orange' : 'default';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Dipakai',
      key: 'dipakai',
      width: 80,
      render: (_: unknown, record: TemplateRaportItem) => (
        <Text type="secondary">{record._count?.raportSantri || 0} raport</Text>
      )
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => new Date(date).toLocaleDateString('id-ID')
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: TemplateRaportItem) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: '#1890ff' }} />}
            onClick={() => setPreviewTemplate(record)}
            size="small"
            title="Review Raport"
          />
          <Popconfirm
            title="Hapus template raport ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Hapus"
            cancelText="Batal"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleting === record.id}
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={items.length > 10 ? { pageSize: 10 } : false}
        locale={{ emptyText: <Empty description="Belum ada template raport" /> }}
        size="small"
      />
      <PreviewRaportDialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        template={previewTemplate}
      />
    </>
  );
}
