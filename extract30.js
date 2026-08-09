const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/guru/hafalan/HafalanClient.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        {/* Statistics Cards */}
        <HafalanStatisticsCards hafalanList={hafalanList as any} />`;

lines.splice(384, 33, replacement);

const importLines = `import HafalanStatisticsCards from "@/components/guru/hafalan/HafalanStatisticsCards";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import HafalanSummaryCards from "@/components/guru/hafalan/HafalanSummaryCards";', 'import HafalanSummaryCards from "@/components/guru/hafalan/HafalanSummaryCards";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
