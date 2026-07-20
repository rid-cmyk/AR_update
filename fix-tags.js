const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./components');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let replaced = content.replace(/<Tag([^>]*?)size=["']small["']([^>]*?)>/g, '<Tag$1style={{ fontSize: "12px", padding: "0 8px" }}$2>');
  replaced = replaced.replace(/<Tag([^>]*?)size=["']large["']([^>]*?)>/g, '<Tag$1style={{ fontSize: "16px", padding: "4 12px" }}$2>');
  replaced = replaced.replace(/<Tag([^>]*?)size=\{["']large["']\}([^>]*?)>/g, '<Tag$1style={{ fontSize: "16px", padding: "4 12px" }}$2>');
  if (content !== replaced) {
    fs.writeFileSync(file, replaced);
    count++;
    console.log('Fixed', file);
  }
});
console.log('Total fixed tags:', count);
