const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/guru/hafalan/HafalanClient.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        {/* Enhanced Filters */}
        <HafalanFiltersCard filters={filters} setFilters={setFilters} />`;

const start = lines.findIndex(l => l.includes('{/* Enhanced Filters */}'));
lines.splice(start, 35, replacement);

const importLines = `import HafalanFiltersCard from "@/components/guru/hafalan/HafalanFiltersCard";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import HafalanStatisticsCards from "@/components/guru/hafalan/HafalanStatisticsCards";', 'import HafalanStatisticsCards from "@/components/guru/hafalan/HafalanStatisticsCards";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
