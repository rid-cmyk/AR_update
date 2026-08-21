"use client";

import { useMemo } from "react";
import type { TablePaginationConfig } from "antd";

interface UseTablePaginationOptions {
  pageSize?: number;
  /** Label total yang tampil di `showTotal`, mis. "santri" atau "nilai ujian" */
  totalLabel?: string;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

/**
 * Hook yang menghasilkan konfigurasi `pagination` Table Ant Design secara
 * konsisten (pageSize 10, showSizeChanger, showQuickJumper, showTotal)
 * sehingga object berulang di ~20 halaman tidak diduplikasi.
 */
export function useTablePagination(
  options: UseTablePaginationOptions = {}
): TablePaginationConfig {
  const {
    pageSize = 10,
    totalLabel = "data",
    showSizeChanger = true,
    showQuickJumper = true,
    showTotal = true,
  } = options;

  return useMemo(
    () => ({
      pageSize,
      showSizeChanger,
      showQuickJumper,
      ...(showTotal
        ? {
            showTotal: (total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} dari ${total} ${totalLabel}`,
          }
        : {}),
    }),
    [pageSize, totalLabel, showSizeChanger, showQuickJumper, showTotal]
  );
}
