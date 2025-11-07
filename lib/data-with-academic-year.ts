import { getActiveAcademicYear, getAcademicYearByDate } from './tahun-akademik';

/**
 * Helper untuk menambahkan tahun akademik ke data yang akan disimpan
 */
export async function withAcademicYear<T extends Record<string, any>>(
  data: T,
  customDate?: Date
): Promise<T & { tahunAjaranId: number }> {
  try {
    let academicYear;
    
    if (customDate) {
      // Gunakan tanggal custom untuk menentukan tahun akademik
      academicYear = await getAcademicYearByDate(customDate);
      
      if (!academicYear) {
        // Jika tidak ditemukan, gunakan tahun akademik aktif
        academicYear = await getActiveAcademicYear();
      }
    } else {
      // Gunakan tahun akademik aktif
      academicYear = await getActiveAcademicYear();
    }

    return {
      ...data,
      tahunAjaranId: academicYear.id
    };
  } catch (error) {
    console.error('Error adding academic year to data:', error);
    throw new Error('Gagal menambahkan tahun akademik ke data');
  }
}

/**
 * Helper untuk filter data berdasarkan tahun akademik
 */
export function createAcademicYearFilter(tahunAjaranId?: number | string) {
  if (!tahunAjaranId) {
    return {};
  }

  const id = typeof tahunAjaranId === 'string' ? parseInt(tahunAjaranId) : tahunAjaranId;
  
  return {
    tahunAjaranId: id
  };
}

/**
 * Helper untuk mendapatkan query parameter tahun akademik
 */
export function getAcademicYearFromQuery(searchParams: URLSearchParams) {
  const tahunAjaranId = searchParams.get('tahunAjaranId');
  
  if (tahunAjaranId && !isNaN(parseInt(tahunAjaranId))) {
    return parseInt(tahunAjaranId);
  }
  
  return undefined;
}

/**
 * Helper untuk include tahun akademik dalam query
 */
export const includeAcademicYear = {
  tahunAjaran: {
    select: {
      id: true,
      namaLengkap: true,
      tahunMulai: true,
      tahunSelesai: true,
      semester: true,
      isActive: true
    }
  }
};

/**
 * Middleware untuk memastikan data memiliki tahun akademik
 */
export async function ensureDataHasAcademicYear(
  model: any,
  data: any,
  options?: {
    dateField?: string;
    skipIfExists?: boolean;
  }
) {
  const { dateField = 'createdAt', skipIfExists = true } = options || {};

  try {
    // Jika sudah ada tahunAjaranId dan skipIfExists true, skip
    if (skipIfExists && data.tahunAjaranId) {
      return data;
    }

    // Tentukan tanggal untuk menentukan tahun akademik
    const referenceDate = data[dateField] ? new Date(data[dateField]) : new Date();
    
    // Tambahkan tahun akademik
    return await withAcademicYear(data, referenceDate);
  } catch (error) {
    console.error('Error ensuring data has academic year:', error);
    throw error;
  }
}

/**
 * Batch update untuk menambahkan tahun akademik ke data yang sudah ada
 */
export async function addAcademicYearToExistingData(
  model: any,
  tableName: string,
  dateField: string = 'createdAt'
) {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    console.log(`🔄 Adding academic year to existing ${tableName} data...`);

    // Ambil data yang belum memiliki tahunAjaranId
    const dataWithoutAcademicYear = await model.findMany({
      where: {
        tahunAjaranId: null
      },
      select: {
        id: true,
        [dateField]: true
      }
    });

    console.log(`📊 Found ${dataWithoutAcademicYear.length} records without academic year`);

    let updated = 0;
    for (const record of dataWithoutAcademicYear) {
      try {
        const referenceDate = record[dateField] || new Date();
        const academicYear = await getAcademicYearByDate(referenceDate);
        
        if (academicYear) {
          await model.update({
            where: { id: record.id },
            data: { tahunAjaranId: academicYear.id }
          });
          updated++;
        }
      } catch (error) {
        console.error(`Error updating record ${record.id}:`, error);
      }
    }

    console.log(`✅ Updated ${updated} ${tableName} records with academic year`);
    return updated;

  } catch (error) {
    console.error(`Error adding academic year to ${tableName}:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}