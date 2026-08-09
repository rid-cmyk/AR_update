const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/super-admin/notifications/forgot-passcode/page.tsx';
const content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const start = lines.findIndex(l => l.includes('const columns = ['));
const end = lines.findIndex((l, i) => i > start && l.trim() === '];');

lines.splice(start, end - start + 1);

let newContent = lines.join('\n');

newContent = newContent.replace('columns={columns}', `columns={getForgotPasscodeColumns({
                            formatPhoneNumberDisplay,
                            handleWhatsAppMessage,
                            handleViewDetail,
                            markAsRead,
                            deleteNotification,
                            deleteLoading
                        })}`);

const importLines = `import { getForgotPasscodeColumns, ForgotPasscodeNotification } from "@/components/super-admin/notifications/forgotPasscodeColumns";`;
newContent = newContent.replace('import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";', 'import AdminHeaderCard from "@/components/admin/layout/AdminHeaderCard";\n' + importLines);

const interfaceStart = newContent.indexOf('interface ForgotPasscodeNotification {');
if (interfaceStart !== -1) {
  const interfaceEnd = newContent.indexOf('}', interfaceStart + 100) + 1;
  newContent = newContent.substring(0, interfaceStart) + newContent.substring(interfaceEnd);
}

fs.writeFileSync(file, newContent);
console.log('Success');
