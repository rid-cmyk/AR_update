const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/ortu/absensi/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `            <SemesterSummaryCards
              childStats={childStats}
              selectedChild={selectedChild}
            />`;

let newContent = [
  ...lines.slice(0, 470),
  replacement,
  ...lines.slice(602)
].join('\n');

const importLines = `import SemesterSummaryCards from "@/components/ortu/absensi/SemesterSummaryCards";`;

newContent = newContent.replace('import { useTablePagination } from "@/hooks/useTablePagination";', 'import { useTablePagination } from "@/hooks/useTablePagination";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
