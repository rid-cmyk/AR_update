const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/admin/halaqah/HalaqahClient.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        {/* Zero Code Duplication Helper for Halaqah Form */}
        {(() => {
          const renderHalaqahFormContent = () => (
            <AdminHalaqahForm form={form} guruOptions={guruOptions} santriOptions={santriOptions} />
          );`;

const start = lines.findIndex(l => l.includes('{/* Zero Code Duplication Helper for Halaqah Form */}'));
lines.splice(start, 59, replacement);

const importLines = `import AdminHalaqahForm from "@/components/admin/halaqah/AdminHalaqahForm";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
