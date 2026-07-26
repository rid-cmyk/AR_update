# Arsitektur Database & Diagram Aktivitas Sistem AR-Hafalan

Dokumen ini memuat penjabaran mendalam mengenai relasi antar tabel (Database Prisma) dan visualisasi aktivitas spesifik (*Use Case* & *Activity Diagram*) untuk setiap fitur utama di sistem AR-Hafalan.

---

## 1. Penjelasan Relasi Database Prisma (Database Schema)

Sistem AR-Hafalan mengandalkan PostgreSQL dengan Prisma ORM. Struktur *database*-nya sangat relasional (RDBMS) untuk memastikan integritas data akademik.

### Relasi Kunci (Key Relationships):

1. **User (Pengguna) & Role:**
   - Tabel `User` memiliki satu `Role` (Relasi 1-ke-1).
   - Tabel `User` sangat dinamis: Bisa bertindak sebagai Guru, Santri, Orang Tua, Admin, dsb.

2. **Halaqah (Grup Kelas) & Santri:**
   - Relasi *Many-to-Many* melalui tabel *Pivot* `HalaqahSantri`.
   - Sebuah `Halaqah` memiliki satu Guru utama (`guruId` merujuk ke `User`).
   - Tabel `HalaqahSantri` mencatat riwayat masuknya Santri ke Halaqah pada suatu `TahunAkademik` dan `Semester`.

3. **Jadwal & Absensi:**
   - `Halaqah` memiliki banyak `Jadwal` (1-ke-Banyak).
   - `Absensi` terkait langsung dengan `Jadwal` spesifik dan `Santri` spesifik. Memastikan tidak ada absensi tanpa jadwal yang terdaftar.

4. **Hafalan & Target:**
   - `Santri` (User) memiliki banyak riwayat `Hafalan` (Relasi 1-ke-Banyak).
   - `TargetHafalan` berdiri secara terpisah untuk setiap Santri, berisi tenggat waktu (*deadline*) dan status tercapai atau belum.

5. **Sistem Penilaian (Ujian & Raport):**
   - **Template:** Terdapat `TemplateUjian` yang memiliki banyak `KomponenPenilaian` (misal: Tajwid 40%, Fasohah 60%).
   - **Transaksi:** Saat ujian, dibuat `UjianSantri` yang merujuk pada `TemplateUjian`. Rincian nilainya disimpan di `NilaiUjian` yang menunjuk ke `KomponenPenilaian`.
   - **Raport Akhir:** Data ujian dikalkulasi lalu direkam abadi di tabel `RaportSantri` beserta tautan file PDF dan grafiknya.

---

## 2. Entity Relationship Diagram (ERD) Komprehensif

