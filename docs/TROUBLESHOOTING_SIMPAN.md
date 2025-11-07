# 🔧 Troubleshooting - Masalah Simpan Data

## Warning NextAuth (Bukan Error!)

### Warning yang Muncul:
```
[next-auth][warn][NEXTAUTH_URL] https://next-auth.js.org/warnings#nextauth_url
[next-auth][warn][NO_SECRET] https://next-auth.js.org/warnings#no_secret
```

### ⚠️ PENTING:
**Ini hanya WARNING, bukan ERROR!** Data tetap bisa disimpan meskipun warning ini muncul.

### Penjelasan:

#### 1. NEXTAUTH_URL Warning
**Apa itu?**
- NextAuth membutuhkan environment variable `NEXTAUTH_URL`
- Digunakan untuk redirect setelah login

**Apakah menghalangi simpan?**
- ❌ TIDAK! Ini hanya warning
- Data tetap bisa disimpan
- Hanya mempengaruhi redirect URL

**Cara Fix (Opsional)**:
```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
```

#### 2. NO_SECRET Warning
**Apa itu?**
- NextAuth membutuhkan environment variable `NEXTAUTH_SECRET`
- Digunakan untuk enkripsi session

**Apakah menghalangi simpan?**
- ❌ TIDAK! Ini hanya warning
- Data tetap bisa disimpan
- NextAuth akan generate secret otomatis

**Cara Fix (Opsional)**:
```env
# .env.local
NEXTAUTH_SECRET=your-secret-key-here
```

---

## Cara Kerja Simpan Data

### Flow Lengkap:

```
1. User klik "Simpan Pengaturan"
        ↓
2. handleSubmit dipanggil
        ↓
3. Merge dengan default value:
   - whatsappNumber: values || '+6281213923253'
   - whatsappMessageHelp: values || DEFAULT_HELP_TEXT
   - whatsappMessageRegistered: values || DEFAULT_REGISTERED_TEXT
   - whatsappMessageUnregistered: values || DEFAULT_UNREGISTERED_TEXT
        ↓
4. Kirim ke API PUT /api/admin-settings
        ↓
5. API cek session (NextAuth)
        ↓
6. API cek role (super-admin only)
        ↓
7. API simpan ke database
        ↓
8. Return success response
        ↓
9. Modal tutup, data tersimpan
```

### Default Value Behavior:

**Skenario 1: Field Kosong**
```javascript
Input: whatsappMessageHelp = ""
Saved: whatsappMessageHelp = DEFAULT_HELP_TEXT
```

**Skenario 2: Field Ada Isi**
```javascript
Input: whatsappMessageHelp = "Custom message"
Saved: whatsappMessageHelp = "Custom message"
```

**Skenario 3: Placeholder Dihapus**
```javascript
Input: whatsappMessageRegistered = "Halo, ini pesan tanpa placeholder"
Saved: whatsappMessageRegistered = "Halo, ini pesan tanpa placeholder"
✅ Valid - Bisa disimpan
```

**Skenario 4: Hanya Nomor Kosong**
```javascript
Input: whatsappNumber = ""
Saved: whatsappNumber = "+6281213923253" (default)
```

---

## Debug dengan Console Log

### Cara Cek:

1. Buka browser DevTools (F12)
2. Buka tab "Console"
3. Klik "Simpan Pengaturan"
4. Lihat log:

```javascript
// Log 1: Data yang akan disimpan
Data yang akan disimpan: {
  whatsappNumber: "+6281234567890",
  whatsappMessageHelp: "...",
  whatsappMessageRegistered: "...",
  whatsappMessageUnregistered: "..."
}

// Log 2: Response status
Response status: 200

// Log 3: Response data
Response data: {
  id: 1,
  whatsappNumber: "+6281234567890",
  ...
}
```

### Jika Ada Error:

```javascript
// Error response
Error response: {
  error: "Unauthorized"
}
```

**Solusi**:
- Pastikan sudah login sebagai super-admin
- Refresh halaman dan coba lagi
- Cek session di browser

---

## Checklist Troubleshooting

### ✅ Sebelum Simpan:

- [ ] Login sebagai super-admin
- [ ] Nomor WhatsApp terisi (wajib)
- [ ] Format nomor: +62xxxxxxxxx
- [ ] Template pesan terisi (boleh tanpa placeholder)
- [ ] Browser DevTools terbuka (untuk debug)

