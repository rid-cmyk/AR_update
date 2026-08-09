import React from "react";
import { Row, Col, Card, Empty } from "antd";
import dayjs from "dayjs";
import dynamic from "next/dynamic";

const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const Legend = dynamic<any>(() => import("recharts").then(mod => mod.Legend as any), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });

const COLORS = ['#219ebc', '#219ebc', '#ffb703', '#fb8500', '#8ecae6'];

interface GrafikHafalanTabProps {
  hafalanData: any[];
  pieData: any[];
  selectedHalaqahData: any;
  CustomTooltip: any;
}

export default function GrafikHafalanTab({ hafalanData, pieData, selectedHalaqahData, CustomTooltip }: GrafikHafalanTabProps) {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={`Perkembangan Hafalan - ${selectedHalaqahData?.namaHalaqah}`}>
            {hafalanData && hafalanData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={hafalanData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="tanggal"
                    tickFormatter={(value) => dayjs(value).format('DD/MM')}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ziyadah"
                    stroke="#219ebc"
                    strokeWidth={3}
                    name="Ziyadah"
                    dot={{ fill: '#219ebc', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="murojaah"
                    stroke="#219ebc"
                    strokeWidth={3}
                    name="Murojaah"
                    dot={{ fill: '#219ebc', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Empty description="Belum ada data grafik" />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Distribusi Hafalan">
            {pieData && pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Empty description="Belum ada data distribusi" />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Bar Chart */}
      <Card title="Perbandingan Ziyadah vs Murojaah" style={{ marginTop: 16 }}>
        {hafalanData && hafalanData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hafalanData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="tanggal"
                tickFormatter={(value) => dayjs(value).format('DD/MM')}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="ziyadah" fill="#219ebc" name="Ziyadah" />
              <Bar dataKey="murojaah" fill="#219ebc" name="Murojaah" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Empty description="Belum ada data grafik" />
          </div>
        )}
      </Card>
    </>
  );
}
