const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components'),
];

const colorMap = {
  '#667eea': '#023047',
  '#764ba2': '#219ebc',
  '#ff6b6b': '#fb8500',
  '#ee5a24': '#fb8500',
  '#52c41a': '#219ebc', // just in case
  '#73d13d': '#8ecae6',
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
    }
  });
});
