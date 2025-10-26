// Seed script untuk template ujian
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedUjianTemplates() {
  console.log('🌱 Seeding ujian templates...')
  
  try {
    // Get active tahun ajaran
    const tahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    })
    
    if (!tahunAjaran) {
      console.log('❌ No active tahun ajaran found. Please create one first.')
      return
    }

    console.log(`📅 Using tahun ajaran: ${tahunAjaran.namaLengkap}`)

    // Template MHQ
    const templateMHQ = await prisma.templateUjian.upsert({
      where: { 
        namaTemplate: 'Template MHQ Standard'
      },
      update: {},
      create: {
        namaTemplate: 'Template MHQ Standard',
        jenisUjian: 'mhq',
        deskripsi: 'Template standar untuk ujian MHQ dengan komponen penilaian lengkap',
        status: 'aktif',
        tahunAjaranId: tahunAjaran.id,
        komponenPenilaian: {
          create: [
            {
              namaKomponen: 'Tajwid & Makhraj',
              bobotNilai: 30,
              nilaiMaksimal: 100,
              deskripsi: 'Penilaian ketepatan tajwid dan makhraj huruf',
              urutan: 1
            },
            {
              namaKomponen: 'Kelancaran',
              bobotNilai: 25,
              nilaiMaksimal: 100,
              deskripsi: 'Penilaian kelancaran dalam membaca',
              urutan: 2
            },
            {
              namaKomponen: 'Ketepatan Ayat',
              bobotNilai: 25,
              nilaiMaksimal: 100,
              deskripsi: 'Penilaian ketepatan hafalan ayat',
              urutan: 3
            },
            {
              namaKomponen: 'Adab & Sikap',
              bobotNilai: 20,
              nilaiMaksimal: 100,
              deskripsi: 'Penilaian adab dan sikap saat ujian',
              urutan: 4
            }
          ]
        }
      },
      include: {
        komponenPenilaian: true
      }
    })

    console.log('✅ Template MHQ created:', templateMHQ.namaTemplate)

    // Template UAS
    const templateUAS = await prisma.templateUjian.upsert({
      where: { 
        namaTemplate: 'Template UAS Standard'
      },
      update: {},
      create: {
        namaTemplate: 'Template UAS Standard',
        jenisUjian: 'uas',
        deskripsi: 'Template standar untuk Ujian Akhir Semester',
        status: 'aktif',
        tahunAjaranId: tahunAjaran.id,
        komponenPenilaian: {
          create: []  // UAS tidak menggunakan komponen penilaian
        }
      }
    })

    console.log('✅ Template UAS created:', templateUAS.namaTemplate)

    // Template Tasmi'
    const templateTasmi = await prisma.templateUjian.upsert({
      where: { 
        namaTemplate: 'Template Tasmi Standard'
      },
      update: {},
      create: {
        namaTemplate: 'Template Tasmi Standard',
        jenisUjian: 'tasmi',
        deskripsi: 'Template standar untuk ujian tasmi hafalan baru',
        status: 'aktif',
        tahunAjaranId: tahunAjaran.id,
        komponenPenilaian: {
          create: [
            {
              namaKomponen: 'Ketepatan Hafalan',
              bobotNilai: 40,
              nilaiMaksimal: 100,
              deskripsi: 'Penilaian ketepatan hafalan ayat',
              urutan: 1
            },
            {
              namaKomponen: 'Tajwid',
              bobotNilai: 35,
              nilaiMaksimal: 100,
              deskripsi: 'Penilaian tajwid dan makhraj',
              urutan: 2
            },
            {
              namaKomponen: 'Kelancaran',
              bobotNilai: 25,
              nilaiMaksimal: 100,
              deskripsi: 'Penilaian kelancaran membaca',
              urutan: 3
            }
          ]
        }
      },
      include: {
        komponenPenilaian: true
      }
    })

    console.log('✅ Template Tasmi created:', templateTasmi.namaTemplate)

    // Template Kenaikan Juz
    const templateKenaikanJuz = await prisma.templateUjian.upsert({
      where: { 
        namaTemplate: 'Template Kenaikan Juz'
      },
      update: {},
      create: {
        namaTemplate: 'Template Kenaikan Juz',
        jenisUjian: 'kenaikan_juz',
        deskripsi: 'Template untuk ujian kenaikan ke juz berikutnya',
        status: 'aktif',
        tahunAjaranId: tahunAjaran.id,
        komponenPenilaian: {
          create: [
            {
              namaKomponen: 'Hafalan Juz Sebelumnya',
              bobotNilai: 50,
              nilaiMaksimal: 100,
              deskripsi: 'Penilaian hafalan juz yang sudah dipelajari',
              urutan: 1
            },
            {
              namaKomponen: 'Kesiapan Juz Baru',
              bobotNilai: 30,
              nilaiMaksimal: 100,
              deskripsi: 'Penilaian kesiapan untuk juz baru',
              urutan: 2
            },
            {
              namaKomponen: 'Tajwid & Makhraj',
              bobotNilai: 20,
              nilaiMaksimal: 100,
              deskripsi: 'Penilaian tajwid dan makhraj',
              urutan: 3
            }
          ]
        }
      },
      include: {
        komponenPenilaian: true
      }
    })

    console.log('✅ Template Kenaikan Juz created:', templateKenaikanJuz.namaTemplate)

    console.log('\n🎉 All ujian templates seeded successfully!')
    console.log('\n📋 Summary:')
    console.log('   - Template MHQ Standard (4 komponen)')
    console.log('   - Template UAS Standard (nilai per halaman)')
    console.log('   - Template Tasmi Standard (3 komponen)')
    console.log('   - Template Kenaikan Juz (3 komponen)')

  } catch (error) {
    console.error('❌ Error seeding templates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed
seedUjianTemplates().catch(console.error)