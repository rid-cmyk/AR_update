import React from 'react';
import { Card, Table, Tag, Progress, Descriptions, Tabs } from 'antd';
import { TeamOutlined, BookOutlined, StarOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface YayasanSantriTabsProps {
  selectedSantri: any;
}

export const YayasanSantriTabs: React.FC<YayasanSantriTabsProps> = ({ selectedSantri }) => {
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'ziyadah': 'green',
      'muraja\'ah': 'blue',
      'masuk': 'green',
      'izin': 'orange',
      'sakit': 'orange',
      'alpha': 'red',
      'selesai': 'green',
      'berlangsung': 'blue',
      'tertunda': 'orange',
    };
    return statusColors[status.toLowerCase()] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const statusIcons: Record<string, any> = {
      'masuk': <CheckCircleOutlined />,
      'izin': <ClockCircleOutlined />,
      'sakit': <ExclamationCircleOutlined />,
      'alpha': <CloseCircleOutlined />,
      'selesai': <CheckCircleOutlined />,
      'berlangsung': <ClockCircleOutlined />,
    };
    return statusIcons[status.toLowerCase()] || null;
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <TeamOutlined /> Halaqah
        </span>
      ),
      children: (
        <Card>
          {selectedSantri.halaqah && selectedSantri.halaqah.length > 0 ? (
            selectedSantri.halaqah.map((h: any) => (
              <Card key={h.id} size="small" style={{ marginBottom: 16 }}>
                <Descriptions title={h.namaHalaqah} bordered column={2}>
                  <Descriptions.Item label="Guru">
                    {h.guru.namaLengkap} (@{h.guru.username})
                  </Descriptions.Item>
                  <Descriptions.Item label="Jadwal">
                    {h.jadwal && h.jadwal.length > 0 ? (
                      <div>
                        {h.jadwal.map((j: any, idx: number) => (
                          <Tag key={idx} color="blue">
                            {j.hari}: {j.waktuMulai} - {j.waktuSelesai}
                          </Tag>
                        ))}
                      </div>
                    ) : (
                      'Belum ada jadwal'
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              Belum terdaftar di halaqah manapun
            </div>
          )}
        </Card>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <BookOutlined /> Hafalan ({selectedSantri.allHafalan?.length || 0})
        </span>
      ),
      children: (
        <Table
          dataSource={selectedSantri.allHafalan || []}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`
          }}
          columns={[
            {
              title: 'Tanggal',
              dataIndex: 'tanggal',
              key: 'tanggal',
              render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
              sorter: (a: any, b: any) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
            },
            {
              title: 'Jenis',
              dataIndex: 'jenis',
              key: 'jenis',
              render: (jenis: string) => (
                <Tag color={jenis === 'ziyadah' ? 'green' : 'blue'}>
                  {jenis.toUpperCase()}
                </Tag>
              ),
              filters: [
                { text: 'Ziyadah', value: 'ziyadah' },
                { text: 'Muraja\'ah', value: 'muraja\'ah' },
              ],
              onFilter: (value: any, record: any) => record.jenis === value,
            },
            {
              title: 'Surah',
              dataIndex: 'surah',
              key: 'surah',
            },
            {
              title: 'Ayat',
              key: 'ayat',
              render: (record: any) => `${record.ayatMulai} - ${record.ayatSelesai}`,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => (
                <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                  {status.toUpperCase()}
                </Tag>
              ),
            },
            {
              title: 'Guru',
              dataIndex: ['guru', 'namaLengkap'],
              key: 'guru',
            },
            {
              title: 'Catatan',
              dataIndex: 'catatan',
              key: 'catatan',
              render: (catatan: string) => catatan || '-',
            },
          ]}
        />
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <StarOutlined /> Target ({selectedSantri.targets?.length || 0})
        </span>
      ),
      children: (
        <Table
          dataSource={selectedSantri.targets || []}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`
          }}
          columns={[
            {
              title: 'Surah',
              dataIndex: 'surah',
              key: 'surah',
            },
            {
              title: 'Ayat',
              key: 'ayat',
              render: (record: any) => `${record.ayatMulai} - ${record.ayatSelesai}`,
            },
            {
              title: 'Target Selesai',
              dataIndex: 'targetSelesai',
              key: 'targetSelesai',
              render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
              sorter: (a: any, b: any) => new Date(a.targetSelesai).getTime() - new Date(b.targetSelesai).getTime(),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                  {status.toUpperCase()}
                </Tag>
              ),
              filters: [
                { text: 'Selesai', value: 'selesai' },
                { text: 'Berlangsung', value: 'berlangsung' },
                { text: 'Tertunda', value: 'tertunda' },
              ],
              onFilter: (value: any, record: any) => record.status === value,
            },
            {
              title: 'Progress',
              dataIndex: 'progress',
              key: 'progress',
              render: (progress: number) => (
                <Progress percent={progress} size="small" />
              ),
              sorter: (a: any, b: any) => a.progress - b.progress,
            },
          ]}
        />
      ),
    },
    {
      key: '4',
      label: (
        <span>
          <CalendarOutlined /> Absensi ({selectedSantri.absensi?.length || 0})
        </span>
      ),
      children: (
        <Table
          dataSource={selectedSantri.absensi || []}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`
          }}
          columns={[
            {
              title: 'Tanggal',
              dataIndex: 'tanggal',
              key: 'tanggal',
              render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
              sorter: (a: any, b: any) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
            },
            {
              title: 'Halaqah',
              dataIndex: ['halaqah', 'namaHalaqah'],
              key: 'halaqah',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => (
                <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                  {status.toUpperCase()}
                </Tag>
              ),
              filters: [
                { text: 'Masuk', value: 'masuk' },
                { text: 'Izin', value: 'izin' },
                { text: 'Sakit', value: 'sakit' },
                { text: 'Alpha', value: 'alpha' },
              ],
              onFilter: (value: any, record: any) => record.status === value,
            },
            {
              title: 'Keterangan',
              dataIndex: 'keterangan',
              key: 'keterangan',
              render: (keterangan: string) => keterangan || '-',
            },
          ]}
        />
      ),
    },
  ];

  return <Tabs defaultActiveKey="1" items={tabItems} />;
};
