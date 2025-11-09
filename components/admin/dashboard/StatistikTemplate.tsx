"use client";

import { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Progress, Tag, Space, Spin } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined
} from "@ant-design/icons";

interface TemplateStats {
  templateUjian: {
    total: number;
    aktif: number;
    nonAktif: number;
  };
  templateRaport: {
    total: number;
    aktif: number;
    nonAktif: number;
  };
}

export function StatistikTemplate() {
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/template-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching template stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <p style={{ color: '#999' }}>Tidak ada data statistik template</p>
        </div>
      </Card>
    );
  }

  const ujianAktifPercentage = stats.templateUjian.total > 0 
    ? (stats.templateUjian.aktif / stats.templateUjian.total) * 100 
    : 0;

  const raportAktifPercentage = stats.templateRaport.total > 0 
    ? (stats.templateRaport.aktif / stats.templateRaport.total) * 100 
    : 0;

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Template Ujian */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <span>Template Ujian</span>
              </Space>
            }
            variant="borderless"
            style={{ height: '100%' }}
          >
            <Statistic
              title="Total Template"
              value={stats.templateUjian.total}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff', marginBottom: 16 }}
            />
            
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>Aktif</span>
                  </Space>
                  <Tag color="green">{stats.templateUjian.aktif}</Tag>
                </div>
                <Progress 
                  percent={ujianAktifPercentage} 
                  strokeColor="#52c41a"
                  showInfo={false}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    <span>Non-aktif</span>
                  </Space>
                  <Tag color="red">{stats.templateUjian.nonAktif}</Tag>
                </div>
                <Progress 
                  percent={100 - ujianAktifPercentage} 
                  strokeColor="#ff4d4f"
                  showInfo={false}
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Template Raport */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: '#722ed1' }} />
                <span>Template Raport</span>
              </Space>
            }
            variant="borderless"
            style={{ height: '100%' }}
          >
            <Statistic
              title="Total Template"
              value={stats.templateRaport.total}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1', marginBottom: 16 }}
            />
            
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>Aktif</span>
                  </Space>
                  <Tag color="green">{stats.templateRaport.aktif}</Tag>
                </div>
                <Progress 
                  percent={raportAktifPercentage} 
                  strokeColor="#52c41a"
                  showInfo={false}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space>
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    <span>Non-aktif</span>
                  </Space>
                  <Tag color="red">{stats.templateRaport.nonAktif}</Tag>
                </div>
                <Progress 
                  percent={100 - raportAktifPercentage} 
                  strokeColor="#ff4d4f"
                  showInfo={false}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

