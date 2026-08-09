const fs = require('fs');
const file = 'C:/Users/farre/AR_update/components/guru/ujian/FormUjianWizard.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        <FormUjianWizardActions
          currentStep={currentStep}
          stepsLength={steps.length}
          onCancel={onCancel}
          handlePrev={handlePrev}
          handleNext={handleNext}
          handleComplete={handleComplete}
        />`;

const start = lines.findIndex(l => l.includes('<div className={styles.actionButtons}>'));
lines.splice(start, 38, replacement);

const importLines = `import FormUjianWizardActions from "@/components/guru/ujian/FormUjianWizardActions";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import { FormPertanyaanPerJuz } from \'./FormPertanyaanPerJuz\'', 'import { FormPertanyaanPerJuz } from \'./FormPertanyaanPerJuz\'\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
