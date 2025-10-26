"use client";

import React, { useState } from 'react';
import { Input, Tooltip } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined } from '@ant-design/icons';

interface PasscodeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  style?: React.CSSProperties;
  autoComplete?: string;
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
  maxLength?: number;
  onPressEnter?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export default function PasscodeInput({
  value,
  onChange,
  placeholder = "Masukkan passcode Anda",
  disabled = false,
  size = 'large',
  style,
  autoComplete = "current-password",
  id = "passcode-input",
  name = "passcode",
  required = false,
  className,
  maxLength,
  onPressEnter,
  'aria-label': ariaLabel = "Kolom input passcode",
  'aria-describedby': ariaDescribedBy,
  ...props
}: PasscodeInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <Input
      {...props}
      id={id}
      name={name}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      size={size}
      className={className}
      maxLength={maxLength}
      onPressEnter={onPressEnter}
      style={{
        borderRadius: '8px',
        ...style
      }}
      autoComplete={autoComplete}
      required={required}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      prefix={
        <LockOutlined 
          style={{ color: '#bfbfbf' }} 
          aria-hidden="true"
        />
      }
      suffix={
        <Tooltip 
          title={showPassword ? "Sembunyikan passcode" : "Tampilkan passcode"}
          placement="top"
        >
          <button
            type="button"
            onClick={togglePasswordVisibility}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bfbfbf',
              transition: 'color 0.2s'
            }}
            aria-label={showPassword ? "Sembunyikan passcode" : "Tampilkan passcode"}
            tabIndex={0}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1890ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#bfbfbf';
            }}
          >
            {showPassword ? (
              <EyeInvisibleOutlined style={{ fontSize: '16px' }} />
            ) : (
              <EyeOutlined style={{ fontSize: '16px' }} />
            )}
          </button>
        </Tooltip>
      }
    />
  );
}