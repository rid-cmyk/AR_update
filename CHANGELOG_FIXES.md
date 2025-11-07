# 🔧 Changelog - Bug Fixes & Improvements

## Version 2.1.0 (2025-11-07) - IMPROVEMENTS

### ✨ Improvements

#### 8. Penjelasan Placeholder di UI
**Feature**: Alert box yang menjelaskan kenapa placeholder tidak bisa diedit

**Content**:
- Penjelasan fungsi placeholder
- Contoh penggunaan
- Alasan kenapa read-only

**UI**:
- Alert box orange dengan icon ℹ️
- Posisi: Di atas form
- Jelas dan mudah dipahami

**File Modified**:
- `components/super-admin/AdminSettingsModal.tsx` - Add explanation alert

**Status**: ✅ Implemented

---

#### 9. Validasi Lebih Fleksibel
**Change**: Placeholder tidak wajib ada, hanya nomor yang wajib diisi

**Before**:
- Placeholder wajib ada
- Error jika placeholder dihapus
- Tidak bisa simpan tanpa placeholder

**After**:
- Placeholder opsional
- Bisa simpan tanpa placeholder
- Hanya nomor WhatsApp yang wajib

**Reason**:
- Lebih fleksibel untuk super admin
- Bisa buat template generic tanpa personalisasi
- Tidak memaksa penggunaan placeholder

**File Modified**:
- `components/super-admin/AdminSettingsModal.tsx` - Remove placeholder validation

**Status**: ✅ Implemented

---

#### 10. Fix Error "Unauthorized" saat GET
**Fix**: GET API tidak perlu auth karena digunakan di halaman public

**Problem**:
- GET API butuh auth
- Halaman forgot-passcode (public) tidak bisa akses
- Error "Unauthorized"

**Solution**:
- Remove auth check dari GET endpoint
- GET API sekarang public
- PUT API tetap butuh auth (super-admin only)

**Security**:
- Data yang diexpose hanya nomor WA dan template (tidak sensitif)
- PUT tetap protected
- Tidak ada security risk

**File Modified**:
- `app/api/admin-settings/route.ts` - Remove auth from GET

**Status**: ✅ Fixed

---

## Version 2.0.0 (2025-11-07) - MAJOR UPDATE

### ✨ New Features

#### 6. Read-Only Placeholder - Benar-benar Tidak Bisa Diedit
**Feature**: Placeholder `{tanggal}`, `{nama}`, `{passcode}`, `{nomor}` benar-benar read-only

**Implementation**:
- Komponen `ReadOnlyPlaceholderTextArea` baru
- Block semua aksi edit di placeholder (backspace, delete, typing, cut, paste)
- Cek posisi cursor sebelum izinkan edit
- No duplication/cloning

**Behavior**:
- User coba hapus → Diblok, tidak terjadi apa-apa
- User coba ketik di placeholder → Diblok
- User ketik di luar placeholder → Boleh
- Tidak ada clone/duplikasi placeholder

**UI/UX**:
- Alert warning (orange) dengan icon
- Tag merah untuk placeholder
- Pesan jelas: "tidak bisa dihapus atau diedit"

**File Created**:
- `components/super-admin/ReadOnlyPlaceholderTextArea.tsx` - Komponen baru

**File Deleted**:
- `components/super-admin/ProtectedTextArea.tsx` - Komponen lama (deprecated)

**File Modified**:
- `components/super-admin/AdminSettingsModal.tsx` - Gunakan ReadOnlyPlaceholderTextArea

**Status**: ✅ Implemented

---

#### 7. Default Text untuk Pesan Bantuan
**Feature**: Pesan Bantuan sekarang punya default text

**Default Text**:
```
Assalamualaikum App Ar-Hafalan. saya mau nanya tentang App : 

terimakasih Atas bantuannya
```

**Implementation**:
- Konstanta `DEFAULT_HELP_TEXT` di AdminSettingsModal
- `initialValue` di Form.Item
- Auto-load saat pertama kali buka modal

**File Modified**:
- `components/super-admin/AdminSettingsModal.tsx` - Add default text

**Status**: ✅ Implemented

---

## Version 1.0.3 (2025-11-07) - DEPRECATED

### ✨ New Features

#### 4. Protected Placeholder - Tidak Bisa Dihapus (DEPRECATED)
**Feature**: Placeholder `{tanggal}`, `{nama}`, `{passcode}`, `{nomor}` tidak bisa dihapus

**Implementation**:
- Komponen `ProtectedTextArea` custom
- Auto-restore placeholder yang hilang
- Validasi saat simpan
- Visual indicator dengan Tag dan warning

**Behavior**:
- User hapus placeholder → Otomatis muncul kembali
- User simpan tanpa placeholder → Error validation
- User tambah teks di sekitar → Boleh
- Default text otomatis load dengan placeholder

**Security**:
- Placeholder wajib ada untuk data user
- Tidak bisa simpan template tanpa placeholder
- Validasi di frontend dan backend

**File Created**:
- `components/super-admin/ProtectedTextArea.tsx` - Komponen protected

