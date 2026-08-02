const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function run() {
  console.log('=== DB Query Performance Profiling ===\n');

  // 1. Santri lookup
  const t0 = Date.now();
  const santri = await prisma.user.findFirst({ where: { role: { name: 'santri' } } });
  const d0 = Date.now() - t0;
  console.log(`[${d0}ms] findFirst santri → id: ${santri?.id}`);

  if (!santri) {
    await prisma.$disconnect();
    return;
  }

  // 2. Hafalan groupBy
  const t1 = Date.now();
  const hafalan = await prisma.hafalan.groupBy({ by: ['status'], where: { santriId: santri.id }, _count: { status: true } });
  const d1 = Date.now() - t1;
  console.log(`[${d1}ms] hafalan.groupBy → ${hafalan.length} status rows`);

  // 3. Absensi count
  const t2 = Date.now();
  const absensi = await prisma.absensi.count({ where: { santriId: santri.id } });
  const d2 = Date.now() - t2;
  console.log(`[${d2}ms] absensi.count → ${absensi}`);

  // 4. UjianSantri count
  const t3 = Date.now();
  const ujian = await prisma.ujianSantri.count({ where: { santriId: santri.id } });
  const d3 = Date.now() - t3;
  console.log(`[${d3}ms] ujianSantri.count → ${ujian}`);

  // 5. Notifikasi count
  const t4 = Date.now();
  const notif = await prisma.notifikasi.count({ where: { userId: santri.id, isRead: false } });
  const d4 = Date.now() - t4;
  console.log(`[${d4}ms] notifikasi.count → ${notif}`);

  // 6. Halaqah santri lookup (typical dashboard query)
  const t5 = Date.now();
  const halaqah = await prisma.halaqahSantri.findFirst({
    where: { santriId: santri.id },
    include: { halaqah: { include: { guru: { select: { id: true, namaLengkap: true } } } } }
  });
  const d5 = Date.now() - t5;
  console.log(`[${d5}ms] halaqahSantri.findFirst+include.halaqah.guru`);

  // 7. All users count
  const t6 = Date.now();
  const userCount = await prisma.user.count();
  const d6 = Date.now() - t6;
  console.log(`[${d6}ms] user.count → ${userCount} total users`);

  // 8. Yayasan dashboard — halaqah list with nested counts (why /yayasan/dashboard was 2185ms)
  const t7 = Date.now();
  const halaqahList = await prisma.halaqah.findMany({
    include: {
      santri: { select: { id: true } },
      guru: { select: { id: true } }
    }
  });
  const d7 = Date.now() - t7;
  console.log(`[${d7}ms] halaqah.findMany+include.santri+guru → ${halaqahList.length} halaqah`);

  // 8b. Yayasan OPTIMIZED — use _count instead of include
  const t7b = Date.now();
  const halaqahListOpt = await prisma.halaqah.findMany({
    select: {
      id: true,
      namaHalaqah: true,
      _count: { select: { santri: true } }
    }
  });
  const d7b = Date.now() - t7b;
  console.log(`[${d7b}ms] halaqah.findMany+_count.santri OPTIMIZED → ${halaqahListOpt.length} halaqah`);

  // 9. Santri for Yayasan (potential unbounded)
  const t8 = Date.now();
  const allSantri = await prisma.user.findMany({ where: { role: { name: 'santri' } }, select: { id: true, namaLengkap: true } });
  const d8 = Date.now() - t8;
  console.log(`[${d8}ms] user.findMany(santri, select) → ${allSantri.length} santri`);

  // 10. TargetHafalan for santri (dashboard widget)
  const t9 = Date.now();
  const targets = await prisma.targetHafalan.findMany({ where: { santriId: santri.id } });
  const d9 = Date.now() - t9;
  console.log(`[${d9}ms] targetHafalan.findMany → ${targets.length} targets`);

  console.log('\n=== Summary ===');
  const timings = [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9];
  const total = timings.reduce((a, b) => a + b, 0);
  console.log(`Total (if sequential): ${total}ms`);
  console.log(`Slowest query: ${Math.max(...timings)}ms`);
  console.log(`Fastest query: ${Math.min(...timings)}ms`);
  console.log(`\nHeaviest pattern: halaqah.findMany+include (${d7}ms) vs _count (${d7b}ms) → ${d7 > d7b ? `${d7 - d7b}ms saved (${Math.round((d7 - d7b) / d7 * 100)}%)` : 'no difference'}`);

  await prisma.$disconnect();

}

run().catch(e => { console.error(e); process.exit(1); });
