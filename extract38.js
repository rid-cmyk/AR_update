const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/admin/laporan/LaporanClient.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        {/* Performance Overview */}
        <AdminLaporanPerformance reportData={reportData} />`;

const start = lines.findIndex(l => l.includes('{/* Performance Overview */}'));
lines.splice(start, 35, replacement);

const importLines = `import AdminLaporanPerformance from "@/components/admin/laporan/AdminLaporanPerformance";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
