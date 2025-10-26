# 📋 Dokumentasi Sinkronisasi Data Profil User

## 🎯 **Overview**
Dokumentasi ini menjelaskan bagaimana data profil user disinkronkan antara halaman dashboard, header bar, dan database untuk memastikan konsistensi data di seluruh sistem.

## 🔄 **Alur Sinkronisasi Data**

### **1. Login Process** 🔐
```typescript
// app/api/login/route.ts
1. User login dengan passCode
2. Sistem query database untuk mendapatkan data lengkap user
3. Data user disimpan dalam JWT token:
   - id, namaLengkap, username, role, foto
4. JWT token disimpan dalam HTTP-only cookie
5. Response login mengembalikan data user yang sama
```

### **2. Header Bar Data** 📊
```typescript
// components/layout/HeaderBar.tsx
1. Menggunakan API /api/auth/me untuk mendapatkan data user
2. Data ditampilkan di header: nama, role, foto
3. Auto-refresh setiap kali component mount
4. Data selalu fresh dari database (bukan dari JWT token)
```

### **3. Profile Pages Data** 👤
```typescript
// app/(dashboard)/*/profil/page.tsx
1. Menggunakan API /api/auth/me untuk fetch data
2. Form diisi dengan data terbaru dari database
3. Update menggunakan API /api/profile (PUT)
4. Setelah update, JWT token diperbarui dengan data baru
```

## 🛠️ **API Endpoints untuk Sinkronisasi**

### **1. GET /api/auth/me** 
**Fungsi**: Mendapatkan data user terbaru dari database
```typescript
// Sebelum (hanya dari JWT token):
return { user: decoded }

// Setelah (fresh dari database):
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { role: { select: { name: true } } }
});
return { user: { ...user, role: user.role.name } }
```

### **2. PUT /api/profile**
**Fungsi**: Update profil user dan sinkronisasi JWT token
```typescript
1. Validasi data input
2. Cek username tidak duplikat
3. Update data di database
4. Generate JWT token baru dengan data terbaru
5. Set cookie baru dengan token yang diperbarui
6. Log aktivitas update profil
```

## 📱 **Implementasi di Setiap Dashboard**

### **Super Admin** 👑
```typescript
// app/(dashboard)/super-admin/profil/page.tsx
- Fetch: /api/auth/me + /api/analytics/dashboard
- Update: /api/profile
- Extra: Dashboard statistics
- Fields: namaLengkap, username, email, noTlp, alamat, foto
```

### **Guru** 👨‍🏫
```typescript
// app/(dashboard)/guru/profil/page.tsx
- Fetch: /api/auth/me
- Update: /api/profile
- Fields: namaLengkap, username, email, noTlp, alamat, foto
```

### **Santri** 👨‍🎓
```typescript
// app/(dashboard)/santri/profil/page.tsx
- Fetch: /api/auth/me
- Update: /api/profile
- Fields: namaLengkap, username, email, noTlp, alamat, foto
```

### **Admin, Ortu, Yayasan** 👥
```typescript
// Menggunakan pattern yang sama
- Fetch: /api/auth/me
- Update: /api/profile
- Fields: namaLengkap, username, email, noTlp, alamat, foto
```

## 🔒 **Security & Validation**

### **JWT Token Management**
```typescript
// Login: Generate token dengan data user
const token = jwt.sign({
  id, namaLengkap, username, role, foto
}, JWT_SECRET, { expiresIn: '24h' });

// Update Profile: Regenerate token dengan data baru
const newToken = jwt.sign({
  id: updatedUser.id,
  namaLengkap: updatedUser.namaLengkap,
  username: updatedUser.username,
  role: updatedUser.role.name,
  foto: updatedUser.foto
}, JWT_SECRET, { expiresIn: '24h' });
```

### **Data Validation**
```typescript
// Required fields validation
if (!namaLengkap || !username) {
  return NextResponse.json(
    { error: "Nama lengkap dan username wajib diisi" },
    { status: 400 }
  );
}

// Username uniqueness check
const existingUser = await prisma.user.findFirst({
  where: { username: username, NOT: { id: userId } }
});
```

## 📊 **Data Flow Diagram**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│  JWT Token  │───▶│  Database   │
│   Process   │    │   Storage   │    │   Query     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Header     │◀───│ /api/auth/me│◀───│  Fresh Data │
│  Display    │    │   Endpoint  │    │  from DB    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Profile    │───▶│ /api/profile│───▶│  Update DB  │
│  Update     │    │   (PUT)     │    │ + New Token │
└─────────────┘    └─────────────┘    └─────────────┘
```

## ✅ **Checklist Sinkronisasi**

### **Data Consistency** ✅
- [x] Header bar menampilkan data terbaru dari database
- [x] Profile pages menggunakan data fresh dari database  
- [x] Update profile memperbarui JWT token
- [x] Semua dashboard menggunakan API endpoint yang sama

### **Security** ✅
- [x] JWT token diperbarui setelah profile update
- [x] Username uniqueness validation
- [x] HTTP-only cookies untuk token storage
- [x] Proper error handling dan validation

### **User Experience** ✅
- [x] Real-time update di header setelah profile change
- [x] Consistent form behavior di semua dashboard
- [x] Proper loading states dan error messages
- [x] Auto-refresh data setelah update

### **Performance** ✅
- [x] Efficient database queries dengan include
- [x] Minimal API calls dengan proper caching
- [x] Optimized JWT token size
- [x] Proper error handling untuk network issues

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Data Tidak Sinkron di Header**
```typescript
// Problem: Header masih menampilkan data lama
// Solution: Pastikan /api/auth/me mengambil dari database

// ❌ Wrong (dari JWT token saja)
return { user: decoded }

// ✅ Correct (fresh dari database)
const user = await prisma.user.findUnique(...)
return { user: user }
```

#### **2. Profile Update Tidak Tersimpan**
```typescript
// Problem: Update berhasil tapi data tidak berubah
// Solution: Pastikan JWT token diperbarui

// ✅ Update token setelah profile update
const newToken = jwt.sign(updatedUserData, JWT_SECRET)
response.cookies.set('auth_token', newToken)
```

#### **3. Username Conflict**
```typescript
// Problem: User bisa menggunakan username yang sudah ada
// Solution: Validasi uniqueness sebelum update

const existingUser = await prisma.user.findFirst({
  where: { username: username, NOT: { id: userId } }
});
if (existingUser) {
  return NextResponse.json({ error: "Username sudah digunakan" })
}
```

## 📈 **Performance Monitoring**

### **Metrics to Track**
- API response time untuk /api/auth/me
- Database query performance untuk user lookup
- JWT token generation time
- Profile update success rate

### **Optimization Opportunities**
- Implement Redis caching untuk user data
- Optimize database indexes untuk user queries
- Implement WebSocket untuk real-time updates
- Add client-side caching dengan SWR/React Query

---

## 📝 **Summary**

✅ **Sinkronisasi data profil telah berhasil diimplementasikan dengan:**

1. **Consistent Data Source**: Semua komponen menggunakan `/api/auth/me` yang mengambil data fresh dari database
2. **Proper Update Flow**: Profile update memperbarui database dan JWT token secara bersamaan
3. **Security**: Username validation, JWT token refresh, dan proper error handling
4. **User Experience**: Real-time updates di header dan form yang konsisten
5. **Performance**: Efficient queries dan minimal API calls

Data profil sekarang sudah tersinkronisasi dengan baik antara login, header bar, dan semua halaman profil dashboard! 🎯