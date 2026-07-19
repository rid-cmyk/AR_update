# Verifikasi Sinkronisasi Pengumuman - FINAL CHECK

## 🔍 Status Sistem Saat Ini

### ✅ API Endpoints yang Sudah Dibuat:
1. **`/api/pengumuman`** - API utama untuk admin (CREATE, READ, UPDATE, DELETE)
2. **`/api/notifikasi`** - API unified untuk semua role (READ notifications + pengumuman)
3. **`/api/santri/pengumuman`** - API khusus santri
4. **`/api/guru/pengumuman`** - API khusus guru
5. **`/api/ortu/pengumuman`** - API khusus orang tua
6. **`/api/yayasan/pengumuman`** - API khusus yayasan ✅ BARU

### ✅ Dashboard Notifikasi yang Sudah Dibuat:
1. **Santri**: `/santri/notifikasi` - Tema Biru
2. **Guru**: `/guru/notifikasi` - Tema Hijau
3. **Orang Tua**: `/ortu/notifikasi` - Tema Ungu
4. **Yayasan**: `/yayasan/notifikasi` - Tema Orange

### ✅ Target Audience Options di Admin:
```typescript
const audienceOptions = [
  { value: "semua", label: "🌐 Semua User" },
  { value: "santri", label: "🎓 Khusus Santri" },
  { value: "guru", label: "👨‍🏫 Khusus Guru" },
  { value: "ortu", label: "👨‍👩‍👧‍👦 Khusus Orang Tua" },
  { value: "yayasan", label: "🏢 Khusus Yayasan" }, // ✅ BARU
  { value: "admin", label: "⚙️ Khusus Admin" }
];
```

## 🔄 Alur Sinkronisasi Lengkap

### 1. Admin Membuat Pengumuman
```
Admin Dashboard → Pengumuman → Tambah Baru
↓
Pilih Target Audience (santri/guru/ortu/yayasan/semua)
↓
Isi judul dan konten
↓
Klik "Simpan"
↓
API POST /api/pengumuman
```

### 2. Sistem Otomatis Proses
```
createNotificationsForAnnouncement() dipanggil
↓
Query users berdasarkan targetAudience:
- Jika "santri" → Query users dengan role "santri"
- Jika "guru" → Query users dengan role "guru"
- Jika "ortu" → Query users dengan role "ortu"
- Jika "yayasan" → Query users dengan role "yayasan"
- Jika "semua" → Query semua users
↓
Buat record di tabel Notifikasi untuk setiap user target
↓
Console log: "Created X notifications for pengumuman Y"
```

### 3. User Melihat Notifikasi
```
User login → Dashboard → Notifikasi
↓
API GET /api/notifikasi
↓
Filtering berdasarkan user role:
- Santri: targetAudience IN ['semua', 'santri']
- Guru: targetAudience IN ['semua', 'guru']
- Ortu: targetAudience IN ['semua', 'ortu']
- Yayasan: targetAudience IN ['semua', 'yayasan']
↓
Return pengumuman yang sesuai target + notifikasi reguler
↓
Tampilkan di dashboard dengan tema sesuai role
```

## 🧪 Test Cases Lengkap

### Test Case 1: Target "Khusus Santri"
```
INPUT:
- Admin buat pengumuman
- Target: "🎓 Khusus Santri"
- Judul: "Libur Santri Besok"

EXPECTED OUTPUT:
✅ Santri Dashboard: Muncul "Libur Santri Besok"
❌ Guru Dashboard: TIDAK muncul
❌ Ortu Dashboard: TIDAK muncul
❌ Yayasan Dashboard: TIDAK muncul

CONSOLE LOGS:
"Target audience: santri, Users notified: [nama santri]"
"User [Santri] (santri) will see pengumuman with targetAudience: semua, santri"
"User [Guru] (guru) will see pengumuman with targetAudience: semua, guru"
```

### Test Case 2: Target "Khusus Guru"
```
INPUT:
- Admin buat pengumuman
- Target: "👨‍🏫 Khusus Guru"
- Judul: "Rapat Guru Penting"

EXPECTED OUTPUT:
✅ Guru Dashboard: Muncul "Rapat Guru Penting"
❌ Santri Dashboard: TIDAK muncul
❌ Ortu Dashboard: TIDAK muncul
❌ Yayasan Dashboard: TIDAK muncul
```

### Test Case 3: Target "Khusus Orang Tua"
```
INPUT:
- Admin buat pengumuman
- Target: "👨‍👩‍👧‍👦 Khusus Orang Tua"
- Judul: "Pertemuan Wali Murid"

EXPECTED OUTPUT:
✅ Ortu Dashboard: Muncul "Pertemuan Wali Murid"
❌ Santri Dashboard: TIDAK muncul
❌ Guru Dashboard: TIDAK muncul
❌ Yayasan Dashboard: TIDAK muncul
```

