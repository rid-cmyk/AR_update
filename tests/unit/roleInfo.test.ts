import { describe, it, expect } from 'vitest';
import {
  getRoleInfo,
  canEditSelfPasscode,
  canEditPhoto,
} from '@/components/profile/roleInfo';

describe('roleInfo', () => {
  describe('getRoleInfo', () => {
    it('mengembalikan konfigurasi role yang dikenali', () => {
      const guru = getRoleInfo('guru');
      expect(guru.title).toBe('Guru/Ustadz');
      expect(guru.permissions).toContain('Penilaian ujian');
    });

    it('case-insensitive terhadap nama role', () => {
      expect(getRoleInfo('ADMIN').title).toBe('Administrator');
    });

    it('fallback ke santri untuk role tidak dikenal', () => {
      const fallback = getRoleInfo('role_tidak_ada');
      expect(fallback.title).toBe('Santri');
    });

    it('setiap role memiliki warna dan ikon', () => {
      ['super_admin', 'admin', 'guru', 'santri', 'ortu', 'yayasan'].forEach(role => {
        const info = getRoleInfo(role);
        expect(info.color).toMatch(/^#/);
        expect(info.icon).toBeTruthy();
      });
    });
  });

  describe('canEditSelfPasscode', () => {
    it('hanya super_admin dan admin yang boleh edit passcode sendiri', () => {
      expect(canEditSelfPasscode('super_admin')).toBe(true);
      expect(canEditSelfPasscode('admin')).toBe(true);
      expect(canEditSelfPasscode('guru')).toBe(false);
      expect(canEditSelfPasscode('santri')).toBe(false);
    });

    it('case-insensitive', () => {
      expect(canEditSelfPasscode('ADMIN')).toBe(true);
    });
  });

  describe('canEditPhoto', () => {
    it('santri tidak boleh edit foto sendiri', () => {
      expect(canEditPhoto('santri')).toBe(false);
      expect(canEditPhoto('guru')).toBe(true);
      expect(canEditPhoto('admin')).toBe(true);
    });
  });
});
