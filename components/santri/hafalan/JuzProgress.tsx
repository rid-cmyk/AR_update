'use client'

import { Card, Progress, Row, Col, Typography, Tag, Tooltip } from 'antd'
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface JuzData {
  juz: number;
  name: string;
  totalAyat: number;
  completedAyat: number;
  status: 'completed' | 'in_progress' | 'not_started' | 'has_target';
  lastActivity?: string;
  hasActiveTarget?: boolean;
  targetProgress?: number;
  targetDeadline?: string;
  targetCreatedBy?: string;
}

interface TargetHafalan {
  id: number;
  judul: string;
  juzTarget?: number;
  currentAyat: number;
  targetAyat: number;
  status: 'active' | 'completed' | 'overdue';
  deadline: string;
  createdBy: string;
}

interface JuzProgressProps {
  juzData?: JuzData[];
  targets?: TargetHafalan[];
}

export function JuzProgress({ juzData, targets = [] }: JuzProgressProps) {
  // Generate juz data dengan integrasi target
  const generateJuzData = (): JuzData[] => {
    return Array.from({ length: 30 }, (_, i) => {
      const juz = i + 1;
      
      // Cari target yang berkaitan dengan juz ini
      const juzTarget = targets.find(t => t.juzTarget === juz);
      
      // Base progress (simulasi hafalan yang sudah ada)
      const baseProgress = Math.max(0, Math.min(100, (juz <= 3 ? 85 : juz <= 10 ? 45 : juz <= 20 ? 20 : 0) + Math.random() * 15));
      
      let status: 'completed' | 'in_progress' | 'not_started' | 'has_target' = 'not_started';
      let completedAyat = 0;
      let targetProgress = 0;
      
      if (juzTarget) {
        // Jika ada target untuk juz ini
        targetProgress = Math.round((juzTarget.currentAyat / juzTarget.targetAyat) * 100);
        completedAyat = juzTarget.currentAyat;
        
        if (juzTarget.status === 'completed') {
          status = 'completed';
        } else {
          status = 'has_target';
        }
      } else {
        // Jika tidak ada target, gunakan base progress
        if (baseProgress >= 100) {
          status = 'completed';
          completedAyat = Math.floor(baseProgress * 2);
        } else if (baseProgress > 0) {
          status = 'in_progress';
          completedAyat = Math.floor(baseProgress * 2);
        }
      }
      
      return {
        juz,
        name: `Juz ${juz}`,
        totalAyat: juz === 1 ? 148 : juz === 30 ? 564 : Math.floor(Math.random() * 200) + 150,
        completedAyat,
        status,
        lastActivity: completedAyat > 0 ? `${Math.floor(Math.random() * 7) + 1} hari lalu` : undefined,
        hasActiveTarget: !!juzTarget && juzTarget.status === 'active',
        targetProgress: juzTarget ? targetProgress : undefined,
        targetDeadline: juzTarget?.deadline,
        targetCreatedBy: juzTarget?.createdBy
      };
    });
  };

  const data = juzData || generateJuzData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#52c41a';
      case 'in_progress': return '#1890ff';
      case 'has_target': return '#faad14';
      case 'not_started': return '#f0f0f0';
      default: return '#f0f0f0';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'in_progress': return 'Berlangsung';
      case 'has_target': return 'Ada Target';
      case 'not_started': return 'Belum Mulai';
      default: return 'Unknown';
    }
  };

  const completedJuz = data.filter(j => j.status === 'completed').length;
  const inProgressJuz = data.filter(j => j.status === 'in_progress').length;
  const hasTargetJuz = data.filter(j => j.status === 'has_target').length;
  const totalProgress = Math.round((completedJuz / 30) * 100);

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <BookOutlined className="text-blue-500" />
          <span className="text-lg font-semibold">Progress 30 Juz Al-Quran</span>
        </div>
      }
      className="border-0 shadow-sm"
    >
      {/* Overall Progress */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <Text className="text-gray-700 font-medium">Progress Keseluruhan</Text>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-600">{completedJuz}/30</div>
            <div className="text-xs text-gray-500">Juz Selesai</div>
          </div>
        </div>
        <Progress 
          percent={totalProgress} 
          strokeColor="#1890ff"
          trailColor="#f0f0f0"
          strokeWidth={6}
          showInfo={false}
        />
        <div className="flex justify-between mt-3 text-sm text-gray-600">
          <span>{completedJuz} Selesai</span>
          <span>{inProgressJuz} Berlangsung</span>
          <span>{hasTargetJuz} Ada Target</span>
          <span>{30 - completedJuz - inProgressJuz - hasTargetJuz} Belum Mulai</span>
        </div>
      </div>

      {/* Juz Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-3">
        {data.map((juz) => {
          const progressPercent = Math.round((juz.completedAyat / juz.totalAyat) * 100);
          
          return (
            <Tooltip
              key={juz.juz}
              title={
                <div className="text-center">
                  <div className="font-medium">{juz.name}</div>
                  <div className="text-sm mt-1">
                    {juz.completedAyat} / {juz.totalAyat} ayat
                  </div>
                  <div className="text-sm">
                    Progress: {progressPercent}%
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Status: {getStatusText(juz.status)}
                  </div>
                  {juz.hasActiveTarget && (
                    <div className="text-xs text-yellow-300 mt-1">
                      🎯 Target Aktif: {juz.targetProgress}%
                    </div>
                  )}
                  {juz.targetDeadline && (
                    <div className="text-xs text-gray-300">
                      Deadline: {dayjs(juz.targetDeadline).format('DD/MM/YYYY')}
                    </div>
                  )}
                  {juz.targetCreatedBy && (
                    <div className="text-xs text-gray-300">
                      Oleh: {juz.targetCreatedBy}
                    </div>
                  )}
                </div>
              }
            >
              <div
                className="relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: getStatusColor(juz.status),
                  border: juz.status !== 'not_started' ? `2px solid ${getStatusColor(juz.status)}` : '2px solid #e5e7eb'
                }}
              >
                {/* Juz Number */}
                <div 
                  className={`text-sm font-bold ${
                    juz.status === 'not_started' ? 'text-gray-400' : 'text-white'
                  }`}
                >
                  {juz.juz}
                </div>

                {/* Progress Indicator */}
                {juz.status !== 'not_started' && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div 
                      className="h-1 bg-white/30 rounded-full overflow-hidden"
                    >
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Indicator */}
                {juz.status === 'completed' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircleOutlined className="text-white text-xs" />
                  </div>
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-xl font-bold text-green-600">{completedJuz}</div>
          <div className="text-sm text-gray-600">Selesai</div>
        </div>
        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xl font-bold text-blue-600">{inProgressJuz}</div>
          <div className="text-sm text-gray-600">Berlangsung</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-xl font-bold text-yellow-600">{hasTargetJuz}</div>
          <div className="text-sm text-gray-600">Ada Target</div>
        </div>
        <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xl font-bold text-gray-600">{30 - completedJuz - inProgressJuz - hasTargetJuz}</div>
          <div className="text-sm text-gray-600">Belum Mulai</div>
        </div>
      </div>
    </Card>
  );
}