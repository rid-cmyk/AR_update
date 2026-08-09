const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/guru/prestasi/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `        <PrestasiFormModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          form={form}
          handleSubmit={handleSubmit}
          selectedHalaqahData={selectedHalaqahData}
          editingPrestasi={editingPrestasi}
        />`;

let newContent = [
  ...lines.slice(0, 422),
  replacement,
  ...lines.slice(546)
].join('\n');

const importLines = `import PrestasiFormModal from "@/components/guru/prestasi/PrestasiFormModal";`;

newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
