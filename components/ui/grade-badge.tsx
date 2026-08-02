import React from 'react';
import { Tag } from 'antd';
import { cn } from '@/lib/utils';
import {
  calculateGradeLetter,
  calculateGradeColor,
  calculatePredikat,
} from '@/lib/utils/hafalanAssessment';

export interface GradeBadgeProps {
  /** Nilai angka dari 0-100 */
  nilai?: number | null;
  /** Ukuran badge: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Tampilkan predikat kehormatan seperti Mumtaz (Istimewa) */
  showPredikat?: boolean;
  /** Tampilkan angka nilai di samping huruf mutu */
  showNilai?: boolean;
  /** Kelas CSS tambahan */
  className?: string;
}

/**
 * Komponen GradeBadge standar berstandar WCAG 2.1 AA untuk menampilkan
 * Nilai, Huruf Mutu, dan Predikat santri di tabel dan rapor.
 */
export function GradeBadge({
  nilai,
  size = 'md',
  showPredikat = false,
  showNilai = false,
  className,
}: GradeBadgeProps) {
  const letter = calculateGradeLetter(nilai);
  const colorHex = calculateGradeColor(nilai);
  const predikat = calculatePredikat(nilai);

  const sizeClassNames = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1 font-medium',
    lg: 'text-base px-3 py-1.5 font-semibold',
  }[size];

  const ariaLabelText =
    nilai != null
      ? `Nilai ${nilai}, Huruf Mutu ${letter}${showPredikat ? `, Predikat ${predikat}` : ''}`
      : 'Belum Ada Nilai';

  return (
    <span
      role="status"
      aria-label={ariaLabelText}
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      <Tag
        color={colorHex}
        className={cn('m-0 rounded border-0', sizeClassNames)}
      >
        <span>{letter}</span>
        {showNilai && nilai != null && (
          <span className="ml-1 opacity-90">({nilai})</span>
        )}
      </Tag>
      {showPredikat && (
        <span className="text-xs sm:text-sm text-gray-600 font-normal">
          {predikat}
        </span>
      )}
    </span>
  );
}
