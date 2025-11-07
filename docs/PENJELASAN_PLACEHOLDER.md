# 📖 Penjelasan Placeholder & Validasi

## Kenapa Placeholder Tidak Bisa Diedit?

### 🔒 Alasan Teknis

Placeholder seperti `{tanggal}`, `{nama}`, `{passcode}`, dan `{nomor}` adalah **variabel dinamis** yang akan diganti otomatis oleh sistem saat pesan dikirim ke user.

### 🎯 Fungsi Placeholder

#### 1. `{tanggal}` - Tanggal Permintaan
**Fungsi**: Menampilkan tanggal dan waktu saat user meminta reset passcode

**Contoh**:
- Template: `Tanggal Permintaan: {tanggal}`
- Hasil: `Tanggal Permintaan: 7 November 2025, 14:30`

#### 2. `{nama}` - Nama Pengguna
**Fungsi**: Menampilkan nama lengkap user yang terdaftar

**Contoh**:
- Template: `Nama Pengguna: {nama}`
- Hasil: `Nama Pengguna: Ahmad Fauzi`

#### 3. `{passcode}` - Passcode User
**Fungsi**: Menampilkan passcode user untuk login

**Contoh**:
- Template: `Passcode: {passcode}`
- Hasil: `Passcode: 123456`

#### 4. `{nomor}` - Nomor Telepon
**Fungsi**: Menampilkan nomor telepon yang diminta reset

**Contoh**:
- Template: `Nomor {nomor} belum terdaftar`
- Hasil: `Nomor 081234567890 belum terdaftar`

---

## Kenapa Harus Read-Only?

### ❌ Jika Placeholder Bisa Diedit:

**Skenario 1: User Hapus Placeholder**
```
Template: "Nama: {nama}"
User hapus {nama}
Hasil: "Nama: "
Masalah: Data nama tidak muncul!
```

**Skenario 2: User Ubah Placeholder**
```
Template: "Passcode: {passcode}"
User ubah jadi: "Passcode: {password}"
Hasil: Sistem tidak mengenali {password}
Masalah: Passcode tidak muncul!
```

**Skenario 3: User Typo**
```
Template: "Nama: {nama}"
User typo jadi: "Nama: {namma}"
Hasil: Sistem tidak mengenali {namma}
Masalah: Data tidak muncul!
```

### ✅ Dengan Read-Only:

- Placeholder selalu benar
- Data pasti muncul
- Tidak ada typo
- Konsisten untuk semua user

---

## Validasi Baru

### ✅ Yang Wajib Diisi:

1. **Nomor WhatsApp** - Harus diisi dan format +62
2. **Pesan Bantuan** - Harus diisi (boleh tanpa placeholder)
3. **Pesan User Terdaftar** - Harus diisi (boleh tanpa placeholder)
4. **Pesan User Tidak Terdaftar** - Harus diisi (boleh tanpa placeholder)

### ⚠️ Placeholder Opsional:

Placeholder **tidak wajib** ada dalam template. Super admin bisa:
- Hapus semua placeholder
- Gunakan hanya sebagian placeholder
- Tambah placeholder sesuai kebutuhan

**Contoh Valid**:
```
Template tanpa placeholder:
"Silakan hubungi admin untuk reset passcode Anda."
✅ Valid - Bisa disimpan
```

```
Template dengan placeholder:
"Halo {nama}, passcode Anda: {passcode}"
✅ Valid - Bisa disimpan
```

```
Template kosong:
""
❌ Invalid - Tidak bisa disimpan (required)
```

---

## Cara Kerja Sistem

### Flow Pengiriman Pesan:

```
1. User request reset passcode
        ↓
2. Sistem ambil template dari database
        ↓
3. Sistem cari placeholder dalam template
        ↓
4. Sistem ganti placeholder dengan data user:
   - {tanggal} → "7 November 2025, 14:30"
   - {nama} → "Ahmad Fauzi"
   - {passcode} → "123456"
   - {nomor} → "081234567890"
        ↓
5. Sistem kirim pesan ke WhatsApp
```

### Contoh Lengkap:

**Template di Database**:
```
Assalamualaikum {nama},

Berikut passcode Anda:
Passcode: {passcode}
Tanggal: {tanggal}

Terima kasih.
```

**Data User**:
- Nama: Ahmad Fauzi
- Passcode: 123456
- Tanggal: 7 November 2025, 14:30

**Pesan yang Dikirim**:
```
Assalamualaikum Ahmad Fauzi,

Berikut passcode Anda:
Passcode: 123456
Tanggal: 7 November 2025, 14:30

Terima kasih.
```

---

## Penjelasan di UI

### Alert Box (Orange):

```
ℹ️ Kenapa Placeholder Tidak Bisa Diedit?

Placeholder seperti {tanggal}, {nama}, {passcode}, dan {nomor} 
adalah variabel yang akan diganti otomatis dengan data user 
saat pesan dikirim.

Fungsi: Personalisasi pesan untuk setiap user dengan data 
mereka (nama, passcode, nomor telepon, dll).

Contoh: {nama} akan diganti dengan "Ahmad Fauzi" saat kirim 
pesan ke user tersebut.
```

### Alert di TextArea (Warning):

```
⚠️ 🔒 Placeholder yang tidak bisa diedit:
[{tanggal}] [{nama}] [{passcode}]

Placeholder di atas tidak bisa dihapus atau diedit. 
Anda hanya bisa menambah teks di luar placeholder.
```

---

## FAQ

### Q: Apakah placeholder wajib ada?
**A**: Tidak. Placeholder opsional. Anda bisa membuat template tanpa placeholder.

### Q: Apa yang terjadi jika template tanpa placeholder?
**A**: Template akan dikirim apa adanya tanpa personalisasi. Semua user dapat pesan yang sama.

### Q: Apakah bisa menambah placeholder baru?
**A**: Tidak. Hanya placeholder yang sudah ditentukan sistem yang bisa digunakan.

### Q: Bagaimana jika saya salah ketik placeholder?
**A**: Placeholder yang salah tidak akan diganti. Contoh: `{namma}` tidak akan diganti karena sistem hanya mengenali `{nama}`.

### Q: Apakah placeholder case-sensitive?
**A**: Ya. Harus persis `{nama}`, bukan `{Nama}` atau `{NAMA}`.

### Q: Kenapa GET API tidak perlu auth?
**A**: Karena API GET juga digunakan di halaman public (forgot-passcode) untuk menampilkan nomor WhatsApp admin.

### Q: Apakah aman jika GET API public?
**A**: Ya, aman. Data yang ditampilkan hanya nomor WhatsApp dan template pesan (tidak ada data sensitif user).

---

## Best Practices

### ✅ Recommended:

1. **Gunakan placeholder** untuk personalisasi
2. **Tambah konteks** di sekitar placeholder
3. **Test template** sebelum deploy
4. **Backup template** sebelum ubah

### ❌ Not Recommended:

1. Hapus semua placeholder (pesan jadi generic)
2. Typo dalam placeholder
3. Ubah template tanpa test
4. Tidak ada backup

---

## Related Files

- `components/super-admin/AdminSettingsModal.tsx` - Modal dengan penjelasan
- `components/super-admin/ReadOnlyPlaceholderTextArea.tsx` - Komponen readonly
- `app/api/admin-settings/route.ts` - API endpoint (GET public, PUT auth)

---

**Last Updated**: 2025-11-07  
**Version**: 2.1.0  
**Status**: ✅ Production Ready
