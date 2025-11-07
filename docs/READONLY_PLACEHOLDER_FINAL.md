# 🔒 Read-Only Placeholder - Tidak Bisa Diedit/Dihapus

## Fitur Read-Only Placeholder

Placeholder seperti `{tanggal}`, `{nama}`, `{passcode}`, dan `{nomor}` **benar-benar tidak bisa diedit atau dihapus**. Cursor tidak bisa masuk ke dalam placeholder, dan semua aksi edit akan diblok.

---

## Perbedaan dengan Versi Sebelumnya

### ❌ Versi Lama (Auto-Clone):
- User hapus placeholder → Otomatis muncul lagi (clone)
- Bisa menyebabkan duplikasi placeholder
- User bingung kenapa placeholder muncul 2x

### ✅ Versi Baru (Read-Only):
- User tidak bisa hapus placeholder sama sekali
- Cursor tidak bisa masuk ke dalam placeholder
- Tidak ada duplikasi
- Lebih jelas dan user-friendly

---

## Placeholder yang Read-Only

### 1. Pesan User Terdaftar
**Placeholder**:
- `{tanggal}` 🔒 Read-only
- `{nama}` 🔒 Read-only
- `{passcode}` 🔒 Read-only

### 2. Pesan User Tidak Terdaftar
**Placeholder**:
- `{nomor}` 🔒 Read-only

---

## Cara Kerja

### Aksi yang Diblok:
1. ❌ **Backspace** di dalam placeholder
2. ❌ **Delete** di dalam placeholder
3. ❌ **Typing** di dalam placeholder
4. ❌ **Cut** (Ctrl+X) yang mencakup placeholder
5. ❌ **Paste** yang menimpa placeholder
6. ❌ **Select All + Delete** yang menghapus placeholder

### Aksi yang Diizinkan:
1. ✅ **Typing** di luar placeholder
2. ✅ **Enter** untuk baris baru
3. ✅ **Spasi** di luar placeholder
4. ✅ **Copy** (Ctrl+C) termasuk placeholder
5. ✅ **Select All** (Ctrl+A) untuk copy
6. ✅ **Undo/Redo** (Ctrl+Z/Y)

---

## Contoh Interaksi

### Contoh 1: Mencoba Hapus dengan Backspace
```
Text: "Nama: {nama}"
Cursor: Setelah 'a' di {nama}
User: Tekan Backspace
Result: ❌ Tidak terjadi apa-apa (diblok)
```

### Contoh 2: Mencoba Hapus dengan Delete
```
Text: "Nama: {nama}"
Cursor: Sebelum '{' di {nama}
User: Tekan Delete
Result: ❌ Tidak terjadi apa-apa (diblok)
```

### Contoh 3: Mencoba Ketik di Dalam Placeholder
```
Text: "Nama: {nama}"
Cursor: Di tengah {nama}
User: Ketik "test"
Result: ❌ Tidak terjadi apa-apa (diblok)
```

### Contoh 4: Ketik di Luar Placeholder
```
Text: "Nama: {nama}"
Cursor: Setelah "Nama: "
User: Ketik "Lengkap "
Result: ✅ "Nama: Lengkap {nama}"
```

### Contoh 5: Select All + Delete
```
Text: "Nama: {nama}\nPasscode: {passcode}"
User: Ctrl+A → Delete
Result: ❌ Tidak terjadi apa-apa (diblok)
```

---

## Default Text

### Pesan Bantuan (Baru!):
```
Assalamualaikum App Ar-Hafalan. saya mau nanya tentang App : 

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

Passcode ini dapat digunakan untuk mengakses akun Anda.

Wassalamualaikum Warahmatullahi Wabarakatuh.
```

### Pesan User Tidak Terdaftar:
```
Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. 
Maaf, nomor {nomor} belum terdaftar dalam sistem kami.

Silakan melakukan pendaftaran terlebih dahulu.

Wassalamualaikum Warahmatullahi Wabarakatuh.
```

---

## UI/UX

### Visual Indicator:
```
┌────────────────────────────────────────────┐
│ [TextArea dengan teks template]           │
│                                            │
│ Assalamualaikum...                        │
│ Nama: {nama}  ← Tidak bisa diedit         │
│ Passcode: {passcode}  ← Tidak bisa diedit │
│                                            │
└────────────────────────────────────────────┘

⚠️ Warning Alert (Orange):
┌────────────────────────────────────────────┐
│ ⚠️ 🔒 Placeholder yang tidak bisa diedit:  │
│ [{tanggal}] [{nama}] [{passcode}]          │
│                                            │
│ Placeholder di atas tidak bisa dihapus     │
│ atau diedit. Anda hanya bisa menambah      │
│ teks di luar placeholder.                  │
└────────────────────────────────────────────┘
```

