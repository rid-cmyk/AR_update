# Ar-Hapalan - Sistem Manajemen Hafalan Al-Quran

Sistem manajemen hafalan Al-Quran berbasis web untuk pondok pesantren dengan fitur lengkap untuk santri, guru, dan administrator.

## 🚀 Fitur Utama

### 🔐 Keamanan
- JWT Authentication dengan HTTP-only cookies
- Role-based access control (Super Admin, Admin, Guru, Santri, Orang Tua, Yayasan)
- Audit logging untuk semua aktivitas
- Sentry integration untuk error monitoring

### ⚡ Performa
- Redis caching untuk data berat (statistik yayasan)
- SWR untuk caching data pribadi
- Optimized database queries

### 🧪 Validasi
- Zod validation untuk semua input API
- Type-safe API endpoints
- Comprehensive error handling

### 📱 UX/UI
- Loading skeletons untuk better UX
- Ant Design message notifications
- Responsive design
- Real-time notifications

### 📊 Monitoring
- AuditLog untuk tracking aktivitas
- Sentry untuk error tracking
- Login activity monitoring

### 💾 Backup Otomatis
- Cron job backup dengan pg_dump
- Automated cleanup (30 hari retention)
- Manual backup via UI

### 📁 Struktur API
- `/api/(super-admin)/` - Super Admin endpoints
- `/api/(admin)/` - Admin endpoints
- `/api/(guru)/` - Guru endpoints
- `/api/(santri)/` - Santri endpoints
- `/api/(ortu)/` - Orang Tua endpoints
- `/api/(yayasan)/` - Yayasan endpoints

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Ant Design, Tailwind CSS
- **Database**: PostgreSQL dengan Prisma ORM
- **Authentication**: JWT dengan HTTP-only cookies
- **Caching**: Redis + SWR
- **Monitoring**: Sentry
- **Validation**: Zod

## 📦 Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd arhapalan
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env dengan konfigurasi database dan secrets
```

4. Setup database:
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

5. Jalankan development server:
```bash
npm run dev
```

## 🔧 Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run backup` - Manual backup
- `npm run backup:cron` - Automated backup (untuk cron job)
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema ke database
- `npm run prisma:seed` - Seed database

## 📋 Environment Variables

Lihat `.env.example` untuk daftar lengkap environment variables yang diperlukan.

## 🔄 Cron Jobs

Setup cron job untuk backup otomatis:

```bash
# Backup harian pukul 2 pagi
0 2 * * * cd /path/to/arhapalan && npm run backup:cron
```

## 📊 Roles & Permissions

- **Super Admin**: Full access, user management, system settings
- **Admin**: Pengumuman, halaqah, jadwal management
- **Guru**: Hafalan tracking, rapor, absensi
- **Santri**: View progress, target hafalan
- **Orang Tua**: Monitor anak progress
- **Yayasan**: Analytics, laporan keseluruhan

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Untuk support atau pertanyaan, silakan buat issue di repository ini.
# AR_update
