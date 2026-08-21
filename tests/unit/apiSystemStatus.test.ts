import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/super-admin/system-status/route';
import { withAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/database/prisma';

vi.mock('@/lib/api-helpers', () => ({
  withAuth: vi.fn(),
  ApiResponse: {
    success: vi.fn((data, status = 200) => {
      return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
    }),
    error: vi.fn((message, status = 400) => {
      return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
    }),
    unauthorized: vi.fn((msg = 'Unauthorized') => {
      return new Response(JSON.stringify({ error: msg }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }),
    forbidden: vi.fn((msg = 'Forbidden') => {
      return new Response(JSON.stringify({ error: msg }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }),
    notFound: vi.fn((msg = 'Not found') => {
      return new Response(JSON.stringify({ error: msg }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }),
    serverError: vi.fn((msg = 'Internal server error') => {
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }),
  },
}));

vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    user: { count: vi.fn() },
    halaqah: { count: vi.fn() },
    hafalan: { count: vi.fn() },
    ujianSantri: { count: vi.fn() },
    absensi: { count: vi.fn() },
    raportSantri: { count: vi.fn() },
    templateUjian: { count: vi.fn() },
    templateRaport: { count: vi.fn() },
    auditLog: { findMany: vi.fn() },
    semester: { findFirst: vi.fn() },
  }
}));

const mockRequest = () => new Request('http://localhost:3000/api/super-admin/system-status');

describe('GET /api/super-admin/system-status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: null, error: 'Unauthorized' } as any);
    
    const req = mockRequest();
    const res = await GET(req);
    
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return system status if authorized as super_admin', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: '1', role: 'super-admin' } } as any);
    
    vi.mocked(prisma.user.count).mockResolvedValue(10);
    vi.mocked(prisma.halaqah.count).mockResolvedValue(2);
    vi.mocked(prisma.hafalan.count).mockResolvedValue(5);
    vi.mocked(prisma.ujianSantri.count).mockResolvedValue(3);
    vi.mocked(prisma.absensi.count).mockResolvedValue(20);
    vi.mocked(prisma.raportSantri.count).mockResolvedValue(4);
    vi.mocked(prisma.templateUjian.count).mockResolvedValue(1);
    vi.mocked(prisma.templateRaport.count).mockResolvedValue(1);
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([{ 
      id: 1, 
      action: 'BACKUP', 
      tanggal: new Date('2023-01-01T00:00:00Z'), 
      keterangan: 'backup.sql' 
    }] as any);
    vi.mocked(prisma.semester.findFirst).mockResolvedValue({ 
      id: 1, 
      namaSemester: 'Ganjil', 
      isActive: true, 
      tahunAjaran: { namaLengkap: '2023/2024' } 
    } as any);

    const req = mockRequest();
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    const data = await res.json();
    
    expect(data.status).toBe('healthy');
    expect(data.database.connected).toBe(true);
    expect(data.database.totalRecords).toBe(44);
    expect(data.summary.totalUsers).toBe(10);
    expect(data.academicYear.nama).toBe('2023/2024');
    expect(data.backup.fileName).toBe('backup.sql');
  });

  it('should return 500 unhealthy status if database fails', async () => {
    vi.mocked(withAuth).mockResolvedValueOnce({ user: { id: '1', role: 'super-admin' } } as any);
    vi.mocked(prisma.user.count).mockRejectedValueOnce(new Error('DB Error'));

    const req = mockRequest();
    const res = await GET(req);
    
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.status).toBe('unhealthy');
    expect(data.database.connected).toBe(false);
  });
});
