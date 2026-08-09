const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/santri/hafalan/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `                <RiwayatSetoranTab
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filterJenis={filterJenis}
                  setFilterJenis={setFilterJenis}
                  filteredHafalan={filteredHafalan}
                  getJenisColor={getJenisColor}
                  getJenisIcon={getJenisIcon}
                  getNilaiColor={getNilaiColor}
                  setSelectedHafalan={setSelectedHafalan}
                  setIsModalOpen={setIsModalOpen}
                />`;

let newContent = [
  ...lines.slice(0, 476),
  replacement,
  ...lines.slice(598)
].join('\n');

const importLines = `import RiwayatSetoranTab from "@/components/santri/hafalan/RiwayatSetoranTab";`;

newContent = newContent.replace('import { TargetHafalanDetail } from "@/components/santri/hafalan/TargetHafalanDetail";', 'import { TargetHafalanDetail } from "@/components/santri/hafalan/TargetHafalanDetail";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
