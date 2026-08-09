export const generatePenilaianItems = (ujianData: any) => {
  const items: any[] = [];
  
  if (ujianData.jenisUjian.nama.toLowerCase().includes('mhq')) {
    // MHQ - Per Juz dengan aspek penilaian dari admin
    const juzStart = ujianData.juzRange?.dari || 1;
    const juzEnd = ujianData.juzRange?.sampai || 1;
    
    for (let juz = juzStart; juz <= juzEnd; juz++) {
      // Untuk setiap juz, buat item dengan aspek penilaian
      ujianData.jenisUjian.komponenPenilaian.forEach((komponen: any) => {
        items.push({
          key: `juz-${juz}-${komponen.nama.toLowerCase().replace(/\s+/g, '_')}`,
          label: `Juz ${juz} - ${komponen.nama}`,
          type: 'juz-aspek',
          juz: juz,
          aspek: komponen.nama,
          bobot: komponen.bobot,
          nilaiMaksimal: komponen.nilaiMaksimal || 100,
          number: juz
        });
      });
    }
  } else {
    // Tasmi - Per Halaman (20 halaman per juz)
    const juzPageMapping: Record<number, { start: number; end: number }> = {
      1: { start: 1, end: 21 },
      2: { start: 22, end: 41 },
      3: { start: 42, end: 61 },
      4: { start: 62, end: 81 },
      5: { start: 82, end: 101 },
      6: { start: 102, end: 121 },
      7: { start: 122, end: 141 },
      8: { start: 142, end: 161 },
      9: { start: 162, end: 181 },
      10: { start: 182, end: 201 },
      11: { start: 202, end: 221 },
      12: { start: 222, end: 241 },
      13: { start: 242, end: 261 },
      14: { start: 262, end: 281 },
      15: { start: 282, end: 301 },
      16: { start: 302, end: 321 },
      17: { start: 322, end: 341 },
      18: { start: 342, end: 361 },
      19: { start: 362, end: 381 },
      20: { start: 382, end: 401 },
      21: { start: 402, end: 421 },
      22: { start: 422, end: 441 },
      23: { start: 442, end: 461 },
      24: { start: 462, end: 481 },
      25: { start: 482, end: 501 },
      26: { start: 502, end: 521 },
      27: { start: 522, end: 541 },
      28: { start: 542, end: 561 },
      29: { start: 562, end: 581 },
      30: { start: 582, end: 604 }
    };

    const juzStart = ujianData.juzRange?.dari || 1;
    const juzEnd = ujianData.juzRange?.sampai || 1;
    
    for (let juz = juzStart; juz <= juzEnd; juz++) {
      const juzInfo = juzPageMapping[juz];
      if (juzInfo) {
        // 20 halaman per juz (atau sesuai mapping)
        for (let page = juzInfo.start; page <= juzInfo.end; page++) {
          items.push({
            key: `halaman-${page}`,
            label: `Halaman ${page}`,
            type: 'halaman',
            number: page,
            juz: juz
          });
        }
      }
    }
  }
  
  return items;
};

export const calculateNilaiAkhir = (santriPenilaian: any) => {
  if (!santriPenilaian?.nilai) return 0;
  const nilaiList = Object.values(santriPenilaian.nilai).filter((n: any) => n > 0);
  if (nilaiList.length === 0) return 0;
  return Math.round(nilaiList.reduce((sum: number, nilai: any) => sum + (nilai as number), 0) / nilaiList.length);
}

export const getCompletionStatus = (santriPenilaian: any, totalItems: number) => {
  if (!santriPenilaian?.nilai) return 0;
  const completedItems = Object.keys(santriPenilaian.nilai).filter(key => 
    santriPenilaian.nilai[key] > 0
  ).length;
  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}
