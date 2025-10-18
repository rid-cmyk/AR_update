"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Progress, List, Tag, Statistic, Select, Avatar } from "antd";
import { AimOutlined, TrophyOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import LayoutApp from "../../../components/LayoutApp";

interface TargetData {
  id: number;
  surat: string;
  ayatTarget: number;
  deadline: string;
  status: string;
  santri: {
    namaLengkap: string;
  };
}

export default function OrtuTargetPage() {
  const [targetData, setTargetData] = useState<TargetData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [anakList, setAnakList] = useState<any[]>([]);

  // Fetch dashboard data to get anak list
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/ortu");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setAnakList(data.anakList || []);

      // Set first anak as default
      if (data.anakList && data.anakList.length > 0 && !selectedSantriId) {
        setSelectedSantriId(data.anakList[0].id);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch target data for selected santri
  const fetchTargetData = async (santriId: number) => {
    try {
      const res = await fetch(`/api/users/${santriId}`);
      if (res.ok) {
        const userData = await res.json();
        setTargetData(userData.TargetHafalan || []);
      }
    } catch (error) {
      console.error("Error fetching target data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedSantriId) {
      fetchTargetData(selectedSantriId);
    }
  }, [selectedSantriId]);

  // Calculate statistics
  const stats = {
    totalTargets: targetData.length,
    completedTargets: targetData.filter(t => t.status === 'selesai').length,
    inProgressTargets: targetData.filter(t => t.status === 'proses').length,
    pendingTargets: targetData.filter(t => t.status === 'belum').length,
    completionRate: targetData.length > 0 ?
      Math.round((targetData.filter(t => t.status === 'selesai').length / targetData.length) * 100) : 0,
    upcomingDeadlines: targetData
      .filter(t => t.status !== 'selesai')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5)
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineStatus = (deadline: string, status: string) => {
    if (status === 'selesai') return 'completed';
    const daysLeft = getDaysUntilDeadline(deadline);
    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 3) return 'urgent';
    if (daysLeft <= 7) return 'warning';
    return 'normal';
  };

  const selectedSantri = anakList.find(anak => anak.id === selectedSantriId);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0 }}>Target Hafalan</h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>
              Monitor target hafalan anak Anda
            </p>
          </div>
        </div>

        {/* Santri Selector */}
        {anakList.length > 1 && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card bordered={false}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: 0, marginBottom: 8 }}>Pilih Anak</h3>
                  <Select
                    style={{ width: '100%', maxWidth: 300 }}
                    placeholder="Pilih anak"
                    value={selectedSantriId}
                    onChange={(value) => setSelectedSantriId(value)}
                  >
                    {anakList.map((anak) => (
                      <Select.Option key={anak.id} value={anak.id}>
                        {anak.namaLengkap}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Santri Info */}
        {selectedSantri && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card bordered={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
                    {selectedSantri.namaLengkap.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <h2 style={{ margin: 0, color: '#1890ff' }}>{selectedSantri.namaLengkap}</h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                      Santri • Username: @{selectedSantri.username}
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Target Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Target"
                value={stats.totalTargets}
                prefix={<AimOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Selesai"
                value={stats.completedTargets}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Dalam Proses"
                value={stats.inProgressTargets}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tingkat Penyelesaian"
                value={stats.completionRate}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Overall Progress */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              title="Progres Keseluruhan Target Hafalan"
              bordered={false}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Progress
                  type="circle"
                  percent={stats.completionRate}
                  format={() => `${stats.completionRate}%`}
                  width={120}
                  status={stats.completionRate === 100 ? 'success' : 'active'}
                />
                <div>
                  <h3 style={{ margin: 0, marginBottom: 8 }}>Pencapaian Target</h3>
                  <p style={{ margin: 0, color: '#666' }}>
                    {stats.completionRate === 100 && "🎉 Selamat! Semua target hafalan telah tercapai!"}
                    {stats.completionRate >= 75 && stats.completionRate < 100 && "Kerja bagus! Hampir selesai semua."}
                    {stats.completionRate >= 50 && stats.completionRate < 75 && "Sedang dalam progres yang baik."}
                    {stats.completionRate < 50 && "Mari tingkatkan lagi pencapaiannya."}
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Target List */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card
              title="Daftar Target Hafalan"
              bordered={false}
            >
              {targetData.length > 0 ? (
                <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                  {targetData.map((target) => {
                    const deadlineStatus = getDeadlineStatus(target.deadline, target.status);
                    const daysLeft = getDaysUntilDeadline(target.deadline);

                    return (
                      <div key={target.id} style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <h4 style={{ margin: 0, marginBottom: 4 }}>Surat {target.surat}</h4>
                            <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                              Target: {target.ayatTarget} ayat
                            </p>
                          </div>
                          <Tag color={
                            target.status === 'selesai' ? 'green' :
                            target.status === 'proses' ? 'blue' : 'orange'
                          }>
                            {target.status === 'selesai' ? '✓ Selesai' :
                             target.status === 'proses' ? '⏳ Proses' : '⏰ Belum'}
                          </Tag>
                        </div>

                        <Progress
                          percent={target.status === 'selesai' ? 100 : target.status === 'proses' ? 50 : 0}
                          status={target.status === 'selesai' ? 'success' : 'active'}
                          size="small"
                          style={{ marginBottom: 8 }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#666' }}>
                            Deadline: {new Date(target.deadline).toLocaleDateString('id-ID')}
                          </span>
                          {target.status !== 'selesai' && (
                            <Tag color={
                              deadlineStatus === 'overdue' ? 'red' :
                              deadlineStatus === 'urgent' ? 'orange' :
                              deadlineStatus === 'warning' ? 'gold' : 'blue'
                            }>
                              {deadlineStatus === 'overdue' ? `${Math.abs(daysLeft)} hari terlambat` :
                               deadlineStatus === 'urgent' ? `${daysLeft} hari lagi` :
                               deadlineStatus === 'warning' ? `${daysLeft} hari lagi` :
                               `${daysLeft} hari lagi`}
                            </Tag>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  Belum ada target hafalan yang diberikan ustadz
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Upcoming Deadlines */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title="Deadline Mendatang"
              bordered={false}
            >
              {stats.upcomingDeadlines.length > 0 ? (
                <List
                  size="small"
                  dataSource={stats.upcomingDeadlines}
                  renderItem={(target) => {
                    const deadlineStatus = getDeadlineStatus(target.deadline, target.status);
                    const daysLeft = getDaysUntilDeadline(target.deadline);

                    return (
                      <List.Item>
                        <List.Item.Meta
                          title={`Surat ${target.surat} - ${target.ayatTarget} ayat`}
                          description={
                            <div>
                              <div>Deadline: {new Date(target.deadline).toLocaleDateString('id-ID')}</div>
                              <div style={{ marginTop: 4 }}>
                                <Tag color={
                                  deadlineStatus === 'overdue' ? 'red' :
                                  deadlineStatus === 'urgent' ? 'orange' :
                                  deadlineStatus === 'warning' ? 'gold' : 'blue'
                                }>
                                  {deadlineStatus === 'overdue' ? `${Math.abs(daysLeft)} hari terlambat` :
                                   `${daysLeft} hari lagi`}
                                </Tag>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  Tidak ada deadline mendatang
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}