import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Memulai migrasi role admin -> super_admin...')

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } })
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'super_admin' } })

  if (!superAdminRole) {
    throw new Error('Role super_admin tidak ditemukan di database.')
  }

  if (!adminRole) {
    console.log('ℹ️ Role "admin" sudah tidak ada. Tidak ada yang perlu dimigrasi.')
    return
  }

  // 1. Pindahkan seluruh user ber-role admin ke super_admin
  const adminUsers = await prisma.user.findMany({
    where: { roleId: adminRole.id },
    select: { id: true, username: true, namaLengkap: true },
  })

  if (adminUsers.length > 0) {
    const result = await prisma.user.updateMany({
      where: { roleId: adminRole.id },
      data: { roleId: superAdminRole.id },
    })
    console.log(`✅ ${result.count} user dipindahkan ke role super_admin.`)
    for (const u of adminUsers) {
      console.log(`   - ${u.username} (${u.namaLengkap})`)
    }
  } else {
    console.log('ℹ️ Tidak ada user ber-role admin.')
  }

  // 2. Hapus role admin
  await prisma.role.delete({ where: { name: 'admin' } })
  console.log('✅ Role "admin" dihapus dari database.')

  const remaining = await prisma.role.findMany({ select: { name: true } })
  console.log('📋 Role yang tersisa:', remaining.map((r) => r.name).join(', '))
}

main()
  .catch((e) => {
    console.error('❌ Migrasi gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
