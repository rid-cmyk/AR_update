# 🔄 Reset Settings ke Default

## Fitur Reset ke Default

Super admin dapat mereset semua pengaturan WhatsApp dan template pesan kembali ke nilai default dengan satu klik.

---

## Cara Menggunakan

### Langkah 1: Buka Modal Pengaturan
1. Login sebagai **Super Admin**
2. Buka menu **Notifikasi → Forgot Passcode**
3. Klik tombol **"Pengaturan"**

### Langkah 2: Klik Tombol Reset
1. Di modal pengaturan, lihat tombol **"🔄 Reset ke Default"** di pojok kiri bawah
2. Klik tombol tersebut

### Langkah 3: Konfirmasi Reset
1. Akan muncul dialog konfirmasi:
   ```
   Reset ke Pengaturan Default?
   Semua pengaturan akan dikembalikan ke nilai default. 
   Apakah Anda yakin?
   ```
2. Klik **"Ya, Reset"** untuk melanjutkan
3. Atau klik **"Batal"** untuk membatalkan

### Langkah 4: Verifikasi
1. Setelah reset, form akan otomatis reload dengan nilai default
2. Muncul notifikasi: "Pengaturan berhasil direset ke default"
3. Verifikasi semua field kembali ke nilai default

---

## Nilai Default

### Nomor WhatsApp:
```
+6281213923253
```

### Pesan Bantuan:
```
Assalamualaikum App Ar-Hafalan. 
saya mau nanya tentang App : 

terimakasih Atas bantuannya
```

### Pesan User Terdaftar:
```
Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. 
Berikut adalah passcode yang Anda minta:

📅 Tanggal Permintaan: {tanggal}
👤 Nama Pengguna: {nama}
🔐 Passcode: {passcode}

Passcode ini dapat digunakan untuk mengakses akun Anda di Aplikasi AR-Hafalan. 
Jaga kerahasiaan passcode Anda dan jangan berikan kepada siapapun.

Terima kasih atas partisipasinya dalam menggunakan Aplikasi AR-Hafalan.

Wassalamualaikum Warahmatullahi Wabarakatuh.
```

### Pesan User Tidak Terdaftar:
```
Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. 
Maaf, nomor {nomor} belum terdaftar dalam sistem kami.

Silakan melakukan pendaftaran terlebih dahulu melalui aplikasi 
atau hubungi admin untuk informasi lebih lanjut.

Terima kasih.

Wassalamualaikum Warahmatullahi Wabarakatuh.
```

---

## Kapan Menggunakan Reset?

### Gunakan Reset Ketika:
- ✅ Pengaturan sudah terlalu banyak diubah dan ingin kembali ke awal
- ✅ Template pesan tidak sesuai dan ingin menggunakan template standar
- ✅ Nomor WhatsApp salah dan ingin kembali ke nomor default
- ✅ Testing selesai dan ingin kembali ke production settings
- ✅ Ada kesalahan dalam pengaturan dan ingin mulai dari awal

### Jangan Reset Ketika:
- ❌ Hanya ingin mengubah satu field (lebih baik edit manual)
- ❌ Sudah ada pengaturan custom yang bagus
- ❌ Sedang dalam proses testing (simpan dulu pengaturan lama)

---

## Keamanan

### Proteksi:
- ✅ Hanya **super-admin** yang bisa reset
- ✅ Konfirmasi dialog sebelum reset
- ✅ API endpoint dilindungi dengan autentikasi
- ✅ Validasi role di backend

### API Endpoint:
```
DELETE /api/admin-settings
```

### Response Success:
```json
{
  "message": "Settings berhasil direset ke default",
  "settings": {
    "id": 1,
    "whatsappNumber": "+6281213923253",
    "whatsappMessageHelp": "...",
    "whatsappMessageRegistered": "...",
    "whatsappMessageUnregistered": "...",
    "createdAt": "2025-11-07T...",
    "updatedAt": "2025-11-07T..."
  }
}
```

---

## Flow Diagram

```
┌─────────────────────────────────────────┐
│  Super Admin klik "Reset ke Default"   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Muncul Dialog Konfirmasi               │
│  "Apakah Anda yakin?"                   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   [Ya, Reset]          [Batal]
        │                   │
        │                   └──> Tidak ada perubahan
        │
        ▼
┌─────────────────────────────────────────┐
│  API DELETE /api/admin-settings         │
│  - Validasi super-admin                 │
│  - Update settings ke default           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Database: AdminSettings updated        │
│  - whatsappNumber = default             │
│  - whatsappMessageHelp = default        │
│  - whatsappMessageRegistered = default  │
│  - whatsappMessageUnregistered = default│
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Form reload dengan nilai default       │
│  Notifikasi: "Berhasil direset"         │
└─────────────────────────────────────────┘
```

---

## Testing

### Test Case 1: Reset Berhasil
```
1. Login sebagai super-admin
2. Ubah semua pengaturan
3. Klik "Reset ke Default"
4. Klik "Ya, Reset"
5. Verifikasi: Form kembali ke default
Status: ✅ Pass
```

### Test Case 2: Batal Reset
```
1. Login sebagai super-admin
2. Klik "Reset ke Default"
3. Klik "Batal"
4. Verifikasi: Tidak ada perubahan
Status: ✅ Pass
```

### Test Case 3: Reset Tanpa Akses
```
1. Login sebagai admin biasa
2. Coba akses API DELETE langsung
3. Verifikasi: Return 403 Forbidden
Status: ✅ Pass
```

### Test Case 4: Reset Settings Kosong
```
1. Hapus semua data AdminSettings dari database
2. Klik "Reset ke Default"
3. Verifikasi: Buat settings baru dengan default
Status: ✅ Pass
```

---

## Troubleshooting

### Reset tidak bekerja:
- Pastikan login sebagai super-admin
- Cek koneksi internet
- Cek console browser untuk error
- Refresh halaman dan coba lagi

### Form tidak reload:
- Tunggu beberapa detik
- Refresh halaman manual
- Tutup dan buka modal lagi

### Nilai tidak kembali ke default:
- Cek database AdminSettings
- Verifikasi API response
- Cek console untuk error

---

## Best Practices

### Untuk Super Admin:
1. **Backup dulu** pengaturan lama sebelum reset (copy-paste ke notepad)
2. **Verifikasi** nilai default sesuai kebutuhan
3. **Test** kirim pesan setelah reset
4. **Dokumentasi** jika ada perubahan dari default

### Untuk Developer:
1. Pastikan DEFAULT_SETTINGS di API selalu update
2. Sync dengan data di seed file
3. Test endpoint DELETE secara berkala
4. Monitor error logs

---

## FAQ

### Q: Apakah reset menghapus data?
**A**: Tidak. Reset hanya mengubah nilai settings ke default, tidak menghapus data.

### Q: Apakah bisa undo setelah reset?
**A**: Tidak ada fitur undo. Sebaiknya backup pengaturan lama sebelum reset.

### Q: Apakah reset mempengaruhi user lain?
**A**: Ya. Reset akan mengubah nomor dan template yang dilihat semua user di halaman Forgot Passcode.

### Q: Berapa lama proses reset?
**A**: Instant, biasanya kurang dari 1 detik.

### Q: Apakah perlu restart aplikasi?
**A**: Tidak perlu. Perubahan langsung aktif.

---

## Related Files

- `app/api/admin-settings/route.ts` - API endpoint DELETE
- `components/super-admin/AdminSettingsModal.tsx` - UI tombol reset
- `prisma/seed-admin-settings.ts` - Data default seed
- `prisma/schema.prisma` - Model AdminSettings

---

**Last Updated**: 2025-11-07  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
