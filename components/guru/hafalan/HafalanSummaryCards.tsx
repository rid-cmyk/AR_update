import React from "react";
import { Row, Col, Card } from "antd";
import dayjs from "dayjs";

interface HafalanSummary {
  santri: {
    id: number;
    namaLengkap: string;
    username: string;
  };
  totalHafalan: number;
  ziyadahCount: number;
  murojaahCount: number;
  lastHafalan: any;
}

interface HafalanSummaryCardsProps {
  summaries: HafalanSummary[];
}

export default function HafalanSummaryCards({ summaries }: HafalanSummaryCardsProps) {
  if (summaries.length === 0) return null;

  return (
    <Card title="📊 Ringkasan Hafalan per Santri" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        {summaries.map((summary) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={summary.santri.id}>
            <Card 
              size="small" 
              className="border-0 shadow-md hover:shadow-lg transition-all duration-300"
              style={{ 
                background: '#023047',
                color: 'white'
              }}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white">
                    {summary.santri.namaLengkap[0]}
                  </span>
                </div>
                <div className="font-bold text-lg mb-2">{summary.santri.namaLengkap}</div>
                <div className="text-sm opacity-90 mb-3">@{summary.santri.username}</div>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white/20 rounded-lg p-2">
                    <div className="text-xl font-bold">{summary.totalHafalan}</div>
                    <div className="text-xs opacity-90">Total</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <div className="text-xl font-bold">{summary.ziyadahCount}</div>
                    <div className="text-xs opacity-90">Ziyadah</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2">
                    <div className="text-xl font-bold">{summary.murojaahCount}</div>
                    <div className="text-xs opacity-90">Murojaah</div>
                  </div>
                </div>
                
                <div className="bg-white/20 rounded-lg p-2">
                  <div className="text-xs opacity-90 mb-1">Hafalan Terakhir:</div>
                  <div className="font-medium text-sm">
                    {summary.lastHafalan.surat} ({summary.lastHafalan.ayatMulai}-{summary.lastHafalan.ayatSelesai})
                  </div>
                  <div className="text-xs opacity-75">
                    {dayjs(summary.lastHafalan.tanggal).format('DD MMM YYYY')}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
