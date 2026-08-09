import React from "react";
import { Row, Col, Card } from "antd";

interface Santri {
  id: number;
  namaLengkap: string;
}

interface Hafalan {
  id: number;
  santri?: Santri;
  status: "ziyadah" | "murojaah";
}

interface HafalanStatisticsCardsProps {
  hafalanList: Hafalan[];
}

export default function HafalanStatisticsCards({ hafalanList }: HafalanStatisticsCardsProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24} sm={6}>
        <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-3xl font-bold text-blue-600 mb-2">{hafalanList.length}</div>
          <div className="text-gray-600">Total Hafalan</div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {hafalanList.filter(h => h.status === 'ziyadah').length}
          </div>
          <div className="text-gray-600">Ziyadah</div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {hafalanList.filter(h => h.status === 'murojaah').length}
          </div>
          <div className="text-gray-600">Murojaah</div>
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {new Set(hafalanList.filter(h => h.santri && h.santri.id).map(h => h.santri?.id)).size}
          </div>
          <div className="text-gray-600">Santri Aktif</div>
        </Card>
      </Col>
    </Row>
  );
}
