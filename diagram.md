# Diagram Sistem AR-Hafalan (Sistem Informasi Manajemen Hafalan Al-Quran)

Dokumen ini berisi **Class Diagram** dan **Activity Diagram** untuk seluruh fitur pada sistem
(Sistem Manajemen Hafalan Al-Quran: Next.js 15 App Router, Prisma/PostgreSQL, role-based).
Semua diagram menggunakan **Mermaid** dan dapat dirender pada GitHub, mermaid.live, atau VS Code (Mermaid plugin).

Daftar isi:
- [1. Class Diagram](#1-class-diagram)
  - [1.1 Master, Role & Organisasi](#11-master-role--organisasi)
  - [1.2 Akademik](#12-akademik)
  - [1.3 Ujian](#13-ujian)
  - [1.4 Raport & Kelulusan](#14-raport--kelulusan)
  - [1.5 Sistem (Notifikasi, Pengumuman, Audit)](#15-sistem-notifikasi-pengumuman-audit)
- [2. Activity Diagram](#2-activity-diagram)
  - [2.1 Autentikasi & Keamanan](#21-autentikasi--keamanan)
  - [2.2 Super Admin](#22-super-admin)
  - [2.3 Admin](#23-admin)
  - [2.4 Guru](#24-guru)
  - [2.5 Santri](#25-santri)
  - [2.6 Orang Tua](#26-orang-tua)
  - [2.7 Yayasan](#27-yayasan)
  - [2.8 Layanan Otomatis (Cron & WhatsApp)](#28-layanan-otomatis-cron--whatsapp)
- [3. Sequence Diagram](#3-sequence-diagram)
  - [3.1 Login & RBAC](#31-login--rbac)
  - [3.2 Lupa Passcode](#32-lupa-passcode)
  - [3.3 Kelola Pengguna (Super Admin)](#33-kelola-pengguna-super-admin)
  - [3.4 Template Ujian & Komponen (Admin)](#34-template-ujian--komponen-admin)
  - [3.5 Input Absensi (Guru)](#35-input-absensi-guru)
  - [3.6 Setoran Hafalan (Guru)](#36-setoran-hafalan-guru)
  - [3.7 Target Hafalan (Guru)](#37-target-hafalan-guru)
  - [3.8 Ujian & Remedial (Guru ↔ Admin)](#38-ujian--remedial-guru--admin)
  - [3.9 Generate & Cetak Raport](#39-generate--cetak-raport)
  - [3.10 Pengumuman Broadcast](#310-pengumuman-broadcast)
  - [3.11 Monitoring Multi-Anak (Ortu)](#311-monitoring-multi-anak-ortu)
  - [3.12 Cron Rekap Absensi WA](#312-cron-rekap-absensi-wa)
- [4. Lampiran: Pemetaan Fitur ke Kode](#4-lampiran-pemetaan-fitur-ke-kode)

---

# 1. Class Diagram

Class diagram berikut memetakan 24 model pada `prisma/schema.prisma` ke dalam konsep kelas
diagram UML (atribut + hubungan). Nama field mengikuti skema Prisma.

## 1.1 Master, Role & Organisasi

Mencakup: `User`, `Role`, `Guru`, `Santri`, `OrangTua`, `TahunAjaran`, `Semester`, `Halaqah`.
`HalaqahSantri` (pivot), `GuruPermission`, `JenisUjian`, `Surah`.

```mermaid
classDiagram
    class User {
        +Int id
        +String username
        +String password
        +String namaLengkap
        +String foto
        +String noTlp
        +String passCode
        +Int roleId
        +String email
        +String jenisKelamin
        +String alamat
        +DateTime createdAt
        +DateTime updatedAt
        +login()
        +logout()
    }

    class Role {
        +Int id
        +String name
    }

    class Guru {
        +Int id
        +Int userId
        +String nip
        +String tugasTambahan
    }

    class Santri {
        +Int id
        +Int userId
        +String nis
        +String tempatLahir
        +DateTime tanggalLahir
        +Int angkatan
        +StatusSantri status
    }

    class OrangTua {
        +Int id
        +Int userId
        +String pekerjaan
    }

    class TahunAjaran {
        +Int id
        +Int tahunMulai
        +Int tahunSelesai
        +String namaLengkap
        +DateTime tanggalMulai
        +DateTime tanggalSelesai
        +Boolean isActive
        +createdBy
    }

    class Semester {
        +Int id
        +Int tahunAjaranId
        +String namaSemester
        +Int semesterUrutan
        +Boolean isActive
        +DateTime tanggalMulai
        +DateTime tanggalSelesai
    }

    class Halaqah {
        +Int id
        +String namaHalaqah
        +String deskripsi
        +Int guruId
        +Int semesterId
    }

    class HalaqahSantri {
        +Int id
        +Int halaqahId
        +Int santriId
        +Int tahunAjaranId
        +Int semesterId
        +String status
    }

    class GuruPermission {
        +Int id
        +Int guruId
        +Int halaqahId
        +Boolean canAbsensi
        +Boolean canHafalan
        +Boolean canTarget
        +Boolean isActive
    }

    class JenisUjian {
        +Int id
        +String nama
        +String kode
        +String deskripsi
    }

    class Surah {
        +Int id
        +Int nomor
        +String namaArab
        +String namaLatin
        +Int jumlahAyat
        +Int urutan
    }

    Role "1" --> "0..*" User : memiliki
    User "1" --> "0..1" Guru : _guru
    User "1" --> "0..1" Santri : _santri
    User "1" --> "0..1" OrangTua : _orangtua
    TahunAjaran "1" --> "0..*" Semester : berisi
    Semester "1" --> "0..*" Halaqah : menaungi
    Halaqah "1" --> "0..*" HalaqahSantri : terdaftar
    Halaqah "1" --> "0..*" GuruPermission : diizinkan
    User "1" --> "0..*" GuruPermission : sebagai guru
    User "0..*" --> "0..*" Surah : via Hafalan
```

## 1.2 Akademik

Mencakup: `Jadwal`, `Absensi`, `Hafalan`, `TargetHafalan`, `Prestasi`, `Surah`.

```mermaid
classDiagram
    class Jadwal {
        +Int id
        +Hari hari
        +DateTime jamMulai
        +DateTime jamSelesai
        +Int halaqahId
        +Int semesterId
        +Boolean isActive
        +Boolean isTemplate
        +DateTime tanggalMulai
        +DateTime tanggalSelesai
    }

    class Absensi {
        +Int id
        +StatusAbsensi status
        +DateTime tanggal
        +Int santriId
        +Int jadwalId
        +Int semesterId
        +String keterangan
    }

    class Hafalan {
        +Int id
        +DateTime tanggal
        +String surat
        +Int surahId
        +Int semesterId
        +Int ayatMulai
        +Int ayatSelesai
        +StatusHafalan status
        +String keterangan
        +Int santriId
        +validateAyat()
    }

    class TargetHafalan {
        +Int id
        +String surat
        +Int surahId
        +Int semesterId
        +Int ayatTarget
        +DateTime deadline
        +StatusTarget status
        +Int santriId
        +String hubungan
    }

    class Prestasi {
        +Int id
        +String namaPrestasi
        +String keterangan
        +String kategori
        +String tingkat
        +Int tahun
        +Int santriId
        +Int semesterId
        +Boolean validated
    }

    class Surah {
        +Int id
        +Int nomor
        +String namaArab
        +String namaLatin
        +Int jumlahAyat
    }

    Halaqah "1" --> "0..*" Jadwal : dijadwalkan
    Jadwal "1" --> "0..*" Absensi : diisi
    User "1" --> "0..*" Absensi : milik santri
    Surah "1" --> "0..*" Hafalan : direferensikan
    User "1" --> "0..*" Hafalan : milik santri
    Surah "1" --> "0..*" TargetHafalan : direferensikan
    User "1" --> "0..*" TargetHafalan : milik santri
    User "1" --> "0..*" Prestasi : milik santri
```

## 1.3 Ujian

Mencakup: `TemplateUjian`, `JenisUjian`, `KomponenPenilaian`, `UjianSantri` beserta enum dan
evaluasi per-juz.

```mermaid
classDiagram
    class TemplateUjian {
        +Int id
        +String namaTemplate
        +JenisUjianTemplate jenisUjian
        +String deskripsi
        +StatusTemplate status
        +Int tahunAjaranId
        +Int semesterId
        +Int createdBy
    }

    class KomponenPenilaian {
        +Int id
        +Int templateUjianId
        +Int jenisUjianId
        +String namaKomponen
        +Float bobotNilai
        +Float nilaiMaksimal
        +Float nilaiMinimal
        +Int urutan
        +Boolean isActive
    }

    class UjianSantri {
        +Int id
        +Int santriId
        +Int templateUjianId
        +Int tahunAjaranId
        +Int semesterId
        +DateTime tanggalUjian
        +Float nilaiAkhir
        +StatusUjian statusUjian
        +String catatanGuru
        +Int diverifikasiBy
        +DateTime tanggalVerifikasi
        +Int guruId
        +String jenisUjianLabel
        +Json nilaiDetail
        +Json pengaturan
        +Int juzDari
        +Int juzSampai
        +hitungNilaiPerJuz()
        +evaluasiKKM()
        +tentukanPredikat()
    }

    class JenisUjianTemplate {
        <<enumeration>>
        tasmi
        mhq
        uas
        kenaikan_juz
        ujian_harian
        ujian_tengah_semester
        tahfidz
    }

    class StatusUjian {
        <<enumeration>>
        draft
        selesai
        diverifikasi
        ditolak
    }

    class StatusTemplate {
        <<enumeration>>
        aktif
        nonaktif
        draft
    }

    class StatusHafalan {
        <<enumeration>>
        ziyadah
        murojaah
    }

    class StatusTarget {
        <<enumeration>>
        belum
        proses
        selesai
    }

    JenisUjianTemplate --> TemplateUjian : jenis
    TemplateUjian "1" --> "0..*" KomponenPenilaian : memiliki
    JenisUjian "1" --> "0..*" KomponenPenilaian : default komponen
    TemplateUjian "1" --> "0..*" UjianSantri : digunakan
    UjianSantri "1" --> "1" User : santri yang diuji
    UjianSantri "1" --> "1" User : guru penguji
    UjianSantri "1" --> "1" User : verifikator
    StatusUjian <-- UjianSantri : status
```

> **Keterangan hasil per-juz:** `nilaiPerJuz`, `juzRemedialList`, dan `predikatAkhir` dihitung
> oleh fungsi `calculateNilaiPerJuz` (lihat DTO `PerJuzEvaluation` pada 1.4).

> **Nilai per-juz** (lihat `lib/utils/hafalanAssessment.ts`):
> - `nilaiDetail` disimpan sebagai JSON berisi nilai tiap komponen per juz
>   (contoh key `juz-30-p1-kelancaran`).
> - `pengaturan` berisi `nilaiPerJuz`, `juzRemedialList`, `kkm`, `statusKelulusan`,
>   `rekomendasiRemedial`, `predikatAkhir`.

## 1.4 Raport & Kelulusan

Mencakup: `TemplateUjianRaport`, `RaportSantri` berikut struktur hasil evaluasi KKM per-juz.

```mermaid
classDiagram
    class TemplateRaport {
        +Int id
        +String namaTemplate
        +String namaLembaga
        +String logoLembaga
        +String alamatLembaga
        +String headerKop
        +String footerKop
        +String tandaTanganKepala
        +String namaKepala
        +String jabatanKepala
        +Json formatTabel
        +Boolean tampilanGrafik
        +Boolean tampilanRanking
        +StatusTemplate status
        +Int tahunAjaranId
        +Int semesterId
    }

    class RaportSantri {
        +Int id
        +Int santriId
        +Int templateRaportId
        +Int tahunAjaranId
        +Int semesterId
        +Float nilaiRataRata
        +Float totalNilaiAkhir
        +Int ranking
        +String statusKelulusan
        +String catatanGuru
        +Json grafikData
        +String pathFilePDF
        +DateTime tanggalGenerate
        +generate()
        +hitungRataRata()
        +hitungRanking()
    }

    class PerJuzEvaluation {
        <<DTO>>
        +Record~number, JuzEvaluation~ nilaiPerJuz
        +Int[] juzRemedialList
        +Boolean isAllJuzLulus
        +number nilaiAkhirGabungan
        +String predikatAkhir
        +evaluate()
    }

    class JuzEvaluation {
        <<DTO>>
        +number nilai
        +String status
        +number KKM
        +String predikat
        +Boolean isRemedial
    }

    class UjianSantri {
        <<Domain>>
        +nilaiDetail
        +pengaturan
        +jenisUjianLabel
    }

    UjianSantri --> RaportSantri : data sumber
    RaportSantri "1" --> "1" PerJuzEvaluation : dihitung
    PerJuzEvaluation "1" o-- "0..30" JuzEvaluation
    RaportSantri "1" --> "1" TemplateRaport : memakai template
    TahunAjaran "1" --> "0..*" RaportSantri : per tahun
```

## 1.5 Sistem (Notifikasi, Pengumuman, Audit)

Mencakup: `Pengumuman`, `PengumumanRead`, `Notifikasi`, `NotifikasiPenerima`,
`TargetNotifikasi`, `OrangTuaSantri`, `AuditLog`, `ForgotPasscode`, `SystemSetting`.

```mermaid
classDiagram
    class Pengumuman {
        +Int id
        +String judul
        +String isi
        +DateTime tanggal
        +DateTime tanggalKadaluarsa
        +TargetAudience targetAudience
        +Int createdBy
    }

    class PengumumanRead {
        +Int id
        +Int pengumumanId
        +Int userId
        +DateTime dibacaPada
    }

    class Notifikasi {
        +Int id
        +String judul
        +String isi
        +String pesan
        +String kategori
        +String channel
        +String prioritas
        +NotifType type
        +Int refId
        +Boolean isRead
        +DateTime readAt
        +Int userId
        +Int createdBy
    }

    class NotifikasiPenerima {
        +Int id
        +Int notifikasiId
        +Int userId
        +Boolean isRead
        +DateTime readAt
    }

    class TargetNotifikasi {
        +Int id
        +Int notifikasiId
        +String role
        +Int angkatan
        +Int halaqahId
    }

    class OrangTuaSantri {
        +Int id
        +Int orangTuaId
        +Int santriId
        +String hubungan
    }

    class AuditLog {
        +Int id
        +String action
        +String keterangan
        +DateTime tanggal
        +Int userId
        +String ipAddress
        +String userAgent
        +String module
    }

    class ForgotPasscode {
        +Int id
        +String phoneNumber
        +String message
        +Boolean isRead
        +Boolean isRegistered
        +Int userId
    }

    class SystemSetting {
        +String id
        +Json data
    }

    class NotifType {
        <<enumeration>>
        user
        hafalan
        rapot
        absensi
        pengumuman
    }

    class TargetAudience {
        <<enumeration>>
        semua
        guru
        santri
        admin
        ortu
        yayasan
        super_admin
    }

    Pengumuman "1" --> "0..*" PengumumanRead : dibaca
    User "1" --> "0..*" PengumumanRead
    Notifikasi "1" --> "0..*" NotifikasiPenerima : diteruskan
    Notifikasi "1" --> "0..*" TargetNotifikasi : sasaran
    Role "--" TargetNotifikasi : peran
    Halaqah "--" TargetNotifikasi : halaqah
    User "1" --> "0..*" OrangTuaSantri : sebagai ortu
    User "1" --> "0..*" OrangTuaSantri : sebagai anak
    User "1" --> "0..*" AuditLog : mencatat
    User "0..1" --> "0..*" ForgotPasscode : meminta reset
    SystemSetting : menyimpan KKM default & konfig WA
```

---

# 2. Activity Diagram

Alur aktivitas memakai notasi `flowchart` Mermaid.
Aktor: **Pengunjung**, **Siswa**, **Guru**, **Admin**, **Super Admin**, **Orang Tua**, **Yayasan**, **Sistem (cron)**.

## 2.1 Autentikasi & Keamanan

### 2.1.1 Login Passcode / Username

```mermaid
flowchart TD
    A([Mulai]) --> B{Tersedia klik login}
    B --> C[Input passcode ATAU username + password]
    C --> D[POST /api/login]
    D --> E{Cek rate limit middleware<br/>5 percobaan/menit}
    E -- Gagal --> F[Tolak: 429 Terlalu Banyak]
    E -- OK --> G{Cari user di database}
    G -- Tidak ditemukan --> H[Gagal: Passcode tidak terdaftar]
    G -- Ditemukan --> I[Buat JWT via signToken]
    I --> J[Set cookie http-only auth_token]
    J --> K[Log AuditLog LOGIN]
    K --> L{Tentukan arah peran user}
    L --> M[Redirect ke dashboard sesuai role]
    M --> N([Selesai])
```

### 2.1.2 Verify Token & RBAC (middleware)

```mermaid
flowchart TD
    A([Request masuk]) --> B{Path /login atau /api/public?}
    B -- Ya --> C[Lanjutkan tanpa token]
    B -- Tidak --> D{Ada cookie auth_token?}
    D -- Tidak --> E[Redirect /login atau 401 API]
    D -- Ya --> F[Verifikasi signature JWT WebCrypto]
    F -- Tidak valid --> G[Kosongkan cookie, redirect /login]
    F -- Valid --> H[Peroleh role dari JWT]
    H -- Tidak dikenal --> I[Redirect /login]
    H -- Dikenal --> J{Sesuai izin route?}
    J -- Tidak --> K[403 API / redirect /unauthorized]
    J -- Ya --> L[Set header x-user-id/role/is-mobile]
    L --> M([Lanjut ke handler])
```

### 2.1.3 Lupa Passcode (alur OOP: publik + super admin)

```mermaid
flowchart TD
    A([Pengguna buka /forgot-passcode]) --> B[Isi noTelp + alasan]
    B --> C[POST /api/forgot-passcode/request]
    C --> D{Cek nomor terdaftar?}
    D -- Tidak terdaftar --> E[Simpan ForgotPasscode isRegistered=false]
    E --> F[Balasan: hubungi admin]
    D -- Terdaftar --> G[Simpan ForgotPasscode isRegistered=true + userId]
    G --> H[Buat notifikasi ke super admin]
    H --> I[Balasan: permintaan diterima]
    F --> J([Akhir pengguna])
    I --> J
    J --> K[Super admin buka inbox super-admin/notifications]
    K --> L{Proses permintaan}
    L -- Setujui --> M[Generate passCode baru]
    M --> N[Kirim WA passCode baru ke user]
    M --> O[Update passCode user + tandai isRead]
    L -- Tolak --> P[Tandai isRead atau tambah komentar balasan]
    O --> Q([Selesai])
    P --> Q
```

## 2.2 Super Admin

### 2.2.1 Kelola Pengguna

```mermaid
flowchart TD
    A([Mulai]) --> B[super-admin/users]
    B --> C{Pilih aksi}
    C -- Tambah --> D[Form: username, nama, role, noTlp, foto]
    D --> E[Validasi Zod + cek duplikat username]
    E -- Gagal --> F[Tampilkan error]
    E -- OK --> G[POST /api/users]
    G --> H[Hash password + simpan + AuditLog]
    C -- Edit --> I[PATCH /api/users/id]
    I --> J[Hapus data field]
    J --> H
    C -- Hapus --> K[DELETE /api/users/id]
    K --> L[Konfirmasi & cascade referensi]
    C -- Reset passcode --> M[POST /api/users/id/passcode]
    M --> N[Buat passCode baru + konfirmasi]
    N --> O([Selesai])
    L --> O
```

### 2.2.2 Backup & Manajemen Database

```mermaid
flowchart TD
    A([Mulai]) --> B[super-admin/backup-database]
    B --> C{Backup otomatis?}
    C -- Ya --> D[Cron pg_dump harian]
    D --> E[Simpan ke tempat penyimpanan + riwayat]
    C -- Manual --> F[POST /api/admin/backup]
    F --> E
    E --> G[Riwayat backup via /api/database/backup-history]
    G --> H[Pilih: unduh / hapus / pulihkan backup]
    H --> I([Selesai])
```

### 2.2.3 Dashboard & Notifikasi Global

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka /super-admin/dashboard]
    B --> C[GET /api/analytics/global-reports + dashboard]
    C --> D[Tampilkan metrik sistem global]
    B --> E[Buka /super-admin/notifications]
    E --> F[Lihat notifikasi + inbox forgot-passcode]
    F --> G[Proses reset passcode (lihat 2.1.3)]
    D --> H([Selesai])
```

---

## 2.3 Admin

### 2.3.1 Kelola Tahun Akademik & Semester

```mermaid
flowchart TD
    A([Mulai]) --> B{Metode pembuatan?}
    B -- Auto generate --> C[Input rentang tahun]
    C --> D[GET template /api/admin/tahun-akademik/auto-generate]
    D --> E[Preview daftar TahunAjaran yg akan dibuat]
    E --> F[POST auto-generate batch]
    F --> G[Dek dalam transaksi buat TahunAjaran + Semester]
    B -- Manual --> H[POST /api/admin/tahun-akademik]
    H --> G
    G --> I{Set sebagai aktif?}
    I -- Ya --> J[Aktifkan ini, nonaktifkan TahunAjaran lain]
    I -- Tidak --> K[Simpan pasif]
    J --> L([Selesai])
    K --> L
```

### 2.3.2 Halaqah & Siapkan Santri

```mermaid
flowchart TD
    A([Mulai]) --> B[admin/halaqah]
    B --> C{Pilih aksi}
    C -- Buat --> D[Input nama, guru, semester]
    D --> E[POST /api/admin/halaqah]
    E --> F[Aktifkan satu guru pembimbing]
    C -- Atur santri --> G[Pilih halaqah]
    G --> H[Tampil santri belum ditempatkan via /api/admin/users/available]
    H --> I[POST HalaqahSantri untuk tahun ajaran aktif]
    C -- Edit/Hapus --> J[PUT/DELETE /api/admin/halaqah/id]
    I --> K([Selesai])
    J --> K
```

### 2.3.3 Guru Permission (cross-halaqah)

```mermaid
flowchart TD
    A([Mulai]) --> B[admin/guru-permissions]
    B --> C[Pilih guru & halaqah]
    C --> D[Centang hak: canAbsensi / canHafalan / canTarget]
    D --> E[POST /api/admin/guru-permissions]
    E --> F{Permission sudah ada untuk pasangan guru-halaqah?}
    F -- Ya --> G[UPDATE isActive + izin]
    F -- Tidak --> H[CREATE GuruPermission]
    G --> I[AuditLog]
    H --> I
    I --> K([Selesai])
```

### 2.3.4 Template Ujian & Komponen

```mermaid
flowchart TD
    A([Mulai]) --> B[admin/template-ujian]
    B --> C{Buat template baru?}
    C -- Ya --> D[Pilih JenisUjianTemplate]
    D --> E[POST /api/admin/template-ujian]
    E --> F[Pilih 'default komponen' sesuai jenis]
    F --> G[POST komponen/default -> isi KomponenPenilaian]
    D -- Tidak --> H[Edit komponen: nama, bobot, maksimum]
    H --> I[Simpan via /komponen & /komponen/id]
    G --> J[Toggle status aktif/nonaktif]
    I --> J
    J --> K([Selesai])
```

### 2.3.5 Jadwal Halaqah

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih halaqah + semester]
    B --> C[Input hari, jam mulai, jam selesai]
    C --> D[Tandai sebagai template?]
    D --> E[POST /api/jadwal]
    E --> F[Edit / toggle aktif / nonaktif]
    F --> G([Selesai])
```

### 2.3.6 Verifikasi Ujian (status juz bermasalah)

```mermaid
flowchart TD
    A([Mulai]) --> B[Notifikasi 'ujian menunggu verifikasi']
    B --> C[Buka daftar /api/admin/ujian]
    C --> D[Lihat detail hasil nilai per-juz]
    D --> E{Verifikasi diizinkan?}
    E -- Ya --> F[PATCH /api/admin/ujian/id/verify action=verify]
    F --> G[status=diverifikasi + tanggalVerifikasi + verifikator]
    G --> H[Notifikasi + WA ke guru 'ujian diverifikasi/ditolak']
    E -- Tidak --> I[PATCH verify action=reject + keterangan]
    I --> J[status=ditolak + catatan keterangan]
    J --> H
    H --> K([Selesai])
```

### 2.3.7 Generate & Cetak Raport

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih santri / template / tahun ajaran]
    B --> C[POST /api/admin/generate-raport]
    C --> D[Ambil semua UjianSantri thn tsb status selesai/diverifikasi]
    D --> E[Ambil nilai per-juz dari pengaturan.nilaiPerJuz]
    E --> F[Hitung nilai rata-rata + predikat]
    E --> G[Hitung ranking vs seluruh santri se-tahun]
    F --> H{Hasil >= KKM (default 70)?}
    H -- Ya --> I[statusKelulusan Lulus + predikat]
    H -- Tidak + ada override --> J[Tidak Lulus + predikat]
    H -- Tidak + tanpa override --> K[Perbaikan/Remedial Required]
    I --> L[Simpan / update RaportSantri + grafikData + rekapPerJuz]
    J --> L
    K --> L
    L --> M[Download/print PDF / batch]
    M --> N([Selesai])
```

### 2.3.8 Pengumuman & WA Broadcast

```mermaid
flowchart TD
    A([Mulai]) --> B[Input judul, isi, tanggal Kadaluarsa]
    B --> C[Pilih target: semua/guru/santri/ortu/yayasan]
    C --> D[POST /api/pengumuman atau admin-settings]
    D --> E[Simpan Pengumuman]
    E --> F{Pengaturan WA aktif?}
    F -- Ya --> G[Build daftar noTelp penerima]
    G --> H[notifyPengumuman kirim WA broadcast]
    F -- Tidak --> I[Tanpa WA]
    H --> J[notifikasi in-app ke semua target]
    I --> J
    J --> K([Selesai, dibaca ditandai via PengumumanRead])
```

---

## 2.4 Guru

### 2.4.1 Input Absensi

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka /guru/absensi]
    B --> C[Pilih tanggal + jadwal/halaqah]
    C --> D[GET /api/guru/absensi -> daftar santri]
    D --> E{Tanggal masa depan?}
    E -- Ya --> E2[Tolak "tidak dapat mengisi masa depan"]
    E2 --> M
    E -- Tidak --> F{Berada pada rentang waktu jadwal?}
    F -- Tidak --> F2[Tolak di luar rentang waktu]
    F2 --> M
    F -- Ya --> G[Pilih status tiap santri: masuk/izin/alpha]
    G --> H[POST /api/guru/absensi]
    H --> I{Cek apakah absensi sudah ada?}
    I -- Ya --> J[UPDATE]
    I -- Tidak --> K[CREATE]
    J --> L[Auditlog CREATE/UPDATE_ABSENSI]
    K --> L
    L --> M([Selesai, rekap WA malam via cron])
```

### 2.4.2 Input Setoran Hafalan (Ziyadah / Muroja'ah)

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih santri + mushaf digital]
    B --> C[Input surat, ayat mulai, ayat selesai]
    C --> D[Pilih status ziyadah / murojaah]
    D --> E{Validasi rentang ayat?}
    E -- Tidak valid --> E2(Tampilkan error validasi)
    E2 --> C
    E -- Valid --> F[POST /api/guru/hafalan]
    F --> G[Simpan Hafalan baru]
    G --> H[Notifikasi WA ke orang tua]
    H --> I([Selesai])
```

### 2.4.3 Manajemen Target Hafalan Santri

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih santri]
    B --> C[Input surat, ayatTarget, deadline]
    C --> D{Target surat ini sudah ada & belum selesai?}
    D -- Ya --> E[Tolak "target sudah ada"]
    E --> C
    D -- Tidak --> F[POST /api/guru/target]
    F --> G[Simpan TargetHafalan status=belum]
    G --> H[Notifikasi in-app ke santri]
    H --> I[Perbarui status: belum/proses/selesai oleh guru]
    I --> J{Status selesai?}
    J -- Ya --> K[notifyTarget WA ke orang tua]
    J -- Tidak --> L[Lewati WA]
    K --> M([Selesai])
    L --> M
```

### 2.4.4 Wizard Penilaian Ujian (multi-juz + mushaf)

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih jenis ujian: kenaikan_juz/mhq/tasmi/dll]
    B --> C[Set rentang juz dari-sampai (1..30)]
    C --> D[Pilih santri yang dinilai]
    D --> E{Bentuk UI}
    E -- Desktop --> F[[Split-screen: panel form 5 kolom + mushaf 7 kolom]]
    E -- Mobile --> G[[Persistent bottom-sheet 3 status + mushaf di latar]]
    F --> H[Input nilai per komponen per juz]
    G --> H
    H --> I[Server: calculateNilaiPerJuz]
    I --> J[Hasil: nilaiPerJuz + daftar juz di bawah KKM]
    J --> K{Ada juz di bawah KKM?}
    K -- Tidak --> L[status LULUS semua juz]
    K -- Ya --> M{Ada keinginan remedial?}
    M -- Ya --> N[Jadwalkan remedial per-juz (lihat 2.4.5)]
    M -- Tidak & override --> O[overrideRemedial=true + alasan]
    N --> P[Simpan UjianSantri + parameter di pengaturan]
    O --> P
    L --> P
    P --> Q[POST /api/guru/ujian lalu PATCH /id/submit]
    Q --> R{Sistem rekomendasi remedial tanpa override?}
    R -- Ya --> S[422: paksa keputusan remedial]
    S --> T[Pilih remedial atau konfirmasi tanpa remedial]
    R -- Tidak --> U[statusUjian=selesai]
    U --> V[Notifikasi & WA ke admin menunggu verifikasi]
    T --> W([Verifikasi oleh admin 2.3.6])
    V --> W
```

### 2.4.5 Remedial per Juz

```mermaid
flowchart TD
    A([Mulai]) --> B[Terdeteksi daftar juz di bawah KKM]
    B --> C[Guru pilih ujian dasar]
    C --> D[POST /api/guru/ujian/ID/remedial targetJuz]
    D --> E[Buat UjianSantri baru draft]
    E --> F[Set pengaturan.isRemedial=true + parentUjianId]
    F --> G[Nilai ulang juz bermasalah saja]
    G --> H[Submit ulang -> STATUSU selesai]
    H --> I([Menunggu verifikasi, join nilai utk performa])
```

### 2.4.6 Pencatatan Prestasi

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih santri + nama prestasi + tahun]
    B --> C[POST /api/guru/prestasi]
    C --> D[Simpan Prestasi validated=false]
    D --> E[notifikasi WA ke ortu]
    E --> F[Guru dapat edit / hapus]
    F --> G([Selesai, validasi opsional oleh admin])
```

### 2.4.7 Grafik, Laporan & Dashboard Guru

```mermaid
flowchart TD
    A([Mulai]) --> B{Pilih fungsi}
    B --> C[Grafik hafalan /api/guru/grafik/hafalan]
    B --> D[Top santri /api/guru/grafik/top-santri]
    B --> E[Laporan ujian /guru/laporan]
    C --> F[Render grafik jml ayat / tren setor]
    D --> F
    E --> G[Rangkuman nilai ujian santri]
    F --> H([Selesai])
    G --> H
```

---

## 2.5 Santri

### 2.5.1 Dashboard Santri

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka /santri/dashboard]
    B --> C[GET /api/dashboard/santri]
    C --> D[Statistik hafalan tersimpan + target aktif]
    D --> E[Info jadwal & absensi terbaru]
    E --> F([Selesai])
```

### 2.5.2 Melihat Progress, Target & Rekap Hafalan

```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih halaman target / rekap / progress-juz]
    B --> C{Pilih menu}
    C -- Target --> D[GET /api/santri/target]
    D --> E[Tampil daftar target + deadline]
    C -- Rekap --> F[GET /api/santri/hafalan/rekap]
    F --> G[Statistik setoran / muroja'ah]
    C -- Progress Juz --> H[GET /api/konversi/progress-juz]
    H --> I[Progres per-juz + status ujian]
    E --> J([Selesai])
    G --> J
    I --> J
```

### 2.5.3 Absensi, Jadwal & Raport Santri

```mermaid
flowchart TD
    A([Mulai]) --> B{Pilih menu}
    B -- Absensi --> C[GET /api/santri/absensi]
    C --> C2[Rekap status masuk/izin/alpha]
    B -- Jadwal --> D[GET /api/santri/jadwal]
    D --> D2[Tampil hari, jam, halaqah]
    B -- Raport --> E[GET /api/raport + detail per-juz]
    E --> E2[Download /api/admin/raport/id/print]
    C2 --> F([Selesai])
    D2 --> F
    E2 --> F
```

---

## 2.6 Orang Tua

### 2.6.1 Monitoring Multi-Anak

```mermaid
flowchart TD
    A([Mulai]) --> B[Ortu login]
    B --> C[GET /api/ortu/anak - daftar anak biasa multi-child]
    C --> D[Pilih anak]
    D --> E[GET hafalan-progress /api/ortu/hafalan-progress]
    D --> F[GET target /api/ortu/target]
    D --> G[GET absensi /api/ortu/absensi-summary]
    D --> H[GET raport anak]
    E --> J[Grafik perkembangan hafalan harian]
    F --> K[Tampil target + deadline]
    G --> L[Rekap hadir / izin / alpha]
    H --> M[Lihat raport anak + pdf]
    J --> N([Selesai])
    K --> N
    L --> N
    M --> N
```

### 2.6.2 Notifikasi & Pengumuman Ortu

```mermaid
flowchart TD
    A([Mulai]) --> B[Buka halaman pengumuman / notifikasi]
    B --> C[GET /api/ortu/pengumuman + notifikasi target]
    C --> D[Tandai dibaca]
    D --> E([Selesai])
```

---

## 2.7 Yayasan

### 2.7.1 Dashboard Eksekutif & Laporan Read-Only

```mermaid
flowchart TD
    A([Mulai]) --> B[Yayasan login]
    B --> C[GET /api/analytics/global + guru-dashboard]
    C --> D[Metrik: santri aktif, capaian target ujian, performa guru]
    B --> E{Pilih laporan}
    E --> F[Laporan halaqah]
    F --> G[Rekap kinerja per-halaqah]
    E --> H[Tren hafalan global]
    E --> I[Rangkuman ujian /api/analytics/ujian-reports]
    D --> J([Selesai])
    G --> J
    H --> J
    I --> J
```

### 2.7.2 Pemantauan Santri & Raport (Read-only)

```mermaid
flowchart TD
    A([Mulai]) --> B[/yayasan/santri]
    B --> C[List santri per halaqah/tahun]
    C --> D[Tampil detail & statistik santri]
    D --> E[Lihat raport santri]
    E --> F([Selesai])
```

---

## 2.8 Layanan Otomatis (Cron & WhatsApp)

### 2.8.1 Cron Absensi Recap Hari (setiap 18-23, sekali/hari)

```mermaid
flowchart TD
    A([Cron */30 18-23 * * *]) --> B[GET /api/cron/absensi-wa]
    B --> C{Setting absensi_wa_last_sent == hari ini?}
    C -- Sudah --> C2[Balas 200, skip]
    C -- Belum --> D[Hari ini & daftar Jadwal aktif]
    D --> E{Hari ini = hari jadwal?}
    E -- Tidak --> E2[Skip tanpa kirim]
    E -- Ya --> F{Jam sekarang >= jam terakhir jadwal?}
    F -- Belum --> F2[Skip, tunggu]
    F -- Ya --> G[Ambil seluruh Absensi hari ini]
    G --> H{Ada data absensi > 0?}
    H -- Tidak --> H2[Skip]
    H -- Ya --> I[Kumpulkan per jadwal/halaqah]
    I --> J[Bangun pesan rekap: Hadir + Alpha + Izin]
    J --> K[Kirim WA per santri ke ortu (5 paralel)]
    K --> L[Set SystemSetting absensi_wa_last_sent=today]
    L --> M([Selesai 1x per hari])
    C2 --> M
    E2 --> M
    F2 --> M
    H2 --> M
```

### 2.8.2 Notifikasi WhatsApp perivitas kejadian (real-time, fire-and-forget)

```mermaid
flowchart TD
    A([Peristiwa di sistem]) --> B{HubunganWA-aktif?}
    B -- Tidak --> X[Skip WA, lanjut alur utama]
    B -- Ya --> C{Siapkan pesan + penerima}
    C --> C2[Hafalan -> WA ortu]
    C --> C3[Target -> WA ortu]
    C --> C4[Ujian submit -> WA admin "menunggu verifikasi"]
    C --> C5[Ujian verified/ditindak -> WA guru]
    C --> C6[Prestasi -> WA ortu]
    C --> C7[Pengumuman -> broadcast target]
    C --> C8[Lupa passcode -> WA user]
    C2 --> D[Send WA .catch(console.error)]
    C3 --> D
    C4 --> D
    C5 --> D
    C6 --> D
    C7 --> D
    C8 --> D
    D --> E([Alur utama tetap berlanjut])
```

---

# 3. Sequence Diagram

Alur interaksi antar-**aktor** dan **sistem** untuk fitur utama, memakai notasi `sequenceDiagram` Mermaid.

## 3.1 Login & RBAC

```mermaid
sequenceDiagram
    actor P as Pengguna
    participant MW as Middleware (Edge)
    participant API as API login
    participant DB as Prisma DB

    P->>MW: request halaman
    MW->>MW: cek rate limit & cookie
    MW-->>P: redirect /login (tanpa token)
    P->>API: POST /api/login (passcode/username+password)
    API->>DB: verifikasi user
    DB-->>API: user atau null
    alt user tidak ditemukan
        API-->>P: 401 "Passcode tidak terdaftar"
    else valid
        API->>API: signToken() -> JWT
        API-->>P: Set-Cookie auth_token (httpOnly)
        API->>DB: tulis AuditLog "LOGIN"
        P->>MW: redirect ke dashboard role
        MW->>MW: verifikasi JWT + RBAC route
        MW-->>P: dashboard role/mobile
    end
```

## 3.2 Lupa Passcode

```mermaid
sequenceDiagram
    actor U as Pengguna
    participant F as API /forgot-passcode
    participant DB as Prisma DB
    participant SA as Super Admin
    participant WA as WhatsApp

    U->>F: POST {phoneNumber, message}
    F->>DB: cocokkan noTlp + simpan ForgotPasscode
    DB-->>F: isRegistered
    alt nomor terdaftar
        F-->>U: "Permintaan diterima"
    else tidak terdaftar
        F-->>U: "Hubungi admin"
    end
    SA->>DB: daftar permintaan belum dibaca
    SA->>DB: reset passCode + tandai isRead
    DB->>WA: kirim passCode baru ke user
    WA-->>U: passCode via WA
```

## 3.3 Kelola Pengguna (Super Admin)

```mermaid
sequenceDiagram
    actor A as Super Admin
    participant API as API users
    participant DB as DB
    participant LOG as AuditLog

    A->>API: tambah / edit / hapus / reset passcode
    API->>DB: validasi (Zod) + cek duplikat username
    API->>DB: create / update / delete User
    API->>DB: hash password (bcrypt)
    API->>LOG: catat aktivitas user
    API-->>A: daftar user terbaru
```

## 3.4 Template Ujian & Komponen (Admin)

```mermaid
sequenceDiagram
    actor A as Admin
    participant T as API template-ujian
    participant K as API komponen/id
    participant DB as DB

    A->>T: POST /api/admin/template-ujian {jenis, tahun}
    T->>DB: create TemplateUjian
    DB-->>T: id template
    A->>K: POST komponen/default {jenisUjian}
    K->>K: hapus komponen lama
    K->>DB: insert komponen default (bobot per komponen)
    DB-->>K: list komponen
    A->>K: PATCH bobot / urutan / isActive
    DB-->>A: sukses
```

## 3.5 Input Absensi (Guru)

```mermaid
sequenceDiagram
    actor G as Guru
    participant API as API guru/absensi
    participant DB as DB
    participant J as Jadwal/Halaq

    G->>API: GET (tanggal, jadwal)
    API->>J: daftar santri di halaqah guru
    J-->>API: santri list
    API-->>G: form absensi
    G->>API: POST {santriId, jadwalId, status}
    API->>API: validasi tanggal & rentang waktu
    alt absensi sudah ada
        API->>DB: UPDATE status
    else baru
        API->>DB: CREATE Absensi
    end
    API->>DB: AuditLog CREATE/UPDATE_ABSENSI
    API-->>G: simpan sukses
```

## 3.6 Setoran Hafalan (Guru)

```mermaid
sequenceDiagram
    actor G as Guru
    participant UI as wizard hafalan
    participant API as /api/guru/hafalan
    participant DB as DB
    participant WA as WhatsApp

    G->>UI: pilih santri + mushaf + rentang ayat
    G->>UI: tipe ziyadah / murojaah
    UI->>API: POST {santriId, surat, ayatMulai, ayatSelesai, status}
    API->>DB: validasi rentang ayat
    DB-->>API: ok / error
    alt ayat valid
        API->>DB: create Hafalan
        API->>WA: notifyHafalan (fire-and-forget)
        API-->>UI: sukses
    else invalid
        API-->>UI: error validasi
    end
```

## 3.7 Target Hafalan (Guru)

```mermaid
sequenceDiagram
    actor G as Guru
    participant T as API target
    participant DB as DB
    participant N as Notifikasi
    participant WA as WhatsApp

    G->>T: POST {santriId, surat, ayatTarget, deadline}
    T->>DB: cek target berjalan duplikat
    alt duplikat belum selesai
        T-->>G: 400 "target sudah ada"
    else valid
        T->>DB: create TargetHafalan (belum)
        T->>N: notifikasi untuk santri
        T->>WA: notifyTarget(created)
        T-->>G: sukses
    end
```

## 3.8 Ujian & Remedial (Guru ↔ Admin)

```mermaid
sequenceDiagram
    actor G as Guru
    participant W as Wizard ujian
    participant API as /api/guru/ujian
    participant H as hafalanAssessment.ts
    participant DB as DB
    actor A as Admin
    participant WA as WhatsApp

    G->>W: pilih jenis + rentang juz (1..30)
    G->>W: isi nilai per komponen per juz
    W->>API: POST {ujianResults, juzRange}
    API->>H: calculateNilaiPerJuz(nilaiDetail, juzRange)
    H-->>API: nilaiPerJuz + juzRemedialList + predikat
    API->>DB: create UjianSantri
    alt ada juz di bawah KKM
        API-->>G: rekomendasi remedial (422 keputusan)
        G->>API: POST /id/remedial {targetJuz}
        API->>DB: create ujian remedial (isRemedial=true)
        G->>API: PATCH /id/submit (overrideRemedial?)
        API->>DB: statusUjian=selesai
        API->>A: notifikasi + WA "menunggu verifikasi"
    else semua lulus
        G->>API: Submit -> status=selesai
        API->>A: notifikasi verifikasi
    end
    A->>API: PATCH /api/admin/ujian/id/verify
    API->>DB: status diverifikasi / ditolak
    API-->>WA: hasil ke guru via WA
```

## 3.9 Generate & Cetak Raport

```mermaid
sequenceDiagram
    actor P as Admin/Guru
    participant G as API generate-raport
    participant DB as DB
    participant F as File PDF

    P->>G: POST {santriId, templateRaportId, tahunAjaranId}
    G->>DB: ambil UjianSantri per tahun
    DB-->>G: daftar ujian + nilai per-juz
    G->>G: hitung rata2 + predikat + KKM + ranking
    alt raport sudah ada
        G->>DB: UPDATE RaportSantri
    else baru
        G->>DB: CREATE RaportSantri
    end
    G->>F: generatePDF / pathFilePDF
    DB-->>G: raportId
    P->>F: GET print / download
    F-->>P: hasil PDF
```

## 3.10 Pengumuman & Notifikasi

```mermaid
sequenceDiagram
    actor P as Admin/Guru/Yayasan
    participant API as /api/pengumuman
    participant DB as DB
    participant WA as WhatsApp
    participant R as Penerima (target)

    P->>API: POST {judul, isi, targetAudience}
    API->>DB: create Pengumuman
    API->>R: notifikasi in-app (Notifikasi)
    alt whatsApp enabled
        API->>WA: notifyPengumuman broadcast
        WA->>R: kirim WA singkat
    end
    R->>API: PATCH /id/read
    API->>DB: catat PengumumanRead
```

## 3.11 Monitoring Multi-Person (Ortu)

```mermaid
sequenceDiagram
    actor O as Orang Tua
    participant API as /api/ortu/*
    participant DB as DB

    O->>API: GET /api/ortu/anak
    API->>DB: daftar anak (OrangTuaSantri)
    DB-->>API: list anak
    API-->>O: pilih anak
    O->>API: GET hafalan-progress / absensi-summary / target / raport
    API->>DB: query per anak
    DB-->>API: rekap
    API-->>O: dashboard grafik anak
```

## 3.12 Cron Rekap Absensi WhatsApp

```mermaid
sequenceDiagram
    participant C as cron (vercel.json)
    participant API as /api/cron/absensi-wa
    participant DB as DB
    participant WA as WhatsApp
    participant R as Ortu penerima

    C->>API: GET setiap 30 menit (18-23)
    API->>DB: SystemSetting absensi_wa_last_sent
    alt sudah terkirim hari ini
        DB-->>API: skip
    else belum
        API->>DB: ambil jadwal aktif hari ini
        API->>DB: ambil absensi hari ini
        API->>DB: ambil noTlp ortu (relation)
        API->>WA: kirim rekap per santri (limit concurrency 5)
        WA-->>R: rekap hadir/alpha/izin
        API->>DB: simpan absensi_wa_last_sent=today
    end
```

---

# 4. Lampiran: Pemetaan Fitur ke File

| Fitur | Route/Halaman | Service/Fungsi |
|-------|---------------|----------------|
| Autentikasi & RBAC | `api/login`, `api/logout`, `middleware.ts` | `lib/auth.ts`, `lib/jwt.ts` |
| Lupa passcode | `api/forgot-passcode/request`, `api/auth/forgot-passcode`, `api/notifications/forgot-passcode/*` | `lib/services/whatsapp-notifier.ts` |
| CRUD pengguna | `api/admin/users`, `api/users/*`, `super-admin/users` | `lib/api-helpers.ts` |
| Tahun akademik | `api/admin/tahun-akademik/*` | `lib/tahun-akademik-utils.ts` |
| Halaqah & permission | `api/admin/halaqah`, `api/admin/guru-permissions` | `lib/auth.ts` |
| Template ujian | `api/admin/template-ujian/*`, `api/admin/mhq-kriteria` | — |
| Absensi | `api/guru/absensi`, `api/absensi` | `lib/services/absensi.ts` |
| Hafalan | `api/guru/hafalan`, `api/hafalan` | WA notifier |
| Target | `api/guru/target`, `api/target` | WA notifier |
| Wizard ujian & remedial | `api/guru/ujian`, `api/guru/ujian/*/submit`, `.../remedial`, `api/admin/ujian/*/verify` | `lib/utils/hafalanAssessment.ts` |
| Generate raport | `api/admin/generate-raport`, `api/admin/raport/*/print`, `.../download`, `api/admin/download-raport-batch` | `calculateNilaiPerJuz` |
| Pengumuman | `api/pengumuman`, `api/santri/pengumuman`, `api/yayasan/pengumuman` | WA notifier |
| Notifikasi in-app | `api/notifikasi`, `api/notifications/count` | — |
| Cron absensi WA | `api/cron/absensi-wa` | `sendAbsensiRecap` |
| Backup DB | `api/admin/backup`, `api/database/*` | — |
| Analytics Yayasan | `api/analytics/*`, `api/analytics/predictive` | `lib/services/predictiveAnalytics.ts` |
| Mushaf digital | `api/mushaf`, `api/quran/juz/{id}`, `api/quran/surat/{id}` | — |

---

> **Catatan**: 
> - Assessment KKM bersifat **per-juz** (fungsi `calculateNilaiPerJuz`), bukan berbasis hasil akhir;
>   hasil akhir menentukan **predikat kehormatan** (`Mumtaz/Jayyid Jiddan/Jayyid/Maqbul`).
> - Raport yang dihasilkan selalu menyertakan rincian penilaian tiap juz dan status kelulusan juz
>   (sesuai AGENTS.md).
> - Notifikasi WA hanya dikirim bila `whatsapp_enabled` + apiKey + sessionId terpenuhi, dengan
>   cache konfigurasi 5 menit.