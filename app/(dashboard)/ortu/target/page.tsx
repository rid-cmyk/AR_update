"use client";

import { Card, Row, Col, Table, Tag, Spin, Select, Progress, Statistic, Space } from "antd";
import { AimOutlined, ClockCircleOutlined } from "@ant-design/icons";
import AdminHeaderCard from "@/components/super-admin/layout/AdminHeaderCard";
import dayjs from "dayjs";
import { useOrtuChildDashboard } from "@/hooks/useOrtuChildDashboard";
import { useStatusTag, TARGET_STATUS_TAGS } from "@/hooks/useStatusTag";
import { useTablePagination } from "@/hooks/useTablePagination";

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
  const { data, children, loading, selectedChild, setSelectedChild } = useOrtuChildDashboard<{
    target: TargetData[];
    stats: ChildTargetStats[];
  }>({
    endpoint: "/api/dashboard/ortu",
    transformAnak: (anak: any) => {
      const target: TargetData[] = [];
      (anak.TargetHafalan || []).forEach((item: any) => {
        target.push({
          id: item.id,
          surat: item.surat,
          ayatTarget: item.ayatTarget,
          deadline: item.deadline,
          status: item.status,
          progress: item.progress || 0,
          catatan: item.catatan,
          santri: {
            namaLengkap: anak.namaLengkap,
            username: anak.username,
          },
        });
      });

      const totalTarget = anak.TargetHafalan?.length || 0;
      const targetSelesai = anak.TargetHafalan?.filter((t: any) => t.status === "selesai").length || 0;
      const targetAktif = anak.TargetHafalan?.filter((t: any) => t.status === "aktif").length || 0;
      const totalProgress = anak.TargetHafalan?.reduce((sum: number, t: any) => sum + (t.progress || 0), 0) || 0;

      return {
        data: {
          target,
          stats: [
            {
              namaLengkap: anak.namaLengkap,
              totalTarget,
              targetSelesai,
              targetAktif,
              rataRataProgress: totalTarget > 0 ? Math.round(totalProgress / totalTarget) : 0,
            },
          ],
        },
        child: { id: anak.id, namaLengkap: anak.namaLengkap, username: anak.username },
      };
    },
    initialData: {
      target: [],
      stats: [],
    },
  });

  const targetData = data.target;
  const childStats = data.stats;

  // Filter data based on selected child
  const filteredData = targetData.filter((item) => {
    return selectedChild === "all" || item.santri.namaLengkap === selectedChild;
  });

  const childNames = children.map((c) => c.namaLengkap);

  const renderStatus = useStatusTag(TARGET_STATUS_TAGS, "tertunda");
  const pagination = useTablePagination({ totalLabel: "target" });

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
      render: renderStatus,
    },
    {
      title: "Catatan",
      dataIndex: "catatan",
      key: "catatan",
      render: (catatan: string) => catatan || "-",
    },
  ];

  return (
    <>
      <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        <AdminHeaderCard
          title="Target Hafalan Anak"
          subtitle="Dukung anak mencapai target hafalan dengan semangat dan doa yang tulus"
          tags={[
            { label: "Target", icon: <AimOutlined /> },
            { label: "Online", icon: <ClockCircleOutlined /> }
          ]}
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: "#6b7280" }}>Memuat data target hafalan...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {childStats.map((child, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card style={{ textAlign: "center", border: "2px solid #8ecae6" }}>
                    <Statistic
                      title={`🎯 ${child.namaLengkap}`}
                      value={child.totalTarget}
                      prefix={<AimOutlined />}
                      suffix="target"
                      valueStyle={{ color: "#8ecae6", fontSize: "24px", fontWeight: "bold" }}
                    />
                    <div style={{ marginTop: 12, fontSize: "14px", color: "#666" }}>
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
                  <Card title={`📈 Progress ${child.namaLengkap}`} variant="borderless">
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Progress
                        type="circle"
                        percent={child.rataRataProgress}
                        format={(percent) => `${percent}%`}
                        strokeColor="#8ecae6"
                        size={100}
                      />
                      <p style={{ marginTop: 16, color: "#666", fontSize: "14px" }}>
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
                  <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Pilih Anak:</label>
                  <Select
                    value={selectedChild}
                    onChange={setSelectedChild}
                    style={{ width: 200 }}
                    placeholder="Pilih anak"
                  >
                    <Select.Option value="all">Semua Anak</Select.Option>
                    {childNames.map(child => (
                      <Select.Option key={child} value={child}>{child}</Select.Option>
                    ))}
                  </Select>
                </div>
              </Space>
            </Card>

            {/* Target Table */}
            <Card title="📋 Detail Target Hafalan" variant="borderless">
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={pagination}
                scroll={{ x: 800 }}
              />
            </Card>
          </>
        )}
      </div>
    </>
  );
}