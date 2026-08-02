/**
 * Error Recovery and Safe Fallback Utility
 * Implements patterns from /agent-skills:debugging-and-error-recovery
 */

export interface ParsedError {
  code: string;
  message: string;
  status: number;
}

/**
 * Safely parse and classify database (Prisma) or runtime errors without leaking sensitive stack traces
 */
export function parsePrismaError(error: unknown): ParsedError {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: unknown }).code);

    switch (code) {
      case 'P2002':
        return {
          code,
          message: 'Data sudah ada (duplikat). Silakan periksa kembali entri Anda.',
          status: 409,
        };
      case 'P2025':
        return {
          code,
          message: 'Data tidak ditemukan di dalam database.',
          status: 404,
        };
      case 'P2003':
        return {
          code,
          message: 'Referensi data tidak valid atau berelasi dengan data lain.',
          status: 400,
        };
      case 'P1001':
      case 'P1008':
        return {
          code,
          message: 'Koneksi ke database tidak dapat dilakukan atau waktu habis (timeout).',
          status: 503,
        };
      default:
        return {
          code,
          message: 'Terjadi kesalahan pada database.',
          status: 500,
        };
    }
  }

  if (error instanceof Error) {
    // Avoid returning raw SQL syntax errors to users
    if (error.message.toLowerCase().includes('timeout')) {
      return {
        code: 'TIMEOUT',
        message: 'Waktu permintaan habis (timeout). Silakan coba lagi.',
        status: 504,
      };
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Terjadi kesalahan internal pada server.',
    status: 500,
  };
}

/**
 * Execute an async operation with a safe fallback value if it throws
 * Useful for non-critical side effects (e.g., WA notifications, analytics)
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  fallback: T,
  onError?: (error: unknown) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (onError) {
      try {
        onError(error);
      } catch {
        // Suppress errors in error handler
      }
    }
    return fallback;
  }
}

/**
 * Determine if an error is a network or timeout error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('fetch failed') ||
    msg.includes('aborted')
  );
}
