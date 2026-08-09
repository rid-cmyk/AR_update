const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/super-admin/settings/backup-database/page.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const start = lines.findIndex(l => l.includes('const tableColumns = ['));
const end = lines.findIndex((l, i) => i > start && l.trim() === '];');

lines.splice(start, end - start + 1);

let newContent = lines.join('\n');

// Update usage of tableColumns
newContent = newContent.replace('columns={tableColumns}', 'columns={getBackupTableColumns(handleExport)}');

// Import
const importLines = `import { getBackupTableColumns, TableInfo } from "@/components/super-admin/settings/backupTableColumns";`;
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

// Also we need to remove the previous TableInfo interface definition to avoid duplicate identifier
const interfaceStart = newContent.indexOf('interface TableInfo {');
if (interfaceStart !== -1) {
  const interfaceEnd = newContent.indexOf('}', interfaceStart) + 1;
  newContent = newContent.substring(0, interfaceStart) + newContent.substring(interfaceEnd);
}

fs.writeFileSync(file, newContent);
console.log('Success');
