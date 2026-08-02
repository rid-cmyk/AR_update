import React from 'react';
import { Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  /** Judul pesan keadaan kosong (bahasa Indonesia) */
  title?: string;
  /** Penjelasan detail atau petunjuk langkah selanjutnya */
  description?: string;
  /** Ikon kustom opsional */
  icon?: React.ReactNode;
  /** Teks pada tombol aksi CTA opsional */
  actionLabel?: string;
  /** Callback saat tombol CTA diklik */
  onAction?: () => void;
  /** Kelas CSS tambahan */
  className?: string;
}

/**
 * Komponen EmptyState standar WCAG 2.1 AA yang responsif untuk tabel, daftar, dan grafik.
 * Menghindari tampilan layar kosong atau pesan default tanpa arah.
 */
export function EmptyState({
  title = 'Tidak Ada Data',
  description = 'Belum ada data yang tersedia saat ini.',
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center py-10 px-4 sm:py-14 sm:px-6 rounded-lg border border-dashed border-gray-200 bg-gray-50/50',
        className
      )}
    >
      <div
        className="mb-3 text-3xl sm:text-4xl text-gray-400 select-none"
        aria-hidden="true"
      >
        {icon || <InboxOutlined />}
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-gray-800 m-0">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm m-0">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button
            type="primary"
            onClick={onAction}
            className="text-xs sm:text-sm"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
