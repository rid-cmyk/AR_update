const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/yayasan/laporan/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `      <HafalanReportTab
        reportData={reportData}
        chartData={chartData}
        pieData={pieData}
        absensiData={absensiData}
      />`;

let newContent = [
  ...lines.slice(0, 94),
  replacement,
  ...lines.slice(249)
].join('\n');

const importLines = `import HafalanReportTab from "@/components/yayasan/laporan/HafalanReportTab";`;

newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
