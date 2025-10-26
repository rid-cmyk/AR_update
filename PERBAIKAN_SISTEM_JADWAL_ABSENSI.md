# 🔧 PERBAIKAN SISTEM JADWAL & ABSENSI

**Tanggal:** 23 Oktober 2025  
**Status:** 🚧 **DALAM PERBAIKAN**

---

## 🎯 MASALAH YANG DITEMUKAN

### 1. **Masalah Jadwal Berulang**
- ❌ Admin harus membuat jadwal berulang setiap minggu
- ❌ Jika pilih hari Senin, hanya berlaku untuk Senin itu saja
- ❌ Senin depan tidak otomatis ada jadwalnya
- ❌ Admin harus ngulang-ulang bikin jadwal yang banyak

### 2. **Masalah Absensi Guru**
- ❌ Guru hanya bisa absen santri yang ada di halaqahnya saja
- ❌ Tidak ada fleksibilitas untuk absen santri lain

---

## 🛠️ SOLUSI YANG AKAN DITERAPKAN

### **Solusi 1: Sistem Jadwal Template (Recurring Schedule)**

#### **Konsep:**
- Jadwal dibuat sebagai **template mingguan** yang berulang otomatis
- Admin cukup buat jadwal sekali, berlaku untuk semua minggu
- Sistem otomatis generate jadwal untuk tanggal-tanggal mendatang

#### **Perubahan Database:**
```prisma
model Jadwal {
  id         Int       @id @default(autoincrement())
  hari       Hari      // Enum: Senin, Selasa, dst
  jamMulai   DateTime  // Format: HH:mm:ss
  jamSelesai DateTime  // Format: HH:mm:ss
  halaqahId  Int
  
  // NEW FIELDS untuk recurring
  isTemplate Boolean   @default(true)  // Apakah ini template atau jadwal spesifik
  tanggalMulai DateTime? // Tanggal mulai berlaku (opsional)
  tanggalSelesai DateTime? // Tanggal selesai berlaku (opsional)
  isActive   Boolean   @default(true)  // Status aktif/nonaktif
  
  absensi    Absensi[]
  halaqah    Halaqah   @relation(fields: [halaqahId], references: [id])
}
```

#### **Fitur Baru:**
1. **Template Mode**: Jadwal default berulang setiap minggu
2. **Date Range**: Bisa set periode berlaku jadwal
3. **Active/Inactive**: Bisa nonaktifkan jadwal tanpa hapus
4. **Auto Generation**: Sistem otomatis generate jadwal untuk minggu-minggu mendatang

---

### **Solusi 2: Sistem Absensi Fleksibel**

#### **Konsep:**
- Guru bisa absen santri di halaqahnya (default)
- **PLUS** guru bisa absen santri lain dengan approval/permission
- Admin bisa set permission guru untuk absen lintas halaqah

#### **Perubahan Database:**
```prisma
model GuruPermission {
  id         Int  @id @default(autoincrement())
  guruId     Int  // Guru yang diberi permission
  halaqahId  Int  // Halaqah yang boleh diakses
  canAbsensi Boolean @default(false)
  canHafalan Boolean @default(false)
  createdAt  DateTime @default(now())
  
  guru       User     @relation("GuruPermissions", fields: [guruId], references: [id])
  halaqah    Halaqah  @relation("HalaqahPermissions", fields: [halaqahId], references: [id])
  
  @@unique([guruId, halaqahId])
}
```

#### **Fitur Baru:**
1. **Cross-Halaqah Access**: Guru bisa akses halaqah lain dengan permission
2. **Permission Management**: Admin atur permission guru
3. **Flexible Absensi**: Guru bisa absen santri dari multiple halaqah
4. **Audit Trail**: Log semua aktivitas absensi lintas halaqah

---

## 📋 IMPLEMENTASI STEP-BY-STEP

### **Phase 1: Perbaikan Sistem Jadwal Template**

#### **1.1 Update Database Schema**
- Tambah field `isTemplate`, `tanggalMulai`, `tanggalSelesai`, `isActive`
- Migration script untuk data existing

#### **1.2 Update API Jadwal**
- `GET /api/jadwal` - Support template mode
- `POST /api/jadwal` - Create template jadwal
- `GET /api/jadwal/generate` - Generate jadwal untuk periode tertentu
- `PUT /api/jadwal/[id]/toggle` - Aktifkan/nonaktifkan jadwal

