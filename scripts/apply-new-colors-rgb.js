const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components'),
];

// Extended mapping for RGB and dark gradient colors
const colorMap = {
  // RGB forms of old primary (#1890ff) to new Blue-Green (#219ebc) -> rgb(33, 158, 188)
  '24, 144, 255': '33, 158, 188',
  '24,144,255': '33,158,188',
  // Old light blue (#40a9ff) in RGB to Sky Blue Light (#8ecae6) -> rgb(142, 202, 230)
  '64, 169, 255': '142, 202, 230',
  
  // Specific Antd dark blue gradients -> Deep Space Blue variants (#023047)
  '#001529': '#023047',
  '#002140': '#012638',
  '#003a70': '#011c2a',
  
  // Button gradients old to new
  '#096dd9': '#023047', // deep space blue for bottom of gradients
  
  // Light background gradients to sky blue light tint
  '#e6f7ff': '#eaf6fb', // lighter version of 8ecae6 for very light backgrounds
  '#f0f8ff': '#eaf6fb',
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
      // replace all instances
      const regex = new RegExp(oldColor.replace(/([, ])/g, '\\$1'), 'gi');
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
