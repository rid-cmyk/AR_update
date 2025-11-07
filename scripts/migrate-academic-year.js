// Script untuk migrasi data existing ke sistem tahun akademik
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function untuk menentukan tahun akademik berdasarkan tanggal
function getAcademicYearFromDate(date) {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1; // 1-12

  if (currentMonth >= 1 && currentMonth <= 6) {
    // Januari - Juni: Semester 2
    return {
      tahunMulai: currentYear - 1,
      tahunSelesai: currentYear,
      semester: 'S2'
    };
  } else {
    // Juli - Desember: Semester 1
    return {
      tahunMulai: currentYear,
      tahunSelesai: currentYear + 1,
      semester: 'S1'
    };
  }
}

async function findOrCreateAcademicYear(date) {
  const academicYearInfo = getAcademicYearFromDate(date);
  
  // Cari tahun akademik yang sesuai
  let academicYear = await prisma.tahunAjaran.findUnique({
    where: {
      tahunMulai_tahunSelesai_semester: {
        tahunMulai: academicYearInfo.tahunMulai,
        tahunSelesai: academicYearInfo.tahunSelesai,
        semester: academicYearInfo.semester
      }
    }
  });

  // Jika tidak ada, buat baru
  if (!academicYear) {
    const namaLengkap = `${academicYearInfo.tahunMulai}/${academicYearInfo.tahunSelesai} Semester ${academicYearInfo.semester === 'S1' ? '1' : '2'}`;
    
    let tanggalMulai, tanggalSelesai;
    if (academicYearInfo.semester === 'S1') {
      tanggalMulai = new Date(academicYearInfo.tahunMulai, 6, 1); // 1 Juli
      tanggalSelesai = new Date(academicYearInfo.tahunMulai, 11, 31); // 31 Desember
    } else {
      tanggalMulai = new Date(academicYearInfo.tahunSelesai, 0, 1); // 1 Januari
      tanggalSelesai = new Date(academicYearInfo.tahunSelesai, 5, 30); // 30 Juni
    }

    academicYear = await prisma.tahunAjaran.create({
      data: {
        tahunMulai: academicYearInfo.tahunMulai,
        tahunSelesai: academicYearInfo.tahunSelesai,
        semester: academicYearInfo.semester,
        namaLengkap,
        tanggalMulai,
        tanggalSelesai,
        isActive: false
      }
    });

    console.log(`✅ Created academic year: ${namaLengkap}`);
  }

  return academicYear;
}

async function migrateTableData(tableName, model, dateField = 'createdAt') {
  console.log(`\n🔄 Migrating ${tableName}...`);
  
  try {
    // Ambil data yang belum memiliki tahunAjaranId
    const records = await model.findMany({
      where: {
        OR: [
          { tahunAjaranId: null },
          { tahunAjaranId: undefined }
        ]
      },
      select: {
        id: true,
        [dateField]: true
      }
    });

    console.log(`📊 Found ${records.length} records to migrate`);

    let migrated = 0;
    for (const record of records) {
      try {
        const referenceDate = record[dateField] || new Date();
        const academicYear = await findOrCreateAcademicYear(referenceDate);
        
        await model.update({
          where: { id: record.id },
          data: { tahunAjaranId: academicYear.id }
        });
        
        migrated++;
        
        if (migrated % 100 === 0) {
          console.log(`   📈 Migrated ${migrated}/${records.length} records...`);
        }
      } catch (error) {
        console.error(`   ❌ Error migrating record ${record.id}:`, error.message);
      }
    }

    console.log(`✅ Successfully migrated ${migrated} ${tableName} records`);
    return migrated;
  } catch (error) {
    console.error(`❌ Error migrating ${tableName}:`, error);
    return 0;
  }
}

async function main() {
  console.log('🚀 Starting Academic Year Migration...\n');

  try {
    // Daftar tabel yang perlu dimigrasi
    const tablesToMigrate = [
      { name: 'Absensi', model: prisma.absensi, dateField: 'tanggal' },
      { name: 'Hafalan', model: prisma.hafalan, dateField: 'tanggal' },
      { name: 'Ujian', model: prisma.ujian, dateField: 'tanggalUjian' },
      { name: 'UjianSantri', model: prisma.ujianSantri, dateField: 'tanggalUjian' },
      { name: 'Prestasi', model: prisma.prestasi, dateField: 'tanggal' },
      { name: 'TargetHafalan', model: prisma.targetHafalan, dateField: 'createdAt' },
      { name: 'RaportSantri', model: prisma.raportSantri, dateField: 'createdAt' },
      { name: 'Notifikasi', model: prisma.notifikasi, dateField: 'tanggal' },
      { name: 'Pengumuman', model: prisma.pengumuman, dateField: 'tanggal' }
    ];

    let totalMigrated = 0;

    for (const table of tablesToMigrate) {
      const migrated = await migrateTableData(table.name, table.model, table.dateField);
      totalMigrated += migrated;
    }

    // Set tahun akademik saat ini sebagai aktif
    console.log('\n🔄 Setting current academic year as active...');
    const currentDate = new Date();
    const currentAcademicYear = await findOrCreateAcademicYear(currentDate);
    
    // Nonaktifkan semua tahun akademik
    await prisma.tahunAjaran.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Aktifkan tahun akademik saat ini
    await prisma.tahunAjaran.update({
      where: { id: currentAcademicYear.id },
      data: { isActive: true }
    });

    console.log(`✅ Set ${currentAcademicYear.namaLengkap} as active`);

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total records migrated: ${totalMigrated}`);
    console.log(`📅 Active academic year: ${currentAcademicYear.namaLengkap}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan migrasi
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});