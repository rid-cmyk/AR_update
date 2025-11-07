'use client'

import { Card, Row, Col, Progress, Typography, Tooltip } from 'antd'
import { 
  TrophyOutlined, 
  StarOutlined, 
  FireOutlined, 
  BookOutlined,
  CalendarOutlined,
  AimOutlined,
  CrownOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: 'setoran' | 'nilai' | 'streak' | 'target';
}

interface AchievementBadgesProps {
  stats: {
    totalSetoran: number;
    streakDays: number;
    averageNilai: number;
    targetCompletion: number;
  };
}

export function AchievementBadges({ stats }: AchievementBadgesProps) {
  const achievements: Achievement[] = [
    {
      id: 'first_setoran',
      title: 'Setoran Pertama',
      description: 'Melakukan setoran hafalan pertama kali',
      icon: <StarOutlined />,
      color: '#FFD700',
      progress: Math.min(stats.totalSetoran, 1),
      maxProgress: 1,
      unlocked: stats.totalSetoran >= 1,
      category: 'setoran'
    },
    {
      id: 'hafiz_pemula',
      title: 'Hafiz Pemula',
      description: 'Melakukan 10 setoran hafalan',
      icon: <BookOutlined />,
      color: '#1890ff',
      progress: Math.min(stats.totalSetoran, 10),
      maxProgress: 10,
      unlocked: stats.totalSetoran >= 10,
      category: 'setoran'
    },
    {
      id: 'hafiz_aktif',
      title: 'Hafiz Aktif',
      description: 'Melakukan 25 setoran hafalan',
      icon: <FireOutlined />,
      color: '#ff4d4f',
      progress: Math.min(stats.totalSetoran, 25),
      maxProgress: 25,
      unlocked: stats.totalSetoran >= 25,
      category: 'setoran'
    },
    {
      id: 'master_hafiz',
      title: 'Master Hafiz',
      description: 'Melakukan 50 setoran hafalan',
      icon: <CrownOutlined />,
      color: '#722ed1',
      progress: Math.min(stats.totalSetoran, 50),
      maxProgress: 50,
      unlocked: stats.totalSetoran >= 50,
      category: 'setoran'
    }
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <TrophyOutlined className="text-yellow-500" />
          <span>Pencapaian & Badge</span>
        </div>
      }
      className="border-0 shadow-lg"
    >
      <Row gutter={[16, 16]}>
        {achievements.map((achievement) => (
          <Col xs={12} sm={8} md={6} key={achievement.id}>
            <Tooltip
              title={
                <div>
                  <div className="font-semibold">{achievement.title}</div>
                  <div className="text-sm">{achievement.description}</div>
                  <div className="text-xs mt-1">
                    Progress: {achievement.progress}/{achievement.maxProgress}
                  </div>
                </div>
              }
            >
              <div
                className={`
                  relative p-4 rounded-xl text-center transition-all duration-300 cursor-pointer
                  ${achievement.unlocked 
                    ? 'bg-gradient-to-br shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                    : 'bg-gray-100 opacity-60'
                  }
                `}
                style={{
                  background: achievement.unlocked 
                    ? `linear-gradient(135deg, ${achievement.color}20, ${achievement.color}10)`
                    : undefined,
                  border: achievement.unlocked 
                    ? `2px solid ${achievement.color}40` 
                    : '2px solid #d9d9d9'
                }}
              >
                {achievement.unlocked && (
                  <div 
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: achievement.color }}
                  >
                    ✓
                  </div>
                )}
                
                <div 
                  className={`text-3xl mb-2 ${achievement.unlocked ? '' : 'text-gray-400'}`}
                  style={{ color: achievement.unlocked ? achievement.color : undefined }}
                >
                  {achievement.icon}
                </div>
                
                <div className={`font-semibold text-sm mb-1 ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                  {achievement.title}
                </div>
                
                <div className="mb-2">
                  <Progress
                    percent={(achievement.progress / achievement.maxProgress) * 100}
                    size="small"
                    strokeColor={achievement.color}
                    showInfo={false}
                    trailColor={achievement.unlocked ? '#f0f0f0' : '#e0e0e0'}
                  />
                </div>
                
                <div className={`text-xs ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                  {achievement.progress}/{achievement.maxProgress}
                </div>
              </div>
            </Tooltip>
          </Col>
        ))}
      </Row>
    </Card>
  );
}