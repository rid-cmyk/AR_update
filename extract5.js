const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/guru/target/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `        <TargetFormModal
          isModalOpen={isModalOpen}
          closeModal={closeModal}
          form={form}
          santriList={santriList}
          suratList={suratList}
          editingTarget={editingTarget}
          handleSaveTarget={handleSaveTarget}
        />`;

let newContent = [
  ...lines.slice(0, 470),
  replacement,
  ...lines.slice(680)
].join('\n');

const importLines = `import TargetFormModal from "@/components/guru/target/TargetFormModal";`;

newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
