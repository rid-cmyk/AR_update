import React from "react";
import { Row, Col, Card, Statistic, Table } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface HafalanReportTabProps {
  reportData: any;
  chartData: any[];
  pieData: any[];
  absensiData: any[];
}

export default function HafalanReportTab({
  reportData,
  chartData,
  pieData,
  absensiData
}: HafalanReportTabProps) {
  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Hafalan"
              value={reportData?.totalHafalan || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#219ebc' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ziyadah"
              value={reportData?.hafalanByStatus?.find((s: any) => s.status === 'ziyadah')?._count.status || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#219ebc' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Murojaah"
              value={reportData?.hafalanByStatus?.find((s: any) => s.status === 'murojaah')?._count.status || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#ffb703' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Grafik Perkembangan Hafalan" variant="borderless" style={{ height: '100%' }}>
            {chartData.length > 0 ? (
              <div style={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="Total" stroke="#219ebc" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="Ayat" stroke="#219ebc" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
                Belum ada data perkembangan
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card title="Distribusi Hafalan" variant="borderless" style={{ height: '100%' }}>
            {pieData.length > 0 ? (
              <div style={{ height: 300, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name.toLowerCase() === 'ziyadah' ? '#219ebc' : '#ffb703'} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
                Belum ada data hafalan
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card title="Overview Absensi" variant="borderless" style={{ height: '100%' }}>
            {absensiData.length > 0 ? (
              <div style={{ height: 300, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={absensiData}
                      cx="50%"
                      cy="45%"
                      innerRadius={0}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {absensiData.map((entry, index) => {
                        let color = '#d9d9d9';
                        if (entry.name.toLowerCase() === 'masuk') color = '#219ebc';
                        else if (entry.name.toLowerCase() === 'izin') color = '#ffb703';
                        else if (entry.name.toLowerCase() === 'sakit') color = '#219ebc';
                        else if (entry.name.toLowerCase() === 'alpha') color = '#fb8500';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
                Belum ada data absensi
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Top 10 Santri Hafalan" variant="borderless">
            <Table
              dataSource={reportData?.topSantri?.slice(0, 10) || []}
              rowKey="id"
              columns={[
                {
                  title: 'Nama Santri',
                  dataIndex: 'namaLengkap',
                  key: 'namaLengkap',
                },
                {
                  title: 'Total Hafalan',
                  dataIndex: ['_count', 'Hafalan'],
                  key: 'totalHafalan',
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
