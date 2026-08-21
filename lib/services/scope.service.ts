import { prisma } from '@/lib/database/prisma';

interface ScopeUser {
  id: number;
  role: { name: string };
}

interface ScopeOptions {
  halaqahId?: number;
}

/**
 * Resolve santri IDs based on user role.
 * - super_admin / admin / yayasan: returns all santri IDs (optionally filtered by halaqahId)
 * - guru: returns santri IDs from guru's assigned halaqah (optionally filtered by halaqahId)
 * - santri: returns [userId] (santri can only access own data)
 * - ortu: returns santri IDs linked to this parent
 */
export async function resolveSantriIdsByRole(
  user: ScopeUser,
  opts?: ScopeOptions
): Promise<number[]> {
  const roleName = user.role.name;

  switch (roleName) {
    case 'super_admin':
    case 'admin':
    case 'yayasan': {
      const where: Record<string, unknown> = {};
      if (opts?.halaqahId) {
        where.HalaqahSantri = { some: { halaqahId: opts.halaqahId } };
      }
      const santris = await prisma.santri.findMany({
        where,
        select: { id: true },
      });
      return santris.map((s) => s.id);
    }

    case 'guru': {
      const halaqahWhere: Record<string, unknown> = { guruId: user.id };
      if (opts?.halaqahId) {
        halaqahWhere.id = opts.halaqahId;
      }
      const halaqahList = await prisma.halaqah.findMany({
        where: halaqahWhere,
        include: {
          santri: {
            include: {
              santri: { select: { id: true } },
            },
          },
        },
      });
      const santriIds: number[] = [];
      halaqahList.forEach((h) => {
        h.santri.forEach((hs) => {
          santriIds.push(hs.santri.id);
        });
      });
      return santriIds;
    }

    case 'santri': {
      const santri = await prisma.santri.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      return santri ? [santri.id] : [];
    }

    case 'ortu': {
      const relations = await prisma.orangTuaSantri.findMany({
        where: { orangTuaId: user.id },
        select: { santriId: true },
      });
      return relations.map((r) => r.santriId);
    }

    default:
      return [];
  }
}
