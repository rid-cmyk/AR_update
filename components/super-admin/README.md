# 🔐 Super Admin Components

⚠️ **PENTING: Komponen di folder ini HANYA untuk SUPER ADMIN**

## Daftar Komponen

### 1. AdminSettingsModal.tsx
**Fungsi**: Modal untuk mengatur nomor WhatsApp dan template pesan

**Akses**: 
- ✅ Super Admin ONLY
- ❌ Admin biasa TIDAK bisa akses
- ❌ Guru/Santri/Ortu TIDAK bisa akses

**Digunakan di**:
- `app/(dashboard)/super-admin/notifications/forgot-passcode/page.tsx`

**Fitur**:
- Update nomor WhatsApp super admin
- Update template pesan bantuan
- Update template pesan untuk user terdaftar
- Update template pesan untuk user tidak terdaftar
- Validasi format nomor telepon
- Placeholder untuk personalisasi pesan

**API yang digunakan**:
- `GET /api/super-admin/whatsapp-settings` - Ambil pengaturan
- `PUT /api/super-admin/whatsapp-settings` - Update pengaturan (super-admin only)

---

## Struktur Folder

```
components/
├── super-admin/           ← Komponen khusus super admin
│   ├── AdminSettingsModal.tsx
│   └── README.md
├── layout/                ← Komponen layout umum
├── common/                ← Komponen umum
└── ...
```

---

## Cara Menambah Komponen Baru

Jika ingin menambah komponen khusus super admin:

1. Buat file di folder `components/super-admin/`
2. Pastikan komponen hanya digunakan di route super-admin
3. Tambahkan validasi role di API jika perlu
4. Update README ini

---

## Keamanan

### Proteksi di Level Komponen:
- Komponen hanya di-import di halaman super-admin
- Route super-admin dilindungi oleh middleware

### Proteksi di Level API:
- Semua API endpoint memvalidasi session
- API PUT/POST/DELETE memvalidasi role super-admin
- Return 403 Forbidden jika bukan super-admin

### Contoh Validasi API:
```typescript
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  include: { role: true }
});

if (user?.role.name !== "super-admin") {
  return NextResponse.json(
    { error: "Only super-admin can access this" },
    { status: 403 }
  );
}
```

---

## Testing

Untuk test komponen super admin:

1. Login sebagai super-admin
2. Buka halaman yang menggunakan komponen
3. Verifikasi fungsi CRUD berjalan
4. Logout dan login sebagai role lain
5. Verifikasi komponen/menu tidak muncul

---

## Maintenance

Jika ada perubahan:
- Update dokumentasi di README ini
- Update dokumentasi di `FITUR_ADMIN_SETTINGS.md`
- Update user guide di `docs/CARA_MENGATUR_WHATSAPP_ADMIN.md`
- Test dengan berbagai role user

---

## Contact

Jika ada pertanyaan atau issue, hubungi developer atau tim IT.