#### **1.3 Update Frontend Admin**
- Toggle "Template Mode" vs "Specific Date"
- Date range picker untuk periode berlaku
- Bulk actions: activate/deactivate multiple jadwal
- Preview generated schedule

#### **1.4 Auto Generation Service**
- Background job generate jadwal mingguan
- Cron job untuk generate jadwal 2 minggu ke depan
- Notification jika ada konflik jadwal

---

### **Phase 2: Perbaikan Sistem Absensi Fleksibel**

#### **2.1 Update Database Schema**
- Tambah model `GuruPermission`
- Update relasi User dan Halaqah

#### **2.2 Update API Absensi**
- `GET /api/guru/absensi` - Include permitted halaqah
- `GET /api/guru/permissions` - Get guru permissions
- `POST /api/admin/guru-permissions` - Manage permissions

#### **2.3 Update Frontend Guru**
- Dropdown pilih halaqah (own + permitted)
- Badge indicator "Own" vs "Permitted"
- Warning message untuk absensi lintas halaqah

#### **2.4 Update Frontend Admin**
- Permission management page
- Assign guru ke multiple halaqah
- Bulk permission assignment

---

## 🎨 UI/UX IMPROVEMENTS

### **Dashboard Admin - Jadwal Management**

#### **Template Mode:**
```
┌─────────────────────────────────────────┐
│ ☑️ Template Mode (Recurring Weekly)     │
│ ☐ Specific Date Mode                    │
│                                         │
│ Halaqah: [Al-Fatihah ▼]                │
│ Hari: [Senin ▼]                        │
│ Jam: [08:00] - [10:00]                 │
│                                         │
│ 📅 Periode Berlaku (Opsional):         │
│ Dari: [01/11/2025] Sampai: [31/12/2025]│
│                                         │
│ [💾 Simpan Template] [👁️ Preview]       │
└─────────────────────────────────────────┘
```

#### **Jadwal List dengan Status:**
```
┌─────────────────────────────────────────┐
│ ID │ Halaqah    │ Hari   │ Waktu │ Status│
├────┼────────────┼────────┼───────┼───────┤
│ 1  │ Al-Fatihah │ Senin  │08-10  │🟢 Aktif│
│ 2  │ Al-Baqarah │ Selasa │10-12  │🟡 Template│
│ 3  │ Ali-Imran  │ Rabu   │14-16  │🔴 Nonaktif│
└─────────────────────────────────────────┘
```

---

### **Dashboard Guru - Absensi Fleksibel**

#### **Halaqah Selection:**
```
┌─────────────────────────────────────────┐
│ Pilih Halaqah:                          │
│ [Al-Fatihah (Own) ▼]                   │
│   • Al-Fatihah (Own) ✅                │
│   • Al-Baqarah (Permitted) 🔑          │
│   • Ali-Imran (Permitted) 🔑           │
│                                         │
│ ⚠️ Anda akan absen di halaqah lain      │
│    Pastikan koordinasi dengan guru      │
└─────────────────────────────────────────┘
```

---

## 🔄 WORKFLOW BARU

### **Workflow Admin - Buat Jadwal Template:**
```
1. Admin buka Dashboard Jadwal
   ↓
2. Klik "Add Schedule" 
   ↓
3. Pilih "Template Mode"
   ↓
4. Isi: Halaqah, Hari, Jam
   ↓
5. (Opsional) Set periode berlaku
   ↓
6. Klik "Simpan Template"
   ↓
7. Sistem auto-generate jadwal untuk 4 minggu ke depan
   ↓
8. ✅ Jadwal berulang otomatis setiap minggu!
```

### **Workflow Guru - Absensi Lintas Halaqah:**
```
1. Guru buka Dashboard Absensi
   ↓
2. Pilih tanggal
   ↓
3. Pilih halaqah (own + permitted)
   ↓
4. Sistem load santri dari halaqah terpilih
   ↓
5. Guru input absensi
   ↓
6. Sistem log aktivitas lintas halaqah
   ↓
7. ✅ Absensi tersimpan dengan audit trail
```

---

## 📊 BENEFITS

### **Untuk Admin:**
- ✅ **90% Less Work**: Cukup buat jadwal sekali, berlaku selamanya
- ✅ **Auto Management**: Sistem otomatis handle recurring
- ✅ **Flexible Control**: Bisa nonaktifkan/aktifkan jadwal
- ✅ **Better Planning**: Preview jadwal untuk bulan-bulan mendatang

