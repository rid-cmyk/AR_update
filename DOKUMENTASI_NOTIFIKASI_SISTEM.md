# 📋 Dokumentasi Sistem Notifikasi Header

## 🎯 **Overview**
Sistem notifikasi header yang berbeda untuk setiap role user dengan fitur popup modal yang menampilkan informasi spesifik berdasarkan role.

## 🔔 **Fitur Notifikasi Berdasarkan Role**

### 1. **Super Admin** 🔑
- **Icon**: `KeyOutlined` (ikon kunci)
- **Fungsi**: Menampilkan permintaan reset password
- **Data yang ditampilkan**:
  - Username yang meminta reset
  - Status: Terdaftar/Tidak Terdaftar
  - Nama lengkap (jika terdaftar)
  - Role user (jika terdaftar)
  - Timestamp permintaan
  - Badge count: Jumlah permintaan pending

### 2. **Dashboard Lainnya** (Admin, Guru, Santri, Ortu, Yayasan) 📢
- **Icon**: `BellOutlined` (ikon lonceng)
- **Fungsi**: Menampilkan pengumuman terbaru yang belum dibaca
- **Data yang ditampilkan**:
  - Judul pengumuman
  - Isi pengumuman (preview 150 karakter)
  - Pembuat pengumuman
  - Role pembuat
  - Timestamp pembuatan
  - Badge count: Jumlah pengumuman belum dibaca

## 🛠️ **Implementasi Teknis**

### **API Endpoints**

#### 1. Reset Password Requests (Super Admin)
```typescript
// GET /api/admin/reset-password-requests
// Mengambil daftar permintaan reset password

// POST /api/admin/reset-password-requests
// Menambah permintaan reset password baru
```

#### 2. Latest Announcements (Non-Super Admin)
```typescript
// GET /api/pengumuman/latest
// Mengambil 5 pengumuman terbaru yang belum dibaca berdasarkan role
```

### **HeaderBar Component Updates**

#### **State Management**
```typescript
const [resetPasswordRequests, setResetPasswordRequests] = useState<any[]>([]);
const [latestAnnouncements, setLatestAnnouncements] = useState<any[]>([]);
const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
```

#### **Auto Refresh**
- **Reset Password Requests**: Refresh setiap 30 detik
- **Announcements**: Refresh setiap 60 detik

### **Modal Components**

#### 1. **Reset Password Modal** (Super Admin)
```typescript
<Modal
  title="Permintaan Reset Password"
  open={showResetPasswordModal}
  onCancel={() => setShowResetPasswordModal(false)}
  footer={null}
  width={600}
>
  // List permintaan dengan status terdaftar/tidak terdaftar
</Modal>
```

#### 2. **Announcements Modal** (Non-Super Admin)
```typescript
<Modal
  title="Pengumuman Terbaru"
  open={showAnnouncementModal}
  onCancel={() => setShowAnnouncementModal(false)}
  footer={null}
  width={700}
>
  // List pengumuman dengan preview dan link "Lihat Selengkapnya"
</Modal>
```

## 🔄 **Integrasi dengan Forgot Password**

### **Forgot Password Page Integration**
Ketika user menggunakan fitur forgot password:

1. **Data Ditemukan**: 
   - Sistem mengirim request ke `/api/admin/reset-password-requests`
   - Super admin mendapat notifikasi real-time
   - Badge count bertambah

2. **Data Tidak Ditemukan**:
   - Tetap mengirim request dengan status "tidak terdaftar"
   - Super admin dapat melihat username yang tidak valid

### **WhatsApp Integration**
- User diarahkan ke WhatsApp admin dengan pesan otomatis
- Super admin mendapat notifikasi di dashboard
- Sinkronisasi antara WhatsApp dan sistem internal

## 🎨 **UI/UX Features**

### **Visual Indicators**
- **Badge Count**: Menampilkan jumlah notifikasi
- **Color Coding**: 
  - Hijau: User terdaftar
  - Orange: User tidak terdaftar/pengumuman baru
- **Hover Effects**: Animasi scale dan background change
- **Responsive Design**: Optimal di berbagai ukuran layar

### **User Experience**
- **One-Click Access**: Langsung buka modal dengan satu klik
- **Auto-Refresh**: Data selalu up-to-date
- **Quick Actions**: Link langsung ke halaman detail
- **Clear Status**: Status terdaftar/tidak terdaftar jelas terlihat

## 📱 **Responsive Behavior**

### **Layout Adjustments**
```css
.marquee-wrapper {
  left: 200px;   /* Setelah logo */
  right: 280px;  /* Sebelum notifikasi + profile */
}
```

### **Icon Positioning**
- **Super Admin**: Reset Password Icon → Profile
- **Others**: Announcement Icon → Profile
- **Gap**: 12px antar elemen
- **Alignment**: Center vertical alignment

## 🔒 **Security & Permissions**

### **Role-Based Access**
- **Super Admin**: Hanya bisa lihat reset password requests
- **Non-Super Admin**: Hanya bisa lihat pengumuman sesuai target audience
- **Authentication**: Semua API endpoint memerlukan valid JWT token

### **Data Privacy**
- **Reset Requests**: Hanya username dan status yang ditampilkan
- **Announcements**: Filter berdasarkan target audience
- **No Sensitive Data**: Tidak ada password atau data sensitif di frontend

## 🚀 **Performance Optimizations**

### **Efficient Polling**
- **Conditional Fetching**: Hanya fetch data sesuai role
- **Reasonable Intervals**: 30s untuk reset requests, 60s untuk announcements
- **Error Handling**: Graceful fallback jika API gagal

### **Memory Management**
- **Cleanup Intervals**: Clear interval saat component unmount
- **Limited Data**: Maksimal 5 pengumuman terbaru
- **Optimized Queries**: Include hanya field yang diperlukan

## 📊 **Monitoring & Analytics**

### **Trackable Metrics**
- Jumlah permintaan reset password per hari
- Response time super admin terhadap permintaan
- Engagement rate pengumuman
- Click-through rate ke halaman detail

### **Error Logging**
- API call failures
- Authentication errors
- Network connectivity issues
- User interaction errors

## 🔧 **Maintenance & Updates**

### **Regular Tasks**
- Monitor API performance
- Update notification intervals jika diperlukan
- Review dan cleanup old reset requests
- Optimize database queries

### **Future Enhancements**
- Real-time notifications dengan WebSocket
- Push notifications untuk mobile
- Advanced filtering dan sorting
- Bulk actions untuk super admin

---

## 📝 **Summary**

Sistem notifikasi header telah berhasil diimplementasikan dengan:

✅ **Role-based notifications**: Super admin melihat reset password requests, yang lain melihat pengumuman  
✅ **Real-time updates**: Auto-refresh setiap 30-60 detik  
✅ **Intuitive UI**: Modal popup dengan informasi lengkap  
✅ **WhatsApp integration**: Sinkronisasi dengan forgot password flow  
✅ **Responsive design**: Optimal di semua device  
✅ **Security**: Role-based access control  

Fitur ini meningkatkan efisiensi komunikasi dan manajemen sistem secara keseluruhan! 🎯