"use client";

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  message,
  Table,
  Typography,
  Tag,
  Calendar,
  Badge,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import LayoutApp from "@/components/layout/LayoutApp";
import dayjs from "dayjs";
import type { Dayjs } from 'dayjs';

interface Jadwal {
  id: number;
  hari: string;
  jamMulai: Date | string;
  jamSelesai: Date | string;
  halaqah: {
    id: number;
    namaHalaqah: string;
    guru: {
      id: number;
      namaLengkap: string;
    };
    jumlahSantri: number;
  };
}

export default function SantriJadwalPage() {
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data
  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/santri/jadwal");
      if (!res.ok) throw new Error("Failed to fetch jadwal");
      const data = await res.json();
      setJadwal(data);
    } catch (error: any) {
      console.error("Error fetching jadwal:", error);
      message.error("Error fetching jadwal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  const getHariColor = (hari: string) => {
    const colors: { [key: string]: string } = {
      'Senin': 'blue',
      'Selasa': 'green',
      'Rabu': 'orange',
      'Kamis': 'red',
      'Jumat': 'purple',
      'Sabtu': 'cyan',
      'Minggu': 'magenta'
    };
    return colors[hari] || 'default';
  };

  const columns = [
    {
      title: "Halaqah",
      dataIndex: "halaqah",
      key: "halaqah",
      render: (halaqah: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{halaqah.namaHalaqah}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <UserOutlined style={{ marginRight: 4 }} />
            {halaqah.guru.namaLengkap}
          </div>
        </div>
      ),
    },
    {
      title: "Hari",
      dataIndex: "hari",
      key: "hari",
      render: (hari: string) => (
        <Tag color={getHariColor(hari)}>{hari}</Tag>
      ),
    },
    {
      title: "Waktu",
      key: "waktu",
      render: (_: unknown, record: Jadwal) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {dayjs(record.jamMulai).format("HH:mm")} - {dayjs(record.jamSelesai).format("HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "Jumlah Santri",
      key: "jumlahSantri",
      render: (_: unknown, record: Jadwal) => (
        <div style={{ textAlign: 'center' }}>
          <TeamOutlined style={{ marginRight: 4 }} />
          {record.halaqah.jumlahSantri}
        </div>
      ),
    },
  ];

  const todaySchedule = jadwal.filter(j => j.hari === dayjs().format('dddd'));
  const tomorrowSchedule = jadwal.filter(j => j.hari === dayjs().add(1, 'day').format('dddd'));

  // Calendar data
  const getListData = (value: Dayjs) => {
    const dayName = value.format('dddd');
    const daySchedule = jadwal.filter(j => j.hari === dayName);
    
    return daySchedule.map(j => ({
      type: 'success' as const,
      content: `${j.halaqah.namaHalaqah} (${dayjs(j.jamMulai).format("HH:mm")})`
    }));
  };

  const cellRender = (value: Dayjs, info: { type: string; originNode: React.ReactElement }) => {
    if (info.type === 'date') {
      const listData = getListData(value);
      return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {listData.map((item, index) => (
            <li key={index}>
              <Badge status={item.type} text={item.content} style={{ fontSize: '10px' }} />
            </li>
          ))}
        </ul>
      );
    }
    
    return info.originNode;
  };

  return (
    <LayoutApp>
      <div style={{ padding: "24px 0" }}>
        <div style={{ marginBottom: 24 }}>
          <h1>Jadwal Halaqah</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Lihat jadwal halaqah yang Anda ikuti
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Jadwal</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {jadwal.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Hari Ini</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {todaySchedule.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ fontSize: '24px', color: '#fa8c16', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Besok</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {tomorrowSchedule.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TeamOutlined style={{ fontSize: '24px', color: '#722ed1', marginRight: 12 }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Halaqah</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                    {new Set(jadwal.map(j => j.halaqah.id)).size}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Today's Schedule */}
          <Col xs={24} lg={12}>
            {todaySchedule.length > 0 && (
              <Card title="Jadwal Hari Ini" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                  {todaySchedule.map((j) => (
                    <Col xs={24} key={j.id}>
                      <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: 8 }}>
                            {j.halaqah.namaHalaqah}
                          </div>
                          <div style={{ color: '#666', marginBottom: 4 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {dayjs(j.jamMulai).format("HH:mm")} - {dayjs(j.jamSelesai).format("HH:mm")}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            <UserOutlined style={{ marginRight: 4 }} />
                            {j.halaqah.guru.namaLengkap}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            {todaySchedule.length === 0 && (
              <Card title="Jadwal Hari Ini" style={{ marginBottom: 24 }}>
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                  <CalendarOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
                  <div>Tidak ada jadwal hari ini</div>
                </div>
              </Card>
            )}

            {/* Tomorrow's Schedule */}
            {tomorrowSchedule.length > 0 && (
              <Card title="Jadwal Besok">
                <Row gutter={[16, 16]}>
                  {tomorrowSchedule.map((j) => (
                    <Col xs={24} key={j.id}>
                      <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: 8 }}>
                            {j.halaqah.namaHalaqah}
                          </div>
                          <div style={{ color: '#666', marginBottom: 4 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {dayjs(j.jamMulai).format("HH:mm")} - {dayjs(j.jamSelesai).format("HH:mm")}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            <UserOutlined style={{ marginRight: 4 }} />
                            {j.halaqah.guru.namaLengkap}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
          </Col>

          {/* Calendar */}
          <Col xs={24} lg={12}>
            <Card title="Kalender Jadwal">
              <Calendar 
                fullscreen={false} 
                cellRender={cellRender}
              />
            </Card>
          </Col>
        </Row>

        {/* All Schedules Table */}
        <Card title="Semua Jadwal" style={{ marginTop: 24 }}>
          <Table
            dataSource={jadwal}
            columns={columns}
            rowKey="id"
            loading={loading}
            size="small"
            scroll={{ x: 600 }}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </LayoutApp>
  );
}