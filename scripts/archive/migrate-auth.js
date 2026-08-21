const fs = require('fs');
const path = require('path');

const files = [
  "admin-settings/test/route.ts",
  "admin/download-raport-batch/route.ts",
  "admin/download-raport/[id]/route.ts",
  "admin/raport/[id]/download/route.ts",
  "admin/raport/[id]/print/route.ts",
  "admin/template-ujian/[id]/route.ts",
  "admin/template-ujian/[id]/komponen/route.ts",
  "admin/template-ujian/[id]/komponen/[komponenId]/route.ts",
  "admin/template-ujian/[id]/komponen/default/route.ts",
  "admin/template-ujian/[id]/toggle/route.ts",
  "admin/halaqah/route.ts",
  "admin/mhq-kriteria/route.ts",
  "admin/ujian/route.ts",
  "admin/ujian/[id]/verify/route.ts",
  "guru/ujian/[id]/remedial/route.ts",
  "guru/ujian/[id]/submit/route.ts",
  "guru/ujian/detailed/route.ts"
];

const basePath = "C:/Users/farre/AR_update/app/api";

files.forEach(file => {
  const filePath = path.join(basePath, file);
  if (!fs.existsSync(filePath)) {
    console.log("Not found:", filePath);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace imports
  content = content.replace(/import\s*{\s*getServerSession\s*}\s*from\s*['"]next-auth\/next['"]\s*;?/g, "");
  content = content.replace(/import\s*{\s*authOptions\s*}\s*from\s*['"]@\/lib\/auth['"]\s*;?/g, "");
  
  if (!content.includes('import { getAuthUser } from "@/lib/auth"')) {
    // Add getAuthUser after NextResponse or NextRequest import
    content = content.replace(/(import\s+.*from\s+['"]next\/server['"];?)/, "$1\nimport { getAuthUser } from \"@/lib/auth\"");
    // If not found next/server, just prepend
    if (!content.includes('getAuthUser')) {
      content = `import { getAuthUser } from "@/lib/auth"\n` + content;
    }
  }

  // Ensure GET/POST etc takes request parameter if it doesn't already
  const methodRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(([^)]*)\)\s*\{/g;
  content = content.replace(methodRegex, (match, method, args) => {
    let newArgs = args;
    if (!args || args.trim() === '') {
       newArgs = 'request: NextRequest';
    }
    return `export async function ${method}(${newArgs}) {`;
  });
  
  // Make sure NextRequest is imported if we added request: NextRequest
  if (content.includes('request: NextRequest') && !content.includes('NextRequest,')) {
    content = content.replace(/import\s*{\s*NextResponse\s*}\s*from\s*['"]next\/server['"]/, "import { NextRequest, NextResponse } from 'next/server'");
  }

  // Determine parameter name used (request or req)
  content = content.replace(/const\s+session\s*=\s*await\s+getServerSession\(authOptions\)/g, (match, offset, str) => {
      // Very basic heuristic
      let reqParamName = 'request';
      if (str.includes('(req: NextRequest')) reqParamName = 'req';
      return `const { user, error } = await getAuthUser(${reqParamName})`;
  });

  // Replace if (!session?.user) { ... }
  content = content.replace(/if\s*\(\s*!session\?\.user\s*\)\s*\{\s*return\s+NextResponse\.json\(\s*\{\s*error:\s*['"]Unauthorized['"]\s*\}\s*,\s*\{\s*status:\s*401\s*\}\s*\)\s*\}/g, 
    `if (!user || error) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }`);

  // Special handling for admin-settings/test/route.ts
  if (file.includes('test/route.ts')) {
      content = content.replace(/hasSession: !!session,/, 'hasSession: !!user,');
      content = content.replace(/hasUser: !!session\?\.user,/, 'hasUser: !!user,');
      content = content.replace(/userId: session\?\.user\?\.id,/, 'userId: user?.id,');
      content = content.replace(/session: session/, 'user: user');
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Done");
