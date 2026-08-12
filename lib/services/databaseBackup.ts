export interface TableInfo {
  name: string;
  displayName: string;
  recordCount: number;
  lastUpdated: string;
  size: string;
  description: string;
  category: 'core' | 'data' | 'system' | 'logs';
}

export interface BackupHistory {
  id: string;
  timestamp: string;
  type: 'full' | 'partial';
  tables: string[];
  size: string;
  status: 'success' | 'failed' | 'in_progress';
}

export interface ImportResult {
  recordsImported: number;
}

export const fetchDatabaseInfo = async (): Promise<TableInfo[]> => {
  const response = await fetch('/api/database/info');
  if (!response.ok) throw new Error('Failed to fetch database info');
  const data = await response.json();
  return data.tables;
};

export const fetchBackupHistory = async (): Promise<BackupHistory[]> => {
  const response = await fetch('/api/database/backup-history');
  if (!response.ok) throw new Error('Failed to fetch backup history');
  const data = await response.json();
  return data.history;
};

export const exportDatabase = async (tables: string[]): Promise<Blob> => {
  const response = await fetch('/api/database/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tables })
  });
  if (!response.ok) throw new Error('Export failed');
  return response.blob();
};

export const importDatabase = async (file: File): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/database/import', {
    method: 'POST',
    body: formData
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Import failed');
  }
  return response.json();
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

const CATEGORY_COLORS: Record<string, string> = {
  core: '#1890ff',
  data: '#52c41a',
  system: '#fa8c16',
  logs: '#722ed1'
};

export interface CategoryStat {
  category: string;
  count: number;
  color: string;
}

export const getCategoryStats = (tables: TableInfo[]): CategoryStat[] => {
  const counts = tables.reduce((acc, table) => {
    acc[table.category] = (acc[table.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).map(([category, count]) => ({
    category,
    count,
    color: CATEGORY_COLORS[category] || '#666'
  }));
};