### Test Case 4: Target "Khusus Yayasan"
```
INPUT:
- Admin buat pengumuman
- Target: "🏢 Khusus Yayasan"
- Judul: "Laporan Bulanan Tersedia"

EXPECTED OUTPUT:
✅ Yayasan Dashboard: Muncul "Laporan Bulanan Tersedia"
❌ Santri Dashboard: TIDAK muncul
❌ Guru Dashboard: TIDAK muncul
❌ Ortu Dashboard: TIDAK muncul
```

### Test Case 5: Target "Semua User"
```
INPUT:
- Admin buat pengumuman
- Target: "🌐 Semua User"
- Judul: "Libur Nasional"

EXPECTED OUTPUT:
✅ Santri Dashboard: Muncul "Libur Nasional"
✅ Guru Dashboard: Muncul "Libur Nasional"
✅ Ortu Dashboard: Muncul "Libur Nasional"
✅ Yayasan Dashboard: Muncul "Libur Nasional"
```

## 📊 Database Verification Queries

### 1. Cek Pengumuman yang Dibuat
```sql
SELECT 
  id, 
  judul, 
  targetAudience, 
  createdAt,
  (SELECT namaLengkap FROM User WHERE id = createdBy) as creator
FROM Pengumuman 
ORDER BY createdAt DESC 
LIMIT 10;
```

### 2. Cek Notifikasi yang Dibuat
```sql
SELECT 
  n.id,
  n.pesan,
  n.type,
  n.refId,
  u.namaLengkap,
  r.name as user_role,
  p.targetAudience
FROM Notifikasi n
JOIN User u ON n.userId = u.id
JOIN Role r ON u.roleId = r.id
LEFT JOIN Pengumuman p ON n.refId = p.id AND n.type = 'pengumuman'
WHERE n.type = 'pengumuman'
ORDER BY n.tanggal DESC;
```

### 3. Verifikasi Target Audience Filtering
```sql
-- Untuk santri: hanya pengumuman 'semua' atau 'santri'
SELECT p.id, p.judul, p.targetAudience
FROM Pengumuman p
WHERE p.targetAudience IN ('semua', 'santri')
ORDER BY p.createdAt DESC;

-- Untuk guru: hanya pengumuman 'semua' atau 'guru'
SELECT p.id, p.judul, p.targetAudience
FROM Pengumuman p
WHERE p.targetAudience IN ('semua', 'guru')
ORDER BY p.createdAt DESC;

-- dst untuk role lainnya...
```

## 🔧 Troubleshooting Guide

### Problem: Pengumuman tidak muncul di dashboard target
**Solution:**
1. Cek console logs saat admin buat pengumuman
2. Verifikasi targetAudience di database
3. Cek apakah notifikasi dibuat di tabel Notifikasi
4. Verifikasi API filtering dengan console logs

### Problem: Pengumuman muncul di role yang salah
**Solution:**
1. Cek targetAudience yang dipilih admin
2. Verifikasi filtering logic di API /api/notifikasi
3. Cek targetAudienceFilter array di console logs

### Problem: Notifikasi tidak dibuat
**Solution:**
1. Cek fungsi createNotificationsForAnnouncement
2. Verifikasi ada users dengan role target
3. Cek error logs di console

## ✅ Final Checklist

Sistem dianggap berhasil jika:

### ✅ Admin Dashboard
- [ ] Dapat memilih semua target audience (semua, santri, guru, ortu, yayasan, admin)
- [ ] Pengumuman tersimpan dengan targetAudience yang benar
- [ ] Console log menunjukkan notifikasi dibuat untuk user yang tepat

### ✅ Santri Dashboard
- [ ] Menerima pengumuman dengan target "semua" dan "santri"
- [ ] TIDAK menerima pengumuman untuk guru/ortu/yayasan
- [ ] Console log: "targetAudience: semua, santri"

### ✅ Guru Dashboard
- [ ] Menerima pengumuman dengan target "semua" dan "guru"
- [ ] TIDAK menerima pengumuman untuk santri/ortu/yayasan
- [ ] Console log: "targetAudience: semua, guru"

### ✅ Orang Tua Dashboard
- [ ] Menerima pengumuman dengan target "semua" dan "ortu"
- [ ] TIDAK menerima pengumuman untuk santri/guru/yayasan
- [ ] Console log: "targetAudience: semua, ortu"

### ✅ Yayasan Dashboard
- [ ] Menerima pengumuman dengan target "semua" dan "yayasan"
- [ ] TIDAK menerima pengumuman untuk santri/guru/ortu
- [ ] Console log: "targetAudience: semua, yayasan"

### ✅ Database Consistency
- [ ] Tabel Pengumuman memiliki targetAudience yang benar
- [ ] Tabel Notifikasi memiliki record untuk user yang tepat
- [ ] Tidak ada notifikasi untuk user yang bukan target

## 🎯 Kesimpulan

Jika semua checklist di atas terpenuhi, maka sistem sinkronisasi pengumuman bekerja dengan SEMPURNA sesuai target audience yang diatur admin di halaman pengumuman.

**SISTEM SIAP DIGUNAKAN!** 🚀