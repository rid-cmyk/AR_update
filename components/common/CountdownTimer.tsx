"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Progress } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { formatRemainingTime } from '@/lib/utils/rateLimiter';

const { Text } = Typography;

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  message?: string;
  showProgress?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds,
  onComplete,
  message,
  showProgress = true
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, onComplete]);

  const progressPercent = ((initialSeconds - remainingSeconds) / initialSeconds) * 100;

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '20px',
      background: '#fff2f0',
      border: '1px solid #ffccc7',
      borderRadius: '8px',
      margin: '16px 0'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <ClockCircleOutlined 
          style={{ 
            fontSize: '24px', 
            color: '#ff4d4f',
            marginBottom: '8px'
          }} 
        />
        <div>
          <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
            {message || 'Silakan tunggu...'}
          </Text>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Text style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          color: '#ff4d4f',
          fontFamily: 'monospace'
        }}>
          {formatRemainingTime(remainingSeconds)}
        </Text>
      </div>

      {showProgress && (
        <Progress
          percent={progressPercent}
          strokeColor={{
            '0%': '#ff4d4f',
            '100%': '#52c41a',
          }}
          showInfo={false}
          size="small"
        />
      )}

      <div style={{ marginTop: '12px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Waktu tunggu akan berakhir secara otomatis
        </Text>
      </div>
    </div>
  );
};

export default CountdownTimer;