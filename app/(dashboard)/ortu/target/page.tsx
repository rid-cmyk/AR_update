"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Table, Tag, Spin, Select, Progress, Statistic, Space } from "antd";
import { AimOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";

interface TargetData {
  id: number;
  surat: string;
  ayatTarget: number;
  deadline: string;
  status: string;
  progress?: number;
  catatan?: string;
  santri: {
    namaLengkap: string;
    username: string;
  };
}

interface ChildTargetStats {
  namaLengkap: string;
  totalTarget: number;
  targetSelesai: number;
  targetAktif: number;
  rataRataProgress: number;
}

export default function TargetHafalanAnak() {
  const [targetData, setTargetData] = useState<TargetData[]>([]);
  const [childStats, setChildStats] = useState<ChildTargetStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string>("all");

  // Fetch target data
  const fetchTargetData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/ortu");
      if (!res.ok) throw new Error("Failed to fetch target data");
      const data = await res.json();

      // Transform data for display
      const transformedData: TargetData[] = [];
      const stats: ChildTargetStats[] = [];

      data.anakList?.forEach((anak: any) => {
        // Collect target data
        anak.TargetHafalan?.forEach((target: any) => {
          transformedData.push({
            id: target.id,
            surat: target.surat,
            ayatTarget: target.ayatTarget,
            deadline: target.deadline,
            status: target.status,
            progress: target.progress || Math.floor(Math.random() * 100), // Mock progress
            catatan: target.catatan,
            santri: {
              namaLengkap: anak.namaLengkap,
              username: anak.username,
            },
          });
        });

        // Calculate target stats
        const totalTarget = anak.TargetHafalan?.length || 0;
        const targetSelesai = anak.TargetHafalan?.filter((t: any) => t.status === 'selesai').length || 0;
        const targetAktif = anak.TargetHafalan?.filter((t: any) => t.status === 'aktif').length || 0;

        // Calculate average progress
        const totalProgress = anak.TargetHafalan?.reduce((sum: number, t: any) =>
          sum + (t.progress || Math.floor(Math.random() * 100)), 0) || 0;
        const rataRataProgress = totalTarget > 0 ? Math.round(totalProgress / totalTarget) : 0;

        stats.push({
          namaLengkap: anak.namaLengkap,
          totalTarget,
          targetSelesai,
          targetAktif,
          rataRataProgress,
        });
      });

      setTargetData(transformedData);
      setChildStats(stats);
    } catch (error) {
      console.error("Error fetching target data:", error);
      // Set mock data for demo
      setTargetData([
        {
          id: 1,
          surat: "Al-Baqarah",
          ayatTarget: 25,
          deadline: "2024-02-01",
          status: "aktif",
          progress: 60,
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
        },
        {
          id: 2,
          surat: "Ali Imran",
          ayatTarget: 20,
          deadline: "2024-03-01",
          status: "selesai",
          progress: 100,
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
        },
        {
          id: 3,
          surat: "An-Nisa",
          ayatTarget: 30,
          deadline: "2024-04-01",
          status: "aktif",
          progress: 25,
          santri: { namaLengkap: "Ahmad", username: "ahmad123" },
        },
      ]);

      setChildStats([
        {
          namaLengkap: "Ahmad",
          totalTarget: 5,
          targetSelesai: 2,
          targetAktif: 3,
          rataRataProgress: 62,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargetData();
  }, []);

  // Filter data based on selected child
  const filteredData = targetData.filter((item) => {
    return selectedChild === "all" || item.santri.namaLengkap === selectedChild;
  });

  // Get unique children for filter
  const children = Array.from(new Set(targetData.map(item => item.santri.namaLengkap)));

  const columns = [
    {
      title: "Anak",
      dataIndex: ["santri", "namaLengkap"],
      key: "namaLengkap",
    },
    {
      title: "Surat",
      dataIndex: "surat",
      key: "surat",
    },
    {
      title: "Target Ayat",
      dataIndex: "ayatTarget",
      key: "ayatTarget",
      render: (ayatTarget: number) => `${ayatTarget} ayat`,
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (deadline: string) => dayjs(deadline).format("DD/MM/YYYY"),
      sorter: (a: TargetData, b: TargetData) => dayjs(a.deadline).unix() - dayjs(b.deadline).unix(),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => (
        <div style={{ width: 100 }}>
          <Progress percent={progress} size="small" />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig = {
          selesai: { color: "green", icon: <CheckCircleOutlined />, text: "Selesai" },
          aktif: { color: "blue", icon: <ClockCircleOutlined />, text: "Aktif" },
          tertunda: { color: "orange", icon: <ClockCircleOutlined />, text: "Tertunda" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.tertunda;
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      },
    },
    {
      title: "Catatan",
      dataIndex: "catatan",
      key: "catatan",
      render: (catatan: string) => catatan || "-",
    },
  ];

  return (
    <LayoutApp>
      <div style={{ padding: "24px", maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
            🎯 Target Hafalan Anak
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: '16px' }}>
            Pantau target hafalan dan pencapaian anak Anda
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#6b7280' }}>Memuat data target hafalan...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {childStats.map((child, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card style={{ textAlign: 'center', border: '2px solid #722ed1' }}>
                    <Statistic
                      title={`🎯 ${child.namaLengkap}`}
                      value={child.totalTarget}
                      prefix={<AimOutlined />}
                      suffix="target"
                      valueStyle={{ color: "#722ed1", fontSize: '24px', fontWeight: 'bold' }}
                    />
                    <div style={{ marginTop: 12, fontSize: '14px', color: '#666' }}>
                      <div>{child.targetSelesai} selesai, {child.targetAktif} aktif</div>
                      <div>Rata-rata progress: {child.rataRataProgress}%</div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Progress Overview */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {childStats.map((child, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card title={`📈 Progress ${child.namaLengkap}`} bordered={false}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Progress
                        type="circle"
                        percent={child.rataRataProgress}
                        format={(percent) => `${percent}%`}
                        strokeColor="#722ed1"
                        size={100}
                      />
                      <p style={{ marginTop: 16, color: '#666', fontSize: '14px' }}>
                        Rata-rata progress target hafalan
                      </p>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
              <Space size="large" wrap>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Pilih Anak:</label>
                  <Select
                    value={selectedChild}
                    onChange={setSelectedChild}
                    style={{ width: 200 }}
                    placeholder="Pilih anak"
                  >
                    <Select.Option value="all">Semua Anak</Select.Option>
                    {children.map(child => (
                      <Select.Option key={child} value={child}>{child}</Select.Option>
                    ))}
                  </Select>
                </div>
              </Space>
            </Card>

            {/* Target Table */}
            <Card title="📋 Detail Target Hafalan" bordered={false}>
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} dari ${total} target`,
                }}
                scroll={{ x: 800 }}
              />
            </Card>
          </>
        )}
      </div>
    </LayoutApp>
  );
}