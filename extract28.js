const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/ortu/absensi/page.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `            {/* Detailed Statistics Cards - Filtered by Month */}
            <OrtuAbsensiStatCards filteredStats={filteredStats} />`;

lines.splice(391, 78, replacement);

const importLines = `import OrtuAbsensiStatCards from "@/components/ortu/absensi/OrtuAbsensiStatCards";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