**File Modified**:
- `components/super-admin/AdminSettingsModal.tsx` - Gunakan ProtectedTextArea

**Status**: ✅ Implemented

---

#### 5. Hapus Tombol Reset ke Default
**Change**: Tombol "Reset ke Default" dihapus dari modal

**Reason**:
- Placeholder sudah protected, tidak perlu reset
- Default text otomatis load saat pertama kali
- Simplify UI, fokus ke edit template

**File Modified**:
- `components/super-admin/AdminSettingsModal.tsx` - Hapus tombol dan fungsi reset

**Status**: ✅ Implemented

---

## Version 1.0.2 (2025-11-07)

### ✨ New Features

#### 3. Reset Settings ke Default (DEPRECATED)
**Feature**: Tombol untuk reset semua pengaturan kembali ke nilai default

**Implementation**:
- API endpoint DELETE `/api/admin-settings`
- Tombol "🔄 Reset ke Default" di modal
- Konfirmasi dialog sebelum reset
- Auto-reload form setelah reset

**Behavior**:
- Klik tombol → Konfirmasi → Reset → Reload
- Semua field kembali ke nilai default
- Notifikasi sukses muncul

**Security**:
- Hanya super-admin yang bisa reset
- Validasi role di backend
- Konfirmasi dialog untuk mencegah accident

**File Modified**:
- `app/api/admin-settings/route.ts` - Add DELETE endpoint
- `components/super-admin/AdminSettingsModal.tsx` - Add reset button

**Status**: ✅ Implemented

---

## Version 1.0.1 (2025-11-07)

### 🐛 Bug Fixes

#### 1. Fix Import Prisma Error
**Problem**:
```
Module not found: Can't resolve '@/lib/prisma'
```

**Solution**:
- Changed import from `@/lib/prisma` to `@/lib/database/prisma`
- File location: `app/api/admin-settings/route.ts`

**Before**:
```typescript
import { prisma } from "@/lib/prisma";
```

**After**:
```typescript
import { prisma } from "@/lib/database/prisma";
```

**Status**: ✅ Fixed

---

### ✨ New Features

#### 2. Auto-Format Nomor WhatsApp ke +62
**Feature**: Input nomor WhatsApp otomatis diformat ke format Indonesia (+62)

**Implementation**:
- Fungsi `formatWhatsAppNumber()` untuk format otomatis
- Event handler `handleWhatsAppNumberChange()` untuk real-time formatting
- Validasi regex: `^\+62[0-9]{9,13}$`

**Behavior**:
| Input | Output |
|-------|--------|
| `081234567890` | `+6281234567890` |
| `6281234567890` | `+6281234567890` |
| `+6281234567890` | `+6281234567890` |
| `0812 3456 7890` | `+6281234567890` |
| `81234567890` | `+6281234567890` |

**Features**:
- ✅ Hapus karakter non-digit otomatis
- ✅ Ganti 0 di depan dengan 62
- ✅ Tambahkan +62 jika belum ada
- ✅ Real-time formatting saat ketik
- ✅ Validasi format +62
- ✅ MaxLength 16 karakter
- ✅ Placeholder: "081234567890"
- ✅ Extra text: "Otomatis format ke +62"

**File Modified**:
- `components/super-admin/AdminSettingsModal.tsx`

**Status**: ✅ Implemented

---

## Testing Results

### Bug Fix Testing:
- [x] Import prisma berhasil
- [x] API endpoint bisa diakses
- [x] No build errors
- [x] No console errors

### Auto-Format Testing:
- [x] Input 08xxx → +628xxx
- [x] Input 62xxx → +62xxx
- [x] Input +62xxx → +62xxx
- [x] Input dengan spasi → format benar
- [x] Input dengan tanda hubung → format benar
- [x] Input tanpa 0 → format benar
- [x] Validasi format bekerja
- [x] MaxLength bekerja
- [x] Real-time formatting bekerja

---

## Files Changed

### Modified:
1. `app/api/admin-settings/route.ts`
   - Fix import prisma path

2. `components/super-admin/AdminSettingsModal.tsx`
   - Add formatWhatsAppNumber function
   - Add handleWhatsAppNumberChange handler
   - Update Input component with onChange
   - Update validation regex
   - Update placeholder and extra text

### Created:
1. `docs/FORMAT_NOMOR_WHATSAPP.md`
   - Dokumentasi fitur auto-format
   - Contoh penggunaan
   - Testing guide

2. `docs/RESET_SETTINGS_DEFAULT.md`
   - Dokumentasi fitur reset
   - Cara penggunaan
   - Nilai default

3. `CHANGELOG_FIXES.md`
   - Changelog bug fixes
   - Feature improvements

---

## Breaking Changes

None. All changes are backward compatible.

---

## Migration Guide

No migration needed. Changes are automatic.

---

## Next Steps

- [ ] Test dengan berbagai browser
- [ ] Test dengan berbagai device
- [ ] Monitor error logs
- [ ] Collect user feedback

---

## Known Issues

None at the moment.

---

## Contributors

- Developer Team
- QA Team

---

**Last Updated**: 2025-11-07  
**Version**: 1.0.1  
**Status**: ✅ Production Ready
