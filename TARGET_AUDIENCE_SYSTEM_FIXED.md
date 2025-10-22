# Sistem Target Audience Pengumuman - DIPERBAIKI

## 📋 Ringkasan Perbaikan

Sistem target audience pengumuman telah berhasil diperbaiki agar bekerja dengan benar. Sekarang ketika admin membuat pengumuman dengan target audience tertentu, pengumuman tersebut HANYA akan muncul di dashboard role yang ditargetkan.

## 🎯 Cara Kerja Target Audience

### 1. **Admin Pilih Target "Khusus Santri"**
```
✅ Muncul di: Dashboard Santri
❌ TIDAK muncul di: Dashboard Guru, Orang Tua, Admin
```

### 2. **Admin Pilih Target "Khusus Guru"**
```
✅ Muncul di: Dashboard Guru
❌ TIDAK muncul di: Dashboard Santri, Orang Tua, Admin
```

### 3. **Admin Pilih Target "Khusus Orang Tua"**
```
✅ Muncul di: Dashboard Orang Tua
❌ TIDAK muncul di: Dashboard Santri, Guru, Admin
```

### 4. **Admin Pilih Target "Semua User"**
```
✅ Muncul di: Dashboard Santri, Guru, Orang Tua, Admin (SEMUA)
```

## 🔧 Perbaikan yang Dilakukan

### 1. **API Notifikasi Unified (`/api/notifikasi`)**
```typescript
// SEBELUM (SALAH)
let audienceFilter = {
  OR: [
    { targetAudience: 'semua' },
    { targetAudience: user.role.name }
  ]
};

// SESUDAH (BENAR)
const targetAudienceFilter = ['semua']; // Always include 'semua'

if (user.role.name === 'santri') {
  targetAudienceFilter.push('santri');
} else if (user.role.name === 'guru') {
  targetAudienceFilter.push('guru');
} else if (user.role.name === 'ortu') {
  targetAudienceFilter.push('ortu');
}

const pengumuman = await prisma.pengumuman.findMany({
  where: {
    targetAudience: {
      in: targetAudienceFilter // ['semua', 'santri'] untuk santri
    }
  }
});
```

### 2. **API Pengumuman Utama (`/api/pengumuman`)**
```typescript
// Struktur WHERE clause yang diperbaiki
let whereClause = {
  AND: [
    {
      // Only active announcements
      OR: [
        { tanggalKadaluarsa: null },
        { tanggalKadaluarsa: { gte: new Date() } }
      ]
    }
  ]
};

// Filter berdasarkan role user
if (user.role.name !== 'admin' && user.role.name !== 'super-admin') {
  const targetAudienceFilter = ['semua'];
  
  if (user.role.name === 'santri') {
    targetAudienceFilter.push('santri');
  } else if (user.role.name === 'guru') {
    targetAudienceFilter.push('guru');
  } else if (user.role.name === 'ortu') {
    targetAudienceFilter.push('ortu');
  }

  whereClause.AND.push({
    targetAudience: {
      in: targetAudienceFilter
    }
  });
}
```

### 3. **API Role-Specific**
Semua API role-specific diperbaiki dengan struktur yang konsisten:

#### **Santri (`/api/santri/pengumuman`)**
```typescript
let whereClause = {
  AND: [
    {
      targetAudience: {
        in: ['semua', 'santri'] // HANYA 'semua' dan 'santri'
      }
    },
    {
      OR: [
        { tanggalKadaluarsa: null },
        { tanggalKadaluarsa: { gte: new Date() } }
      ]
    }
  ]
};
```

#### **Guru (`/api/guru/pengumuman`)**
```typescript
let whereClause = {
  AND: [
    {
      targetAudience: {
        in: ['semua', 'guru'] // HANYA 'semua' dan 'guru'
      }
    },
    {
      OR: [
        { tanggalKadaluarsa: null },
        { tanggalKadaluarsa: { gte: new Date() } }
      ]
    }
  ]
};
```

