'use client'

import { Card, Progress, Typography, Tag, Button, Empty, Tooltip, Row, Col, Divider, Timeline, Alert } from 'antd'
import { 
  AimOutlined, 
  CalendarOutlined, 
  BookOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  UserOutlined,
  TrophyOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface TargetHafalan {
  id: number;
  judul: string;
  deskripsi: string;
  targetAyat: number;
  currentAyat: number;
  deadline: string;
  status: 'active' | 'completed' | 'overdue';
  kategori: 'ziyadah' | 'murajaah';
  createdBy: string;
  priority: 'high' | 'medium' | 'low';
  surah?: string;
  juzTarget?: number;
  ayatMulai?: number;
  ayatSelesai?: number;
}

interface TargetHafalanDetailProps {
  targets: TargetHafalan[];
  onTargetSelect?: (target: TargetHafalan) => void;
}

export function TargetHafalanDetail({ targets, onTargetSelect }: TargetHafalanDetailProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#52c41a';
      case 'active': return '#1890ff';
      case 'overdue': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined />;
      case 'active': return <ClockCircleOutlined />;
      case 'overdue': return <ExclamationCircleOutlined />;
      default: return <BookOutlined />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'active': return 'Aktif';
      case 'overdue': return 'Terlambat';
      default: return 'Unknown';
    }
  };

  const activeTargets = targets.filter(t => t.status === 'active');
  const completedTargets = targets.filter(t => t.status === 'completed');
  const overdueTargets = targets.filter(t => t.status === 'overdue');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="text-center border-0 shadow-md">
            <div className="text-2xl font-bold text-blue-600 mb-1">{activeTargets.length}</div>
            <div className="text-sm text-gray-600">Target Aktif</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center border-0 shadow-md">
            <div className="text-2xl font-bold text-green-600 mb-1">{completedTargets.length}</div>
            <div className="text-sm text-gray-600">Target Selesai</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center border-0 shadow-md">
            <div className="text-2xl font-bold text-red-600 mb-1">{overdueTargets.length}</div>
            <div className="text-sm text-gray-600">Target Terlambat</div>
          </Card>
        </Col>
      </Row>

      {/* Active Targets */}
      {activeTargets.length > 0 && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-blue-500" />
              <span>Target Aktif</span>
              <Tag color="blue">{activeTargets.length}</Tag>
            </div>
          }
          className="border-0 shadow-lg"
        >
          <div className="space-y-4">
            {activeTargets.map((target) => {
              const progress = Math.round((target.currentAyat / target.targetAyat) * 100);
              const daysLeft = dayjs(target.deadline).diff(dayjs(), 'day');
              
              return (
                <div 
                  key={target.id} 
                  className="bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors cursor-pointer"
                  onClick={() => onTargetSelect?.(target)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{target.judul}</h4>
                        <Tag color={getPriorityColor(target.priority)} size="small">
                          {target.priority.toUpperCase()}
                        </Tag>
                        <Tag color={target.kategori === 'ziyadah' ? 'blue' : 'green'} size="small">
                          {target.kategori}
                        </Tag>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{target.deskripsi}</p>
                      
                      {/* Progress Section */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            Progress: {target.currentAyat} / {target.targetAyat} ayat
                          </span>
                          <span className="text-sm font-semibold text-blue-600">
                            {progress}%
                          </span>
                        </div>
                        <Progress 
                          percent={progress} 
                          strokeColor={{
                            '0%': '#1890ff',
                            '100%': '#52c41a',
                          }}
                          trailColor="#e6f7ff"
                          strokeWidth={8}
                          showInfo={false}
                        />
                      </div>
                      
                      {/* Target Details */}
                      {target.surah && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>
                            <BookOutlined className="mr-1" />
                            {target.surah}
                          </span>
                          {target.ayatMulai && target.ayatSelesai && (
                            <span>Ayat {target.ayatMulai}-{target.ayatSelesai}</span>
                          )}
                          {target.juzTarget && (
                            <span>Juz {target.juzTarget}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Deadline and Creator */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          <CalendarOutlined className="mr-1" />
                          Deadline: {dayjs(target.deadline).format('DD/MM/YYYY')}
                        </span>
                        <span className="text-gray-500">
                          <UserOutlined className="mr-1" />
                          {target.createdBy}
                        </span>
                      </div>
                    </div>
                    
                    {/* Days Left Indicator */}
                    <div className="text-right ml-4">
                      <div className={`text-lg font-bold ${
                        daysLeft < 0 ? 'text-red-500' : 
                        daysLeft <= 3 ? 'text-orange-500' : 'text-green-500'
                      }`}>
                        {daysLeft < 0 ? Math.abs(daysLeft) : daysLeft}
                      </div>
                      <div className="text-xs text-gray-500">
                        {daysLeft < 0 ? 'hari terlambat' : 
                         daysLeft === 0 ? 'hari ini' : 'hari lagi'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Completed Targets */}
      {completedTargets.length > 0 && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-green-500" />
              <span>Target Selesai</span>
              <Tag color="green">{completedTargets.length}</Tag>
            </div>
          }
          className="border-0 shadow-lg"
        >
          <div className="space-y-3">
            {completedTargets.slice(0, 5).map((target) => (
              <div 
                key={target.id} 
                className="bg-green-50 rounded-lg p-3 flex items-center justify-between hover:bg-green-100 transition-colors cursor-pointer"
                onClick={() => onTargetSelect?.(target)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircleOutlined />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{target.judul}</div>
                    <div className="text-sm text-gray-600">
                      Selesai pada {dayjs(target.deadline).format('DD/MM/YYYY')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color="green" size="small">100%</Tag>
                  <TrophyOutlined className="text-green-500" />
                </div>
              </div>
            ))}
            {completedTargets.length > 5 && (
              <div className="text-center pt-2">
                <Button type="link" size="small">
                  Lihat {completedTargets.length - 5} target selesai lainnya
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Overdue Targets */}
      {overdueTargets.length > 0 && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined className="text-red-500" />
              <span>Target Terlambat</span>
              <Tag color="red">{overdueTargets.length}</Tag>
            </div>
          }
          className="border-0 shadow-lg"
        >
          <Alert
            message="Perhatian!"
            description="Anda memiliki target yang sudah melewati deadline. Segera konsultasikan dengan guru untuk penyesuaian target."
            type="warning"
            showIcon
            className="mb-4"
          />
          <div className="space-y-3">
            {overdueTargets.map((target) => {
              const progress = Math.round((target.currentAyat / target.targetAyat) * 100);
              const daysOverdue = Math.abs(dayjs(target.deadline).diff(dayjs(), 'day'));
              
              return (
                <div 
                  key={target.id} 
                  className="bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-colors cursor-pointer"
                  onClick={() => onTargetSelect?.(target)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-800">{target.judul}</h4>
                        <Tag color="red" size="small">
                          {daysOverdue} hari terlambat
                        </Tag>
                      </div>
                      <div className="mb-2">
                        <Progress 
                          percent={progress} 
                          strokeColor="#ff4d4f"
                          trailColor="#ffebe6"
                          size="small"
                          showInfo={false}
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        Progress: {target.currentAyat} / {target.targetAyat} ayat ({progress}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {targets.length === 0 && (
        <Card className="border-0 shadow-lg">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary">Belum ada target hafalan</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Target akan dibuat oleh guru Anda
                </Text>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
}