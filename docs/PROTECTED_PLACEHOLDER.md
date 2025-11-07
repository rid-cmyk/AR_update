# 🔒 Protected Placeholder - Tidak Bisa Dihapus

## Fitur Protected Placeholder

Placeholder seperti `{tanggal}`, `{nama}`, `{passcode}`, dan `{nomor}` **tidak bisa dihapus** dari template pesan. Super admin hanya bisa menambah atau mengubah teks di sekitar placeholder.

---

## Placeholder yang Dilindungi

### 1. Pesan User Terdaftar
**Placeholder Wajib**:
- `{tanggal}` - Tanggal permintaan reset passcode
- `{nama}` - Nama lengkap user
- `{passcode}` - Passcode user

**Contoh Default**:
```
Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. 
Berikut adalah passcode yang Anda minta:

📅 Tanggal Permintaan: {tanggal}
👤 Nama Pengguna: {nama}
🔐 Passcode: {passcode}

Passcode ini dapat digunakan untuk mengakses akun Anda.

Wassalamualaikum Warahmatullahi Wabarakatuh.
```

### 2. Pesan User Tidak Terdaftar
**Placeholder Wajib**:
- `{nomor}` - Nomor telepon yang diminta

**Contoh Default**:
```
Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. 
Maaf, nomor {nomor} belum terdaftar dalam sistem kami.

Silakan melakukan pendaftaran terlebih dahulu.

Wassalamualaikum Warahmatullahi Wabarakatuh.
```

---

## Cara Kerja

### ✅ Yang Bisa Dilakukan:
1. **Menambah teks** sebelum placeholder
2. **Menambah teks** setelah placeholder
3. **Menambah teks** di antara placeholder
4. **Mengubah teks** di sekitar placeholder
5. **Menambah emoji** atau simbol
6. **Mengubah format** (spasi, enter, dll)

### ❌ Yang Tidak Bisa Dilakukan:
1. **Menghapus** placeholder `{tanggal}`, `{nama}`, `{passcode}`, `{nomor}`
2. **Mengubah** nama placeholder
3. **Mengganti** placeholder dengan teks lain
4. **Menyimpan** template tanpa placeholder wajib

---

## Contoh Penggunaan

### Contoh 1: Menambah Teks Sebelum Placeholder
**Sebelum**:
```
📅 Tanggal Permintaan: {tanggal}
```

**Setelah** (✅ Boleh):
```
Berikut informasi permintaan Anda:
📅 Tanggal Permintaan: {tanggal}
```

### Contoh 2: Menambah Teks Setelah Placeholder
**Sebelum**:
```
🔐 Passcode: {passcode}
```

**Setelah** (✅ Boleh):
```
🔐 Passcode: {passcode}
(Jangan bagikan ke siapapun)
```

### Contoh 3: Mengubah Format
**Sebelum**:
```
Nama: {nama}
Passcode: {passcode}
```

**Setelah** (✅ Boleh):
```
👤 Nama Lengkap: {nama}
🔐 Kode Akses: {passcode}
```

### Contoh 4: Mencoba Hapus Placeholder
**Sebelum**:
```
Nama: {nama}
Passcode: {passcode}
```

**User coba hapus** `{passcode}`:
```
Nama: {nama}
```

**Hasil** (❌ Otomatis dikembalikan):
```
Nama: {nama}
{passcode}
```

---

## Validasi

### Validasi Saat Simpan:
1. Cek apakah semua placeholder wajib ada
2. Jika ada yang hilang, tampilkan error
3. Tidak bisa simpan sampai placeholder lengkap

### Error Message:
- **User Terdaftar**: "Placeholder {tanggal}, {nama}, dan {passcode} harus ada!"
- **User Tidak Terdaftar**: "Placeholder {nomor} harus ada!"

---

## UI/UX

### Visual Indicator:
```
┌────────────────────────────────────────────┐
│ [TextArea dengan teks template]           │
│                                            │
│ Assalamualaikum...                        │
│ Nama: {nama}                              │
│ Passcode: {passcode}                      │
│                                            │
└────────────────────────────────────────────┘

🔒 Placeholder yang dilindungi:
[{tanggal}] [{nama}] [{passcode}]

⚠️ Placeholder di atas tidak bisa dihapus. 
   Anda hanya bisa menambah teks di sekitarnya.
```

