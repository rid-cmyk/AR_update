const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/guru/target/page.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        {/* Summary Cards per Santri */}
        <TargetSummaryCards 
          targetListLength={targetList.length} 
          summaries={getTargetSummaryBySantri() as any} 
        />`;

const start = lines.findIndex(l => l.includes('{/* Summary Cards per Santri */}'));
lines.splice(start, 62, replacement);

const importLines = `import TargetSummaryCards from "@/components/guru/target/TargetSummaryCards";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
