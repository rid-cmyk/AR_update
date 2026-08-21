const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components'),
];

// Map of old remaining Ant Design default colors to the new palette
const colorMap = {
  '#3f8600': '#023047', // old dark green -> Deep Space Blue
  '#52c41a': '#219ebc', // old green -> Blue-Green
  '#722ed1': '#8ecae6', // old purple -> Sky Blue Light
  '#fa8c16': '#ffb703', // old orange -> Amber Flame
  '#047857': '#023047', // old Quran bismillah green -> Deep Space Blue
  '#059669': '#219ebc', // old Quran ayah green -> Blue Green
  '#389e0d': '#023047', // old success green -> Deep Space Blue
  '#046c4e': '#023047', // old dark green -> Deep Space Blue
};

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let totalReplacements = 0;
let filesModified = 0;

targetDirs.forEach(dir => {
  walkDir(dir, function(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.css')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      const regex = new RegExp(oldColor, 'gi');
      if (regex.test(content)) {
        const matches = content.match(regex);
        totalReplacements += matches.length;
        content = content.replace(regex, newColor);
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      console.log(`Updated: ${filePath.replace(path.join(__dirname, '..'), '')}`);
    }
  });
});

console.log(`\nDone! Replaced ${totalReplacements} occurrences in ${filesModified} files.`);
