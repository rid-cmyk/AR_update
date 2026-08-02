const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function benchmark() {
  console.log('=== BEFORE vs AFTER: Monthly Trend Aggregation ===\n');

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

  // BASELINE: Current approach — fetch all rows, aggregate in JS
  const t_before = Date.now();
  const monthlyHafalan = await prisma.hafalan.findMany({
    where: { tanggal: { gte: twelveMonthsAgo } },
    select: { tanggal: true }
  });
  const monthlyAbsensi = await prisma.absensi.findMany({
    where: { tanggal: { gte: twelveMonthsAgo } },
    select: { tanggal: true }
  });
  const d_before = Date.now() - t_before;
  console.log(`[BEFORE] JS-aggregated fetch: ${d_before}ms`);
  console.log(`         hafalan rows fetched: ${monthlyHafalan.length}, absensi rows: ${monthlyAbsensi.length}`);

  // OPTIMIZED: Push aggregation to PostgreSQL with date_trunc
  const t_after = Date.now();
  const [hafalanByMonth, absensiByMonth] = await Promise.all([
    prisma.$queryRaw`
      SELECT TO_CHAR(DATE_TRUNC('month', "tanggal"), 'YYYY-MM') AS month, COUNT(*) AS count
      FROM "Hafalan"
      WHERE "tanggal" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "tanggal")
      ORDER BY month ASC
    `,
    prisma.$queryRaw`
      SELECT TO_CHAR(DATE_TRUNC('month', "tanggal"), 'YYYY-MM') AS month, COUNT(*) AS count
      FROM "Absensi"
      WHERE "tanggal" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "tanggal")
      ORDER BY month ASC
    `
  ]);
  const d_after = Date.now() - t_after;
  console.log(`[AFTER]  DB-aggregated $queryRaw: ${d_after}ms`);
  console.log(`         hafalan months: ${hafalanByMonth.length}, absensi months: ${absensiByMonth.length}`);

  const improvement = d_before > d_after
    ? `${d_before - d_after}ms faster (${Math.round((d_before - d_after) / d_before * 100)}% improvement)`
    : 'no measurable difference (small dataset)';
  console.log(`\nResult: ${improvement}`);

  // BASELINE: unbounded ujianSantri.findMany
  console.log('\n=== Unbounded vs Limited: UjianSantri ===');
  const t_unb = Date.now();
  const ujianAll = await prisma.ujianSantri.findMany({
    select: { id: true, nilaiAkhir: true, statusUjian: true, tanggalUjian: true }
  });
  const d_unb = Date.now() - t_unb;
  console.log(`[BEFORE] ujianSantri.findMany (unbounded): ${d_unb}ms → ${ujianAll.length} rows`);

  // OPTIMIZED: use _count + groupBy for stats, take limit for display
  const t_lim = Date.now();
  const [ujianStats, ujianRecent] = await Promise.all([
    prisma.ujianSantri.aggregate({
      _count: { id: true },
      _avg: { nilaiAkhir: true }
    }),
    prisma.ujianSantri.findMany({
      take: 20,
      orderBy: { tanggalUjian: 'desc' },
      select: { id: true, nilaiAkhir: true, statusUjian: true, tanggalUjian: true,
        santri: { select: { namaLengkap: true } },
        templateUjian: { select: { namaTemplate: true } }
      }
    })
  ]);
  const d_lim = Date.now() - t_lim;
  console.log(`[AFTER]  ujianSantri.aggregate + findMany(take:20): ${d_lim}ms → ${ujianStats._count.id} total, ${ujianRecent.length} displayed`);

  console.log('\n=== Summary ===');
  console.log('Monthly trend: BEFORE=' + d_before + 'ms → AFTER=' + d_after + 'ms');
  console.log('UjianSantri:   BEFORE=' + d_unb + 'ms → AFTER=' + d_lim + 'ms');

  await prisma.$disconnect();
}

benchmark().catch(e => { console.error(e); process.exit(1); });
