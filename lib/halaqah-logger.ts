import prisma from '@/lib/database/prisma';

export interface HalaqahLogData {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  halaqahId: number;
  halaqahName: string;
  userId: number;
  details?: any;
}

export async function logHalaqahAction(data: HalaqahLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        action: `HALAQAH_${data.action}`,
        keterangan: `${data.action} halaqah "${data.halaqahName}" (ID: ${data.halaqahId})${
          data.details ? ` - Details: ${JSON.stringify(data.details)}` : ''
        }`,
        userId: data.userId
      }
    });
    
    console.log(`Halaqah ${data.action}: ${data.halaqahName} by user ${data.userId}`);
  } catch (error) {
    console.error('Failed to log halaqah action:', error);
  }
}

export async function validateHalaqahData(halaqahId: number) {
  try {
    const halaqah = await prisma.halaqah.findUnique({
      where: { id: halaqahId },
      include: {
        santri: {
          include: {
            santri: true
          }
        },
        guru: true
      }
    });

    if (!halaqah) {
      throw new Error(`Halaqah with ID ${halaqahId} not found`);
    }

    const validation = {
      id: halaqah.id,
      name: halaqah.namaHalaqah,
      hasGuru: !!halaqah.guru,
      santriCount: halaqah.santri.length,
      isValid: halaqah.santri.length >= 5 && !!halaqah.guru,
      issues: [] as string[]
    };

    if (halaqah.santri.length < 5) {
      validation.issues.push(`Insufficient santri count: ${halaqah.santri.length}/5`);
    }

    if (!halaqah.guru) {
      validation.issues.push('No guru assigned');
    }

    return validation;
  } catch (error) {
    console.error('Error validating halaqah data:', error);
    throw error;
  }
}