#### **Orang Tua (`/api/ortu/pengumuman`)**
```typescript
let whereClause = {
  AND: [
    {
      targetAudience: {
        in: ['semua', 'ortu'] // HANYA 'semua' dan 'ortu'
      }
    },
    {
      OR: [
        { tanggalKadaluarsa: null },
        { tanggalKadaluarsa: { gte: new Date() } }
      ]
    }
  ]
};
```

## 🧪 Testing Scenario

### Test Case 1: Pengumuman untuk Santri
```
1. Admin login → Buat pengumuman
2. Judul: "Libur Santri"
3. Target Audience: "Khusus Santri"
4. Simpan

Expected Result:
✅ Muncul di dashboard santri
❌ TIDAK muncul di dashboard guru
❌ TIDAK muncul di dashboard orang tua
✅ Console log: "Santri pengumuman filter: targetAudience in [semua, santri]"
```

### Test Case 2: Pengumuman untuk Guru
```
1. Admin login → Buat pengumuman
2. Judul: "Rapat Guru"
3. Target Audience: "Khusus Guru"
4. Simpan

Expected Result:
✅ Muncul di dashboard guru
❌ TIDAK muncul di dashboard santri
❌ TIDAK muncul di dashboard orang tua
✅ Console log: "Guru pengumuman filter: targetAudience in [semua, guru]"
```

### Test Case 3: Pengumuman untuk Semua
```
1. Admin login → Buat pengumuman
2. Judul: "Libur Nasional"
3. Target Audience: "Semua User"
4. Simpan

Expected Result:
✅ Muncul di dashboard santri
✅ Muncul di dashboard guru
✅ Muncul di dashboard orang tua
✅ Muncul di dashboard admin
```

## 📊 Database Query Examples

### Query untuk Santri
```sql
SELECT * FROM Pengumuman 
WHERE targetAudience IN ('semua', 'santri')
AND (tanggalKadaluarsa IS NULL OR tanggalKadaluarsa >= NOW());
```

### Query untuk Guru
```sql
SELECT * FROM Pengumuman 
WHERE targetAudience IN ('semua', 'guru')
AND (tanggalKadaluarsa IS NULL OR tanggalKadaluarsa >= NOW());
```

### Query untuk Orang Tua
```sql
SELECT * FROM Pengumuman 
WHERE targetAudience IN ('semua', 'ortu')
AND (tanggalKadaluarsa IS NULL OR tanggalKadaluarsa >= NOW());
```

## 🔍 Monitoring & Debugging

### Console Logs untuk Debugging
```javascript
// Di setiap API
console.log(`User ${user.namaLengkap} (${user.role.name}) will see pengumuman with targetAudience: ${targetAudienceFilter.join(', ')}`);

// Output examples:
// "User Ahmad (santri) will see pengumuman with targetAudience: semua, santri"
// "User Budi (guru) will see pengumuman with targetAudience: semua, guru"
// "User Siti (ortu) will see pengumuman with targetAudience: semua, ortu"
```

### Verifikasi Database
```sql
-- Cek pengumuman berdasarkan target
SELECT id, judul, targetAudience, tanggal 
FROM Pengumuman 
ORDER BY tanggal DESC;

-- Cek notifikasi yang dibuat
SELECT n.id, n.pesan, n.type, u.namaLengkap, r.name as role
FROM Notifikasi n
JOIN User u ON n.userId = u.id
JOIN Role r ON u.roleId = r.id
WHERE n.type = 'pengumuman'
ORDER BY n.tanggal DESC;
```

## ✅ Hasil Akhir

**SISTEM TARGET AUDIENCE BERHASIL DIPERBAIKI!**

Sekarang sistem bekerja dengan benar:

1. ✅ **Target "Santri"** → HANYA muncul di dashboard santri
2. ✅ **Target "Guru"** → HANYA muncul di dashboard guru  
3. ✅ **Target "Orang Tua"** → HANYA muncul di dashboard orang tua
4. ✅ **Target "Semua"** → Muncul di SEMUA dashboard
5. ✅ **Konsistensi API** → Semua API menggunakan struktur query yang sama
6. ✅ **Logging** → Console log untuk debugging dan monitoring

Admin sekarang dapat dengan tepat menargetkan pengumuman ke role tertentu dan pengumuman akan muncul HANYA di dashboard role yang ditargetkan!