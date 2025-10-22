# Test Sinkronisasi Pengumuman - Semua Role

## 🧪 Test Scenarios

### Test 1: Pengumuman untuk Santri Saja
```
ADMIN ACTION:
1. Login sebagai admin
2. Buat pengumuman:
   - Judul: "Libur Khusus Santri"
   - Isi: "Santri libur besok untuk kegiatan khusus"
   - Target Audience: "🎓 Khusus Santri"
3. Klik Simpan

EXPECTED RESULTS:
✅ SANTRI login → Dashboard → Notifikasi → Muncul "Libur Khusus Santri"
❌ GURU login → Dashboard → Notifikasi → TIDAK ADA "Libur Khusus Santri"
❌ ORTU login → Dashboard → Notifikasi → TIDAK ADA "Libur Khusus Santri"
❌ YAYASAN login → Dashboard → Notifikasi → TIDAK ADA "Libur Khusus Santri"

CONSOLE LOGS:
- "Created X notifications for pengumuman Y"
- "Target audience: santri, Users notified: [nama-nama santri]"
- "User [Nama Santri] (santri) will see pengumuman with targetAudience: semua, santri"
- "User [Nama Guru] (guru) will see pengumuman with targetAudience: semua, guru"
```

### Test 2: Pengumuman untuk Guru Saja
```
ADMIN ACTION:
1. Login sebagai admin
2. Buat pengumuman:
   - Judul: "Rapat Guru Wajib"
   - Isi: "Semua guru wajib hadir rapat besok jam 8 pagi"
   - Target Audience: "👨‍🏫 Khusus Guru"
3. Klik Simpan

EXPECTED RESULTS:
✅ GURU login → Dashboard → Notifikasi → Muncul "Rapat Guru Wajib"
❌ SANTRI login → Dashboard → Notifikasi → TIDAK ADA "Rapat Guru Wajib"
❌ ORTU login → Dashboard → Notifikasi → TIDAK ADA "Rapat Guru Wajib"
❌ YAYASAN login → Dashboard → Notifikasi → TIDAK ADA "Rapat Guru Wajib"
```

### Test 3: Pengumuman untuk Orang Tua Saja
```
ADMIN ACTION:
1. Login sebagai admin
2. Buat pengumuman:
   - Judul: "Pertemuan Wali Murid"
   - Isi: "Undangan pertemuan wali murid bulan depan"
   - Target Audience: "👨‍👩‍👧‍👦 Khusus Orang Tua"
3. Klik Simpan

EXPECTED RESULTS:
✅ ORTU login → Dashboard → Notifikasi → Muncul "Pertemuan Wali Murid"
❌ SANTRI login → Dashboard → Notifikasi → TIDAK ADA "Pertemuan Wali Murid"
❌ GURU login → Dashboard → Notifikasi → TIDAK ADA "Pertemuan Wali Murid"
❌ YAYASAN login → Dashboard → Notifikasi → TIDAK ADA "Pertemuan Wali Murid"
```

### Test 4: Pengumuman untuk Yayasan Saja
```
ADMIN ACTION:
1. Login sebagai admin
2. Buat pengumuman:
   - Judul: "Laporan Keuangan Bulanan"
   - Isi: "Laporan keuangan bulan ini sudah tersedia"
   - Target Audience: "🏢 Khusus Yayasan"
3. Klik Simpan

EXPECTED RESULTS:
✅ YAYASAN login → Dashboard → Notifikasi → Muncul "Laporan Keuangan Bulanan"
❌ SANTRI login → Dashboard → Notifikasi → TIDAK ADA "Laporan Keuangan Bulanan"
❌ GURU login → Dashboard → Notifikasi → TIDAK ADA "Laporan Keuangan Bulanan"
❌ ORTU login → Dashboard → Notifikasi → TIDAK ADA "Laporan Keuangan Bulanan"
```

### Test 5: Pengumuman untuk Semua User
```
ADMIN ACTION:
1. Login sebagai admin
2. Buat pengumuman:
   - Judul: "Libur Nasional 17 Agustus"
   - Isi: "Sekolah libur dalam rangka HUT RI"
   - Target Audience: "🌐 Semua User"
3. Klik Simpan

EXPECTED RESULTS:
✅ SANTRI login → Dashboard → Notifikasi → Muncul "Libur Nasional 17 Agustus"
✅ GURU login → Dashboard → Notifikasi → Muncul "Libur Nasional 17 Agustus"
✅ ORTU login → Dashboard → Notifikasi → Muncul "Libur Nasional 17 Agustus"
✅ YAYASAN login → Dashboard → Notifikasi → Muncul "Libur Nasional 17 Agustus"
```

