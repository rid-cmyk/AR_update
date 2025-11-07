'use client'

import { Modal, Descriptions, Tag, Progress, Rate, Timeline, Divider } from 'antd'
import { CalendarOutlined, UserOutlined, BookOutlined, StarOutlined, TrophyOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

interface HafalanDetail {
  id: number;
  tanggal: string;
  jenis: 'ziyadah' | 'murajaah';
  surah: string;
  ayat: string;
  guru: string;
  nilai?: number;
  catatan?: string;
}

interface DetailHafalanModalProps {
  open: boolean;
  onClose: () => void;
  hafalan: HafalanDetail | null;
}

export function DetailHafalanModal({ open, onClose, hafalan }: DetailHafalanModalProps) {
  if (!hafalan) return null;

  const getNilaiColor = (nilai: number) => {
    if (nilai >= 90) return '#52c41a';
    if (nilai >= 80) return '#1890ff';
    if (nilai >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const getNilaiLabel = (nilai: number) => {
    if (nilai >= 90) return 'Sangat Baik';
    if (nilai >= 80) return 'Baik';
    if (nilai >= 70) return 'Cukup';
    return 'Perlu Perbaikan';
  };

  const getJenisColor = (jenis: string) => {
    return jenis === 'ziyadah' ? '#1890ff' : '#52c41a';
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: getJenisColor(hafalan.jenis) }}
          >
            <BookOutlined />
          </div>
          <div>
            <div className="font-semibold">Detail Setoran Hafalan</div>
            <div className="text-sm text-gray-500 font-normal">
              {hafalan.surah} ({hafalan.ayat})
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      className="detail-hafalan-modal"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Jenis Setoran</div>
              <Tag 
                color={hafalan.jenis === 'ziyadah' ? 'blue' : 'green'} 
                className="text-sm px-3 py-1"
              >
                {hafalan.jenis === 'ziyadah' ? 'Ziyadah (Hafalan Baru)' : 'Murajaah (Mengulang)'}
              </Tag>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Tanggal Setoran</div>
              <div className="flex items-center gap-2 text-gray-800">
                <CalendarOutlined />
                {dayjs(hafalan.tanggal).format('DD MMMM YYYY')}
              </div>
            </div>
          </div>
        </div>

        {/* Nilai Section */}
        {hafalan.nilai && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 mb-2">Nilai Setoran</div>
              <div 
                className="text-4xl font-bold mb-2"
                style={{ color: getNilaiColor(hafalan.nilai) }}
              >
                {hafalan.nilai}
              </div>
              <Tag 
                color={getNilaiColor(hafalan.nilai)} 
                className="text-sm px-3 py-1"
              >
                {getNilaiLabel(hafalan.nilai)}
              </Tag>
            </div>
            
            <div className="mb-4">
              <Progress 
                percent={hafalan.nilai} 
                strokeColor={getNilaiColor(hafalan.nilai)}
                trailColor="#f0f0f0"
                strokeWidth={8}
                showInfo={false}
              />
            </div>

            <div className="text-center">
              <Rate 
                disabled 
                value={Math.ceil(hafalan.nilai / 20)} 
                character={<StarOutlined />}
                className="text-yellow-400"
              />
            </div>
          </div>
        )}

        {/* Detail Informasi */}
        <Descriptions 
          title="Informasi Detail" 
          bordered 
          column={1}
          size="small"
          className="bg-gray-50 rounded-xl"
        >
          <Descriptions.Item label="Surah">
            <div className="flex items-center gap-2">
              <BookOutlined className="text-blue-500" />
              <span className="font-medium">{hafalan.surah}</span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Ayat">
            <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {hafalan.ayat}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Guru Penguji">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-green-500" />
              <span>{hafalan.guru}</span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Waktu Setoran">
            {dayjs(hafalan.tanggal).format('dddd, DD MMMM YYYY - HH:mm')} WIB
          </Descriptions.Item>
        </Descriptions>

        {/* Catatan Guru */}
        {hafalan.catatan && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrophyOutlined className="text-yellow-600" />
              <span className="font-semibold text-yellow-800">Catatan Guru</span>
            </div>
            <div className="text-gray-700 leading-relaxed">
              "{hafalan.catatan}"
            </div>
          </div>
        )}

        {/* Timeline Progress */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="font-semibold mb-3 flex items-center gap-2">
            <CalendarOutlined className="text-blue-500" />
            Timeline Setoran
          </div>
          <Timeline
            items={[
              {
                color: 'blue',
                children: (
                  <div>
                    <div className="font-medium">Setoran Dimulai</div>
                    <div className="text-sm text-gray-500">
                      {dayjs(hafalan.tanggal).format('HH:mm')} - Memulai setoran {hafalan.surah}
                    </div>
                  </div>
                )
              },
              {
                color: hafalan.nilai && hafalan.nilai >= 80 ? 'green' : 'orange',
                children: (
                  <div>
                    <div className="font-medium">Penilaian Selesai</div>
                    <div className="text-sm text-gray-500">
                      {dayjs(hafalan.tanggal).add(15, 'minute').format('HH:mm')} - 
                      Mendapat nilai {hafalan.nilai || 'Belum dinilai'}
                    </div>
                  </div>
                )
              },
              {
                color: 'gray',
                children: (
                  <div>
                    <div className="font-medium">Catatan Diberikan</div>
                    <div className="text-sm text-gray-500">
                      {dayjs(hafalan.tanggal).add(20, 'minute').format('HH:mm')} - 
                      Guru memberikan feedback
                    </div>
                  </div>
                )
              }
            ]}
          />
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="font-semibold text-blue-800 mb-2">💡 Tips untuk Setoran Selanjutnya</div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Pastikan bacaan tajwid sudah benar sebelum setoran</li>
            <li>• Lakukan murajaah rutin untuk menjaga hafalan</li>
            <li>• Siapkan mental dan kondisi fisik yang prima</li>
            <li>• Jangan lupa berdoa sebelum memulai setoran</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}