### Tag Warna:
- Placeholder ditampilkan sebagai **Tag biru**
- Icon **🔒 LockOutlined** menunjukkan proteksi
- Warning text di bawah TextArea

---

## Implementasi Teknis

### Komponen: ProtectedTextArea
**File**: `components/super-admin/ProtectedTextArea.tsx`

**Props**:
```typescript
interface ProtectedTextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  protectedPlaceholders: string[]; // Placeholder yang dilindungi
  defaultText?: string; // Text default
}
```

**Fungsi Utama**:
```typescript
const ensurePlaceholders = (text: string): string => {
  let result = text;
  
  // Jika text kosong, gunakan defaultText
  if (!result && defaultText) {
    result = defaultText;
  }
  
  // Pastikan semua placeholder ada
  protectedPlaceholders.forEach(placeholder => {
    if (!result.includes(placeholder)) {
      result += `\n${placeholder}`;
    }
  });
  
  return result;
};
```

### Event Handlers:
1. **onChange**: Cek placeholder setiap kali user ketik
2. **onBlur**: Double check saat user keluar dari field
3. **Auto-restore**: Tambahkan placeholder yang hilang

---

## Testing

### Test Case 1: Hapus Placeholder
```
1. Buka modal pengaturan
2. Hapus {nama} dari template
3. Klik di luar TextArea
4. Verifikasi: {nama} otomatis muncul kembali
Status: ✅ Pass
```

### Test Case 2: Simpan Tanpa Placeholder
```
1. Hapus semua placeholder
2. Klik "Simpan Pengaturan"
3. Verifikasi: Error "Placeholder harus ada!"
Status: ✅ Pass
```

### Test Case 3: Tambah Teks di Sekitar
```
1. Tambah teks sebelum {nama}
2. Tambah teks setelah {passcode}
3. Klik "Simpan Pengaturan"
4. Verifikasi: Berhasil disimpan
Status: ✅ Pass
```

### Test Case 4: Load Data Tanpa Placeholder
```
1. Database tidak punya placeholder
2. Buka modal pengaturan
3. Verifikasi: Placeholder otomatis ditambahkan
Status: ✅ Pass
```

---

## Keunggulan

1. **Konsistensi**: Semua template pasti punya placeholder
2. **User Friendly**: Super admin tidak perlu ingat placeholder
3. **Error Prevention**: Tidak bisa simpan template yang salah
4. **Auto-Restore**: Placeholder hilang otomatis dikembalikan
5. **Visual Clear**: Tag dan warning jelas terlihat

---

## FAQ

### Q: Kenapa placeholder tidak bisa dihapus?
**A**: Placeholder dibutuhkan untuk menampilkan data user (nama, passcode, dll). Tanpa placeholder, pesan tidak akan personal.

### Q: Bagaimana jika saya tidak suka posisi placeholder?
**A**: Anda bisa menambah teks di sekitar placeholder untuk mengubah konteks, tapi placeholder harus tetap ada.

### Q: Apakah bisa menambah placeholder baru?
**A**: Tidak. Hanya placeholder yang sudah ditentukan yang bisa digunakan: `{tanggal}`, `{nama}`, `{passcode}`, `{nomor}`.

### Q: Bagaimana jika placeholder hilang saat edit?
**A**: Sistem akan otomatis menambahkan kembali placeholder yang hilang saat Anda klik di luar TextArea atau saat simpan.

### Q: Apakah placeholder case-sensitive?
**A**: Ya. Harus persis `{nama}`, bukan `{Nama}` atau `{NAMA}`.

---

## Related Files

- `components/super-admin/ProtectedTextArea.tsx` - Komponen protected textarea
- `components/super-admin/AdminSettingsModal.tsx` - Modal pengaturan
- `app/api/admin-settings/route.ts` - API endpoint
- `app/(dashboard)/super-admin/notifications/forgot-passcode/page.tsx` - Halaman notifikasi

---

**Last Updated**: 2025-11-07  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