## 🔍 Cara Verifikasi

### 1. Manual Testing
```
Step 1: Admin buat pengumuman dengan target tertentu
Step 2: Login sebagai role target → Harus muncul
Step 3: Login sebagai role lain → Harus TIDAK muncul
Step 4: Ulangi untuk semua kombinasi target audience
```

### 2. Console Log Verification
```javascript
// Saat admin buat pengumuman
"Creating pengumuman: {judul: '...', targetAudience: 'santri'}"
"Created 5 notifications for pengumuman 123"
"Target audience: santri, Users notified: Ahmad, Budi, Siti, ..."

// Saat user login dan buka notifikasi
"User Ahmad (santri) will see pengumuman with targetAudience: semua, santri"
"User Pak Guru (guru) will see pengumuman with targetAudience: semua, guru"
```

### 3. Database Verification
```sql
-- Cek pengumuman yang dibuat
SELECT id, judul, targetAudience, createdAt FROM Pengumuman ORDER BY createdAt DESC;

-- Cek notifikasi yang dibuat untuk pengumuman tertentu
SELECT 
  n.id, n.pesan, n.type, n.refId,
  u.namaLengkap, r.name as role
FROM Notifikasi n
JOIN User u ON n.userId = u.id
JOIN Role r ON u.roleId = r.id
WHERE n.type = 'pengumuman' AND n.refId = [PENGUMUMAN_ID]
ORDER BY u.namaLengkap;

-- Cek apakah filtering bekerja dengan benar
-- Untuk santri: hanya pengumuman dengan targetAudience 'semua' atau 'santri'
-- Untuk guru: hanya pengumuman dengan targetAudience 'semua' atau 'guru'
-- dst.
```

## 📊 Expected Results Matrix

| Admin Target | Santri Dashboard | Guru Dashboard | Ortu Dashboard | Yayasan Dashboard |
|--------------|------------------|----------------|----------------|-------------------|
| "Khusus Santri" | ✅ MUNCUL | ❌ TIDAK | ❌ TIDAK | ❌ TIDAK |
| "Khusus Guru" | ❌ TIDAK | ✅ MUNCUL | ❌ TIDAK | ❌ TIDAK |
| "Khusus Orang Tua" | ❌ TIDAK | ❌ TIDAK | ✅ MUNCUL | ❌ TIDAK |
| "Khusus Yayasan" | ❌ TIDAK | ❌ TIDAK | ❌ TIDAK | ✅ MUNCUL |
| "Semua User" | ✅ MUNCUL | ✅ MUNCUL | ✅ MUNCUL | ✅ MUNCUL |

## 🚨 Troubleshooting

### Jika Pengumuman Tidak Muncul:
1. **Cek Console Logs**: Apakah notifikasi dibuat?
2. **Cek Target Audience**: Apakah sesuai dengan role user?
3. **Cek Database**: Apakah ada record di tabel Notifikasi?
4. **Cek API Response**: Apakah filtering bekerja dengan benar?

### Jika Pengumuman Muncul di Role yang Salah:
1. **Cek Target Audience**: Pastikan admin pilih target yang benar
2. **Cek API Filtering**: Pastikan targetAudienceFilter benar
3. **Cek Database Schema**: Pastikan enum TargetAudience lengkap

## ✅ Success Criteria

Sistem dianggap berhasil jika:
1. ✅ Pengumuman dengan target "santri" HANYA muncul di dashboard santri
2. ✅ Pengumuman dengan target "guru" HANYA muncul di dashboard guru
3. ✅ Pengumuman dengan target "ortu" HANYA muncul di dashboard orang tua
4. ✅ Pengumuman dengan target "yayasan" HANYA muncul di dashboard yayasan
5. ✅ Pengumuman dengan target "semua" muncul di SEMUA dashboard
6. ✅ Console logs menunjukkan filtering yang benar
7. ✅ Database records sesuai dengan target audience
8. ✅ Real-time sync bekerja tanpa delay

Jika semua criteria di atas terpenuhi, maka sistem sinkronisasi pengumuman bekerja dengan sempurna!