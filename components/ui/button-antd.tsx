"use client";

import React from 'react';
import { Button as AntButton } from 'antd';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className,
  disabled,
  type = 'button'
}: ButtonProps) {
  const getAntType = () => {
    switch (variant) {
      case 'destructive': return 'primary';
      case 'outline': return 'default';
      case 'ghost': return 'text';
      case 'link': return 'link';
      default: return 'primary';
    }
  };

  const getAntSize = () => {
    switch (size) {
      case 'sm': return 'small';
      case 'lg': return 'large';
      default: return 'middle';
    }
  };

  return (
    <AntButton
      type={getAntType()}
      size={getAntSize()}
      onClick={onClick}
      className={className}
      disabled={disabled}
      htmlType={type}
      danger={variant === 'destructive'}
    >
      {children}
    </AntButton>
  );
}