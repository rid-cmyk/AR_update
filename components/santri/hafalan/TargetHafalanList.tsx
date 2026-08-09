import React from "react";
import { Card, Select, Tag, Progress } from "antd";
import { AimOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

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
}

interface TargetHafalanListProps {
  selectedTarget: string;
  setSelectedTarget: (val: string) => void;
  filteredTargets: TargetHafalan[];
  getPriorityColor: (priority: string) => string;
}

export default function TargetHafalanList({
  selectedTarget,
  setSelectedTarget,
  filteredTargets,
  getPriorityColor,
}: TargetHafalanListProps) {
  return (
    <div>
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold flex items-center gap-2">
              <AimOutlined className="text-green-500" />
              Target Hafalan
            </span>
            <Select
              value={selectedTarget}
              onChange={setSelectedTarget}
              size="small"
              className="w-24"
            >
              <Option value="all">Semua</Option>
              <Option value="active">Aktif</Option>
              <Option value="completed">Selesai</Option>
            </Select>
          </div>
        }
        className="border-0 shadow-lg h-full"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredTargets.slice(0, 5).map((target) => {
            const progress = Math.round((target.currentAyat / target.targetAyat) * 100);
            const daysLeft = dayjs(target.deadline).diff(dayjs(), 'day');
            
            return (
              <div key={target.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{target.judul}</h4>
                    <p className="text-sm text-gray-600 mb-2">{target.deskripsi}</p>
                  </div>
                  <div className="flex gap-1">
                    <Tag color={getPriorityColor(target.priority)} style={{ fontSize: '11px' }}>
                      {target.priority.toUpperCase()}
                    </Tag>
                    <Tag color={target.kategori === 'ziyadah' ? 'blue' : 'green'} style={{ fontSize: '11px' }}>
                      {target.kategori}
                    </Tag>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">
                      {target.currentAyat} / {target.targetAyat} ayat
                    </span>
                    <span className="text-sm font-semibold text-blue-600">
                      {progress}%
                    </span>
                  </div>
                  <Progress 
                    percent={progress} 
                    size="small" 
                    strokeColor={target.kategori === 'ziyadah' ? '#219ebc' : '#219ebc'}
                    showInfo={false}
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    <CalendarOutlined className="mr-1" />
                    {dayjs(target.deadline).format('DD/MM/YYYY')}
                  </span>
                  <span className={`font-medium ${
                    daysLeft < 0 ? 'text-red-500' : 
                    daysLeft <= 3 ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {daysLeft < 0 ? `${Math.abs(daysLeft)} hari terlambat` :
                     daysLeft === 0 ? 'Hari ini' :
                     `${daysLeft} hari lagi`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
