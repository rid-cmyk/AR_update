const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/santri/progress-juz/page.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `  const juzColumns = getJuzColumns({ getStatusColor, getProgressColor, showJuzDetail });`;

const start = lines.findIndex(l => l.includes('const juzColumns = ['));
lines.splice(start, 122, replacement);

const importLines = `import { getJuzColumns, recentHafalanColumns } from "@/components/santri/progress-juz/SantriProgressJuzColumns";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
