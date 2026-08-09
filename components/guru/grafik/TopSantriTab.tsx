import React from "react";
import { Card, Input, Table, Avatar, Tag, Button, Empty } from "antd";
import { SearchOutlined, BookOutlined, FireOutlined, CheckCircleOutlined, LineChartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#8dd1e1', '#a4de6c'];

export interface TopSantri {
  id: string;
  namaLengkap: string;
  username: string;
  totalAyat: number;
  ziyadahCount: number;
  murojaahCount: number;
  lastHafalan?: string;
}

interface TopSantriTabProps {
  topSantriList: TopSantri[];
  filteredSantri: TopSantri[];
  searchText: string;
  setSearchText: (val: string) => void;
  loading: boolean;
  setSelectedSantriId: (val: string) => void;
  setActiveTabKey: (val: string) => void;
}

export default function TopSantriTab({
  topSantriList,
  filteredSantri,
  searchText,
  setSearchText,
  loading,
  setSelectedSantriId,
  setActiveTabKey
}: TopSantriTabProps) {
  const columns = [
    {
      title: "Rank",
      key: "rank",
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Avatar
          style={{
            backgroundColor: index < 3 ? COLORS[index] : '#d9d9d9',
            fontWeight: 'bold'
          }}
        >
          {index + 1}
        </Avatar>
      ),
    },
    {
      title: "Nama Santri",
      dataIndex: "namaLengkap",
      key: "namaLengkap",
      render: (text: string, record: TopSantri) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>@{record.username}</div>
        </div>
      ),
    },
    {
      title: "Total Ayat",
      dataIndex: "totalAyat",
      key: "totalAyat",
      sorter: (a: TopSantri, b: TopSantri) => a.totalAyat - b.totalAyat,
      render: (value: number) => (
        <Tag color="blue" icon={<BookOutlined />}>
          {value} ayat
        </Tag>
      ),
    },
    {
      title: "Ziyadah",
      dataIndex: "ziyadahCount",
      key: "ziyadahCount",
      sorter: (a: TopSantri, b: TopSantri) => a.ziyadahCount - b.ziyadahCount,
      render: (value: number) => (
        <Tag color="green" icon={<FireOutlined />}>
          {value}x
        </Tag>
      ),
    },
    {
      title: "Murojaah",
      dataIndex: "murojaahCount",
      key: "murojaahCount",
      sorter: (a: TopSantri, b: TopSantri) => a.murojaahCount - b.murojaahCount,
      render: (value: number) => (
        <Tag color="cyan" icon={<CheckCircleOutlined />}>
          {value}x
        </Tag>
      ),
    },
    {
      title: "Hafalan Terakhir",
      dataIndex: "lastHafalan",
      key: "lastHafalan",
      render: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : '-',
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      render: (_: any, record: TopSantri) => (
        <Button
          type="primary"
          size="small"
          icon={<LineChartOutlined />}
          onClick={() => {
            setSelectedSantriId(record.id);
            setActiveTabKey("analitik");
          }}
        >
          Analitik
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>Ranking Santri Berdasarkan Hafalan ({topSantriList.length} santri)</span>
          <Input
            placeholder="Cari nama santri..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>
      }
    >
      {filteredSantri.length === 0 && !loading ? (
        <Empty
          description={
            searchText 
              ? "Tidak ada santri yang cocok dengan pencarian"
              : "Belum ada data hafalan untuk santri di halaqah ini"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredSantri}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} santri`,
          }}
          rowClassName={(record, index) => {
            if (index === 0) return 'gold-row';
            if (index === 1) return 'silver-row';
            if (index === 2) return 'bronze-row';
            return '';
          }}
        />
      )}
    </Card>
  );
}
