const fs = require('fs');
const file = 'C:/Users/farre/AR_update/components/guru/ujian/FormPenilaianUjianNew.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `  const calculateNilaiAkhir = (santriId: string) => {
    return calculateNilaiAkhirUtil(penilaianData[santriId]);
  }

  const getCompletionStatus = (santriId: string) => {
    return getCompletionStatusUtil(penilaianData[santriId], penilaianItems.length);
  }`;

const start = lines.findIndex(l => l.includes('const calculateNilaiAkhir = (santriId: string) => {'));
lines.splice(start, 22, replacement);

const importLines = `import { calculateNilaiAkhir as calculateNilaiAkhirUtil, getCompletionStatus as getCompletionStatusUtil } from './utils/penilaianUtils';`;

let newContent = lines.join('\n');
newContent = newContent.replace('import { generatePenilaianItems } from \'./utils/penilaianUtils\'', 'import { generatePenilaianItems } from \'./utils/penilaianUtils\'\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
