const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components'),
];

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
    
    // Replace linear-gradient(..., color1, ...) with color1
    // Matches: linear-gradient(135deg, #023047 0%, ...)
    // Group 1 captures the first color (#023047 or rgba(...) or ${color})
    const gradientRegex = /linear-gradient\([^,]+,\s*(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|\$\{[^}]+\})[^)]*\)/gi;
    
    if (gradientRegex.test(content)) {
      const matches = content.match(gradientRegex);
      totalReplacements += matches.length;
      content = content.replace(gradientRegex, "$1");
    }
    
    // Also catch simpler gradients like linear-gradient(135deg, #25d366, #128c7e)
    const gradientRegex2 = /linear-gradient\([^,]+,\s*(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|\$\{[^}]+\})\s*,[^)]*\)/gi;
    if (gradientRegex2.test(content)) {
        const matches = content.match(gradientRegex2);
        totalReplacements += matches.length;
        content = content.replace(gradientRegex2, "$1");
    }

    // Special manual overrides for backticks like `linear-gradient(135deg, ${theme.accent}, ...)` -> `${theme.accent}`
    const backtickGradient = /`linear-gradient\([^,]+,\s*\$\{([^}]+)\}[^`]*`/gi;
    if (backtickGradient.test(content)) {
        content = content.replace(backtickGradient, "`${$1}`");
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      console.log(`Updated: ${filePath.replace(path.join(__dirname, '..'), '')}`);
    }
  });
});

console.log(`\nDone! Replaced ${totalReplacements} gradients in ${filesModified} files.`);
