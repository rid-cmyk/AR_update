import { describe, it, expect } from 'vitest';
import { hafalanCreateSchema, parseBodyWithSchema } from '@/lib/services/validation.service';

describe('validation.service', () => {
  describe('hafalanCreateSchema', () => {
    const validBody = {
      santriId: 10,
      surat: 'Al-Mulk',
      ayatMulai: 1,
      ayatSelesai: 10,
      status: 'ziyadah',
      tanggal: '2023-01-01',
    };

    it('accepts numeric ids and ayat', () => {
      const parsed = parseBodyWithSchema(hafalanCreateSchema, validBody);
      expect(parsed.ok).toBe(true);
      if (parsed.ok) expect(parsed.data.surat).toBe('Al-Mulk');
    });

    it('accepts string ids and ayat (legacy client format)', () => {
      const parsed = parseBodyWithSchema(hafalanCreateSchema, {
        ...validBody,
        santriId: '10',
        ayatMulai: '1',
        ayatSelesai: '10',
      });
      expect(parsed.ok).toBe(true);
    });

    it('rejects invalid status', () => {
      const parsed = parseBodyWithSchema(hafalanCreateSchema, { ...validBody, status: 'ngawur' });
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) expect(parsed.message).toContain('status');
    });

    it('rejects ayatSelesai < ayatMulai', () => {
      const parsed = parseBodyWithSchema(hafalanCreateSchema, {
        ...validBody,
        ayatMulai: 10,
        ayatSelesai: 5,
      });
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) expect(parsed.message).toContain('ayatSelesai');
    });

    it('rejects unparseable tanggal', () => {
      const parsed = parseBodyWithSchema(hafalanCreateSchema, {
        ...validBody,
        tanggal: 'bukan-tanggal',
      });
      expect(parsed.ok).toBe(false);
    });

    it('rejects empty surat and non-positive santriId', () => {
      expect(parseBodyWithSchema(hafalanCreateSchema, { ...validBody, surat: '' }).ok).toBe(false);
      expect(parseBodyWithSchema(hafalanCreateSchema, { ...validBody, santriId: -1 }).ok).toBe(false);
      expect(parseBodyWithSchema(hafalanCreateSchema, { ...validBody, santriId: 'abc' }).ok).toBe(false);
    });

    it('reports the failing field in the message', () => {
      const parsed = parseBodyWithSchema(hafalanCreateSchema, { ...validBody, keterangan: 'x'.repeat(501) });
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) expect(parsed.message).toContain('keterangan');
    });
  });

  describe('parseBodyWithSchema', () => {
    it('returns ok:false with field path for nested issues', () => {
      const schema = hafalanCreateSchema;
      const parsed = parseBodyWithSchema(schema, null);
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) expect(typeof parsed.message).toBe('string');
    });
  });
});
