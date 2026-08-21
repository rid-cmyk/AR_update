import { useState, useMemo } from 'react';
import { useDebounce } from './generic';

export interface UseTableFilterOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  initialPageSize?: number;
  additionalFilters?: Record<string, (item: T, value: string) => boolean>;
}

export function useTableFilter<T extends Record<string, any>>({
  data,
  searchFields,
  initialPageSize = 10,
  additionalFilters,
}: UseTableFilterOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((item) => {
      // 1. Filter Pencarian Query
      if (debouncedSearch) {
        const matchesSearch = searchFields.some((field) => {
          const val = item[field];
          return val ? String(val).toLowerCase().includes(debouncedSearch.toLowerCase()) : false;
        });
        if (!matchesSearch) return false;
      }

      // 2. Filter Status
      if (filterStatus !== 'all' && item.status !== undefined) {
        if (String(item.status).toLowerCase() !== filterStatus.toLowerCase()) {
          return false;
        }
      }

      // 3. Extra Filters
      if (additionalFilters) {
        const matchesExtra = Object.entries(extraFilters).every(([key, value]) => {
          const filterFn = additionalFilters[key];
          return filterFn ? filterFn(item, value) : true;
        });
        if (!matchesExtra) return false;
      }

      return true;
    }).sort((a, b) => {
      if (!sortField) return 0;
      const aVal = String(a[sortField]);
      const bVal = String(b[sortField]);
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  }, [data, debouncedSearch, filterStatus, searchFields, extraFilters, additionalFilters, sortField, sortOrder]);

  return {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    extraFilters,
    setExtraFilters,
    filteredData,
    total: filteredData.length,
  };
}
