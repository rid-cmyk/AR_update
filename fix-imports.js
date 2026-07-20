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
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./app/api');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let replaced = content.replace(/import\s+{\s*getServerSession\s*}\s+from\s+["']next-auth["']/g, 'import { getServerSession } from "next-auth/next"');
  if (content !== replaced) {
    fs.writeFileSync(file, replaced);
    count++;
    console.log('Fixed', file);
  }
});
console.log('Total fixed:', count);
