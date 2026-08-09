"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Progress,
  Typography,
  Row,
  Col,
  Tag,
  Statistic,
  Timeline,
  Empty,
  Spin,
  Divider
} from "antd";
import {
  AimOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  BookOutlined,
  FireOutlined,
  UserOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { SantriTargetStats } from "./SantriTargetStats";
import { SantriTargetCards } from "./SantriTargetCards";
import { SantriTargetMilestones } from "./SantriTargetMilestones";

const { Title, Text, Paragraph } = Typography;

interface Target {
  id: number;
  judul: string;
  deskripsi: string;
  targetAyat: number;
  currentAyat: number;
  tanggalMulai: string;
  tanggalTarget: string;
  status: 'active' | 'completed' | 'overdue' | 'paused';
  prioritas: 'tinggi' | 'sedang' | 'rendah';
  kategori: 'ziyadah' | 'murajaah' | 'tilawah';
  surahList: string[];
  createdAt: string;
  guru: string;
}

interface Milestone {
  id: number;
  targetId: number;
  judul: string;
  targetAyat: number;
  tanggalTarget: string;
  status: 'completed' | 'pending' | 'overdue';
  completedAt?: string;
}

export default function TargetHafalanPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data removed

  useEffect(() => {
    // Fetch real API data
    const fetchTargets = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/santri/target');
        if (response.ok) {
          const data = await response.json();
          // Map to local target structure (assuming standard API shape)
          const mappedTargets = data.data || [];
          setTargets(mappedTargets);
          // Just empty milestones for now if API doesn't return it
          setMilestones(data.milestones || []);
        } else {
          // fallback to empty
          setTargets([]);
          setMilestones([]);
        }
      } catch (error) {
        console.error('Error fetching targets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
     
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#219ebc';
      case 'active': return '#4A90E2';
      case 'overdue': return '#fb8500';
      case 'paused': return '#ffb703';
      default: return '#d9d9d9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'active': return 'Aktif';
      case 'overdue': return 'Terlambat';
      case 'paused': return 'Dijeda';
      default: return status;
    }
  };

  const getPriorityColor = (prioritas: string) => {
    switch (prioritas) {
      case 'tinggi': return 'red';
      case 'sedang': return 'orange';
      case 'rendah': return 'green';
      default: return 'default';
    }
  };

  const getCategoryIcon = (kategori: string) => {
    switch (kategori) {
      case 'ziyadah': return <FireOutlined />;
      case 'murajaah': return <BookOutlined />;
      case 'tilawah': return <CalendarOutlined />;
      default: return <BookOutlined />;
    }
  };

  const getCategoryColor = (kategori: string) => {
    switch (kategori) {
      case 'ziyadah': return '#4A90E2';
      case 'murajaah': return '#50E3C2';
      case 'tilawah': return '#74B9FF';
      default: return '#d9d9d9';
    }
  };

  // Calculate statistics
  const activeTargets = targets.filter(t => t.status === 'active').length;
  const completedTargets = targets.filter(t => t.status === 'completed').length;
  const overdueTargets = targets.filter(t => t.status === 'overdue').length;
  const totalProgress = targets.length > 0
    ? Math.round(targets.reduce((sum, t) => sum + (t.currentAyat / t.targetAyat * 100), 0) / targets.length)
    : 0;

  if (loading) {
    return (
      <>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Spin size="large" />
          <Text type="secondary">Memuat target hafalan Anda...</Text>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ padding: "24px 0", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          background: '#4A90E2',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            width: '120px',
            height: '120px',
            position: 'absolute',
            top: '-30px',
            right: '-30px'
          }} />
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            position: 'absolute',
            bottom: '-20px',
            left: '20px'
          }} />

          <Row align="middle" gutter={24}>
            <Col xs={24} md={18}>
              <Title level={1} style={{
                color: 'white',
                margin: 0,
                fontSize: '36px',
                fontWeight: '800',
                marginBottom: '8px'
              }}>
                <AimOutlined style={{ marginRight: 16 }} />
                Target Hafalan
              </Title>
              <Paragraph style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '18px',
                margin: 0,
                fontWeight: '400'
              }}>
                Pantau target hafalan yang telah ditetapkan oleh guru Anda dan lihat progress pencapaian Anda
              </Paragraph>
            </Col>
            <Col xs={24} md={6} style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Target dari Guru
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}>
                  {activeTargets}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  Target Aktif
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Statistics Overview */}
        <SantriTargetStats
          activeTargets={activeTargets}
          completedTargets={completedTargets}
          overdueTargets={overdueTargets}
          totalProgress={totalProgress}
        />

        {/* Target Cards */}
        <SantriTargetCards targets={targets} />

        {/* Milestones Timeline for Active Target */}
        <SantriTargetMilestones targets={targets} milestones={milestones} />

      </div>
    </>
  );
}