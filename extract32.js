const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/guru/absensi/AbsensiClient.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        <AbsensiBulkActions jadwalsLength={jadwals.length} absensiData={absensiData} handleSaveAbsensi={handleSaveAbsensi} />`;

const start = lines.findIndex(l => l.includes('{jadwals.length > 0 && ('));
lines.splice(start, 90, replacement);

const importLines = `import AbsensiBulkActions from "@/components/guru/absensi/AbsensiBulkActions";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
