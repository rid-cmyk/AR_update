import { prisma } from "../database/prisma";

/**
 * Authorization Guard Service
 * Provides O(1) index-backed database authorization checks (Zero memory-allocation).
 * Prevents Broken Object-Level Authorization (BOLA) and Insecure Direct Object References (IDOR).
 */

/**
 * Checks if a Guru is authorized to view/modify a specific Santri (by halaqah assignment).
 */
export async function isGuruAuthorizedForSantri(guruId: number, santriId: number): Promise<boolean> {
  const relation = await prisma.halaqahSantri.findFirst({
    where: {
      santriId: santriId,
      halaqah: { guruId: guruId },
    },
    select: { id: true },
  });
  return !!relation;
}

/**
 * Checks if a Guru is authorized to view/modify a specific Hafalan record.
 */
export async function isGuruAuthorizedForHafalan(guruId: number, hafalanId: number): Promise<boolean> {
  const hafalan = await prisma.hafalan.findFirst({
    where: {
      id: hafalanId,
      santri: {
        HalaqahSantri: {
          some: {
            halaqah: { guruId: guruId },
          },
        },
      },
    },
    select: { id: true },
  });
  return !!hafalan;
}

/**
 * Checks if an Orang Tua is authorized to view a specific Santri record.
 */
export async function isOrtuAuthorizedForSantri(ortuUserId: number, santriId: number): Promise<boolean> {
  const relation = await prisma.orangTuaSantri.findFirst({
    where: {
      orangTuaId: ortuUserId,
      santriId: santriId,
    },
    select: { id: true },
  });
  return !!relation;
}

/**
 * Checks if a Santri is accessing their own record.
 */
export async function isSantriSelf(userId: number, santriId: number): Promise<boolean> {
  const santri = await prisma.santri.findFirst({
    where: {
      id: santriId,
      userId: userId,
    },
    select: { id: true },
  });
  return !!santri;
}
