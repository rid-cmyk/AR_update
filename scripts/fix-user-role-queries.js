const fs = require('fs');
const path = require('path');

function fixUserRoleQueries(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixUserRoleQueries(filePath);
    } else if (file.endsWith('.ts') && filePath.includes('app/api/')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace user queries without role include
      const oldQuery = /const user = await prisma\.user\.findUnique\(\{\s*where: \{ id: parseInt\(session\.user\.id\) \}\s*\}\)/g;
      const newQuery = `const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { role: true }
    })`;
      
      // Replace role checks
      const oldRoleCheck = /user\.role !== ['"]GURU['"]/g;
      const newRoleCheck = `user.role.name !== 'guru'`;
      
      let hasChanges = false;
      
      if (oldQuery.test(content)) {
        content = content.replace(oldQuery, newQuery);
        hasChanges = true;
      }
      
      if (oldRoleCheck.test(content)) {
        content = content.replace(oldRoleCheck, newRoleCheck);
        hasChanges = true;
      }
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
      }
    }
  }
}

console.log('Fixing user role queries...');
fixUserRoleQueries('./app/api');
console.log('Done!');