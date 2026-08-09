import React from "react";
import { Row, Col, Card, Input, Select } from "antd";
import { UserOutlined, BookOutlined } from "@ant-design/icons";

const { Option } = Select;

interface HafalanFiltersCardProps {
  filters: {
    santriName: string;
    surat: string;
    status: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    santriName: string;
    surat: string;
    status: string;
  }>>;
}

export default function HafalanFiltersCard({ filters, setFilters }: HafalanFiltersCardProps) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Input
            placeholder="Cari nama santri..."
            prefix={<UserOutlined />}
            value={filters.santriName}
            onChange={(e) => setFilters(prev => ({ ...prev, santriName: e.target.value }))}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8}>
          <Input
            placeholder="Cari surat..."
            prefix={<BookOutlined />}
            value={filters.surat}
            onChange={(e) => setFilters(prev => ({ ...prev, surat: e.target.value }))}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8}>
          <Select
            placeholder="Filter status"
            style={{ width: '100%' }}
            value={filters.status || undefined}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
            allowClear
          >
            <Option value="ziyadah">Ziyadah</Option>
            <Option value="murojaah">Murojaah</Option>
          </Select>
        </Col>
      </Row>
    </Card>
  );
}
