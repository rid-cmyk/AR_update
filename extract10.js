const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/admin/jadwal/JadwalClient.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `        <JadwalFormModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          form={form}
          handleSave={handleSave}
          editingJadwal={editingJadwal}
          halaqahList={halaqahList}
          hariOptions={hariOptions}
        />`;

let newContent = [
  ...lines.slice(0, 458),
  replacement,
  ...lines.slice(642)
].join('\n');

const importLines = `import JadwalFormModal from "@/components/admin/jadwal/JadwalFormModal";`;

newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
