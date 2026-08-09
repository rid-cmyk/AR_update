const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/super-admin/settings/backup-database/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `        <DatabaseStatistics 
          tables={tables}
          selectedTables={selectedTables}
          backupHistory={backupHistory}
          getCategoryStats={getCategoryStats}
        />`;

let newContent = [
  ...lines.slice(0, 362),
  replacement,
  ...lines.slice(434)
].join('\n');

const importLines = `import DatabaseStatistics from "@/components/super-admin/settings/DatabaseStatistics";`;

newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
