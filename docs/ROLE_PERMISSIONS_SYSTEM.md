# Sistem Hak Akses dan Profil Passcode

## Overview
Sistem ini mengimplementasikan manajemen role dan hak akses dengan fitur khusus untuk pengelolaan passcode yang hanya dapat diakses oleh Super Admin dan Admin.

## Fitur Utama

### 1. Auto-Assignment Hak Akses
- Ketika role baru dibuat, sistem otomatis memberikan hak akses dasar
- Hak akses dasar meliputi: dashboard, profil, dan pengumuman
- Dapat dikustomisasi melalui halaman manajemen role (Super Admin only)

### 2. Profil Passcode dengan Pembatasan Akses Ketat
- **Super Admin**: Dapat melihat dan mengedit passcode semua user melalui user management
- **Admin**: Hanya dapat mengedit passcode sendiri melalui profil
- **Role Lainnya**: Hanya dapat melihat profil, tidak dapat mengedit passcode
- Data tersinkronisasi dengan user management

### 3. Sinkronisasi Data
- Perubahan role otomatis tersinkronisasi dengan user management
- Perubahan passcode langsung terintegrasi dengan profil user
- Notifikasi real-time untuk setiap perubahan

## Struktur Hak Akses

### Super Admin
- Semua hak akses sistem
- Dapat mengedit passcode semua user melalui user management
- Dapat mengelola role dan permissions
- Akses eksklusif ke user management dan role management
- Akses ke backup & restore

### Admin
- Hak akses data operasional
- Hanya dapat mengedit passcode sendiri melalui profil
- Tidak dapat mengakses user management
- Tidak dapat mengelola role sistem

### Yayasan
- Hak akses laporan dan monitoring
- Tidak dapat mengedit passcode
- Akses read-only untuk sebagian besar data

### Guru
- Hak akses input data santri
- Tidak dapat mengedit passcode
- Akses terbatas sesuai halaqah

### Santri & Orang Tua
- Hak akses view-only
- Tidak dapat mengedit passcode
- Akses terbatas pada data pribadi

## API Endpoints

### Role Management
- `GET /api/roles` - Daftar semua role
- `POST /api/roles` - Buat role baru (auto-assign permissions)
- `PUT /api/roles/[id]` - Update role
- `DELETE /api/roles/[id]` - Hapus role
- `GET /api/roles/[id]/permissions` - Lihat permissions role
- `PUT /api/roles/[id]/permissions` - Update permissions role

### User Management
- `GET /api/users` - Daftar semua user
- `POST /api/users` - Buat user baru
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Hapus user
- `GET /api/users/[id]/passcode` - Lihat passcode (restricted)
- `PUT /api/users/[id]/passcode` - Update passcode (restricted)

## Komponen UI

### 1. Role Management (`/yayasan/roles`)
- Tabel daftar role dengan jumlah user
- Modal untuk create/edit role
- Modal untuk manajemen permissions
- Auto-assignment notification

### 2. User Management (`/yayasan/users`)
- Tabel daftar user dengan role dan kontak
- Modal untuk create/edit user
- Modal khusus untuk manajemen passcode (restricted)
- Indikator hak akses passcode

### 3. Unified Profile Component
- Menampilkan informasi role dan permissions
- Pembatasan edit passcode berdasarkan role
- Pesan informatif tentang hak akses

## Security Features

### 1. Permission Checking
```typescript
import { canEditPasscode } from '@/lib/permissions';

// Check if user can edit passcode
if (!canEditPasscode(userRole)) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

### 2. Role-based UI Rendering
```typescript
const canEditPasscodePermission = canEditPasscode(userRole);

// Conditional rendering based on permissions
{canEditPasscodePermission && (
  <Button onClick={handleEditPasscode}>Edit Passcode</Button>
)}
```

### 3. Data Synchronization
- Perubahan role langsung mempengaruhi permissions user
- Passcode changes tersinkronisasi dengan profil
- Audit log untuk semua perubahan permissions

## Implementasi Teknis

### 1. Permission Library (`lib/permissions.ts`)
- Centralized permission management
- Role-based permission mapping
- Helper functions untuk checking permissions

### 2. Database Schema
- Role table dengan relasi ke User
- User table dengan passCode field
- Audit log untuk tracking changes

### 3. Notification System
- Success notifications untuk create/update operations
- Error notifications untuk access denied
- Informative messages untuk sync status

## Best Practices

1. **Principle of Least Privilege**: User hanya mendapat hak akses minimum yang diperlukan
2. **Role Separation**: Pemisahan jelas antara administrative dan operational roles
3. **Audit Trail**: Semua perubahan permissions dicatat untuk audit
4. **Data Consistency**: Sinkronisasi otomatis antar komponen sistem
5. **User Experience**: Pesan informatif dan UI yang intuitif

## Future Enhancements

1. **Dynamic Permissions**: Permissions yang dapat dikonfigurasi per user
2. **Time-based Access**: Hak akses dengan batasan waktu
3. **IP Restriction**: Pembatasan akses berdasarkan IP address
4. **Multi-factor Authentication**: Keamanan tambahan untuk admin functions
5. **Permission Templates**: Template permissions untuk role baru