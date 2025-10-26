"use client";

import React from 'react';
import { Card as AntCard } from 'antd';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <AntCard className={className} style={{ borderRadius: 12 }}>
      {children}
    </AntCard>
  );
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={className} style={{ marginBottom: 16 }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={className} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}