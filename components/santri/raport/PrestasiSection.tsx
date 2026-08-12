"use client";

import { Row, Col, Card, Tag, Typography, Empty } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from "@ant-design/icons";
import { PrestasiData } from "./raportTypes";

const { Text } = Typography;

export function PrestasiSection({ prestasiData }: { prestasiData: PrestasiData[] }) {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24}>
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ffb703',
                boxShadow: '0 0 15px rgba(250, 140, 22, 0.4)'
              }} />
              <span style={{
                background: '#ffb703',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '20px',
                fontWeight: '800',
                letterSpacing: '-0.3px'
              }}>
                🏆 Prestasi & Penghargaan
              </span>
            </div>
          }
          style={{
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(250, 140, 22, 0.08)',
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
            bottom: '20px',
            left: '20px',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(250, 140, 22, 0.05)',
            zIndex: 1
          }} />
          {prestasiData.length > 0 ? (
            <Row gutter={[16, 16]}>
              {prestasiData.map((prestasi) => (
                <Col xs={24} md={12} lg={8} key={prestasi.id}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: '16px',
                      background: prestasi.validated
                        ? '#fff8f0'
                        : '#f8f9ff',
                      border: `1px solid ${prestasi.validated ? 'rgba(250, 140, 22, 0.2)' : 'rgba(114, 46, 209, 0.2)'}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    styles={{ body: { padding: "20px" } }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: prestasi.validated ? '#219ebc' : '#ffb703',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {prestasi.validated ? (
                        <CheckCircleOutlined style={{ fontSize: '10px', color: 'white' }} />
                      ) : (
                        <ClockCircleOutlined style={{ fontSize: '10px', color: 'white' }} />
                      )}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <TrophyOutlined style={{
                        fontSize: '24px',
                        color: prestasi.validated ? '#ffb703' : '#8ecae6',
                        marginBottom: '8px'
                      }} />
                    </div>

                    <div>
                      <Text strong style={{ fontSize: '14px', color: '#333', display: 'block', marginBottom: '4px' }}>
                        {prestasi.namaPrestasi}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px', lineHeight: '1.4', display: 'block', marginBottom: '8px' }}>
                        {prestasi.keterangan}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tag
                          color={prestasi.kategori === 'Akademik' ? 'blue' : 'green'}
                          style={{ fontSize: '10px' }}
                        >
                          {prestasi.kategori}
                        </Tag>
                        <Text style={{ fontSize: '11px', color: '#999' }}>
                          {prestasi.tahun}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text type="secondary">Belum ada data prestasi</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Prestasi akan dicatat oleh guru/admin
                  </Text>
                </div>
              }
            />
          )}
        </Card>
      </Col>
    </Row>
  );
}
