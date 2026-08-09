const fs = require('fs');
const file = 'C:/Users/farre/AR_update/components/layout/ProfileContent.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const replacement = `        {/* Logout */}
        <ProfileLogoutSection handleLogout={handleLogout} />`;

const start = lines.findIndex(l => l.includes('{/* Logout */}'));
lines.splice(start, 23, replacement);

const importLines = `import ProfileLogoutSection from "./ProfileLogoutSection";`;

let newContent = lines.join('\n');
newContent = newContent.replace('import { Form, Input, Button, Card, Typography, Divider, Tabs, Avatar } from "antd";', 'import { Form, Input, Button, Card, Typography, Divider, Tabs, Avatar } from "antd";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
