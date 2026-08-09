const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/yayasan/santri/page.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `          title={<YayasanSantriModalTitle selectedSantri={selectedSantri} />}`;

const start = lines.findIndex(l => l.includes('title={'));
lines.splice(start, 112, replacement);

const importLines = `import YayasanSantriModalTitle from "@/components/yayasan/santri/YayasanSantriModalTitle";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
