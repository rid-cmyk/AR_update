import { z } from 'zod';

/**
 * Validate that all required fields are present in the request body.
 * Throws an error with a descriptive message if any field is missing.
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  body: T,
  fields: (keyof T)[]
): void {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ''
  );
  if (missing.length > 0) {
    throw new Error(`Data tidak lengkap: ${missing.join(', ')}`);
  }
}

/**
 * Parse pagination parameters from URL search params.
 * Returns page, limit, and skip (offset) values.
 */
export function parsePagination(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Zod request-body schemas untuk endpoint tulis.
 * Endpoint baru wajib memvalidasi body via parseBodyWithSchema + schema di sini.
 */
const idLike = z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]);
const ayatLike = z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]);

export const hafalanCreateSchema = z
  .object({
    santriId: idLike,
    surat: z.string().trim().min(1).max(100),
    ayatMulai: ayatLike,
    ayatSelesai: ayatLike,
    status: z.enum(['ziyadah', 'murojaah']),
    tanggal: z.string().refine((v) => !isNaN(Date.parse(v)), 'Tanggal tidak valid').optional(),
    keterangan: z.string().max(500).optional(),
  })
  .refine((d) => Number(d.ayatSelesai) >= Number(d.ayatMulai), {
    message: 'ayatSelesai harus >= ayatMulai',
    path: ['ayatSelesai'],
  });

export type ParsedBody<T> = { ok: true; data: T } | { ok: false; message: string };

/**
 * Validasi body request dengan schema zod.
 * Return discriminated union — route tinggal balas ApiResponse.error(message, 400).
 */
export function parseBodyWithSchema<S extends z.ZodTypeAny>(
  schema: S,
  body: unknown
): ParsedBody<z.infer<S>> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue?.path?.join('.') || 'body';
    return { ok: false, message: `${field}: ${issue?.message || 'Data tidak valid'}` };
  }
  return { ok: true, data: result.data };
}
