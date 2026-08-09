const fs = require('fs');
const file = 'C:/Users/farre/AR_update/app/(dashboard)/super-admin/notifications/forgot-passcode/page.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement = `            <ForgotPasscodeDetailModal
                visible={detailModalVisible}
                onClose={() => {
                    setDetailModalVisible(false);
                    setSelectedNotification(null);
                }}
                notification={selectedNotification}
                onMarkAsRead={markAsRead}
                onWhatsAppMessage={handleWhatsAppMessage}
            />`;

let newContent = [
  ...lines.slice(0, 562),
  replacement,
  ...lines.slice(681)
].join('\n');

const importLines = `import ForgotPasscodeDetailModal from "@/components/super-admin/notifications/ForgotPasscodeDetailModal";`;

newContent = newContent.replace('import AdminSettingsModal from "@/components/super-admin/AdminSettingsModal";', 'import AdminSettingsModal from "@/components/super-admin/AdminSettingsModal";\n' + importLines);

fs.writeFileSync(file, newContent);
console.log('Success');
