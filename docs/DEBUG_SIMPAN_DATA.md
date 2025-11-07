# 🐛 Debug - Masalah Simpan Data

## Langkah-langkah Debug

### 1. Buka Browser DevTools
- Tekan **F12** atau **Ctrl+Shift+I**
- Buka tab **Console**
- Buka tab **Network**

### 2. Coba Simpan Data
- Klik "Simpan Pengaturan"
- Perhatikan log di Console

### 3. Cek Log di Console

#### ✅ Log yang Harus Muncul (Success):

```javascript
// Frontend logs:
Data yang akan disimpan: {
  whatsappNumber: "+6281234567890",
  whatsappMessageHelp: "...",
  whatsappMessageRegistered: "...",
  whatsappMessageUnregistered: "..."
}

Response status: 200
Response ok: true

Response data: {
  success: true,
  settings: {...}
}

// Backend logs (di terminal server):
PUT /api/admin-settings called
Session: exists
User role: super-admin
Request body: {...}
Existing settings: found
Updating existing settings
Settings saved successfully
```

#### ❌ Log Jika Ada Error:

**Error 1: Unauthorized (401)**
```javascript
// Frontend:
Response status: 401
Response ok: false
Error response: { error: "Unauthorized - Please login" }

// Backend:
PUT /api/admin-settings called
Session: null
No session, returning 401
```

**Solusi**: Login ulang sebagai super-admin

---

**Error 2: Forbidden (403)**
```javascript
// Frontend:
Response status: 403
Response ok: false
Error response: { error: "Only super-admin can update settings" }

// Backend:
PUT /api/admin-settings called
Session: exists
User role: admin  // Bukan super-admin!
Not super-admin, returning 403
```

**Solusi**: Login dengan akun super-admin

---

**Error 3: Bad Request (400)**
```javascript
// Frontend:
Response status: 400
Response ok: false
Error response: { error: "All fields are required" }

// Backend:
PUT /api/admin-settings called
Session: exists
User role: super-admin
Request body: { whatsappNumber: "", ... }  // Ada field kosong!
```

**Solusi**: Pastikan semua field terisi (atau akan gunakan default)

---

**Error 4: Internal Server Error (500)**
```javascript
// Frontend:
Response status: 500
Response ok: false
Error response: { 
  error: "Failed to update admin settings",
  details: "Database connection failed"
}

// Backend:
PUT /api/admin-settings called
Session: exists
User role: super-admin
Request body: {...}
Error updating admin settings: [Error details]
```

**Solusi**: Cek koneksi database, cek server logs

---

### 4. Cek Network Tab

#### Request:
```
Method: PUT
URL: http://localhost:3000/api/admin-settings
Status: 200 (atau error code)

Headers:
  Content-Type: application/json

Payload:
{
  "whatsappNumber": "+6281234567890",
  "whatsappMessageHelp": "...",
  "whatsappMessageRegistered": "...",
  "whatsappMessageUnregistered": "..."
}
```

#### Response:
```
Status: 200 OK

Body:
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

## Checklist Debug

### ✅ Sebelum Debug:

- [ ] Server running (npm run dev)
- [ ] Database connected
- [ ] Login sebagai super-admin
- [ ] Browser DevTools terbuka
- [ ] Console tab visible
- [ ] Network tab visible

### ✅ Saat Debug:

- [ ] Klik "Simpan Pengaturan"
- [ ] Cek console logs (frontend)
- [ ] Cek terminal logs (backend)
- [ ] Cek network request
- [ ] Cek network response
- [ ] Screenshot error jika ada

### ✅ Setelah Debug:

- [ ] Identifikasi error code (401, 403, 400, 500)
- [ ] Baca error message
- [ ] Ikuti solusi sesuai error
- [ ] Test lagi setelah fix
- [ ] Verifikasi data tersimpan

---

## Common Issues & Solutions

### Issue 1: "Error response: {}"
**Penyebab**: Response tidak bisa di-parse sebagai JSON

**Debug**:
```javascript
// Cek di Network tab:
Response Headers:
  Content-Type: text/html  // Bukan application/json!
```

**Solusi**:
- Cek server error di terminal
- Mungkin ada crash di API route
- Restart server

---

### Issue 2: Session null
**Penyebab**: NextAuth session tidak terdeteksi

**Debug**:
```javascript
// Backend log:
Session: null
```

**Solusi**:
1. Logout dan login ulang
2. Clear browser cookies
3. Cek `.env` file:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   ```
4. Restart server

---

### Issue 3: Role bukan super-admin
**Penyebab**: User login bukan super-admin

**Debug**:
```javascript
// Backend log:
User role: admin  // atau guru, santri, dll
```

**Solusi**:
1. Cek role di database:
   ```sql
   SELECT u.username, r.name as role
   FROM "User" u
   JOIN "Role" r ON u."roleId" = r.id
   WHERE u.username = 'your-username';
   ```
2. Login dengan akun super-admin
3. Atau update role di database

---

### Issue 4: Database error
**Penyebab**: Koneksi database gagal

**Debug**:
```javascript
// Backend log:
Error updating admin settings: PrismaClientKnownRequestError
```

**Solusi**:
1. Cek database running:
   ```bash
   # PostgreSQL
   pg_isready
   ```
2. Cek connection string di `.env`:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
   ```
3. Test koneksi:
   ```bash
   npx prisma db pull
   ```
4. Restart database

---

## Advanced Debug

### Enable Verbose Logging

**Backend** (`app/api/admin-settings/route.ts`):
```typescript
// Tambahkan di awal function
console.log('=== PUT /api/admin-settings START ===');
console.log('Timestamp:', new Date().toISOString());
console.log('Headers:', Object.fromEntries(request.headers));

// Tambahkan di akhir
console.log('=== PUT /api/admin-settings END ===');
```

**Frontend** (`components/super-admin/AdminSettingsModal.tsx`):
```typescript
// Tambahkan di handleSubmit
console.log('=== SUBMIT START ===');
console.log('Form values:', values);
console.log('Merged data:', dataToSave);
console.log('=== SUBMIT END ===');
```

### Check Database Directly

```sql
-- Cek data AdminSettings
SELECT * FROM "AdminSettings";

-- Cek user dan role
SELECT u.id, u.username, r.name as role
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
WHERE u.username = 'your-username';
```

### Check API Route File

```bash
# Pastikan file ada
ls -la app/api/admin-settings/route.ts

# Cek syntax error
npx tsc --noEmit
```

---

## Test Scenarios

### Scenario 1: Fresh Install
```
1. Database kosong
2. Belum ada AdminSettings
3. Login sebagai super-admin
4. Buka modal pengaturan
5. Klik simpan
Expected: Create new settings dengan default
```

### Scenario 2: Update Existing
```
1. AdminSettings sudah ada
2. Login sebagai super-admin
3. Ubah data
4. Klik simpan
Expected: Update existing settings
```

### Scenario 3: Non Super-Admin
```
1. Login sebagai admin biasa
2. Coba akses API langsung
Expected: 403 Forbidden
```

### Scenario 4: No Session
```
1. Logout
2. Coba akses API langsung
Expected: 401 Unauthorized
```

---

## Contact Support

Jika masih error setelah semua langkah:

1. **Screenshot**:
   - Console logs
   - Network tab
   - Terminal logs

2. **Info**:
   - Browser & version
   - Node version
   - Database version
   - Error message lengkap

3. **Hubungi**:
   - Developer team
   - IT support

---

**Last Updated**: 2025-11-07  
**Version**: 2.1.2  
**Status**: ✅ Debug Ready
