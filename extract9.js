const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/admin/guru-permissions/GuruPermissionsClient.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `        <GuruPermissionsFormModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          form={form}
          handleSave={handleSave}
          editingPermission={editingPermission}
          gurus={gurus}
          halaqahs={halaqahs}
        />`;

let newContent = [
  ...lines.slice(0, 377),
  replacement,
  ...lines.slice(538)
].join('\n');

const importLines = `import GuruPermissionsFormModal from "@/components/admin/guru-permissions/GuruPermissionsFormModal";`;

newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
