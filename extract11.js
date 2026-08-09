const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/guru/grafik/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `                <GrafikHafalanTab 
                  hafalanData={hafalanData}
                  pieData={pieData}
                  selectedHalaqahData={selectedHalaqahData}
                  CustomTooltip={CustomTooltip}
                />`;

let newContent = [
  ...lines.slice(0, 427),
  replacement,
  ...lines.slice(522)
].join('\n');

const importLines = `import GrafikHafalanTab from "@/components/guru/grafik/GrafikHafalanTab";`;

newContent = newContent.replace('import StudentAnalyticsTab from "@/components/analytics/StudentAnalyticsTab";', 'import StudentAnalyticsTab from "@/components/analytics/StudentAnalyticsTab";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
