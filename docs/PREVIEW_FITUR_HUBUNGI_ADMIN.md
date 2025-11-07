# 📱 Preview Fitur "Hubungi Admin"

## Lokasi Tampilan Link "Hubungi Admin"

### 1️⃣ Di Halaman Form Forgot Passcode

**Lokasi**: Bagian bawah form, sebelum submit

**Tampilan**:
```
┌─────────────────────────────────────────┐
│  🔐 Lupa Passcode?                      │
│                                         │
│  [Form Input Nomor Telepon]            │
│  [Form Pesan Tambahan]                 │
│  [Tombol: Kirim Permintaan Reset]      │
│  [Link: Kembali ke Login]              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 💡 Butuh bantuan segera?          │ │
│  │                                   │ │
│  │ 📱 Hubungi Admin: +628xxx         │ │
│  │    (Link WhatsApp - Warna Hijau) │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Warna**: Kotak biru muda (#f0f9ff)

---

### 2️⃣ Di Halaman Result - User Terdaftar

**Lokasi**: Setelah submit permintaan, untuk user yang terdaftar

**Tampilan**:
```
┌─────────────────────────────────────────┐
│  ✅ Permintaan Terkirim                 │
│                                         │
│  Permintaan reset passcode Anda telah  │
│  dikirim ke admin. Mohon tunggu...     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Akun Ditemukan:                   │ │
│  │ Nama: Ahmad Fauzi                 │ │
│  │ Username: @ahmad123               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 💬 Admin akan segera menghubungi  │ │
│  │    Anda via WhatsApp              │ │
│  │                                   │ │
│  │ ┌─────────────────────────────┐  │ │
│  │ │ 📱 Hubungi Admin: +628xxx   │  │ │
│  │ │ (Tombol WhatsApp - Hijau)   │  │ │
│  │ └─────────────────────────────┘  │ │
│  │                                   │ │
│  │ Klik untuk chat langsung via WA   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Kirim Permintaan Lain] [Kembali]    │
└─────────────────────────────────────────┘
```

**Warna**: Kotak biru muda (#f0f9ff)

---

### 3️⃣ Di Halaman Result - User Tidak Terdaftar

**Lokasi**: Setelah submit permintaan, untuk nomor yang tidak terdaftar

**Tampilan**:
```
┌─────────────────────────────────────────┐
│  ⚠️  Nomor Tidak Terdaftar              │
│                                         │
│  Nomor telepon Anda tidak ditemukan    │
│  dalam sistem. Silakan hubungi admin.  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ⚠️  Nomor Anda belum terdaftar.   │ │
│  │     Butuh bantuan?                │ │
│  │                                   │ │
│  │ ┌─────────────────────────────┐  │ │
│  │ │ 📱 Hubungi Admin: +628xxx   │  │ │
│  │ │ (Tombol WhatsApp - Hijau)   │  │ │
│  │ └─────────────────────────────┘  │ │
│  │                                   │ │
│  │ Klik untuk chat langsung via WA   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Kirim Permintaan Lain] [Kembali]    │
└─────────────────────────────────────────┘
```

**Warna**: Kotak orange muda (#fff7e6)

---

## Interaksi User

### Hover Effect pada Tombol WhatsApp:
- **Normal**: Background putih, text hijau, border hijau
- **Hover**: Background hijau (#25D366), text putih

### Klik Tombol:
1. Membuka WhatsApp di tab baru
2. Nomor tujuan: Dari database AdminSettings
3. Pesan otomatis: Dari template AdminSettings.whatsappMessageHelp
4. User tinggal klik "Send" di WhatsApp

---

## Contoh Pesan WhatsApp yang Terkirim

Ketika user klik "Hubungi Admin", WhatsApp akan terbuka dengan pesan:

```
Assalamualaikum App Ar-Hafalan. 
saya mau nanya tentang App : 

terimakasih Atas bantuannya
```

**Note**: Pesan ini bisa diubah oleh super-admin melalui halaman Pengaturan.

---

## Keunggulan Fitur

✅ **Selalu Tersedia**: Link muncul di 3 lokasi berbeda
✅ **Dinamis**: Nomor dan pesan diambil dari database
✅ **User Friendly**: Pesan berbeda untuk user terdaftar vs tidak terdaftar
✅ **Visual Jelas**: Warna berbeda untuk status berbeda
✅ **Responsive**: Tombol dengan hover effect yang menarik
✅ **Langsung ke WhatsApp**: Tidak perlu copy-paste nomor

---

## Untuk Developer

### Data Flow:
1. User buka halaman → Fetch `/api/admin-settings`
2. Simpan di state `adminSettings`
3. Render link dengan data dari `adminSettings`
4. Klik link → Buka WhatsApp dengan URL:
   ```
   https://wa.me/{nomor}?text={pesan}
   ```

### Conditional Rendering:
```typescript
{adminSettings && (
  <div>
    <a href={whatsappUrl}>
      Hubungi Admin: {adminSettings.whatsappNumber}
    </a>
  </div>
)}
```

### Styling Dinamis:
- User terdaftar: `background: '#f0f9ff'` (biru)
- User tidak terdaftar: `background: '#fff7e6'` (orange)
