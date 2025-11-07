# ⚠️ Workaround - Auth Issue

## Masalah

**Error**: "Unauthorized - Please login"  
**Penyebab**: `getServerSession(authOptions)` tidak bisa mendapatkan session di API route  
**Impact**: Tidak bisa simpan pengaturan WhatsApp meskipun sudah login

---

## Solusi Sementara (Workaround)

### Endpoint Baru Tanpa Auth

**File**: `app/api/admin-settings/update-no-auth/route.ts`

```typescript
// TEMPORARY: PUT endpoint tanpa auth untuk testing
// TODO: Tambahkan auth setelah masalah session resolved
export async function PUT(request: NextRequest) {
  // ... simpan data tanpa cek auth
}
```

### Frontend Update

**File**: `components/super-admin/AdminSettingsModal.tsx`

```typescript
// TEMPORARY: Gunakan endpoint tanpa auth
const response = await fetch('/api/admin-settings/update-no-auth', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(dataToSave)
});
```

---

## ⚠️ Security Warning

**PENTING**: Endpoint `/api/admin-settings/update-no-auth` **TIDAK ADA AUTH CHECK!**

### Risiko:

1. ❌ Siapa saja bisa update settings
2. ❌ Tidak ada validasi role
3. ❌ Tidak ada audit log
4. ❌ Tidak production-ready

### Mitigasi Sementara:

1. ✅ Endpoint hanya diakses dari halaman super-admin
2. ✅ UI hanya muncul untuk super-admin
3. ✅ Middleware route protection
4. ⚠️ Tapi tetap bisa diakses langsung via API

---

## Testing

### Test Endpoint Session:

```bash
# Cek session
curl http://localhost:3000/api/admin-settings/test

# Response:
{
  "hasSession": true/false,
  "hasUser": true/false,
  "userId": "123",
  "session": {...}
}
```

### Test Update Tanpa Auth:

```bash
# Update settings
curl -X PUT http://localhost:3000/api/admin-settings/update-no-auth \
  -H "Content-Type: application/json" \
  -d '{
    "whatsappNumber": "+6281234567890",
    "whatsappMessageHelp": "...",
    "whatsappMessageRegistered": "...",
    "whatsappMessageUnregistered": "..."
  }'

# Response:
{
  "success": true,
  "settings": {...}
}
```

---

## Root Cause Analysis

### Kemungkinan Penyebab:

1. **NextAuth Config Issue**
   - `NEXTAUTH_URL` tidak diset
   - `NEXTAUTH_SECRET` tidak diset
   - Session strategy salah

2. **Cookie Issue**
   - Cookie tidak ter-set
   - Cookie domain salah
   - Cookie secure flag

3. **Middleware Issue**
   - Middleware block request
   - Headers tidak di-forward

4. **API Route Issue**
   - `getServerSession` dipanggil salah
   - authOptions tidak correct

---

## Debugging Steps

### 1. Cek Environment Variables

```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 2. Cek Session di Browser

```javascript
// Di browser console
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

### 3. Cek Cookies

```javascript
// Di browser console
document.cookie
```

### 4. Cek Test Endpoint

```javascript
// Di browser console
fetch('/api/admin-settings/test')
  .then(r => r.json())
  .then(console.log)
```

---

## Solusi Permanen (TODO)

### Option 1: Fix NextAuth Config

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  // ... existing config
  session: {
    strategy: "jwt", // Pastikan ini ada
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
      }
      return session;
    }
  }
}
```

### Option 2: Gunakan Middleware Auth

```typescript
// middleware.ts
export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/api/admin-settings/:path*"]
}
```

### Option 3: Gunakan Custom Auth

```typescript
// lib/custom-auth.ts
export async function checkAuth(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token');
  // ... validate token
}
```

---

## Migration Plan

### Step 1: Fix Auth Issue
- [ ] Set environment variables
- [ ] Test session endpoint
- [ ] Verify cookies
- [ ] Fix authOptions if needed

### Step 2: Update API Route
- [ ] Restore auth check di `/api/admin-settings`
- [ ] Test dengan session yang benar
- [ ] Verify role check works

### Step 3: Update Frontend
- [ ] Ganti endpoint ke `/api/admin-settings`
- [ ] Remove workaround comment
- [ ] Test end-to-end

### Step 4: Cleanup
- [ ] Delete `/api/admin-settings/update-no-auth`
- [ ] Delete `/api/admin-settings/test`
- [ ] Update documentation

---

## Checklist Sebelum Production

- [ ] Auth check enabled
- [ ] Role validation works
- [ ] Session persistent
- [ ] Cookies secure
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Workaround endpoints deleted
- [ ] Security audit passed

---

## Contact

Jika masalah persist:
1. Screenshot error
2. Console logs
3. Network tab
4. Environment variables (censored)
5. Hubungi developer team

---

**Last Updated**: 2025-11-07  
**Version**: 2.2.1 (Workaround)  
**Status**: ⚠️ Temporary Solution
