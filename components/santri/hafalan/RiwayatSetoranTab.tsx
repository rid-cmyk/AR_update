import React from "react";
import { Card, Input, Select, List, Tag, Button, Empty, Typography } from "antd";
import { ClockCircleOutlined, SearchOutlined, EyeOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface RecentHafalan {
  id: number;
  tanggal: string;
  jenis: 'ziyadah' | 'murajaah';
  surah: string;
  ayat: string;
  guru: string;
  nilai?: number;
  catatan?: string;
}

interface RiwayatSetoranTabProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterJenis: string;
  setFilterJenis: (val: string) => void;
  filteredHafalan: RecentHafalan[];
  getJenisColor: (jenis: string) => string;
  getJenisIcon: (jenis: string) => React.ReactNode;
  getNilaiColor: (nilai: number) => string;
  setSelectedHafalan: (val: RecentHafalan) => void;
  setIsModalOpen: (val: boolean) => void;
}

export default function RiwayatSetoranTab({
  searchTerm,
  setSearchTerm,
  filterJenis,
  setFilterJenis,
  filteredHafalan,
  getJenisColor,
  getJenisIcon,
  getNilaiColor,
  setSelectedHafalan,
  setIsModalOpen
}: RiwayatSetoranTabProps) {
  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold flex items-center gap-2">
            <ClockCircleOutlined className="text-purple-500" />
            Riwayat Setoran Lengkap
          </span>
          <div className="flex gap-2">
            <Search
              placeholder="Cari surah, ayat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200 }}
              size="small"
            />
            <Select
              value={filterJenis}
              onChange={setFilterJenis}
              size="small"
              className="w-32"
            >
              <Option value="all">Semua</Option>
              <Option value="ziyadah">Ziyadah</Option>
              <Option value="murajaah">Murajaah</Option>
            </Select>
          </div>
        </div>
      }
      className="border-0 shadow-lg"
    >
      {filteredHafalan.length > 0 ? (
        <List
          dataSource={filteredHafalan}
          renderItem={(item) => (
            <List.Item className="hover:bg-gray-50 rounded-lg transition-colors px-4">
              <List.Item.Meta
                avatar={
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold`}
                       style={{ backgroundColor: getJenisColor(item.jenis) }}>
                    {getJenisIcon(item.jenis)}
                  </div>
                }
                title={
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800">
                        {item.surah} <span className="text-gray-500">({item.ayat})</span>
                      </span>
                      <div className="flex gap-2 mt-1">
                        <Tag color={item.jenis === 'ziyadah' ? 'blue' : 'green'} style={{ fontSize: '11px' }}>
                          {item.jenis === 'ziyadah' ? 'Ziyadah' : 'Murajaah'}
                        </Tag>
                        {item.nilai && (
                          <Tag color={getNilaiColor(item.nilai)} style={{ fontSize: '11px' }}>
                            Nilai: {item.nilai}
                          </Tag>
                        )}
                      </div>
                    </div>
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setSelectedHafalan(item);
                        setIsModalOpen(true);
                      }}
                    >
                      Detail
                    </Button>
                  </div>
                }
                description={
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        <CalendarOutlined className="mr-1" />
                        {dayjs(item.tanggal).format('DD/MM/YYYY')}
                      </span>
                      <span className="text-gray-500">
                        <UserOutlined className="mr-1" />
                        {item.guru}
                      </span>
                    </div>
                    {item.catatan && (
                      <div className="text-sm text-gray-600 bg-gray-100 rounded-lg p-2 mt-2">
                        <strong>Catatan:</strong> {item.catatan}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} setoran`
          }}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text type="secondary">
                {searchTerm || filterJenis !== 'all' 
                  ? 'Tidak ada setoran yang sesuai dengan filter'
                  : 'Belum ada setoran hafalan'
                }
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Setoran akan diinput oleh guru Anda
              </Text>
            </div>
          }
        />
      )}
    </Card>
  );
}
