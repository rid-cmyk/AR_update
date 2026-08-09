const fs = require('fs');
const file = 'C:/Users/farre/AR_update/components/guru/ujian/LiveExamSplitScreen.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const start = 106; // line 107 is index 106
const end = 321; // line 322 is index 321

const replacement = `  const renderFormContent = () => (
    <LiveExamFormContent
      juzList={juzList}
      activeJuz={activeJuz}
      setActiveJuz={setActiveJuz}
      kategoriUjian={kategoriUjian}
      nilaiPerJuz={nilaiPerJuz}
      setNilaiPerJuz={setNilaiPerJuz}
      nilaiMhq={nilaiMhq}
      setNilaiMhq={setNilaiMhq}
      jumlahSoalMhq={jumlahSoalMhq}
      potonganTasmi={potonganTasmi}
      setPotonganTasmi={setPotonganTasmi}
      catatan={catatan}
      setCatatan={setCatatan}
    />
  );`;

const newContent = lines.slice(0, start).join('\n') + '\n' + replacement + '\n' + lines.slice(end + 1).join('\n');
const finalContent = newContent.replace(
  'import { MushafDigital } from "./MushafDigital";',
  'import { MushafDigital } from "./MushafDigital";\nimport { LiveExamFormContent } from "./LiveExamFormContent";'
);
fs.writeFileSync(file, finalContent);
console.log('Success');
