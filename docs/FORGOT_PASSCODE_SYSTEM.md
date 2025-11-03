# Sistem Notifikasi Forgot Passcode

## Overview
Sistem notifikasi forgot passcode memungkinkan user yang lupa passcode untuk mengirim permintaan reset melalui form publik. Super admin akan menerima notifikasi dan dapat memproses permintaan tersebut.

## Flow Sistem

### 1. User Lupa Passcode
```
User di halaman login → Klik "Lupa Passcode?" → Form forgot passcode
```

### 2. Submit Permintaan
```
User input nomor telepon → System cek database → Buat notifikasi untuk super admin
```

### 3. Notifikasi Super Admin
```
Super admin login → Lihat badge notifikasi di header → Klik untuk lihat detail
```

### 4. Proses Permintaan
```
Super admin baca notifikasi → Verifikasi user → Reset passcode manual
```

## Komponen Sistem

### 🔗 **Halaman Publik**
- **URL**: `/forgot-passcode`
- **Akses**: Publik (tidak perlu login)
- **Fitur**: Form input nomor telepon dan pesan opsional

### 🔔 **Notifikasi Header**
- **Lokasi**: Header dashboard super admin
- **Fitur**: Badge counter, dropdown preview, auto refresh
- **Akses**: Hanya super admin

### 📄 **Halaman Notifikasi Lengkap**
- **URL**: `/super-admin/notifications/forgot-passcode`
- **Fitur**: Tabel lengkap, statistics, bulk actions
- **Akses**: Hanya super admin

## Database Schema

```sql
model ForgotPasscode {
  id          Int      @id @default(autoincrement())
  phoneNumber String   -- Nomor telepon yang request
  message     String?  -- Pesan tambahan (opsional)
  isRead      Boolean  @default(false)  -- Status dibaca
  isRegistered Boolean @default(false)  -- Apakah nomor terdaftar
  userId      Int?     -- ID user jika terdaftar (nullable)
  createdAt   DateTime @default(now())
  readAt      DateTime? -- Waktu dibaca
  user        User?    @relation(fields: [userId], references: [id])
}
```

## API Endpoints

### Public API
```
POST /api/forgot-passcode/request
Body: { phoneNumber: string, message?: string }
Response: { success: boolean, message: string, isRegistered: boolean }
```

### Admin API
```
GET  /api/notifications/forgot-passcode           # Fetch all notifications
PUT  /api/notifications/forgot-passcode/[id]/read # Mark as read
PUT  /api/notifications/forgot-passcode/mark-all-read # Mark all as read
DELETE /api/notifications/forgot-passcode/[id]   # Delete notification
```

## Fitur Utama

### 🎯 **Smart User Detection**
- **Registered User**: Nomor telepon ditemukan di database
  - Tampilkan nama dan foto user
  - Avatar biru dengan icon user
  - Status: "Terdaftar"

- **Unknown User**: Nomor telepon tidak ditemukan
  - Tampilkan "Orang Tidak Dikenali"
  - Avatar orange dengan icon question
  - Status: "Tidak Terdaftar"

### 📱 **Responsive Notifications**
- **Header Badge**: Menampilkan jumlah notifikasi belum dibaca
- **Dropdown Preview**: 5 notifikasi terbaru dengan info lengkap
- **Auto Refresh**: Update setiap 30 detik
- **Mark as Read**: Klik notifikasi untuk tandai dibaca

### 📊 **Statistics Dashboard**
- **Total Permintaan**: Jumlah semua permintaan
- **Belum Dibaca**: Notifikasi yang belum diproses
- **User Terdaftar**: Permintaan dari nomor terdaftar
- **Tidak Dikenali**: Permintaan dari nomor tidak terdaftar

## Cara Penggunaan

### Untuk User (Lupa Passcode)
1. Buka halaman login
2. Klik "Lupa Passcode? Klik di sini"
3. Masukkan nomor telepon yang terdaftar
4. Tambahkan pesan opsional
5. Klik "Kirim Permintaan Reset"
6. Tunggu admin memproses permintaan

### Untuk Super Admin
1. Login ke dashboard super admin
2. Lihat badge notifikasi di header (jika ada)
3. Klik bell icon untuk preview notifikasi
4. Klik "Lihat Semua Notifikasi" untuk halaman lengkap
5. Proses permintaan sesuai kebutuhan
6. Mark as read setelah diproses

## Testing

### Manual Testing
1. Buka `/forgot-passcode`
2. Test dengan nomor terdaftar: `08123456789`
3. Test dengan nomor tidak terdaftar: `08999888777`
4. Login sebagai super admin
5. Cek notifikasi di header dan halaman lengkap

### Sample Data Script
```bash
node scripts/create-sample-forgot-passcode.js
```

## Security Features

### 🛡️ **Validation**
- Format nomor telepon Indonesia
- Rate limiting (bisa ditambahkan)
- Input sanitization

### 🔐 **Access Control**
- Form publik: Tidak perlu login
- Notifikasi: Hanya super admin
- API: Protected endpoints

### 📝 **Audit Trail**
- Timestamp semua permintaan
- Track status read/unread
- Log user yang memproses

## Customization

### 🎨 **UI Customization**
- Warna badge dan avatar bisa diubah
- Layout notifikasi bisa disesuaikan
- Text dan pesan bisa dikustomisasi

### ⚙️ **Functional Customization**
- Auto-delete notifikasi lama
- Email notification ke admin
- SMS integration untuk response
- Bulk processing tools

## Troubleshooting

### Common Issues
1. **Notifikasi tidak muncul**: Cek role user (harus super admin)
2. **Form tidak submit**: Cek format nomor telepon
3. **Badge tidak update**: Tunggu auto refresh atau refresh manual

### Debug Steps
1. Cek console log di browser
2. Cek network tab untuk API calls
3. Cek database untuk data notifikasi
4. Verify user role dan permissions

## Future Enhancements

### 📈 **Planned Features**
- Auto-response via SMS/WhatsApp
- Bulk passcode reset tools
- Analytics dan reporting
- Integration dengan sistem external

### 🔧 **Technical Improvements**
- Real-time notifications (WebSocket)
- Push notifications
- Mobile app integration
- Advanced filtering dan search