"use client";

import { Col, Card, Table, Tag, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { GradeBadge } from "@/components/ui/grade-badge";
import { calculateGradeLetter } from "@/lib/utils/hafalanAssessment";
import { RaportData } from "./raportTypes";

const { Title, Text } = Typography;

function getRaportNilaiColor(nilai: number): string {
  if (nilai >= 90) return '#219ebc';
  if (nilai >= 80) return '#219ebc';
  if (nilai >= 70) return '#ffb703';
  return '#fb8500';
}

const detailColumns = [
  {
    title: 'Mata Pelajaran',
    dataIndex: 'mataPelajaran',
    key: 'mataPelajaran',
    render: (text: string) => <strong>{text}</strong>
  },
  {
    title: 'Nilai',
    dataIndex: 'nilai',
    key: 'nilai',
    render: (nilai: number) => (
      <GradeBadge nilai={nilai} showNilai />
    )
  },
  {
    title: 'Keterangan',
    dataIndex: 'keterangan',
    key: 'keterangan',
    render: (keterangan: string) => (
      <Text type="secondary">{keterangan}</Text>
    )
  }
];

export function RaportCard({ raport }: { raport: RaportData }) {
  return (
    <Col xs={24} lg={12}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#8ecae6',
                boxShadow: '0 0 15px rgba(114, 46, 209, 0.4)'
              }} />
              <span style={{
                background: '#8ecae6',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '18px',
                fontWeight: '800'
              }}>
                {raport.semester} - {raport.tahunAkademik}
              </span>
            </div>
            <Tag
              color={raport.nilaiAkhir >= 80 ? 'green' : raport.nilaiAkhir >= 70 ? 'orange' : 'red'}
              style={{ fontSize: '14px', fontWeight: 'bold', padding: '4px 12px' }}
            >
              {raport.nilaiAkhir}/100
            </Tag>
          </div>
        }
        style={{
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(114, 46, 209, 0.08)',
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
        styles={{ body: {
          padding: '32px',
          background: 'transparent',
          position: 'relative',
          zIndex: 2
        } }}
      >
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(114, 46, 209, 0.05)',
          zIndex: 1
        }} />

        {/* Overall Grade */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: `${getRaportNilaiColor(raport.nilaiAkhir)}dd`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 8px 24px ${getRaportNilaiColor(raport.nilaiAkhir)}40`
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '32px', fontWeight: '900' }}>{raport.nilaiAkhir}</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{calculateGradeLetter(raport.nilaiAkhir)}</div>
            </div>
          </div>
          <Text style={{ fontSize: '16px', color: '#666' }}>Nilai Akhir</Text>
        </div>

        {/* Subject Details */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ marginBottom: '16px', color: '#333' }}>
            Detail Nilai
          </Title>
          <Table
            columns={detailColumns}
            dataSource={raport.details}
            rowKey="mataPelajaran"
            pagination={false}
            size="small"
            style={{ background: 'transparent' }}
          />
        </div>

        {/* Notes */}
        {raport.catatan && (
          <div style={{ marginBottom: '24px' }}>
            <Title level={4} style={{ marginBottom: '12px', color: '#333' }}>
              Catatan Guru
            </Title>
            <div style={{
              background: '#f8f9ff',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(114, 46, 209, 0.1)'
            }}>
              <Text style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                &quot;{raport.catatan}&quot;
              </Text>
            </div>
          </div>
        )}

        {/* Print Date */}
        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <CalendarOutlined style={{ marginRight: '6px' }} />
            Dicetak pada: {dayjs(raport.tanggalCetak).format('DD MMMM YYYY')}
          </Text>
        </div>
      </Card>
    </Col>
  );
}
