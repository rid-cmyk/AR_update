# 📱 Format Otomatis Nomor WhatsApp

## Fitur Auto-Format +62

Input nomor WhatsApp di modal AdminSettingsModal memiliki fitur **format otomatis** ke format Indonesia (+62).

---

## Cara Kerja

### 1. Input Nomor Biasa
Ketika super admin mengetik nomor telepon biasa:

**Input**: `081234567890`  
**Output**: `+6281234567890`

### 2. Input Nomor dengan 0 di Depan
Angka 0 di depan otomatis diganti dengan 62:

**Input**: `0812345678`  
**Output**: `+62812345678`

### 3. Input Nomor dengan 62
Jika sudah ada 62, hanya tambahkan +:

**Input**: `6281234567890`  
**Output**: `+6281234567890`

### 4. Input Nomor dengan +62
Jika sudah lengkap, tidak berubah:

**Input**: `+6281234567890`  
**Output**: `+6281234567890`

---

## Contoh Penggunaan

### Skenario 1: Nomor Lokal
```
User ketik: 081234567890
Otomatis jadi: +6281234567890
```

### Skenario 2: Nomor dengan Spasi
```
User ketik: 0812 3456 7890
Spasi dihapus: 08123456789
Otomatis jadi: +6281234567890
```

### Skenario 3: Nomor dengan Tanda Hubung
```
User ketik: 0812-3456-7890
Tanda hubung dihapus: 08123456789
Otomatis jadi: +6281234567890
```

### Skenario 4: Nomor Tanpa 0
```
User ketik: 81234567890
Otomatis jadi: +6281234567890
```

---

## Validasi

### Format yang Diterima:
✅ `+6281234567890` (format lengkap)  
✅ `6281234567890` (tanpa +)  
✅ `081234567890` (dengan 0)  
✅ `81234567890` (tanpa 0 dan 62)

### Format yang Ditolak:
❌ `+1234567890` (bukan +62)  
❌ `+628` (terlalu pendek)  
❌ `+628123456789012345` (terlalu panjang)  
❌ `abc123` (ada huruf)

### Aturan Validasi:
- Harus dimulai dengan `+62`
- Minimal 12 karakter (+62 + 9 digit)
- Maksimal 16 karakter (+62 + 13 digit)
- Hanya angka setelah +62

---

## Kode Implementasi

### Fungsi Format:
```typescript
const formatWhatsAppNumber = (value: string) => {
  if (!value) return '';
  
  // Hapus semua karakter non-digit
  let cleaned = value.replace(/\D/g, '');
  
  // Jika dimulai dengan 0, ganti dengan 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  // Jika tidak dimulai dengan 62, tambahkan 62
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  // Tambahkan + di depan
  return '+' + cleaned;
};
```

### Event Handler:
```typescript
const handleWhatsAppNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const formatted = formatWhatsAppNumber(e.target.value);
  form.setFieldsValue({ whatsappNumber: formatted });
};
```

### Input Component:
```tsx
<Input
  prefix={<WhatsAppOutlined style={{ color: '#25D366' }} />}
  placeholder="081234567890"
  size="large"
  onChange={handleWhatsAppNumberChange}
  maxLength={16}
/>
```

---

## User Experience

### Visual Feedback:
1. User mulai mengetik
2. Setiap karakter otomatis diformat
3. User melihat format +62 langsung
4. Tidak perlu manual tambah +62

### Placeholder:
- Menampilkan contoh: `081234567890`
- Memberi petunjuk format lokal
- User tidak perlu tahu format +62

### Extra Text:
- "Otomatis format ke +62"
- "Contoh: ketik 081234567890 → +6281234567890"
- Memberi informasi jelas

---

## Testing

### Test Case 1: Input Normal
```
Input: 081234567890
Expected: +6281234567890
Status: ✅ Pass
```

### Test Case 2: Input dengan 62
```
Input: 6281234567890
Expected: +6281234567890
Status: ✅ Pass
```

### Test Case 3: Input dengan +62
```
Input: +6281234567890
Expected: +6281234567890
Status: ✅ Pass
```

### Test Case 4: Input dengan Spasi
```
Input: 0812 3456 7890
Expected: +6281234567890
Status: ✅ Pass
```

### Test Case 5: Input Tanpa 0
```
Input: 81234567890
Expected: +6281234567890
Status: ✅ Pass
```

### Test Case 6: Input Kosong
```
Input: (empty)
Expected: (empty)
Status: ✅ Pass
```

---

## Keunggulan

1. **User Friendly**: User tidak perlu tahu format +62
2. **Otomatis**: Tidak perlu manual edit
3. **Konsisten**: Semua nomor format sama
4. **Validasi**: Hanya terima format valid
5. **Real-time**: Format langsung saat ketik
6. **Fleksibel**: Terima berbagai format input

---

## Troubleshooting

### Nomor tidak terformat:
- Pastikan JavaScript enabled
- Refresh halaman
- Cek console untuk error

### Format salah:
- Pastikan input hanya angka
- Hapus karakter spesial
- Mulai dari 0 atau 8

### Validasi error:
- Cek panjang nomor (9-13 digit setelah +62)
- Pastikan format +62xxxxxxxxx
- Tidak ada huruf atau simbol

---

## Best Practices

### Untuk Super Admin:
1. Ketik nomor seperti biasa (08xxx)
2. Biarkan sistem format otomatis
3. Verifikasi format sebelum simpan
4. Test kirim pesan setelah simpan

### Untuk Developer:
1. Gunakan regex untuk validasi
2. Hapus karakter non-digit
3. Tambahkan +62 secara konsisten
4. Batasi panjang input (maxLength)
5. Berikan feedback visual

---

## Update Log

**Version 1.0.0** (2025-11-07)
- ✅ Implementasi format otomatis +62
- ✅ Validasi format nomor
- ✅ Real-time formatting
- ✅ Dokumentasi lengkap

---

**Related Files**:
- `components/super-admin/AdminSettingsModal.tsx`
- `app/api/admin-settings/route.ts`
- `prisma/schema.prisma`
