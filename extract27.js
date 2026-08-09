const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/super-admin/notifications/forgot-passcode/page.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `                {/* Statistics */}
                <ForgotPasscodeStats stats={stats} />`;

const start = lines.findIndex(l => l.includes('<Row gutter={[16, 16]}>'));
lines.splice(start - 1, 44, replacement);

const importLines = `import ForgotPasscodeStats from "@/components/super-admin/notifications/ForgotPasscodeStats";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