### ✅ Saat Simpan:

- [ ] Klik "Simpan Pengaturan"
- [ ] Loading indicator muncul
- [ ] Cek console log
- [ ] Tunggu response

### ✅ Setelah Simpan:

- [ ] Notifikasi "Pengaturan berhasil disimpan" muncul
- [ ] Modal tertutup
- [ ] Data tersimpan di database
- [ ] Refresh halaman untuk verifikasi

---

## Error Messages & Solutions

### Error: "Unauthorized"
**Penyebab**: Session tidak valid atau tidak login

**Solusi**:
1. Logout dan login kembali
2. Pastikan login sebagai super-admin
3. Clear browser cache
4. Refresh halaman

### Error: "Only super-admin can update settings"
**Penyebab**: Role bukan super-admin

**Solusi**:
1. Cek role di database
2. Login dengan akun super-admin
3. Hubungi admin untuk upgrade role

### Error: "Nomor WhatsApp harus diisi"
**Penyebab**: Field nomor kosong

**Solusi**:
1. Isi nomor WhatsApp
2. Format: +62xxxxxxxxx
3. Atau biarkan kosong (akan gunakan default)

### Error: "Template pesan harus diisi"
**Penyebab**: Field template kosong

**Solusi**:
1. Isi template pesan
2. Atau biarkan kosong (akan gunakan default)

### Error: "Failed to fetch"
**Penyebab**: Koneksi internet atau server down

**Solusi**:
1. Cek koneksi internet
2. Cek server running
3. Refresh halaman
4. Coba lagi

---

## Validasi Data

### Yang Wajib:
- ✅ Nomor WhatsApp (akan gunakan default jika kosong)
- ✅ Pesan Bantuan (akan gunakan default jika kosong)
- ✅ Pesan User Terdaftar (akan gunakan default jika kosong)
- ✅ Pesan User Tidak Terdaftar (akan gunakan default jika kosong)

### Yang Opsional:
- ❌ Placeholder (boleh ada, boleh tidak)

### Format:
- Nomor WhatsApp: `^\+62[0-9]{9,13}$`
- Template: String (any)

---

## Testing

### Test Case 1: Simpan dengan Default
```
1. Buka modal pengaturan
2. Jangan ubah apapun
3. Klik "Simpan Pengaturan"
4. Verifikasi: Data default tersimpan
Status: ✅ Pass
```

### Test Case 2: Simpan dengan Custom
```
1. Buka modal pengaturan
2. Ubah semua field
3. Klik "Simpan Pengaturan"
4. Verifikasi: Data custom tersimpan
Status: ✅ Pass
```

### Test Case 3: Simpan Tanpa Placeholder
```
1. Buka modal pengaturan
2. Hapus semua placeholder
3. Klik "Simpan Pengaturan"
4. Verifikasi: Data tersimpan tanpa placeholder
Status: ✅ Pass
```

### Test Case 4: Simpan Field Kosong
```
1. Buka modal pengaturan
2. Kosongkan semua field
3. Klik "Simpan Pengaturan"
4. Verifikasi: Data default tersimpan
Status: ✅ Pass
```

---

## FAQ

### Q: Kenapa muncul warning NextAuth?
**A**: Itu hanya warning, bukan error. Data tetap bisa disimpan. Warning muncul karena environment variable belum diset.

### Q: Apakah warning menghalangi simpan?
**A**: Tidak. Warning tidak menghalangi fungsi simpan. Data tetap tersimpan ke database.

### Q: Bagaimana cara hilangkan warning?
**A**: Set environment variable `NEXTAUTH_URL` dan `NEXTAUTH_SECRET` di file `.env.local`.

### Q: Apakah harus fix warning?
**A**: Tidak wajib. Warning hanya informasi. Tapi disarankan untuk production.

### Q: Data tersimpan dimana?
**A**: Database PostgreSQL, tabel `AdminSettings`.

### Q: Bagaimana cara verifikasi data tersimpan?
**A**: Refresh halaman dan buka modal lagi. Data yang tersimpan akan muncul.

---

## Related Files

- `components/super-admin/AdminSettingsModal.tsx` - Modal dengan handleSubmit
- `app/api/admin-settings/route.ts` - API endpoint PUT
- `.env.local` - Environment variables (optional)

---

**Last Updated**: 2025-11-07  
**Version**: 2.1.1  
**Status**: ✅ Production Ready
