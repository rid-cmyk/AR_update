const fs = require('fs');
const file = 'C:/Users/farre/AR_update/components/guru/ujian/utils/penilaianUtils.ts';
let content = fs.readFileSync(file, 'utf8');

const append = `
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
`;
fs.writeFileSync(file, content + append);
console.log('Success');
