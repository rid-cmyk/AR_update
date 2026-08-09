const fs = require('fs');
const file = 'C:/Users/farre/AR_update/components/guru/ujian/FormPenilaianUjianNew.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `  const { currentJuz, setCurrentJuz, getCurrentJuzPages, handleNextJuz, handlePrevJuz } = usePenilaianUjianNav({ ujianData, currentPage, setCurrentPage });`;

const start = lines.findIndex(l => l.includes('// State untuk navigasi juz'));
lines.splice(start, 35, replacement);

const importLines = `import { usePenilaianUjianNav } from './usePenilaianUjianNav';`;

let newContent = lines.join('\n');
newContent = newContent.replace('import { generatePenilaianItems } from \'./utils/penilaianUtils\'', 'import { generatePenilaianItems } from \'./utils/penilaianUtils\'\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
