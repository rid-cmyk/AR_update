'use client';

import React from 'react';
import LayoutApp from '@/components/layout/LayoutApp';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutApp>{children}</LayoutApp>;
}
