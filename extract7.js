const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/guru/hafalan/HafalanClient.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `        <HafalanSummaryCards
          summaries={getHafalanSummaryBySantri()}
        />`;

let newContent = [
  ...lines.slice(0, 454),
  replacement,
  ...lines.slice(508)
].join('\n');

const importLines = `import HafalanSummaryCards from "@/components/guru/hafalan/HafalanSummaryCards";`;

newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
