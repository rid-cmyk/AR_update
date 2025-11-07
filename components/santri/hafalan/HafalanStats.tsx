'use client'

import { Card, Statistic, Progress, Row, Col, Tag, Tooltip, Space } from 'antd'
import { 
  BookOutlined, 
  CheckCircleOutlined, 
  BarChartOutlined, 
  AimOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FireOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'

interface DashboardStats {
  totalAyat: number;
  totalSetoran: number;
  streakDays: number;
  averageDaily: number;
  monthlyProgress: number;
  targetCompletion: number;
}

interface HafalanStatsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export function HafalanStats({ stats, loading = false }: HafalanStatsProps) {
  const getStreakColor = (days: number) => {
    if (days >= 30) return '#52c41a'
    if (days >= 14) return '#1890ff'
    if (days >= 7) return '#faad14'
    return '#ff4d4f'
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return '#52c41a'
    if (progress >= 70) return '#1890ff'
    if (progress >= 50) return '#faad14'
    return '#ff4d4f'
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  const statsCards = [
    {
      title: 'Total Ayat Dihafal',
      value: stats.totalAyat,
      prefix: <BookOutlined className="text-blue-500" />,
      suffix: 'ayat',
      color: '#1890ff',
      trend: { value: 15, isUp: true, label: 'ayat minggu ini' },
      description: 'Jumlah total ayat yang telah dihafal'
    },
    {
      title: 'Total Setoran',
      value: stats.totalSetoran,
      prefix: <CheckCircleOutlined className="text-green-500" />,
      suffix: 'setoran',
      color: '#52c41a',
      trend: { value: 3, isUp: true, label: 'setoran minggu ini' },
      description: 'Jumlah setoran yang telah dilakukan'
    },
    {
      title: 'Rata-rata Harian',
      value: stats.averageDaily,
      precision: 1,
      prefix: <BarChartOutlined className="text-purple-500" />,
      suffix: 'ayat/hari',
      color: '#722ed1',
      trend: { value: 2.3, isUp: true, label: 'dari bulan lalu' },
      description: 'Rata-rata ayat yang dihafal per hari'
    },
    {
      title: 'Progress Target',
      value: stats.targetCompletion,
      prefix: <AimOutlined className="text-orange-500" />,
      suffix: '%',
      color: '#fa8c16',
      trend: { value: 5, isUp: true, label: 'dari minggu lalu' },
      description: 'Persentase pencapaian target keseluruhan'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <Row gutter={[20, 20]}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full"
              loading={loading}
            >
              <Statistic
                title={
                  <Tooltip title={stat.description}>
                    <span className="text-gray-600 text-sm font-medium cursor-help">
                      {stat.title}
                    </span>
                  </Tooltip>
                }
                value={stat.value}
                precision={stat.precision}
                valueStyle={{ 
                  color: stat.color, 
                  fontSize: '28px', 
                  fontWeight: 'bold',
                  lineHeight: '1.2'
                }}
                prefix={stat.prefix}
                suffix={<span className="text-sm text-gray-500">{stat.suffix}</span>}
              />
              
              {stat.trend && (
                <div className="mt-3 flex items-center text-sm">
                  {stat.trend.isUp ? (
                    <RiseOutlined className="text-green-500 mr-1" />
                  ) : (
                    <FallOutlined className="text-red-500 mr-1" />
                  )}
                  <span className={stat.trend.isUp ? 'text-green-600' : 'text-red-600'}>
                    +{stat.trend.value} {stat.trend.label}
                  </span>
                </div>
              )}

              {/* Progress bar for percentage values */}
              {stat.suffix === '%' && (
                <div className="mt-3">
                  <Progress 
                    percent={stat.value} 
                    size="small" 
                    strokeColor={stat.color}
                    showInfo={false}
                  />
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Additional Stats */}
      <Row gutter={[20, 20]}>
        {/* Streak Card */}
        <Col xs={24} md={12}>
          <Card
            className="border-0 shadow-lg h-full"
            loading={loading}
          >
            <div className="text-center">
              <div className="mb-4">
                <div 
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: getStreakColor(stats.streakDays) }}
                >
                  <FireOutlined />
                </div>
              </div>
              
              <Statistic
                title="Streak Hafalan"
                value={stats.streakDays}
                suffix="hari berturut"
                valueStyle={{ 
                  color: getStreakColor(stats.streakDays),
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}
              />
              
              <div className="mt-3">
                <Tag 
                  color={getStreakColor(stats.streakDays)}
                  className="px-3 py-1"
                >
                  {stats.streakDays >= 30 ? '🔥 Streak Master!' :
                   stats.streakDays >= 14 ? '⭐ Konsisten!' :
                   stats.streakDays >= 7 ? '👍 Baik!' : '💪 Semangat!'}
                </Tag>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Terus pertahankan konsistensi hafalan Anda!
              </div>
            </div>
          </Card>
        </Col>

        {/* Monthly Progress */}
        <Col xs={24} md={12}>
          <Card
            className="border-0 shadow-lg h-full"
            loading={loading}
          >
            <div className="text-center">
              <div className="mb-4">
                <CalendarOutlined 
                  className="text-4xl"
                  style={{ color: getProgressColor(stats.monthlyProgress) }}
                />
              </div>
              
              <Statistic
                title="Progress Bulan Ini"
                value={stats.monthlyProgress}
                suffix="%"
                valueStyle={{ 
                  color: getProgressColor(stats.monthlyProgress),
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}
              />
              
              <div className="mt-3">
                <Progress 
                  percent={stats.monthlyProgress} 
                  strokeColor={getProgressColor(stats.monthlyProgress)}
                  trailColor="#f0f0f0"
                  strokeWidth={8}
                  showInfo={false}
                />
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Target bulanan: 100% • Sisa: {100 - stats.monthlyProgress}%
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Achievement Badges */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <TrophyOutlined className="text-yellow-500" />
            Pencapaian Terbaru
          </span>
        }
        className="border-0 shadow-lg"
        loading={loading}
      >
        <Space wrap size="large">
          {stats.totalSetoran >= 1 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 mx-auto">
                🌟
              </div>
              <div className="text-sm font-medium">Setoran Pertama</div>
              <div className="text-xs text-gray-500">1 setoran tercapai</div>
            </div>
          )}
          
          {stats.totalSetoran >= 10 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 mx-auto">
                📚
              </div>
              <div className="text-sm font-medium">Hafiz Aktif</div>
              <div className="text-xs text-gray-500">10 setoran tercapai</div>
            </div>
          )}
          
          {stats.streakDays >= 7 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 mx-auto">
                🔥
              </div>
              <div className="text-sm font-medium">Streak 7 Hari</div>
              <div className="text-xs text-gray-500">Konsisten 1 minggu</div>
            </div>
          )}
          
          {stats.targetCompletion >= 50 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 mx-auto">
                🎯
              </div>
              <div className="text-sm font-medium">Target Master</div>
              <div className="text-xs text-gray-500">50% target tercapai</div>
            </div>
          )}
          
          {stats.totalAyat >= 1000 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 mx-auto">
                👑
              </div>
              <div className="text-sm font-medium">Hafiz 1000</div>
              <div className="text-xs text-gray-500">1000+ ayat dihafal</div>
            </div>
          )}
        </Space>
      </Card>

      {/* Quick Stats Summary */}
      <Card
        title="Ringkasan Cepat"
        className="border-0 shadow-lg"
        loading={loading}
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.ceil(stats.totalAyat / 6236 * 100)}%
              </div>
              <div className="text-sm text-gray-600">Al-Quran</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.ceil(stats.totalAyat / 604)}
              </div>
              <div className="text-sm text-gray-600">Halaman</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.ceil(stats.totalAyat / 20.7)}
              </div>
              <div className="text-sm text-gray-600">Juz</div>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalSetoran > 0 ? Math.ceil(stats.totalAyat / stats.totalSetoran) : 0}
              </div>
              <div className="text-sm text-gray-600">Ayat/Setoran</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}