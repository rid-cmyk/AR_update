import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Memulai migrasi data ke struktur Semester baru...')

  // 1. Ambil semua TahunAjaran yang ada
  const tahunAjarans = await prisma.tahunAjaran.findMany()

  for (const ta of tahunAjarans) {
    console.log(`Memproses TahunAjaran: ${ta.namaLengkap} (${ta.id})`)

    // Buat Semester Ganjil dan Genap untuk TahunAjaran ini jika belum ada
    const semGanjil = await prisma.semester.findFirst({
      where: { tahunAjaranId: ta.id, semesterUrutan: 1 }
    })

    let semester1 = semGanjil
    if (!semester1) {
      semester1 = await prisma.semester.create({
        data: {
          tahunAjaranId: ta.id,
          namaSemester: 'Semester 1 Ganjil',
          semesterUrutan: 1,
          tanggalMulai: new Date(ta.tahunMulai, 6, 1), // Juli
          tanggalSelesai: new Date(ta.tahunMulai, 11, 31), // Desember
          isActive: ta.isActive, // Ikut status aktif induk untuk semester 1
        }
      })
      console.log(`  ✅ Dibuat Semester 1: ${semester1.namaSemester}`)
    }

    const semGenap = await prisma.semester.findFirst({
      where: { tahunAjaranId: ta.id, semesterUrutan: 2 }
    })

    let semester2 = semGenap
    if (!semester2) {
      semester2 = await prisma.semester.create({
        data: {
          tahunAjaranId: ta.id,
          namaSemester: 'Semester 2 Genap',
          semesterUrutan: 2,
          tanggalMulai: new Date(ta.tahunSelesai, 0, 1), // Januari
          tanggalSelesai: new Date(ta.tahunSelesai, 5, 30), // Juni
          isActive: false,
        }
      })
      console.log(`  ✅ Dibuat Semester 2: ${semester2.namaSemester}`)
    }

    // Karena sebelumnya kita tidak tahu S1 atau S2 (kolom dihapus),
    // kita asumsikan semua data yang terkait dengan tahun ajaran ini
    // kita link ke Semester 1 Ganjil sebagai default agar tidak error.
    
    // Update HalaqahSantri
    await prisma.halaqahSantri.updateMany({
      where: { tahunAjaranId: ta.id, semesterId: null },
      data: { semesterId: semester1.id }
    })

    // Update TemplateUjian
    await prisma.templateUjian.updateMany({
      where: { tahunAjaranId: ta.id, semesterId: null },
      data: { semesterId: semester1.id }
    })

    // Update UjianSantri
    await prisma.ujianSantri.updateMany({
      where: { tahunAjaranId: ta.id, semesterId: null },
      data: { semesterId: semester1.id }
    })

    // Update TemplateRaport
    await prisma.templateRaport.updateMany({
      where: { tahunAjaranId: ta.id, semesterId: null },
      data: { semesterId: semester1.id }
    })

    // Update RaportSantri
    await prisma.raportSantri.updateMany({
      where: { tahunAjaranId: ta.id, semesterId: null },
      data: { semesterId: semester1.id }
    })
  }
  
  // Update tabel lain yang gak punya tahunAjaranId tapi bisa kita set ke semester aktif
  const activeSemester = await prisma.semester.findFirst({ where: { isActive: true } })
  if (activeSemester) {
     console.log(`\nMenghubungkan data lain ke semester aktif: ${activeSemester.namaSemester}`)
     
     await prisma.halaqah.updateMany({
       where: { semesterId: null },
       data: { semesterId: activeSemester.id }
     })
     await prisma.jadwal.updateMany({
       where: { semesterId: null },
       data: { semesterId: activeSemester.id }
     })
     await prisma.absensi.updateMany({
       where: { semesterId: null },
       data: { semesterId: activeSemester.id }
     })
     await prisma.targetHafalan.updateMany({
       where: { semesterId: null },
       data: { semesterId: activeSemester.id }
     })
     await prisma.hafalan.updateMany({
       where: { semesterId: null },
       data: { semesterId: activeSemester.id }
     })
     await prisma.prestasi.updateMany({
       where: { semesterId: null },
       data: { semesterId: activeSemester.id }
     })
  }

  console.log('✅ Migrasi selesai!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
