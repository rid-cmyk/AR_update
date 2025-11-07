'use client'

import { useState } from 'react'
import { Card, Select, Button, Space, Tooltip, Tag } from 'antd'
import { 
  LineChartOutlined, 
  BarChartOutlined, 
  PieChartOutlined, 
  DownloadOutlined,
  FullscreenOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import dayjs from 'dayjs'

const { Option } = Select

interface HafalanProgress {
  date: string;
  ziyadah: number;
  murajaah: number;
  total: number;
  cumulative: number;
}

interface HafalanChartProps {
  data: HafalanProgress[];
  period: string;
  onPeriodChange: (period: string) => void;
}

const COLORS = {
  ziyadah: '#1890ff',
  murajaah: '#52c41a',
  total: '#722ed1',
  cumulative: '#fa8c16'
}

const PIE_COLORS = ['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96']

export function HafalanChart({ data, period, onPeriodChange }: HafalanChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'pie'>('area')
  const [showCumulative, setShowCumulative] = useState(false)

  // Calculate totals for pie chart
  const totalZiyadah = data.reduce((sum, item) => sum + item.ziyadah, 0)
  const totalMurajaah = data.reduce((sum, item) => sum + item.murajaah, 0)
  
  const pieData = [
    { name: 'Ziyadah', value: totalZiyadah, color: COLORS.ziyadah },
    { name: 'Murajaah', value: totalMurajaah, color: COLORS.murajaah }
  ]

  const formatTooltipLabel = (value: string) => {
    return `Tanggal: ${dayjs(value).format('DD MMMM YYYY')}`
  }

  const formatXAxisLabel = (value: string) => {
    return dayjs(value).format('DD/MM')
  }

  const exportData = () => {
    const csvContent = [
      ['Tanggal', 'Ziyadah', 'Murajaah', 'Total', 'Kumulatif'],
      ...data.map(item => [
        dayjs(item.date).format('DD/MM/YYYY'),
        item.ziyadah,
        item.murajaah,
        item.total,
        item.cumulative
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hafalan-progress-${dayjs().format('YYYY-MM-DD')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              fontSize={12}
            />
            <YAxis stroke="#666" fontSize={12} />
            <RechartsTooltip
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                background: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ziyadah"
              stroke={COLORS.ziyadah}
              strokeWidth={3}
              name="Ziyadah"
              dot={{ fill: COLORS.ziyadah, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: COLORS.ziyadah, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="murajaah"
              stroke={COLORS.murajaah}
              strokeWidth={3}
              name="Murajaah"
              dot={{ fill: COLORS.murajaah, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: COLORS.murajaah, strokeWidth: 2 }}
            />
            {showCumulative && (
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke={COLORS.cumulative}
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Kumulatif"
                dot={{ fill: COLORS.cumulative, strokeWidth: 2, r: 4 }}
              />
            )}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="ziyadahGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.ziyadah} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.ziyadah} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="murajaahGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.murajaah} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.murajaah} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              fontSize={12}
            />
            <YAxis stroke="#666" fontSize={12} />
            <RechartsTooltip
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                background: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="ziyadah"
              stackId="1"
              stroke={COLORS.ziyadah}
              fill="url(#ziyadahGradient)"
              strokeWidth={2}
              name="Ziyadah"
            />
            <Area
              type="monotone"
              dataKey="murajaah"
              stackId="1"
              stroke={COLORS.murajaah}
              fill="url(#murajaahGradient)"
              strokeWidth={2}
              name="Murajaah"
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              fontSize={12}
            />
            <YAxis stroke="#666" fontSize={12} />
            <RechartsTooltip
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                background: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="ziyadah" fill={COLORS.ziyadah} name="Ziyadah" radius={[2, 2, 0, 0]} />
            <Bar dataKey="murajaah" fill={COLORS.murajaah} name="Murajaah" radius={[2, 2, 0, 0]} />
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart width={400} height={300} style={{ margin: '0 auto' }}>
            <Pie
              data={pieData}
              cx={200}
              cy={150}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold flex items-center gap-2">
            <LineChartOutlined className="text-blue-500" />
            Grafik Progress Hafalan
            <Tooltip title="Grafik menampilkan progress hafalan harian dengan berbagai visualisasi">
              <InfoCircleOutlined className="text-gray-400 text-sm" />
            </Tooltip>
          </span>
          <Space>
            <Select
              value={period}
              onChange={onPeriodChange}
              size="small"
              className="w-32"
            >
              <Option value="7days">7 Hari</Option>
              <Option value="30days">30 Hari</Option>
              <Option value="90days">90 Hari</Option>
            </Select>
          </Space>
        </div>
      }
      extra={
        <Space>
          <Select
            value={chartType}
            onChange={setChartType}
            size="small"
            className="w-24"
          >
            <Option value="area">
              <AreaChart width={16} height={16} className="inline mr-1" />
              Area
            </Option>
            <Option value="line">
              <LineChartOutlined className="mr-1" />
              Line
            </Option>
            <Option value="bar">
              <BarChartOutlined className="mr-1" />
              Bar
            </Option>
            <Option value="pie">
              <PieChartOutlined className="mr-1" />
              Pie
            </Option>
          </Select>
          
          {chartType !== 'pie' && (
            <Button
              size="small"
              type={showCumulative ? 'primary' : 'default'}
              onClick={() => setShowCumulative(!showCumulative)}
            >
              Kumulatif
            </Button>
          )}
          
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={exportData}
          >
            Export
          </Button>
        </Space>
      }
      className="border-0 shadow-lg h-full"
    >
      <div className="mb-4">
        <Space wrap>
          <Tag color="blue">
            Total Ziyadah: {totalZiyadah} ayat
          </Tag>
          <Tag color="green">
            Total Murajaah: {totalMurajaah} ayat
          </Tag>
          <Tag color="purple">
            Total Keseluruhan: {totalZiyadah + totalMurajaah} ayat
          </Tag>
          {data.length > 0 && (
            <Tag color="orange">
              Rata-rata Harian: {Math.round((totalZiyadah + totalMurajaah) / data.length)} ayat
            </Tag>
          )}
        </Space>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        {renderChart()}
      </ResponsiveContainer>

      {/* Chart Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="font-medium">Periode:</span> {
                period === '7days' ? '7 Hari Terakhir' :
                period === '30days' ? '30 Hari Terakhir' : '90 Hari Terakhir'
              }
            </div>
            <div>
              <span className="font-medium">Data Points:</span> {data.length}
            </div>
            <div>
              <span className="font-medium">Tipe Chart:</span> {
                chartType === 'area' ? 'Area Chart' :
                chartType === 'line' ? 'Line Chart' :
                chartType === 'bar' ? 'Bar Chart' : 'Pie Chart'
              }
            </div>
            <div>
              <span className="font-medium">Last Update:</span> {dayjs().format('HH:mm')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}