const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/api/quran/route.ts';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// 187 is "async function handleSearch(query: string) {"
// 253 is "}" for handleAyatRequest

lines.splice(186, 253 - 186 + 1);

const importLines = `import { handleSearch, handleAyatRequest } from './quranHandlers';`;

let newContent = lines.join('\n');
newContent = newContent.replace("import { JUZ_TO_PAGE_MAPPING, SURAT_DATA, generateMushafPageContent } from './quranUtils';", "import { JUZ_TO_PAGE_MAPPING, SURAT_DATA, generateMushafPageContent } from './quranUtils';\n" + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
