"use client";

import React, { useState } from 'react';
import { Button, Tooltip, Typography, Space } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, CopyOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PasscodeDisplayProps {
  passcode: string;
  label?: string;
  copyable?: boolean;
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
}

export default function PasscodeDisplay({
  passcode,
  label = "Passcode",
  copyable = true,
  style,
  size = 'middle'
}: PasscodeDisplayProps) {
  const [showPasscode, setShowPasscode] = useState(false);

  const togglePasscodeVisibility = () => {
    setShowPasscode(!showPasscode);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(passcode);
  };

  const maskedPasscode = '•'.repeat(passcode.length);
  const displayPasscode = showPasscode ? passcode : maskedPasscode;

  const fontSize = size === 'small' ? '12px' : size === 'large' ? '16px' : '14px';

  return (
    <div style={{ ...style }}>
      {label && (
        <Text strong style={{ display: 'block', marginBottom: '4px', fontSize }}>
          {label}:
        </Text>
      )}
      <Space align="center">
        <Text
          code
          style={{
            fontFamily: 'monospace',
            fontSize,
            padding: '4px 8px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            minWidth: '120px',
            display: 'inline-block',
            letterSpacing: showPasscode ? 'normal' : '2px'
          }}
          aria-label={`${label}: ${showPasscode ? passcode : 'tersembunyi'}`}
        >
          {displayPasscode}
        </Text>
        
        <Tooltip title={showPasscode ? "Sembunyikan passcode" : "Tampilkan passcode"}>
          <Button
            type="text"
            size="small"
            icon={showPasscode ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={togglePasscodeVisibility}
            aria-label={showPasscode ? "Sembunyikan passcode" : "Tampilkan passcode"}
            style={{ padding: '4px' }}
          />
        </Tooltip>

        {copyable && (
          <Tooltip title="Salin passcode">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopy}
              aria-label="Salin passcode ke clipboard"
              style={{ padding: '4px' }}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  );
}