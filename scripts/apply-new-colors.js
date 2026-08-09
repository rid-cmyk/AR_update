const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components'),
];

// Map of old hex colors to new hex colors
const colorMap = {
  '#1890ff': '#219ebc', // Old Primary to Blue-Green
  '#40a9ff': '#8ecae6', // Old Light Blue to Sky Blue Light
  '#faad14': '#ffb703', // Old Warning to Amber Flame
  '#ff4d4f': '#fb8500', // Old Error to Princeton Orange
  '#f5222d': '#fb8500', // Another Old Error to Princeton Orange
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
    let modified = false;

    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      const regex = new RegExp(oldColor, 'gi');
      if (regex.test(content)) {
        const matches = content.match(regex);
        totalReplacements += matches.length;
        content = content.replace(regex, newColor);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      console.log(`Updated: ${filePath.replace(path.join(__dirname, '..'), '')}`);
    }
  });
});

console.log(`\nDone! Replaced ${totalReplacements} occurrences in ${filesModified} files.`);
