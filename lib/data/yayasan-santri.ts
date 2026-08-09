import { cache } from 'react';
import { prisma } from '@/lib/database/prisma';

export const getYayasanSantriList = cache(async (searchQuery?: string) => {
  const users = await prisma.user.findMany({
    where: {
      role: { name: 'santri' },
      ...(searchQuery ? {
        OR: [
          { namaLengkap: { contains: searchQuery, mode: 'insensitive' } },
          { username: { contains: searchQuery, mode: 'insensitive' } }
        ]
      } : {})
    },
    select: {
      id: true,
      namaLengkap: true,
      username: true,
      HalaqahSantri: {
        select: {
          halaqah: { select: { namaHalaqah: true } }
        }
      },
      _count: {
        select: { Hafalan: true }
      }
    },
    orderBy: { namaLengkap: 'asc' }
  });

  return users.map(user => ({
    id: user.id,
    namaLengkap: user.namaLengkap,
    username: user.username,
    halaqah: user.HalaqahSantri[0]?.halaqah?.namaHalaqah || 'Belum ada halaqah',
    totalHafalan: user._count.Hafalan
  }));
});
