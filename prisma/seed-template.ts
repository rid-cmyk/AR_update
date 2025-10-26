import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedTemplateSystem() {
  console.log('🌱 Seeding Template System...')

  // Create admin user if not exists
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' }
  })

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      namaLengkap: 'Administrator',
      roleId: adminRole.id
    }
  })

  // Create Tahun Akademik
  const tahunAkademik = await prisma.tahunAkademik.upsert({
    where: { tahunAkademik: '2024/2025' },
    update: {},
    create: {
      tahunAkademik: '2024/2025',
      tanggalMulai: new Date('2024-07-01'),
      tanggalSelesai: new Date('2025-06-30'),
      isActive: true,
      semester: 'S1',
      createdBy: adminUser.id
    }
  })

  // Create Template Ujian Tasmi'
  const templateTasmi = await prisma.templateUjian.create({
    data: {
      namaTemplate: "Template Tasmi' Semester 1",
      jenisUjian: 'tasmi',
      deskripsi: 'Template untuk ujian Tasmi dengan fokus pada kelancaran dan tajwid',
      isActive: true,
      tahunAkademik: tahunAkademik.tahunAkademik,
      createdBy: adminUser.id,
      komponenPenilaian: {
        create: [
          {
            namaKomponen: 'Kelancaran',
            bobotNilai: 50,
            nilaiMaksimal: 100,
            deskripsi: 'Penilaian kelancaran dalam membaca Al-Quran',
            urutan: 1
          },
          {
            namaKomponen: 'Tajwid & Makhraj',
            bobotNilai: 50,
            nilaiMaksimal: 100,
            deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf',
            urutan: 2
          }
        ]
      }
    }
  })

  // Create Template Ujian MHQ
  const templateMHQ = await prisma.templateUjian.create({
    data: {
      namaTemplate: 'Template MHQ Semester 1',
      jenisUjian: 'mhq',
      deskripsi: 'Template untuk Musabaqah Hifdzil Quran dengan penilaian lengkap',
      isActive: true,
      tahunAkademik: tahunAkademik.tahunAkademik,
      createdBy: adminUser.id,
      komponenPenilaian: {
        create: [
          {
            namaKomponen: 'Kelancaran',
            bobotNilai: 30,
            nilaiMaksimal: 100,
            deskripsi: 'Penilaian kelancaran dalam membaca Al-Quran',
            urutan: 1
          },
          {
            namaKomponen: 'Ketepatan Ayat',
            bobotNilai: 30,
            nilaiMaksimal: 100,
            deskripsi: 'Penilaian ketepatan hafalan ayat Al-Quran',
            urutan: 2
          },
          {
            namaKomponen: 'Tajwid & Makhraj',
            bobotNilai: 25,
            nilaiMaksimal: 100,
            deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf',
            urutan: 3
          },
          {
            namaKomponen: 'Penampilan',
            bobotNilai: 15,
            nilaiMaksimal: 100,
            deskripsi: 'Penilaian penampilan dan sikap saat ujian',
            urutan: 4
          }
        ]
      }
    }
  })

  // Create Template Raport
  const templateRaport = await prisma.templateRaport.create({
    data: {
      namaTemplate: 'Template Raport Standar',
      namaLembaga: 'Pondok Pesantren Tahfidz Al-Quran',
      alamatLembaga: 'Jl. Pendidikan No. 123, Kota Santri',
      headerKopSurat: 'RAPORT HAFALAN AL-QURAN\nPONDOK PESANTREN TAHFIDZ AL-QURAN',
      footerRaport: 'Semoga Allah memberikan keberkahan dalam menghafal Al-Quran',
      namaKepala: 'Ustadz Ahmad Fauzi, S.Pd.I',
      jabatanKepala: 'Kepala Tahfidz',
      formatTampilan: {
        showLogo: true,
        showHeader: true,
        showFooter: true,
        showTandaTangan: true,
        showRanking: true,
        showGrafik: true,
        showCatatanGuru: true,
        colorTheme: 'blue',
        fontSize: 'medium'
      },
      isActive: true,
      tahunAkademik: tahunAkademik.tahunAkademik,
      createdBy: adminUser.id
    }
  })

  console.log('✅ Template System seeded successfully!')
  console.log(`📋 Created Template Ujian: ${templateTasmi.namaTemplate}`)
  console.log(`📋 Created Template Ujian: ${templateMHQ.namaTemplate}`)
  console.log(`📄 Created Template Raport: ${templateRaport.namaTemplate}`)
  console.log(`📅 Created Tahun Akademik: ${tahunAkademik.tahunAkademik}`)
}

async function main() {
  try {
    await seedTemplateSystem()
  } catch (error) {
    console.error('❌ Error seeding template system:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { seedTemplateSystem }