Berikut adalah gambaran tabel dan kardinalitas sistem (menggunakan *Crow's Foot Notation*):

```mermaid
erDiagram
    ROLE ||--o{ USER : "mendefinisikan"
    USER ||--o{ HALAQAH : "Mengajar (guruId)"
    USER ||--o{ HALAQAH_SANTRI : "Anggota Kelas"
    HALAQAH ||--o{ HALAQAH_SANTRI : "Memiliki"
    HALAQAH ||--o{ JADWAL : "Memiliki Jadwal"
    
    USER ||--o{ HAFALAN : "Setoran"
    USER ||--o{ TARGET_HAFALAN : "Memiliki Target"
    USER ||--o{ ABSENSI : "Catatan Hadir"
    
    JADWAL ||--o{ ABSENSI : "Referensi Absen"
    
    TAHUN_AJARAN ||--o{ TEMPLATE_UJIAN : "Periode"
    TAHUN_AJARAN ||--o{ TEMPLATE_RAPORT : "Periode"
    TAHUN_AJARAN ||--o{ RAPORT_SANTRI : "Periode"
    
    TEMPLATE_UJIAN ||--o{ KOMPONEN_PENILAIAN : "Terdiri dari"
    TEMPLATE_UJIAN ||--o{ UJIAN_SANTRI : "Dasar Ujian"
    
    USER ||--o{ UJIAN_SANTRI : "Mengikuti (santriId)"
    UJIAN_SANTRI ||--o{ NILAI_UJIAN : "Mendapat Nilai"
    KOMPONEN_PENILAIAN ||--o{ NILAI_UJIAN : "Referensi Bobot"
    
    TEMPLATE_RAPORT ||--o{ RAPORT_SANTRI : "Format Raport"
    USER ||--o{ RAPORT_SANTRI : "Mendapat Raport"
```

---

## 3. Diagram Aktivitas & Use Case Tiap Fitur

### A. Fitur Manajemen Halaqah & Tahun Ajaran
**Penanggung Jawab (Aktor):** Admin

**Use Case:**
```mermaid
usecaseDiagram
    actor Admin
    Admin --> (Buat Tahun Ajaran & Semester)
    Admin --> (Buat Halaqah Baru)
    Admin --> (Tetapkan Guru ke Halaqah)
    Admin --> (Masukkan Daftar Santri ke Halaqah)
    Admin --> (Atur Jadwal Halaqah)
```

**Activity Diagram (Alur Pembentukan Halaqah):**
```mermaid
stateDiagram-v2
    [*] --> BukaMenuHalaqah
    BukaMenuHalaqah --> InputDataHalaqah: Nama, Pilih Guru
    InputDataHalaqah --> SimpanHalaqah
    SimpanHalaqah --> TambahSantri
    TambahSantri --> PilihTahunAkademik
    PilihTahunAkademik --> ChecklistSantri: Centang nama-nama santri
    ChecklistSantri --> ValidasiSistem
    ValidasiSistem --> TampilTabelHalaqah: Sukses (Halaqah terbentuk)
    TampilTabelHalaqah --> [*]
```

---

### B. Fitur Input Setoran Hafalan (Ziyadah/Murojaah)
**Penanggung Jawab (Aktor):** Guru, Santri (Penerima)

**Use Case:**
```mermaid
usecaseDiagram
    actor Guru
    actor Santri
    Guru --> (Pilih Santri)
    Guru --> (Isi Rentang Ayat & Surat)
    Guru --> (Tandai Status: Ziyadah/Murojaah)
    Guru --> (Beri Keterangan Opsional)
    (Terima Notifikasi Push) <-- Santri
    (Lihat Grafik Hafalan Terupdate) <-- Santri
```

**Activity Diagram:**
```mermaid
stateDiagram-v2
    [*] --> DasborGuru
    DasborGuru --> PilihMenuHafalan
    PilihMenuHafalan --> CariSantri: Ketik nama/Pilih dari list
    CariSantri --> FormInputHafalan
    FormInputHafalan --> InputTanggal
    InputTanggal --> InputSuratAyat: Pilih Surat Awal - Akhir
    InputSuratAyat --> PilihStatus: Ziyadah / Murojaah
    PilihStatus --> SimpanKeDB
    SimpanKeDB --> TriggerWebsockets: Broadcast Event via Pusher
    TriggerWebsockets --> SantriTerimaNotif: UI Klien Santri berbunyi/notif
    SantriTerimaNotif --> [*]
```

---

### C. Fitur Pelaksanaan Ujian Tahfidz
**Penanggung Jawab (Aktor):** Guru, Admin (Verifikator)

**Use Case:**
```mermaid
usecaseDiagram
    actor Guru
    actor Admin
    Guru --> (Mulai Ujian Santri)
    Guru --> (Input Nilai per Komponen)
    Guru --> (Simpan sebagai Draft/Selesai)
    (Verifikasi Hasil Ujian) <-- Admin
```

**Activity Diagram:**
```mermaid
stateDiagram-v2
    [*] --> DasborGuru
    DasborGuru --> MenuUjian
    MenuUjian --> PilihSantriUjian
    PilihSantriUjian --> PilihTemplateUjian: Misal 'Ujian Kenaikan Juz'
    PilihTemplateUjian --> MulaiUjianLive
    MulaiUjianLive --> InputNilaiKomponen1: Misal Kelancaran (0-100)
    InputNilaiKomponen1 --> InputNilaiKomponen2: Misal Tajwid (0-100)
    InputNilaiKomponen2 --> KalkulasiOtomatis: Sistem mengalikan dgn bobot
    KalkulasiOtomatis --> StatusSelesai
    StatusSelesai --> TungguVerifikasiAdmin
    TungguVerifikasiAdmin --> AdminSetuju: Nilai Terkunci & Sah
    AdminSetuju --> [*]
```

---

### D. Fitur Generate & Cetak Raport
**Penanggung Jawab (Aktor):** Guru/Admin, Orang Tua (Pembaca)

**Use Case:**
```mermaid
usecaseDiagram
    actor Admin
    actor Guru
    actor Ortu
    Admin --> (Buat Template Raport)
    Guru --> (Klik Generate Raport Kelas)
    Guru --> (Beri Catatan Akhir Wali Kelas)
    (Lihat & Download PDF Raport) <-- Ortu
```

**Activity Diagram:**
```mermaid
stateDiagram-v2
    [*] --> MenuRaport
    MenuRaport --> PilihPeriode: Tahun Ajaran & Semester
    PilihPeriode --> PilihHalaqah
    PilihHalaqah --> TombolGenerateSemua
    TombolGenerateSemua --> SistemMengumpulkanData: Tarik Ujian, Absensi, Hafalan
    SistemMengumpulkanData --> KalkulasiRanking: Bandingkan Total Nilai 1 Kelas
    KalkulasiRanking --> BuatDokumenPDF: Render ke Template
    BuatDokumenPDF --> TersimpanDiDB
    TersimpanDiDB --> OrtuDapatAkses
    OrtuDapatAkses --> [*]
```

---

### E. Fitur Target Hafalan & Pemantauan
**Penanggung Jawab (Aktor):** Guru, Santri

**Activity Diagram:**
```mermaid
stateDiagram-v2
    [*] --> FormTargetGuru
    FormTargetGuru --> TentukanTarget: "Selesai Juz 30"
    TentukanTarget --> SetDeadline: "31 Desember 2026"
    SetDeadline --> SimpanTarget
    
    SimpanTarget --> SantriMenyetorHafalan: Proses Harian Berjalan
    SantriMenyetorHafalan --> SistemCekTarget
    SistemCekTarget --> BandingkanData: (Hafalan Masuk vs Target)
    BandingkanData --> UpdateProgressGrafik: Misal "50% Tercapai"
    UpdateProgressGrafik --> SelesaiTarget?: Jika Ayat Tercapai = Target
    SelesaiTarget? --> Ya: Status berubah 'Selesai'
    SelesaiTarget? --> Tidak: Menunggu Setoran Berikutnya
    Ya --> [*]
```
