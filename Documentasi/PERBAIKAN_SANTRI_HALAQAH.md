# Perbaikan Filter Santri Berdasarkan Halaqah Guru

## Masalah yang Diperbaiki

### Sebelum:
- API `/api/guru/santri` menampilkan SEMUA santri (11 santri)
- Tidak ada filter berdasarkan halaqah guru
- Tidak ada authentication check
- Guru bisa melihat santri dari halaqah lain

### Sesudah:
- ✅ API menggunakan authentication (JWT token)
- ✅ Hanya menampilkan santri dari halaqah yang diajar guru tersebut
- ✅ Verify role guru sebelum akses
- ✅ Filter berdasarkan HalaqahSantri relation

## Perubahan yang Dilakukan

### 1. Authentication & Authorization
```typescript
// Get authenticated user
const { user, error } = await withAuth(request)

// Verify user is a guru
if (user.role.name !== 'guru') {
  return 403 Forbidden
}
```

### 2. Filter Berdasarkan Halaqah Guru
```typescript
// Get halaqah yang diajar oleh guru ini
const halaqahList = await prisma.halaqah.findMany({
  where: {
    guruId: user.id  // Hanya halaqah guru yang login
  }
})

// Get santri dari halaqah tersebut
const halaqahSantriList = await prisma.halaqahSantri.findMany({
  where: {
    halaqahId: {
      in: halaqahIds  // Hanya dari halaqah guru
    }
  }
})
```

### 3. Response Data
```json
{
  "success": true,
  "data": {
    "santriList": [...],      // Santri dari halaqah guru
    "byHalaqah": {...},       // Grouped by halaqah
    "halaqahList": [...],     // Halaqah yang diajar
    "summary": {
      "totalSantri": 5,
      "totalHalaqah": 1,
      "santriPerHalaqah": [...]
    }
  }
}
```

## Test Results

### Ustadz Ahmad (Halaqah Umar):
```
✅ Login successful!
   User: Ustadz Ahmad
   Role: guru

✅ API Response Success!
   Total Santri: 5 (hanya dari Halaqah Umar)
   Total Halaqah: 1 (Halaqah Umar)

👥 Santri List:
  1. Santri 1 (santri01) - Halaqah: umar
  2. Santri 10 (santri10) - Halaqah: umar
  3. Santri 2 (santri2) - Halaqah: umar
  4. Santri 3 (santri3) - Halaqah: umar
  5. Santri 4 (santri4) - Halaqah: umar
```

## Database Schema

### HalaqahSantri Table:
```prisma
model HalaqahSantri {
  id            Int      @id @default(autoincrement())
  tahunAkademik String
  semester      Semester
  halaqahId     Int
  santriId      Int
  halaqah       Halaqah  @relation(...)
  santri        User     @relation(...)
}
```

### Halaqah Table:
```prisma
model Halaqah {
  id          Int    @id @default(autoincrement())
  namaHalaqah String
  guruId      Int?   // Guru yang mengajar
  guru        User?  @relation(...)
  santri      HalaqahSantri[]
}
```

## File yang Diubah

1. **app/api/guru/santri/route.ts**
   - Added authentication with `withAuth()`
   - Added role verification
   - Filter by guru's halaqah
   - Use HalaqahSantri relation

2. **scripts/populate-halaqah-santri.js**
   - Script untuk populate data HalaqahSantri
   - Assign santri ke Halaqah Umar

3. **scripts/test-guru-santri-with-auth.js**
   - Test script dengan authentication
   - Login as guru
   - Test API dengan JWT token

4. **scripts/check-guru-passcode.js**
   - Helper script untuk cek passcode guru

## Cara Test

### 1. Populate Data (jika belum):
```bash
node scripts/populate-halaqah-santri.js
```

### 2. Test API:
```bash
node scripts/test-guru-santri-with-auth.js
```

### 3. Test di Browser:
1. Login sebagai guru (passcode: `guru01`)
2. Buka `/ujian` (form ujian)
3. Pilih santri - hanya akan muncul santri dari halaqah guru tersebut

## Security Features

1. ✅ **Authentication Required**
   - Harus login dengan JWT token
   - Token di-verify sebelum akses

2. ✅ **Role-Based Access Control**
   - Hanya role `guru` yang bisa akses
   - Admin/santri/ortu tidak bisa akses endpoint ini

3. ✅ **Data Isolation**
   - Guru hanya bisa lihat santri dari halaqah mereka
   - Tidak bisa lihat santri dari halaqah lain

4. ✅ **Proper Error Messages**
   - 401: Unauthorized (no token)
   - 403: Forbidden (bukan guru)
   - 404: Not found (tidak ada halaqah)

## Skenario Multi-Halaqah

Jika seorang guru mengajar di beberapa halaqah:

```typescript
// Guru mengajar di Halaqah Umar dan Halaqah Ali
const halaqahList = [
  { id: 1, namaHalaqah: 'umar' },
  { id: 2, namaHalaqah: 'ali' }
]

// API akan return santri dari KEDUA halaqah
const santriList = [
  // Santri dari Halaqah Umar
  { id: 1, nama: 'Santri 1', halaqah: 'umar' },
  { id: 2, nama: 'Santri 2', halaqah: 'umar' },
  // Santri dari Halaqah Ali
  { id: 10, nama: 'Santri 10', halaqah: 'ali' },
  { id: 11, nama: 'Santri 11', halaqah: 'ali' }
]
```

## Tanggal Perbaikan
8 November 2025

## Status
✅ SELESAI - Santri sudah difilter berdasarkan halaqah guru yang login
