# Fitur Super Admin Settings - WhatsApp & Template Pesan

⚠️ **PENTING: Fitur ini HANYA untuk SUPER ADMIN**

## Fitur yang Ditambahkan

### 1. **Model Database Baru: AdminSettings**
Tabel baru di database untuk menyimpan pengaturan admin:
- `whatsappNumber` - Nomor WhatsApp admin
- `whatsappMessageHelp` - Template pesan untuk tombol "Hubungi Admin"
- `whatsappMessageRegistered` - Template pesan untuk user terdaftar
- `whatsappMessageUnregistered` - Template pesan untuk user tidak terdaftar

### 2. **API Endpoint: `/api/admin-settings`**
- **GET** - Mengambil pengaturan (semua user bisa akses untuk melihat nomor WA)
- **PUT** - Update pengaturan (**HANYA SUPER-ADMIN yang bisa update**)

### 3. **Komponen AdminSettingsModal (Super Admin Only)**
Lokasi: `components/super-admin/AdminSettingsModal.tsx`

Modal CRUD untuk mengatur:
- Nomor WhatsApp admin
- Template pesan bantuan
- Template pesan untuk user terdaftar (dengan placeholder: `{tanggal}`, `{nama}`, `{passcode}`)
- Template pesan untuk user tidak terdaftar (dengan placeholder: `{nomor}`)

### 4. **Update Halaman Forgot Passcode**
- Mengambil nomor WhatsApp dari database
- Mengambil template pesan dari database
- Link "Hubungi Admin" otomatis menggunakan nomor dan pesan dari settings

### 5. **Update Halaman Notifikasi Super Admin**
- Tombol "Pengaturan" untuk membuka modal CRUD
- Fungsi `handleWhatsAppMessage` menggunakan template dari database
- Placeholder otomatis diganti dengan data user:
  - `{tanggal}` → Tanggal permintaan
  - `{nama}` → Nama lengkap user
  - `{passcode}` → Passcode user
  - `{nomor}` → Nomor telepon

## Cara Menggunakan

### Untuk Super Admin:
1. Buka halaman **Super Admin → Notifikasi Forgot Passcode**
2. Klik tombol **"Pengaturan"** di header
3. Atur:
   - Nomor WhatsApp (format: +628xxx atau 628xxx)
   - Template pesan bantuan
   - Template pesan untuk user terdaftar
   - Template pesan untuk user tidak terdaftar
4. Klik **"Simpan Pengaturan"**

### Untuk User (Halaman Forgot Passcode):
1. Buka halaman **Forgot Passcode**
2. Di bagian bawah form, ada link **"Hubungi Admin"**
3. Klik link tersebut untuk membuka WhatsApp dengan pesan otomatis

### Untuk User (Setelah Submit Permintaan):
1. Setelah submit permintaan (baik terdaftar atau tidak terdaftar)
2. Di halaman result akan muncul link **"Hubungi Admin"**
3. Untuk user terdaftar: Pesan "Admin akan segera menghubungi Anda"
4. Untuk user tidak terdaftar: Pesan "Nomor Anda belum terdaftar. Butuh bantuan?"
5. Klik link untuk chat langsung dengan admin via WhatsApp

### Untuk Super Admin (Kirim Pesan ke User):
1. Buka halaman **Notifikasi Forgot Passcode**
2. Klik tombol **WhatsApp** (icon hijau) pada notifikasi
3. Pesan otomatis akan dibuat sesuai template dengan data user
4. WhatsApp akan terbuka dengan pesan siap kirim

## Default Values
Jika belum ada pengaturan, sistem akan menggunakan nilai default:
- **Nomor**: +6281213923253
- **Pesan Bantuan**: "Assalamualaikum App Ar-Hafalan. saya mau nanya tentang App : \n\nterimakasih Atas bantuannya"
- **Template Registered**: Pesan lengkap dengan passcode
- **Template Unregistered**: Pesan nomor tidak terdaftar

## Keamanan & Akses

### Akses Super Admin:
- ✅ Bisa melihat dan mengubah semua pengaturan
- ✅ Akses menu "Pengaturan" di halaman Notifikasi Forgot Passcode
- ✅ Bisa update nomor WhatsApp dan template pesan
- ✅ API endpoint `/api/admin-settings` PUT method hanya untuk super-admin

### Akses User Biasa:
- ✅ Bisa melihat nomor WhatsApp di halaman Forgot Passcode
- ✅ Bisa klik link "Hubungi Admin"
- ❌ TIDAK bisa mengubah pengaturan
- ❌ TIDAK bisa akses modal AdminSettingsModal

### Proteksi:
- API endpoint dilindungi dengan autentikasi NextAuth
- Validasi role di backend (hanya super-admin)
- Modal hanya muncul di halaman super-admin

## Database Migration
Tabel `AdminSettings` sudah ditambahkan ke database dengan perintah:
```bash
npx prisma db push
```

## File yang Dimodifikasi/Ditambahkan
1. `prisma/schema.prisma` - Model AdminSettings
2. `app/api/admin-settings/route.ts` - API endpoint (GET: semua, PUT: super-admin only)
3. `components/super-admin/AdminSettingsModal.tsx` - Modal CRUD (Super Admin Only)
4. `app/(dashboard)/super-admin/notifications/forgot-passcode/page.tsx` - Halaman notifikasi super-admin
5. `app/forgot-passcode/page.tsx` - Halaman forgot passcode (public)
6. `prisma/seed-admin-settings.ts` - Seed data default
