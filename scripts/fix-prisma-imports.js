const fs = require('fs');
const path = require('path');

function fixPrismaImports(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixPrismaImports(filePath);
    } else if (file.endsWith('.ts') && filePath.includes('app/api/')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace PrismaClient import
      const oldImport = /import { PrismaClient } from ['"]@prisma\/client['"];?\s*\n\s*const prisma = new PrismaClient\(\);?/g;
      const newImport = 'import { prisma } from "@/lib/database/prisma";';
      
      if (oldImport.test(content)) {
        content = content.replace(oldImport, newImport);
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
      }
    }
  }
}

console.log('Fixing Prisma imports...');
fixPrismaImports('./app/api');
console.log('Done!');