### Tag Warna:
- Placeholder: **Tag merah** (danger)
- Alert: **Warning** (orange)
- Icon: **🔒 LockOutlined**

---

## Implementasi Teknis

### Komponen: ReadOnlyPlaceholderTextArea
**File**: `components/super-admin/ReadOnlyPlaceholderTextArea.tsx`

**Event Handlers**:
1. **onChange**: Cek apakah placeholder hilang
2. **onKeyDown**: Block backspace/delete di placeholder
3. **onPaste**: Block paste yang menimpa placeholder
4. **onCut**: Block cut yang menghapus placeholder

**Fungsi Utama**:
```typescript
const isEditingPlaceholder = (
  text: string, 
  selectionStart: number, 
  selectionEnd: number
): boolean => {
  for (const ph of readOnlyPlaceholders) {
    const index = text.indexOf(ph);
    if (index !== -1) {
      const phStart = index;
      const phEnd = index + ph.length;
      
      // Cek apakah cursor/selection ada di dalam placeholder
      if (
        (selectionStart >= phStart && selectionStart <= phEnd) ||
        (selectionEnd >= phStart && selectionEnd <= phEnd) ||
        (selectionStart <= phStart && selectionEnd >= phEnd)
      ) {
        return true;
      }
    }
  }
  return false;
};
```

---

## Testing

### Test Case 1: Backspace di Placeholder
```
1. Posisikan cursor di dalam {nama}
2. Tekan Backspace
3. Verifikasi: Tidak ada perubahan
Status: ✅ Pass
```

### Test Case 2: Delete di Placeholder
```
1. Posisikan cursor sebelum {nama}
2. Tekan Delete
3. Verifikasi: Tidak ada perubahan
Status: ✅ Pass
```

### Test Case 3: Typing di Placeholder
```
1. Posisikan cursor di dalam {passcode}
2. Ketik "test"
3. Verifikasi: Tidak ada perubahan
Status: ✅ Pass
```

### Test Case 4: Select All + Delete
```
1. Tekan Ctrl+A
2. Tekan Delete
3. Verifikasi: Tidak ada perubahan
Status: ✅ Pass
```

### Test Case 5: Cut Placeholder
```
1. Select {nama}
2. Tekan Ctrl+X
3. Verifikasi: Tidak ada perubahan
Status: ✅ Pass
```

### Test Case 6: Paste di Placeholder
```
1. Copy teks "test"
2. Select {nama}
3. Tekan Ctrl+V
4. Verifikasi: Tidak ada perubahan
Status: ✅ Pass
```

### Test Case 7: Typing di Luar Placeholder
```
1. Posisikan cursor setelah "Nama: "
2. Ketik "Lengkap "
3. Verifikasi: Teks bertambah
Status: ✅ Pass
```

---

## Keunggulan

1. **Benar-benar Protected**: Tidak ada cara untuk hapus placeholder
2. **No Duplication**: Tidak ada clone/duplikasi placeholder
3. **User Friendly**: Jelas mana yang bisa diedit
4. **Visual Clear**: Alert warning yang jelas
5. **Consistent**: Behavior sama di semua browser

---

## FAQ

### Q: Kenapa placeholder tidak bisa diedit sama sekali?
**A**: Placeholder berisi data dinamis dari sistem (nama user, passcode, dll). Jika diedit, data tidak akan muncul dengan benar.

### Q: Bagaimana jika saya ingin mengubah format placeholder?
**A**: Format placeholder sudah fixed. Anda hanya bisa mengubah teks di sekitarnya.

### Q: Apakah bisa copy placeholder?
**A**: Ya, Anda bisa copy (Ctrl+C) termasuk placeholder. Tapi tidak bisa cut (Ctrl+X) atau paste yang menimpa placeholder.

### Q: Bagaimana jika cursor masuk ke placeholder?
**A**: Cursor bisa masuk, tapi semua aksi edit (backspace, delete, typing) akan diblok.

### Q: Apakah ada cara untuk bypass proteksi?
**A**: Tidak ada. Proteksi ada di level event handler yang sangat ketat.

---

## Related Files

- `components/super-admin/ReadOnlyPlaceholderTextArea.tsx` - Komponen readonly
- `components/super-admin/AdminSettingsModal.tsx` - Modal pengaturan
- `app/api/admin-settings/route.ts` - API endpoint

---

**Last Updated**: 2025-11-07  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
