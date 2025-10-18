"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, List, Tag, Badge, Avatar, Button } from "antd";
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import LayoutApp from "../../../components/LayoutApp";

interface PengumumanData {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  targetAudience: string;
  dibacaOleh?: Array<{
    userId: number;
  }>;
}

export default function OrtuPengumumanPage() {
  const [pengumumanData, setPengumumanData] = useState<PengumumanData[]>([]);
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
      setPengumumanData(data.pengumuman || []);

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate statistics
  const stats = {
    total: pengumumanData.length,
    unread: pengumumanData.filter(p =>
      !p.dibacaOleh?.some((d: any) => d.userId === selectedSantriId)
    ).length,
    today: pengumumanData.filter(p =>
      new Date(p.tanggal).toDateString() === new Date().toDateString()
    ).length,
    thisWeek: pengumumanData.filter(p => {
      const notifDate = new Date(p.tanggal);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return notifDate >= weekAgo;
    }).length
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'semua': return 'blue';
      case 'santri': return 'green';
      case 'guru': return 'orange';
      case 'admin': return 'purple';
      default: return 'default';
    }
  };

  const getAudienceText = (audience: string) => {
    switch (audience) {
      case 'semua': return 'Semua';
      case 'santri': return 'Santri';
      case 'guru': return 'Guru';
      case 'admin': return 'Admin';
      default: return audience;
    }
  };

  const isReadBySelectedSantri = (pengumuman: PengumumanData) => {
    return pengumuman.dibacaOleh?.some((d: any) => d.userId === selectedSantriId) || false;
  };

  const selectedSantri = anakList.find(anak => anak.id === selectedSantriId);

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0 }}>Pengumuman</h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>
              Informasi penting dari pesantren
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
                  <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                    Pengumuman akan ditampilkan berdasarkan anak yang dipilih
                  </p>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Statistics Overview */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Badge count={stats.unread} showZero={false}>
                  <Avatar style={{ backgroundColor: '#1890ff' }}>
                    <BellOutlined />
                  </Avatar>
                </Badge>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{stats.total}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Total Pengumuman</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar style={{ backgroundColor: '#f5222d' }}>
                  <ExclamationCircleOutlined />
                </Avatar>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{stats.unread}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Belum Dibaca</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar style={{ backgroundColor: '#52c41a' }}>
                  <CheckCircleOutlined />
                </Avatar>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{stats.today}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Hari Ini</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar style={{ backgroundColor: '#722ed1' }}>
                  <ClockCircleOutlined />
                </Avatar>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{stats.thisWeek}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>Minggu Ini</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Announcements List */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              title="Daftar Pengumuman"
              bordered={false}
            >
              <List
                size="large"
                dataSource={pengumumanData}
                renderItem={(pengumuman) => (
                  <List.Item
                    style={{
                      backgroundColor: isReadBySelectedSantri(pengumuman) ? '#fff' : '#f6ffed',
                      borderLeft: isReadBySelectedSantri(pengumuman) ? 'none' : '4px solid #52c41a',
                      padding: '16px 24px',
                      marginBottom: 8,
                      borderRadius: 8
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{
                          backgroundColor: isReadBySelectedSantri(pengumuman) ? '#f0f0f0' : '#f6ffed',
                          color: isReadBySelectedSantri(pengumuman) ? '#666' : '#52c41a'
                        }}>
                          📢
                        </Avatar>
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{pengumuman.judul}</span>
                          {!isReadBySelectedSantri(pengumuman) && (
                            <Badge status="processing" />
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            {pengumuman.isi.length > 150
                              ? `${pengumuman.isi.substring(0, 150)}...`
                              : pengumuman.isi
                            }
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666' }}>
                            <Tag color={getAudienceColor(pengumuman.targetAudience)}>
                              {getAudienceText(pengumuman.targetAudience)}
                            </Tag>
                            <span>
                              {new Date(pengumuman.tanggal).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </LayoutApp>
  );
}