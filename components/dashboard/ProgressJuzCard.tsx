"use client";

import React from 'react';
import { Card } from 'antd';

interface ProgressJuzCardProps {
  juzProgress?: any[];
}

export default function ProgressJuzCard({ juzProgress = [] }: ProgressJuzCardProps) {
  return (
    <Card title="Progress Hafalan per Juz">
      <div>
        <p>Progress hafalan akan ditampilkan di sini</p>
        <p>Total Juz: {juzProgress.length}</p>
      </div>
    </Card>
  );
}