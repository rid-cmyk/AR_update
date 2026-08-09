const fs = require('fs');
const file = 'C:/Users/farre/AR_update/components/guru/ujian/MushafDigital.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `      {/* Tap-to-Translate Persistent Bottom Sheet (Immersive View) */}
      <MushafAudioModal 
        selectedAyah={selectedAyah} 
        setSelectedAyah={setSelectedAyah} 
        isPlayingAudio={isPlayingAudio} 
        setIsPlayingAudio={setIsPlayingAudio} 
        toggleAudio={toggleAudio} 
        audioRef={audioRef} 
      />`;

const start = lines.findIndex(l => l.includes('{/* Tap-to-Translate Persistent Bottom Sheet (Immersive View) */}'));
lines.splice(start, 86, replacement);

const importLines = `import MushafAudioModal from "@/components/guru/ujian/MushafAudioModal";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import { toArabicDigits } from \'./utils/mushafUtils\'', 'import { toArabicDigits } from \'./utils/mushafUtils\'\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
