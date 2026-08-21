import { describe, it, expect } from 'vitest';
import { formatRoleName } from '@/components/layout/profileContentTypes';

describe('formatRoleName', () => {
  it('mengkapitalisasi huruf pertama nama role', () => {
    expect(formatRoleName('guru')).toBe('Guru');
    expect(formatRoleName('super-admin')).toBe('Super-admin');
  });

  it('membiarkan nama yang sudah kapital', () => {
    expect(formatRoleName('Yayasan')).toBe('Yayasan');
  });

  it('menangani string kosong', () => {
    expect(formatRoleName('')).toBe('');
  });
});
