const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/api/mushaf/route.ts';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const end = 370;

const extractedLines = lines.slice(2, end).join('\n');
fs.writeFileSync('C:/Users/farre/AR_update/app/api/mushaf/mushafHelpers.ts', extractedLines);

const replacement = `import { JUZ_TO_PAGE_MAPPING, generateMushafPageContent, generateFallbackContent } from './mushafHelpers';`;

lines.splice(2, end - 2, replacement);
fs.writeFileSync(file, lines.join('\n'));

console.log('Success');
