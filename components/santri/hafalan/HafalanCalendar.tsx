'use client'

import { Calendar, Badge, Card, Typography, Tag, Tooltip } from 'antd'
import { CalendarOutlined, FireOutlined, BookOutlined, TrophyOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { useState } from 'react'

const { Title, Text } = Typography

interface HafalanCalendarData {
  date: string;
  ziyadah: number;
  murajaah: number;
  total: number;
  nilai?: number;
  catatan?: string;
}

interface HafalanCalendarProps {
  data: HafalanCalendarData[];
  onDateSelect?: (date: Dayjs) => void;
}

export function HafalanCalendar({ data, onDateSelect }: HafalanCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayData = data.find(d => d.date === dateStr);
    
    if (!dayData || dayData.total === 0) return [];

    const items = [];
    
    if (dayData.ziyadah > 0) {
      items.push({
        type: 'success' as const,
        content: `${dayData.ziyadah} Ziyadah`,
        icon: <FireOutlined />
      });
    }
    
    if (dayData.murajaah > 0) {
      items.push({
        type: 'processing' as const,
        content: `${dayData.murajaah} Murajaah`,
        icon: <BookOutlined />
      });
    }

    if (dayData.nilai && dayData.nilai >= 90) {
      items.push({
        type: 'warning' as const,
        content: `Nilai: ${dayData.nilai}`,
        icon: <TrophyOutlined />
      });
    }

    return items;
  };

  const cellRender = (value: Dayjs, info: { type: string; originNode: React.ReactElement }) => {
    if (info.type === 'date') {
      const dateStr = value.format('YYYY-MM-DD');
      const dayData = data.find(d => d.date === dateStr);
      
      if (!dayData || dayData.total === 0) {
        return <div className="h-full" />;
      }
      
      return (
        <div className="h-full relative">
          {/* Activity Indicators */}
          <div className="flex gap-1 mb-1">
            {dayData.ziyadah > 0 && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" title={`${dayData.ziyadah} Ziyadah`} />
            )}
            {dayData.murajaah > 0 && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title={`${dayData.murajaah} Murajaah`} />
            )}
          </div>
          
          {/* Total Count */}
          <div className="absolute bottom-1 right-1">
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white shadow-sm"
              style={{
                backgroundColor: dayData.total >= 15 ? '#52c41a' : 
                                dayData.total >= 10 ? '#1890ff' : 
                                dayData.total >= 5 ? '#faad14' : '#ff7875'
              }}
            >
              {dayData.total}
            </div>
          </div>
        </div>
      );
    }
    
    if (info.type === 'month') {
      const monthStart = value.startOf('month');
      const monthEnd = value.endOf('month');
      
      const monthData = data.filter(d => {
        const date = dayjs(d.date);
        return date.isAfter(monthStart.subtract(1, 'day')) && date.isBefore(monthEnd.add(1, 'day'));
      });

      const totalSetoran = monthData.reduce((sum, d) => sum + d.total, 0);

      if (totalSetoran === 0) return info.originNode;

      return (
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-sm font-bold text-blue-600">{totalSetoran}</div>
          <div className="text-xs text-gray-500">setoran</div>
        </div>
      );
    }
    
    return info.originNode;
  };

  const onSelect = (value: Dayjs) => {
    setSelectedDate(value);
    onDateSelect?.(value);
  };



  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-blue-500" />
          <span className="text-lg font-semibold">Kalender Hafalan</span>
        </div>
      }
      className="border-0 shadow-sm"
    >
      <Calendar
        cellRender={cellRender}
        onSelect={onSelect}
        className="hafalan-calendar"
      />
      
      {selectedDate && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <CalendarOutlined className="text-blue-500" />
            <Title level={5} className="mb-0">
              {selectedDate.format('DD MMMM YYYY')}
            </Title>
          </div>
          {(() => {
            const dateStr = selectedDate.format('YYYY-MM-DD');
            const dayData = data.find(d => d.date === dateStr);
            
            if (!dayData || dayData.total === 0) {
              return (
                <div className="text-center py-4">
                  <Text type="secondary" className="text-sm">
                    Tidak ada setoran pada tanggal ini
                  </Text>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {dayData.ziyadah > 0 && (
                    <Tag color="blue" className="px-3 py-1">
                      <FireOutlined className="mr-1" />
                      {dayData.ziyadah} Ziyadah
                    </Tag>
                  )}
                  {dayData.murajaah > 0 && (
                    <Tag color="green" className="px-3 py-1">
                      <BookOutlined className="mr-1" />
                      {dayData.murajaah} Murajaah
                    </Tag>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-gray-500 mb-1">Total Setoran</div>
                    <div className="text-lg font-bold text-blue-600">{dayData.total}</div>
                  </div>
                  {dayData.nilai && (
                    <div className="bg-white p-3 rounded border">
                      <div className="text-gray-500 mb-1">Nilai Rata-rata</div>
                      <div 
                        className="text-lg font-bold"
                        style={{
                          color: dayData.nilai >= 90 ? '#52c41a' : 
                                dayData.nilai >= 80 ? '#1890ff' : 
                                dayData.nilai >= 70 ? '#faad14' : '#ff4d4f'
                        }}
                      >
                        {dayData.nilai}
                      </div>
                    </div>
                  )}
                </div>
                
                {dayData.catatan && (
                  <div className="bg-white p-3 rounded border border-l-4 border-l-blue-500">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Catatan:</span>
                      <span className="ml-2 text-gray-600">{dayData.catatan}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <style jsx global>{`
        .hafalan-calendar .ant-picker-calendar-date-value {
          height: 50px;
          position: relative;
        }
        
        .hafalan-calendar .ant-badge-status-text {
          font-size: 10px;
        }
        
        .hafalan-calendar .ant-picker-calendar-date-today .ant-picker-calendar-date-value {
          border: 2px solid #1890ff;
          border-radius: 6px;
        }
        
        .hafalan-calendar .ant-picker-calendar-date:hover .ant-picker-calendar-date-value {
          background-color: #f0f9ff;
        }
      `}</style>
    </Card>
  );
}