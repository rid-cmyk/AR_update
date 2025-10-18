"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Select,
  Button,
  Table,
  Space,
  Tag,
  message,
  Row,
  Col,
} from "antd";
import {
  DownloadOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import LayoutApp from "../../components/LayoutApp";

const { Option } = Select;

interface RaportData {
  santri: {
    id: number;
    namaLengkap: string;
  };
  totalAyatHafal: number;
  targetTercapai: number; // percentage
  rataRataNilaiUjian: number;
  statusAkhir: string;
}

interface Halaqah {
  id: number;
  namaHalaqah: string;
  jumlahSantri: number;
  santri: Array<{
    id: number;
    namaLengkap: string;
    username: string;
  }>;
}

export default function RaportPage() {
  const [halaqahList, setHalaqahList] = useState<Halaqah[]>([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState<number | null>(null);
  const [semester, setSemester] = useState<string>("S1");
  const [tahunAjaran, setTahunAjaran] = useState<string>("2024/2025");
  const [raportData, setRaportData] = useState<RaportData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch halaqah milik guru dari dashboard API guru
  const fetchHalaqah = async () => {
    try {
      const res = await fetch("/api/(guru)/dashboard");
      if (res.ok) {
        const data = await res.json();
        setHalaqahList(data.halaqah || []);
        // Auto-select first halaqah if available
        if (data.halaqah && data.halaqah.length > 0 && !selectedHalaqah) {
          setSelectedHalaqah(data.halaqah[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching halaqah:", error);
    }
  };

  // Fetch raport data
  const fetchRaportData = async () => {
    if (!selectedHalaqah) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        halaqahId: selectedHalaqah.toString(),
        semester,
        tahunAjaran,
      });

      const res = await fetch(`/api/raport?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRaportData(data);
      }
    } catch (error) {
      console.error("Error fetching raport data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalaqah();
  }, []);

  useEffect(() => {
    if (selectedHalaqah) {
      fetchRaportData();
    }
  }, [selectedHalaqah, semester, tahunAjaran]);

  const handleExportPDF = async () => {
    try {
      message.loading({ content: 'Generating PDF...', key: 'pdf' });

      const res = await fetch('/api/raport/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester, tahunAjaran, data: raportData }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Raport_Hafalan_${semester}_${tahunAjaran.replace('/', '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        message.success({ content: 'PDF berhasil diunduh!', key: 'pdf' });
      } else {
        message.error({ content: 'Gagal generate PDF', key: 'pdf' });
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      message.error({ content: 'Error saat generate PDF', key: 'pdf' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hijau": return "green";
      case "Kuning": return "orange";
      case "Merah": return "red";
      default: return "default";
    }
  };

  const columns = [
    {
      title: "Santri",
      dataIndex: ["santri", "namaLengkap"],
      key: "santri",
    },
    {
      title: "Total Ayat Hafal",
      dataIndex: "totalAyatHafal",
      key: "totalAyatHafal",
      render: (value: number) => `${value} ayat`,
    },
    {
      title: "Target Tercapai",
      dataIndex: "targetTercapai",
      key: "targetTercapai",
      render: (value: number) => `${value}%`,
    },
    {
      title: "Rata-rata Nilai Ujian",
      dataIndex: "rataRataNilaiUjian",
      key: "rataRataNilaiUjian",
      render: (value: number) => value.toFixed(1),
    },
    {
      title: "Status Akhir",
      dataIndex: "statusAkhir",
      key: "statusAkhir",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      render: (record: RaportData) => (
        <Space>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            size="small"
            onClick={() => {
              // Handle individual PDF generation
              message.info("Fitur detail raport akan segera hadir");
            }}
          >
            Lihat Detail
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <h1>Raport Hafalan</h1>

        {/* Filter */}
        <Card style={{ marginBottom: 24 }}>
          <Space>
            <Select
              placeholder="Pilih Halaqah"
              style={{ width: 200 }}
              value={selectedHalaqah}
              onChange={(value) => setSelectedHalaqah(value)}
            >
              {halaqahList.map((halaqah) => (
                <Option key={halaqah.id} value={halaqah.id}>
                  {halaqah.namaHalaqah}
                </Option>
              ))}
            </Select>
            <Select
              value={semester}
              onChange={setSemester}
              style={{ width: 120 }}
              disabled={!selectedHalaqah}
            >
              <Option value="S1">Semester 1</Option>
              <Option value="S2">Semester 2</Option>
            </Select>
            <Select
              value={tahunAjaran}
              onChange={setTahunAjaran}
              style={{ width: 150 }}
              disabled={!selectedHalaqah}
            >
              <Option value="2023/2024">2023/2024</Option>
              <Option value="2024/2025">2024/2025</Option>
              <Option value="2025/2026">2025/2026</Option>
            </Select>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportPDF}
              disabled={!selectedHalaqah}
            >
              Ekspor PDF
            </Button>
          </Space>
        </Card>

        {/* Table */}
        <Card title={`Raport Hafalan - ${semester} ${tahunAjaran}`}>
          <Table
            columns={columns}
            dataSource={raportData}
            rowKey={(record) => record.santri.id}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} santri`,
            }}
          />
        </Card>

        {/* Summary Card */}
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <h3>Rata-rata Target Tercapai</h3>
                <h2 style={{ color: '#1890ff' }}>
                  {raportData.length > 0
                    ? Math.round(raportData.reduce((sum, item) => sum + item.targetTercapai, 0) / raportData.length)
                    : 0}%
                </h2>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <h3>Rata-rata Nilai Ujian</h3>
                <h2 style={{ color: '#52c41a' }}>
                  {raportData.length > 0
                    ? (raportData.reduce((sum, item) => sum + item.rataRataNilaiUjian, 0) / raportData.length).toFixed(1)
                    : 0}
                </h2>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <h3>Status Hijau</h3>
                <h2 style={{ color: '#3f8600' }}>
                  {raportData.filter(item => item.statusAkhir === 'Hijau').length}
                </h2>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}