const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/santri/dashboard/SantriDashboardClient.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `        {/* Quick Actions and Pengumuman */}
        <SantriQuickActions 
          totalSetoran={totalSetoran}
          activeTargets={activeTargets}
          totalTargetProgress={totalTargetProgress}
          hafalanProgress={hafalanProgress}
        />`;

let newContent = [
  ...lines.slice(0, 312),
  replacement,
  ...lines.slice(372)
].join('\n');

const importLines = `import SantriQuickActions from "@/components/santri/dashboard/SantriQuickActions";`;

newContent = newContent.replace('import AnnouncementList from "@/components/shared/AnnouncementList";', 'import AnnouncementList from "@/components/shared/AnnouncementList";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
