"use client";

import { useState, useEffect } from "react";
import { Card, Select, Space, Tag, Typography, Spin, Alert, Row, Col, Statistic } from "antd";
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface TahunAjaran {
  id: number;
  tahunMulai: number;
  tahunSelesai: number;
  semester: 'S1' | 'S2';
  namaLengkap: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  isActive: boolean;
}

interface TahunAkademikSelectorProps {
  onTahunAkademikChange?: (tahunAjaranId?: number) => void;
  showStats?: boolean;
}

export function TahunAkademikSelector({ onTahunAkademikChange, showStats = false }: TahunAkademikSelectorProps) {
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const fetchTahunAjaran = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tahun-ajaran');
      if (response.ok) {
        const data = await response.json();
        setTahunAjaranList(data);
        
        // Set active tahun ajaran as default
        const active = data.find((ta: TahunAjaran) => ta.isActive);
        if (active) {
          setSelectedTahunAjaran(active.id);
        }
      }
    } catch (error) {
      console.error('Error fetching tahun ajaran:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: number | undefined) => {
    setSelectedTahunAjaran(value);
    if (onTahunAkademikChange) {
      onTahunAkademikChange(value);
    }
  };

  const selectedData = tahunAjaranList.find(ta => ta.id === selectedTahunAjaran);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      </Card>
    );
  }

  if (tahunAjaranList.length === 0) {
    return (
      <Card>
        <Alert
          message="Belum Ada Tahun Ajaran"
          description="Silakan buat tahun ajaran terlebih dahulu"
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Selector */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            <CalendarOutlined /> Pilih Tahun Akademik
          </Text>
          <Select
            style={{ width: '100%' }}
            size="large"
            value={selectedTahunAjaran}
            onChange={handleChange}
            placeholder="Pilih tahun akademik"
            allowClear
            onClear={() => handleChange(undefined)}
          >
            {tahunAjaranList.map(ta => (
              <Select.Option key={ta.id} value={ta.id}>
                <Space>
                  <span>{ta.namaLengkap}</span>
                  {ta.isActive && <Tag color="green">Aktif</Tag>}
                  {ta.semester === 'S1' && <Tag color="orange">🌞 Semester 1</Tag>}
                  {ta.semester === 'S2' && <Tag color="blue">❄️ Semester 2</Tag>}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Info Semester */}
        {selectedData && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #91d5ff',
            borderRadius: 8,
            padding: 16
          }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 16 }}>
                  {selectedData.namaLengkap}
                </Text>
                {selectedData.isActive && (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Aktif
                  </Tag>
                )}
              </div>
              
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {selectedData.semester === 'S1' ? '🌞 Semester 1: Juli - Desember' : '❄️ Semester 2: Januari - Juni'}
                </Text>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    Mulai
                  </Text>
                  <Text strong>
                    {new Date(selectedData.tanggalMulai).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    Selesai
                  </Text>
                  <Text strong>
                    {new Date(selectedData.tanggalSelesai).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </div>
              </div>
            </Space>
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small">
                <Statistic
                  title="Total Tahun Ajaran"
                  value={tahunAjaranList.length}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ fontSize: 20 }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Statistic
                  title="Tahun Ajaran Aktif"
                  value={tahunAjaranList.filter(ta => ta.isActive).length}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ fontSize: 20, color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Info */}
        <div style={{
          background: '#fffbe6',
          border: '1px solid #ffe58f',
          borderRadius: 6,
          padding: 12
        }}>
          <Text style={{ fontSize: 12, color: '#ad8b00' }}>
            💡 <strong>Info:</strong> Data akan difilter berdasarkan tahun akademik yang dipilih. 
            Kosongkan untuk melihat semua data.
          </Text>
        </div>
      </Space>
    </Card>
  );
}
