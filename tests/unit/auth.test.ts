import { describe, it, expect } from 'vitest';
import { hasRole, AuthUser } from '@/lib/auth';

describe('AuthHelpers', () => {
  describe('hasRole', () => {
    const makeUser = (roleName: string): AuthUser => ({
      id: 1,
      username: 'testuser',
      namaLengkap: 'Test User',
      role: { name: roleName },
    });

    it('returns true when user role matches one of the required roles', () => {
      const guruUser = makeUser('guru');
      expect(hasRole(guruUser, ['guru', 'admin'])).toBe(true);
      expect(hasRole(guruUser, ['guru'])).toBe(true);
    });

    it('returns false when user role is not in the required roles list', () => {
      const santriUser = makeUser('santri');
      expect(hasRole(santriUser, ['guru', 'admin', 'super_admin'])).toBe(false);
    });

    it('returns false when required roles array is empty', () => {
      const adminUser = makeUser('admin');
      expect(hasRole(adminUser, [])).toBe(false);
    });
  });
});
