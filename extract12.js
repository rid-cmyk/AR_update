const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/santri/dashboard/SantriDashboardClient.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `            <TargetHafalanCard targets={targets} />
            <RecentActivityCard recentHafalan={recentHafalan} />`;

let newContent = [
  ...lines.slice(0, 457),
  replacement,
  ...lines.slice(647)
].join('\n');

const importLines = `import TargetHafalanCard from "@/components/santri/dashboard/TargetHafalanCard";\nimport RecentActivityCard from "@/components/santri/dashboard/RecentActivityCard";`;

newContent = newContent.replace('import AbsensiSummary from "@/components/santri/AbsensiSummary";', 'import AbsensiSummary from "@/components/santri/AbsensiSummary";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
