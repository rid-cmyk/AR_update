const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/super-admin/settings/backup-database/page.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        {/* Backup History */}
        <BackupHistoryList backupHistory={backupHistory} />`;

lines.splice(416, 49, replacement);

const importLines = `import BackupHistoryList from "@/components/super-admin/settings/BackupHistoryList";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
