const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/guru/grafik/page.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

// Replace the TopSantri tab content first (so lines offsets are handled)
// Top Santri tab is around line 438 to 483.
const topSantriReplacement = `                <TopSantriTab 
                  topSantriList={topSantriList}
                  filteredSantri={filteredSantri}
                  searchText={searchText}
                  setSearchText={setSearchText}
                  loading={loading}
                  setSelectedSantriId={setSelectedSantriId}
                  setActiveTabKey={setActiveTabKey}
                />`;

// Replace lines 438 to 483
lines.splice(438, 46, topSantriReplacement);

// Remove columns definition lines 216 to 300
lines.splice(216, 85);

// Add import
const importLines = `import TopSantriTab from "@/components/guru/grafik/TopSantriTab";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import GrafikHafalanTab from "@/components/guru/grafik/GrafikHafalanTab";', 'import GrafikHafalanTab from "@/components/guru/grafik/GrafikHafalanTab";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
