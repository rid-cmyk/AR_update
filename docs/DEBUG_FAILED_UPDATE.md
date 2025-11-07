# 🐛 Debug - Failed to Update Admin Settings

## Error: "Failed to update admin settings"

### Langkah Debug:

## 1. Buka Browser DevTools

**Tekan F12** atau **Ctrl+Shift+I**

## 2. Buka Tab Console

Lihat semua log yang muncul saat klik "Simpan Pengaturan"

### Log yang Harus Muncul:

```javascript
// Frontend logs:
Data yang akan disimpan: {
  whatsappNumber: "+6281234567890",
  whatsappMessageHelp: "...",
  whatsappMessageRegistered: "...",
  whatsappMessageUnregistered: "..."
}

Response status: 200 atau 500
Response ok: true atau false
```

### Jika Response Status 500:

```javascript
Error response: {
  error: "Failed to update admin settings",
  details: "Error message here",
  type: "PrismaClientKnownRequestError"
}
```

## 3. Buka Tab Network

1. Klik tab **Network**
2. Filter: **Fetch/XHR**
3. Klik "Simpan Pengaturan"
4. Cari request: `update-no-auth`
5. Klik request tersebut
6. Lihat:
   - **Headers** tab
   - **Payload** tab
   - **Response** tab

### Cek Request:

```
Method: PUT
URL: http://localhost:3000/api/admin-settings/update-no-auth
Status: 200 (sukses) atau 500 (error)

Request Payload:
{
  "whatsappNumber": "+6281234567890",
  "whatsappMessageHelp": "...",
  ...
}
```

### Cek Response:

**Jika Sukses (200)**:
```json
{
  "success": true,
  "settings": {
    "id": 1,
    "whatsappNumber": "+6281234567890",
    ...
  }
}
```

**Jika Error (500)**:
```json
{
  "error": "Failed to update admin settings",
  "details": "Error message",
  "type": "ErrorType"
}
```

## 4. Cek Terminal Server

Lihat log di terminal tempat server running (`npm run dev`)

### Log yang Harus Muncul:

```
=== PUT /api/admin-settings/update-no-auth START ===
Parsing request body...
Request body received: {
  "whatsappNumber": "+6281234567890",
  ...
}
Existing settings: found
Updating existing settings
Settings saved successfully: { id: 1, ... }
=== PUT /api/admin-settings/update-no-auth END (SUCCESS) ===
```

### Jika Ada Error:

```
=== ERROR updating admin settings ===
Error type: PrismaClientKnownRequestError
Error message: Invalid `prisma.adminSettings.update()` invocation
Error stack: ...
=== PUT /api/admin-settings/update-no-auth END (ERROR) ===
```

## 5. Common Errors & Solutions

### Error 1: "Cannot read property 'id' of null"

**Penyebab**: Database tidak ada data AdminSettings

**Solusi**:
```bash
# Run seed
npx tsx prisma/seed-admin-settings.ts
```

---

### Error 2: "PrismaClientKnownRequestError"

**Penyebab**: Database schema tidak sync

**Solusi**:
```bash
# Sync database
npx prisma db push

# Generate client
npx prisma generate
```

---

### Error 3: "Database connection failed"

**Penyebab**: Database tidak running

**Solusi**:
```bash
# Cek PostgreSQL running
# Windows:
services.msc
# Cari "PostgreSQL" dan pastikan running

# Test connection:
npx prisma db pull
```

---

### Error 4: "All fields are required"

**Penyebab**: Ada field yang kosong

**Debug**:
```javascript
// Cek di console:
Data yang akan disimpan: {
  whatsappNumber: "",  // ← Kosong!
  ...
}
```

**Solusi**: Pastikan semua field terisi atau akan gunakan default

---

### Error 5: "Failed to parse error response"

**Penyebab**: Response bukan JSON (mungkin HTML error page)

**Debug**:
```javascript
// Di Network tab, lihat Response:
<!DOCTYPE html>
<html>
  <head>
    <title>Error</title>
  </head>
  ...
</html>
```

**Solusi**: 
- Cek server error di terminal
- Restart server
- Cek file route tidak ada syntax error

---

### Error 6: "404 Not Found"

**Penyebab**: Route file tidak ada atau salah path

**Debug**:
```
GET http://localhost:3000/api/admin-settings/update-no-auth 404
```

**Solusi**:
```bash
# Cek file ada:
ls app/api/admin-settings/update-no-auth/route.ts

# Restart server:
# Ctrl+C di terminal
npm run dev
```

---

## 6. Checklist Debug

### ✅ Sebelum Debug:

- [ ] Server running (`npm run dev`)
- [ ] Database running (PostgreSQL)
- [ ] Browser DevTools terbuka
- [ ] Console tab visible
- [ ] Network tab visible
- [ ] Terminal server visible

### ✅ Saat Debug:

- [ ] Klik "Simpan Pengaturan"
- [ ] Cek console logs (frontend)
- [ ] Cek network request
- [ ] Cek network response
- [ ] Cek terminal logs (backend)
- [ ] Screenshot error jika ada

### ✅ Setelah Debug:

- [ ] Identifikasi error type
- [ ] Baca error message
- [ ] Cek error stack trace
- [ ] Ikuti solusi sesuai error
- [ ] Test lagi setelah fix

---

## 7. Quick Fixes

### Fix 1: Restart Server

```bash
# Di terminal server:
Ctrl+C
npm run dev
```

### Fix 2: Clear Cache

```bash
# Delete .next folder
rm -rf .next
# atau di Windows:
rmdir /s /q .next

# Restart server
npm run dev
```

### Fix 3: Reinstall Dependencies

```bash
npm install
npx prisma generate
npm run dev
```

### Fix 4: Reset Database

```bash
# Sync schema
npx prisma db push

# Seed data
npx tsx prisma/seed-admin-settings.ts
```

---

## 8. Test Manually

### Test dengan curl:

```bash
curl -X PUT http://localhost:3000/api/admin-settings/update-no-auth \
  -H "Content-Type: application/json" \
  -d '{
    "whatsappNumber": "+6281234567890",
    "whatsappMessageHelp": "Test message",
    "whatsappMessageRegistered": "Test registered",
    "whatsappMessageUnregistered": "Test unregistered"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "settings": {
    "id": 1,
    "whatsappNumber": "+6281234567890",
    ...
  }
}
```

---

## 9. Contact Support

Jika masih error setelah semua langkah:

### Kirim Info:

1. **Screenshot Console** (F12 → Console tab)
2. **Screenshot Network** (F12 → Network tab → Request detail)
3. **Terminal Logs** (Copy semua log dari terminal server)
4. **Error Message** (Copy exact error message)
5. **Environment**:
   - OS: Windows/Mac/Linux
   - Node version: `node -v`
   - Database: PostgreSQL version
   - Browser: Chrome/Firefox/Edge

### Hubungi:
- Developer team
- IT support
- Create GitHub issue

---

**Last Updated**: 2025-11-07  
**Version**: 2.2.2  
**Status**: 🐛 Debug Guide
