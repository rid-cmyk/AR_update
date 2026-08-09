"use client";

import { useState } from 'react';
import { Modal, Progress, Card, Row, Col, Statistic, Divider, Tag } from 'antd';
import { BookOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export function JuzDetailButton({ juz, getProgressColor, getStatusColor }: { juz: any, getProgressColor: any, getStatusColor: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 transition-colors"
        title="Lihat Detail"
      >
        <EyeOutlined className="text-lg" />
      </button>

      <Modal
        title={`Detail Kemajuan - Juz ${juz.juz}`}
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={600}
      >
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Progress"
                value={juz.progress}
                suffix="%"
                valueStyle={{ color: getProgressColor(juz.progress) }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Ayat Hafal"
                value={`${juz.hafalAyat} / ${juz.totalAyat}`}
                valueStyle={{ color: '#219ebc' }}
              />
            </Col>
          </Row>
          <Progress 
            percent={juz.progress} 
            strokeColor={getProgressColor(juz.progress)}
            style={{ marginTop: 16 }}
          />
        </Card>

        {juz.hasTarget && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Target Deadline:</strong> {dayjs(juz.targetDeadline).format('DD MMMM YYYY')}
              </div>
              <Tag color={getStatusColor(juz.targetStatus || 'belum')}>
                {(juz.targetStatus || 'belum').charAt(0).toUpperCase() + (juz.targetStatus || 'belum').slice(1)}
              </Tag>
            </div>
          </Card>
        )}

        <Divider>Detail Hafalan</Divider>

        {juz.details.length > 0 ? (
          <div>
            {juz.details.map((detail: any, index: number) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{detail.surat}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Ayat {detail.ayatMulai}-{detail.ayatSelesai}
                    </div>
                  </div>
                  <Tag color="green">{detail.jumlahAyat} ayat</Tag>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <BookOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
            <div>Belum ada hafalan untuk juz ini</div>
          </div>
        )}
      </Modal>
    </>
  );
}
