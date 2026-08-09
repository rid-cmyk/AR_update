const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/super-admin/settings/backup-database/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `        <BackupActions 
          handleExport={handleExport}
          selectedTables={selectedTables}
          tables={tables}
          loading={loading}
          uploadLoading={uploadLoading}
          handleImport={handleImport}
        />`;

let newContent = [
  ...lines.slice(0, 452),
  replacement,
  ...lines.slice(520)
].join('\n');

const importLines = `import BackupActions from "@/components/super-admin/settings/BackupActions";`;

newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