### **Untuk Guru:**
- ✅ **Cross-Halaqah Access**: Bisa bantu absen halaqah lain
- ✅ **Emergency Backup**: Jika guru lain berhalangan
- ✅ **Flexible Schedule**: Tidak terbatas halaqah sendiri
- ✅ **Better Coordination**: Permission system yang jelas

### **Untuk Sistem:**
- ✅ **Scalable**: Support ratusan halaqah tanpa manual work
- ✅ **Maintainable**: Template system mudah dikelola
- ✅ **Auditable**: Full tracking semua aktivitas
- ✅ **Future-proof**: Mudah extend untuk fitur baru

---

## 🧪 TESTING SCENARIOS

### **Test Jadwal Template:**
```
Scenario 1: Create Weekly Template
1. Admin buat jadwal Senin 08:00-10:00 (template mode)
2. Sistem generate jadwal untuk 4 Senin ke depan
3. Verify: Semua Senin punya jadwal yang sama

Scenario 2: Deactivate Template  
1. Admin nonaktifkan template jadwal
2. Verify: Jadwal mendatang tidak ter-generate
3. Verify: Jadwal existing tetap ada

Scenario 3: Date Range Template
1. Admin buat template dengan periode 1 Nov - 31 Des
2. Verify: Jadwal hanya generate dalam periode tersebut
3. Verify: Setelah 31 Des, tidak ada jadwal baru
```

### **Test Absensi Fleksibel:**
```
Scenario 1: Cross-Halaqah Permission
1. Admin beri permission Guru A akses Halaqah B
2. Guru A login, bisa lihat Halaqah B di dropdown
3. Guru A absen santri Halaqah B
4. Verify: Absensi tersimpan dengan audit log

Scenario 2: Permission Revoked
1. Admin cabut permission Guru A dari Halaqah B
2. Guru A login, tidak bisa lihat Halaqah B
3. Verify: Access denied jika coba akses via API

Scenario 3: Audit Trail
1. Guru A absen santri di halaqah lain
2. Check audit log: ada record aktivitas lintas halaqah
3. Admin bisa track siapa absen dimana
```

---

## 🚀 IMPLEMENTATION TIMELINE

### **Week 1: Database & Backend**
- ✅ Update Prisma schema
- ✅ Create migration scripts  
- ✅ Update API endpoints
- ✅ Add background jobs

### **Week 2: Frontend Admin**
- ✅ Update jadwal management UI
- ✅ Add template mode toggle
- ✅ Add permission management
- ✅ Add bulk actions

### **Week 3: Frontend Guru**
- ✅ Update absensi UI
- ✅ Add halaqah selection
- ✅ Add permission indicators
- ✅ Add audit trail view

### **Week 4: Testing & Deployment**
- ✅ Unit testing
- ✅ Integration testing
- ✅ User acceptance testing
- ✅ Production deployment

---

## 🎯 SUCCESS METRICS

### **Jadwal Template Success:**
- 📊 **Admin Workload**: Reduce 90% manual jadwal creation
- 📊 **Schedule Coverage**: 100% weeks have complete schedules
- 📊 **Error Rate**: <1% scheduling conflicts
- 📊 **User Satisfaction**: >95% admin satisfaction

### **Absensi Fleksibel Success:**
- 📊 **Cross-Halaqah Usage**: >20% guru use cross-halaqah feature
- 📊 **Coverage Rate**: >95% santri attendance recorded
- 📊 **Response Time**: <2s halaqah switching
- 📊 **Audit Compliance**: 100% activities logged

---

## 🔧 TECHNICAL CONSIDERATIONS

### **Performance:**
- Index database untuk query jadwal template
- Cache permissions untuk faster access
- Optimize bulk jadwal generation
- Background processing untuk heavy operations

### **Security:**
- Validate permissions pada setiap request
- Audit log semua cross-halaqah activities
- Rate limiting untuk bulk operations
- Input sanitization dan validation

### **Scalability:**
- Support 1000+ halaqah dengan template system
- Horizontal scaling untuk background jobs
- Database partitioning untuk large datasets
- CDN untuk static assets

---

**Status:** 🚧 **READY FOR IMPLEMENTATION**  
**Priority:** 🔥 **HIGH** - Critical untuk operational efficiency  
**Impact:** 🎯 **HIGH** - Significantly improve admin & guru workflow
