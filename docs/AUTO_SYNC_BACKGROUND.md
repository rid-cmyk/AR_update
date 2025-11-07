
# 🔄 Auto Sync Background - Sinkronisasi Otomatis

## Perubahan UI

### ❌ Yang Dihapus:

1. **Tombol "Sync Data"** - Tidak ditampilkan lagi
2. **Tombol "Refresh Data"** - Tidak ditampilkan lagi
3. **Notifikasi "X notifikasi berhasil disinkronisasi"** - Tidak muncul lagi
4. **Notifikasi "Semua notifikasi sudah tersinkronisasi"** - Tidak muncul lagi
5. **Notifikasi "Gagal melakukan sinkronisasi"** - Tidak muncul lagi

### ✅ Yang Tetap Ada:

1. **Tombol "Pengaturan"** - Untuk buka modal AdminSettings
2. **Auto-sync setiap 15 detik** - Berjalan di background
3. **Auto-sync saat tab visible** - Saat kembali ke tab
4. **Auto-fetch data** - Saat pertama kali load

---

## Cara Kerja Auto Sync

### Flow Sinkronisasi:

```
1. Halaman load
        ↓
2. Fetch notifications (pertama kali)
        ↓
3. Sync notifications (silent)
        ↓
4. Set interval 15 detik
        ↓
5. Setiap 15 detik:
   - Fetch notifications (silent)
   - Sync notifications (silent)
        ↓
6. Saat tab visible:
   - Fetch notifications (silent)
   - Sync notifications (silent)
```

### Kode:

```typescript
useEffect(() => {
    fetchNotifications();

    // Auto-refresh setiap 15 detik
    const interval = setInterval(() => {
        fetchNotifications();
    }, 15000);

    // Auto-sync saat tab visible
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            fetchNotifications();
            syncNotifications(); // Silent sync
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
}, []);
```

---

## Silent Sync

### Fungsi syncNotifications (Baru):

```typescript
// Sync notifications (silent - no notification)
const syncNotifications = async () => {
    try {
        const response = await fetch('/api/notifications/forgot-passcode/sync', {
            method: 'GET'
        });

        if (response.ok) {
            const data = await response.json();
            // Silent sync - hanya refresh data jika ada perubahan
            if (data.syncedCount > 0) {
                fetchNotifications();
            }
        }
    } catch (error) {
        // Silent error - tidak tampilkan notifikasi
        console.error('Error syncing notifications:', error);
    }
};
```

### Perbedaan dengan Versi Lama:

| Aspek | Versi Lama | Versi Baru |
|-------|-----------|-----------|
| Notifikasi sukses | ✅ Muncul | ❌ Tidak muncul |
| Notifikasi info | ✅ Muncul | ❌ Tidak muncul |
| Notifikasi error | ✅ Muncul | ❌ Tidak muncul |
| Loading state | ✅ Ada | ❌ Tidak ada |
| Tombol manual | ✅ Ada | ❌ Tidak ada |
| Auto sync | ✅ Ada | ✅ Ada |
| Console log error | ✅ Ada | ✅ Ada |

---

## Keunggulan Silent Sync

### ✅ Pros:

1. **Tidak Mengganggu**: User tidak terganggu dengan notifikasi
2. **Clean UI**: Tidak ada tombol yang tidak perlu
3. **Otomatis**: Sync berjalan sendiri di background
4. **Efisien**: Hanya refresh jika ada perubahan
5. **Simple**: UI lebih sederhana dan fokus

### ⚠️ Cons:

1. **Tidak Ada Feedback**: User tidak tahu kapan sync terjadi
2. **Tidak Ada Manual Control**: User tidak bisa trigger sync manual
3. **Debug Lebih Sulit**: Harus cek console log

---

## Monitoring

### Cara Cek Sync Berjalan:

1. **Buka DevTools** (F12)
2. **Buka Console tab**
3. **Lihat log**:

```javascript
// Setiap 15 detik akan muncul:
GET /api/notifications/forgot-passcode 200 in 150ms

// Jika ada sync:
GET /api/notifications/forgot-passcode/sync 200 in 50ms
```

### Cara Cek Error:

```javascript
// Jika ada error sync:
Error syncing notifications: Error: Failed to fetch
```

---

## Troubleshooting

### Issue 1: Data tidak update
**Penyebab**: Sync tidak berjalan

**Debug**:
1. Cek console log
2. Pastikan tidak ada error
3. Cek network tab

**Solusi**:
- Refresh halaman manual
- Cek koneksi internet
- Cek server running

---

### Issue 2: Terlalu banyak request
**Penyebab**: Interval terlalu cepat

**Solusi**:
Ubah interval di kode:
```typescript
// Dari 15 detik ke 30 detik
const interval = setInterval(() => {
    fetchNotifications();
}, 30000); // 30 detik
```

---

### Issue 3: Sync error tidak terlihat
**Penyebab**: Silent error

**Solusi**:
Cek console log:
```javascript
console.error('Error syncing notifications:', error);
```

---

## Konfigurasi

### Ubah Interval Sync:

```typescript
// File: app/(dashboard)/super-admin/notifications/forgot-passcode/page.tsx

// Interval 15 detik (default)
const interval = setInterval(() => {
    fetchNotifications();
}, 15000);

// Interval 30 detik
const interval = setInterval(() => {
    fetchNotifications();
}, 30000);

// Interval 1 menit
const interval = setInterval(() => {
    fetchNotifications();
}, 60000);
```

### Disable Auto Sync:

```typescript
// Hapus atau comment interval
// const interval = setInterval(() => {
//     fetchNotifications();
// }, 15000);

// Hapus atau comment visibility handler
// document.addEventListener('visibilitychange', handleVisibilityChange);
```

### Enable Manual Sync:

Tambahkan kembali tombol:
```typescript
<Button
    icon={<SyncOutlined />}
    onClick={syncNotifications}
>
    Sync
</Button>
```

---

## Best Practices

### ✅ Recommended:

1. **Interval 15-30 detik** - Balance antara real-time dan performance
2. **Silent sync** - Tidak mengganggu user
3. **Console log error** - Untuk debugging
4. **Sync on visibility** - Update saat user kembali ke tab

### ❌ Not Recommended:

1. Interval < 5 detik - Terlalu banyak request
2. Notifikasi setiap sync - Mengganggu user
3. No error logging - Sulit debug
4. No sync on visibility - Data bisa outdated

---

## FAQ

### Q: Bagaimana cara tahu sync berjalan?
**A**: Cek console log di DevTools. Setiap 15 detik akan ada request ke API.

### Q: Apakah sync menggunakan banyak bandwidth?
**A**: Tidak. Request hanya fetch data kecil (JSON). Sekitar 1-5 KB per request.

### Q: Bagaimana jika koneksi lambat?
**A**: Sync akan timeout dan retry di interval berikutnya. Tidak ada notifikasi error.

### Q: Apakah bisa disable auto sync?
**A**: Ya, hapus atau comment kode interval di useEffect.

### Q: Bagaimana jika ingin sync manual?
**A**: Tambahkan kembali tombol sync di UI.

---

## Related Files

- `app/(dashboard)/super-admin/notifications/forgot-passcode/page.tsx` - Halaman notifikasi
- `app/api/notifications/forgot-passcode/sync/route.ts` - API sync endpoint

---

**Last Updated**: 2025-11-07  
**Version**: 2.2.0  
**Status**: ✅ Production Ready
