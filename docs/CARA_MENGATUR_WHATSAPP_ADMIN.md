# 📱 Cara Mengatur WhatsApp Super Admin

⚠️ **PENTING: Fitur ini HANYA untuk SUPER ADMIN**

## Untuk Super Admin

### Langkah 1: Buka Halaman Pengaturan
1. Login sebagai **Super Admin**
2. Buka menu **Notifikasi → Forgot Passcode**
3. Klik tombol **"Pengaturan"** di pojok kanan atas

### Langkah 2: Atur Nomor WhatsApp
1. Masukkan nomor WhatsApp admin
2. Format yang diterima:
   - `+628123456789` (dengan +)
   - `628123456789` (tanpa +)
3. Pastikan nomor aktif dan bisa menerima pesan

### Langkah 3: Atur Template Pesan

#### A. Pesan Bantuan
Pesan ini muncul ketika user klik tombol **"Hubungi Admin"** di halaman Forgot Passcode.

**Contoh:**
```
Assalamualaikum App Ar-Hafalan. 
saya mau nanya tentang App : 

terimakasih Atas bantuannya
```

#### B. Pesan untuk User Terdaftar
Pesan ini digunakan ketika super admin kirim WhatsApp ke user yang terdaftar.

**Placeholder yang tersedia:**
- `{tanggal}` - Otomatis diganti dengan tanggal permintaan
- `{nama}` - Otomatis diganti dengan nama user
- `{passcode}` - Otomatis diganti dengan passcode user

**Contoh:**
```
Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. 
Berikut adalah passcode yang Anda minta:

📅 Tanggal Permintaan: {tanggal}
👤 Nama Pengguna: {nama}
🔐 Passcode: {passcode}

Passcode ini dapat digunakan untuk mengakses akun Anda.
Jaga kerahasiaan passcode Anda.

Terima kasih.

Wassalamualaikum Warahmatullahi Wabarakatuh.
```

#### C. Pesan untuk User Tidak Terdaftar
Pesan ini digunakan ketika super admin kirim WhatsApp ke nomor yang tidak terdaftar.

**Placeholder yang tersedia:**
- `{nomor}` - Otomatis diganti dengan nomor telepon

**Contoh:**
```
Assalamualaikum Warahmatullahi Wabarakatuh,

Saya super-admin dari Aplikasi AR-Hafalan. 
Maaf, nomor {nomor} belum terdaftar dalam sistem kami.

Silakan melakukan pendaftaran terlebih dahulu.

Terima kasih.

Wassalamualaikum Warahmatullahi Wabarakatuh.
```

### Langkah 4: Simpan Pengaturan
1. Klik tombol **"Simpan Pengaturan"**
2. Tunggu notifikasi sukses
3. Pengaturan langsung aktif

## Cara Menggunakan

### Untuk User (Halaman Forgot Passcode)

#### Di Form Permintaan:
1. Buka halaman **Forgot Passcode**
2. Scroll ke bawah form
3. Lihat kotak biru dengan tulisan "Butuh bantuan segera?"
4. Klik link **"Hubungi Admin: +62xxx"**
5. WhatsApp akan terbuka dengan pesan otomatis

#### Setelah Submit Permintaan:
1. Setelah klik "Kirim Permintaan Reset"
2. Akan muncul halaman result (sukses atau warning)
3. Di bagian bawah result ada link **"Hubungi Admin"**
4. **Untuk user terdaftar**: 
   - Pesan: "Admin akan segera menghubungi Anda via WhatsApp"
   - Kotak berwarna biru
5. **Untuk user tidak terdaftar**: 
   - Pesan: "Nomor Anda belum terdaftar. Butuh bantuan?"
   - Kotak berwarna orange
6. Klik link untuk chat langsung dengan admin

### Untuk Super Admin (Kirim Pesan ke User)
1. Buka halaman **Notifikasi Forgot Passcode**
2. Lihat daftar permintaan reset passcode
3. Klik tombol **WhatsApp** (icon hijau) pada notifikasi
4. Pesan otomatis akan dibuat dengan data user
5. WhatsApp terbuka, tinggal klik kirim

## Tips
- ✅ Gunakan nomor WhatsApp yang aktif 24/7
- ✅ Buat template pesan yang jelas dan sopan
- ✅ Gunakan placeholder untuk personalisasi pesan
- ✅ Test kirim pesan setelah mengubah template
- ✅ Simpan backup template di tempat lain

## Troubleshooting

### Nomor tidak valid
- Pastikan format: `+628xxx` atau `628xxx`
- Minimal 10 digit, maksimal 15 digit
- Hanya angka dan tanda +

### Pesan tidak sesuai
- Cek placeholder sudah benar: `{tanggal}`, `{nama}`, `{passcode}`, `{nomor}`
- Gunakan kurung kurawal `{}` bukan `[]` atau `()`

### WhatsApp tidak terbuka
- Pastikan WhatsApp terinstall di device
- Cek browser mengizinkan popup
- Coba browser lain (Chrome, Firefox, Edge)

## Keamanan & Hak Akses

### ⚠️ PENTING - Hanya Super Admin:
- ✅ **Super Admin**: Bisa melihat dan mengubah semua pengaturan
- ❌ **Admin Biasa**: TIDAK bisa akses fitur ini
- ❌ **Guru/Santri/Ortu**: TIDAK bisa akses fitur ini
- ✅ **Semua User**: Bisa melihat nomor WA di halaman Forgot Passcode

### 🔐 Keamanan Data:
- Jangan share nomor admin ke publik
- Hanya super-admin yang bisa ubah pengaturan
- Passcode user bersifat rahasia
- Jangan simpan passcode di tempat lain
- API endpoint dilindungi dengan autentikasi

### 📍 Lokasi Menu:
- Menu hanya muncul di: **Super Admin Dashboard → Notifikasi → Forgot Passcode**
- Tombol "Pengaturan" hanya terlihat oleh super-admin
- Role lain tidak akan melihat tombol ini

## Support
Jika ada masalah, hubungi developer atau tim IT.
