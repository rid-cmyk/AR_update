const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/yayasan/dashboard/YayasanDashboardClient.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        {/* Recent Info Cards */}
        <YayasanDashboardInfoCards />`;

const start = lines.findIndex(l => l.includes('{/* Recent Info Cards */}'));
lines.splice(start, 63, replacement);

const importLines = `import YayasanDashboardInfoCards from "@/components/yayasan/dashboard/YayasanDashboardInfoCards";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
