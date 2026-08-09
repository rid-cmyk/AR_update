const fs = require('fs');
const file = 'C:/Users/farre/AR_update/components/layout/SidebarMenus.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `  if (isOrtuSection) return getOrtuMenu(navigate);
  if (isYayasanSection) return getYayasanMenu(navigate);
  if (isSantriSection) return getSantriMenu(navigate);
  if (isGuruSection) return getGuruMenu(navigate);
  if (isAdminSection) return getAdminMenu(navigate);
  
  return getSuperAdminMenu(navigate, unreadNotifications);`;

let newContent = [
  ...lines.slice(0, 119),
  replacement,
  ...lines.slice(495)
].join('\n');

const importLines = `import {
  getOrtuMenu,
  getYayasanMenu,
  getSantriMenu,
  getGuruMenu,
  getAdminMenu,
  getSuperAdminMenu,
} from "./SidebarMenuDefinitions";`;

newContent = newContent.replace('import type { MenuProps } from "antd";', 'import type { MenuProps } from "antd";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
