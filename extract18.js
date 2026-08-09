const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/admin/jadwal/JadwalClient.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `        <JadwalStatistics 
          initialJadwalCount={initialJadwal.length}
          halaqahListCount={halaqahList.length}
          thisWeekCount={thisWeekCount}
        />`;

let newContent = [
  ...lines.slice(0, 364),
  replacement,
  ...lines.slice(434)
].join('\n');

const importLines = `import JadwalStatistics from "@/components/admin/jadwal/JadwalStatistics";`;

newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
