const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/santri/hafalan/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `                    <TargetHafalanList
                      selectedTarget={selectedTarget}
                      setSelectedTarget={setSelectedTarget}
                      filteredTargets={filteredTargets}
                      getPriorityColor={getPriorityColor}
                    />`;

let newContent = [
  ...lines.slice(0, 362),
  replacement,
  ...lines.slice(444)
].join('\n');

const importLines = `import TargetHafalanList from "@/components/santri/hafalan/TargetHafalanList";`;

newContent = newContent.replace('import RiwayatSetoranTab from "@/components/santri/hafalan/RiwayatSetoranTab";', 'import RiwayatSetoranTab from "@/components/santri/hafalan/RiwayatSetoranTab";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
