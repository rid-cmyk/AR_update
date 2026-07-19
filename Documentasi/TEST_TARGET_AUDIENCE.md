# Test Target Audience System

## 🧪 Skenario Testing

### Skenario 1: Admin buat pengumuman untuk SANTRI saja

**Admin Action:**
```
1. Login sebagai admin
2. Buat pengumuman:
   - Judul: "Libur Khusus Santri"
   - Isi: "Santri libur besok"
   - Target Audience: "Khusus Santri"
3. Simpan
```

**Expected Result:**
```
✅ SANTRI login → Dashboard → Notifikasi → Muncul "Libur Khusus Santri"
❌ GURU login → Dashboard → Notifikasi → TIDAK ADA "Libur Khusus Santri"
❌ ORTU login → Dashboard → Notifikasi → TIDAK ADA "Libur Khusus Santri"
```

**Database Query untuk Verifikasi:**
```sql
-- Pengumuman yang dibuat
SELECT id, judul, targetAudience FROM Pengumuman WHERE judul = 'Libur Khusus Santri';
-- Result: targetAudience = 'santri'

-- Notifikasi yang dibuat (hanya untuk santri)
SELECT n.*, u.namaLengkap, r.name as role 
FROM Notifikasi n 
JOIN User u ON n.userId = u.id 
JOIN Role r ON u.roleId = r.id 
WHERE n.pesan LIKE '%Libur Khusus Santri%';
-- Result: Hanya user dengan role 'santri'
```

### Skenario 2: Admin buat pengumuman untuk GURU saja

**Admin Action:**
```
1. Login sebagai admin
2. Buat pengumuman:
   - Judul: "Rapat Guru Wajib"
   - Isi: "Rapat besok jam 8"
   - Target Audience: "Khusus Guru"
3. Simpan
```

**Expected Result:**
```
✅ GURU login → Dashboard → Notifikasi → Muncul "Rapat Guru Wajib"
❌ SANTRI login → Dashboard → Notifikasi → TIDAK ADA "Rapat Guru Wajib"
❌ ORTU login → Dashboard → Notifikasi → TIDAK ADA "Rapat Guru Wajib"
```

### Skenario 3: Admin buat pengumuman untuk SEMUA

**Admin Action:**
```
1. Login sebagai admin
2. Buat pengumuman:
   - Judul: "Libur Nasional"
   - Isi: "Sekolah libur 17 Agustus"
   - Target Audience: "Semua User"
3. Simpan
```

**Expected Result:**
```
✅ SANTRI login → Dashboard → Notifikasi → Muncul "Libur Nasional"
✅ GURU login → Dashboard → Notifikasi → Muncul "Libur Nasional"
✅ ORTU login → Dashboard → Notifikasi → Muncul "Libur Nasional"
```

## 🔍 Cara Verifikasi

### 1. Check Console Logs
Saat user login dan buka notifikasi, akan muncul log:
```
// Santri login
"User Ahmad (santri) will see pengumuman with targetAudience: semua, santri"

// Guru login  
"User Budi (guru) will see pengumuman with targetAudience: semua, guru"

// Ortu login
"User Siti (ortu) will see pengumuman with targetAudience: semua, ortu"
```

### 2. Check Database
```sql
-- Lihat semua pengumuman dan targetnya
SELECT id, judul, targetAudience, tanggal FROM Pengumuman ORDER BY tanggal DESC;

-- Lihat notifikasi yang dibuat untuk setiap pengumuman
SELECT 
  p.judul,
  p.targetAudience,
  COUNT(n.id) as notif_count,
  GROUP_CONCAT(r.name) as roles_notified
FROM Pengumuman p
LEFT JOIN Notifikasi n ON p.id = n.refId AND n.type = 'pengumuman'
LEFT JOIN User u ON n.userId = u.id
LEFT JOIN Role r ON u.roleId = r.id
GROUP BY p.id;
```

### 3. Manual Testing Steps

**Step 1: Buat pengumuman untuk santri**
```
Admin → Pengumuman → Tambah → Target: "Khusus Santri" → Simpan
```

**Step 2: Login sebagai santri**
```
Santri → Login → Dashboard → Notifikasi → Harus ada pengumuman baru
```

**Step 3: Login sebagai guru**
```
Guru → Login → Dashboard → Notifikasi → TIDAK boleh ada pengumuman tadi
```

**Step 4: Login sebagai ortu**
```
Ortu → Login → Dashboard → Notifikasi → TIDAK boleh ada pengumuman tadi
```

## ✅ Expected Behavior Summary

| Target Audience | Muncul di Santri | Muncul di Guru | Muncul di Ortu |
|-----------------|------------------|----------------|----------------|
| "Khusus Santri" | ✅ YA           | ❌ TIDAK       | ❌ TIDAK       |
| "Khusus Guru"   | ❌ TIDAK        | ✅ YA          | ❌ TIDAK       |
| "Khusus Orang Tua" | ❌ TIDAK     | ❌ TIDAK       | ✅ YA          |
| "Semua User"    | ✅ YA           | ✅ YA          | ✅ YA          |

Jika ada yang tidak sesuai tabel di atas, berarti ada bug yang perlu diperbaiki!