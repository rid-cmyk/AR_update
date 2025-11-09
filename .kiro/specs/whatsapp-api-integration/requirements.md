# Requirements Document

## Introduction

Sistem Manajemen Pondok Pesantren memerlukan integrasi WhatsApp Business API untuk mengirimkan notifikasi otomatis kepada santri, guru, orang tua, dan admin. Fitur ini akan meningkatkan komunikasi dan transparansi antara pihak pondok dengan stakeholder terkait melalui platform WhatsApp yang sudah familiar digunakan.

## Glossary

- **WhatsApp Business API**: Layanan API resmi dari WhatsApp untuk mengirim pesan bisnis secara terprogram
- **Notification System**: Sistem notifikasi internal aplikasi yang akan terintegrasi dengan WhatsApp
- **Message Template**: Template pesan yang telah disetujui WhatsApp untuk pengiriman notifikasi
- **Webhook**: Endpoint API yang menerima callback dari WhatsApp untuk status pengiriman dan pesan masuk
- **Message Queue**: Sistem antrian untuk mengelola pengiriman pesan secara asinkron
- **Rate Limiting**: Pembatasan jumlah pesan yang dapat dikirim dalam periode waktu tertentu
- **Conversation Window**: Jendela waktu 24 jam untuk mengirim pesan follow-up tanpa template
- **Message Status**: Status pengiriman pesan (sent, delivered, read, failed)
- **Broadcast Message**: Pesan yang dikirim ke banyak penerima sekaligus
- **Interactive Message**: Pesan dengan tombol atau list pilihan untuk interaksi pengguna

## Requirements

### Requirement 1

**User Story:** Sebagai Super Admin, saya ingin mengkonfigurasi koneksi WhatsApp Business API, sehingga sistem dapat mengirim notifikasi melalui WhatsApp.

#### Acceptance Criteria

1. WHEN Super Admin mengakses halaman pengaturan WhatsApp, THE System SHALL menampilkan form konfigurasi API credentials (API Key, Phone Number ID, Business Account ID)
2. WHEN Super Admin menyimpan konfigurasi API, THE System SHALL memvalidasi credentials dengan melakukan test connection ke WhatsApp API
3. IF test connection gagal, THEN THE System SHALL menampilkan pesan error yang spesifik dan mencatat log kegagalan
4. WHEN konfigurasi berhasil disimpan, THE System SHALL mengenkripsi API credentials sebelum menyimpan ke database
5. THE System SHALL menyimpan status koneksi WhatsApp (connected, disconnected, error) dan timestamp terakhir verifikasi

### Requirement 2

**User Story:** Sebagai Super Admin, saya ingin membuat dan mengelola template pesan WhatsApp, sehingga notifikasi dapat dikirim sesuai dengan format yang telah disetujui WhatsApp.

#### Acceptance Criteria

1. WHEN Super Admin membuat template pesan baru, THE System SHALL menyediakan form dengan field nama template, kategori, bahasa, header, body, footer, dan buttons
2. THE System SHALL memvalidasi format template sesuai dengan aturan WhatsApp (maksimal 1024 karakter untuk body, variabel menggunakan format {{1}}, {{2}}, dst)
3. WHEN template disimpan, THE System SHALL menyimpan status template (draft, pending_approval, approved, rejected) dan sync dengan WhatsApp API
4. THE System SHALL menampilkan daftar template dengan filter berdasarkan status dan kategori
5. WHEN template disetujui oleh WhatsApp, THE System SHALL memperbarui status template menjadi approved dan mengaktifkan template untuk penggunaan

### Requirement 3

**User Story:** Sebagai Sistem, saya ingin mengirim notifikasi lupa passcode melalui WhatsApp secara otomatis, sehingga pengguna dapat menerima kode reset dengan cepat.

#### Acceptance Criteria

1. WHEN pengguna terdaftar mengajukan permintaan reset passcode, THE System SHALL mengirim pesan WhatsApp menggunakan template approved dengan variabel nama, tanggal, dan passcode
2. WHEN pengguna tidak terdaftar mengajukan permintaan, THE System SHALL mengirim pesan WhatsApp menggunakan template untuk pengguna tidak terdaftar
3. THE System SHALL mencatat setiap pengiriman pesan ke tabel message log dengan informasi recipient, template, status, dan timestamp
4. IF pengiriman gagal, THEN THE System SHALL melakukan retry maksimal 3 kali dengan exponential backoff (5 detik, 15 detik, 45 detik)
5. THE System SHALL memperbarui status notifikasi di database berdasarkan webhook callback dari WhatsApp (sent, delivered, read, failed)

### Requirement 4

**User Story:** Sebagai Admin Yayasan, saya ingin mengirim pengumuman broadcast ke grup target audience melalui WhatsApp, sehingga informasi penting dapat tersebar dengan cepat.

#### Acceptance Criteria

1. WHEN Admin membuat pengumuman dengan target audience tertentu, THE System SHALL menyediakan opsi untuk mengirim via WhatsApp
2. THE System SHALL mengambil nomor WhatsApp dari field noTlp pengguna berdasarkan target audience yang dipilih
3. WHEN Admin mengaktifkan pengiriman WhatsApp, THE System SHALL menambahkan pesan ke message queue untuk diproses secara asinkron
4. THE System SHALL membatasi pengiriman broadcast maksimal 100 pesan per batch dengan delay 2 detik antar pesan untuk menghindari rate limiting
5. THE System SHALL menampilkan progress pengiriman broadcast dengan statistik jumlah terkirim, gagal, dan pending

### Requirement 5

**User Story:** Sebagai Orang Tua Santri, saya ingin menerima notifikasi WhatsApp tentang hafalan anak saya, sehingga saya dapat memantau perkembangan hafalan secara real-time.

#### Acceptance Criteria

1. WHEN Guru mencatat hafalan santri dengan status ziyadah atau murojaah, THE System SHALL mengirim notifikasi WhatsApp ke nomor orang tua yang terdaftar di tabel OrangTuaSantri
2. THE System SHALL menggunakan template approved dengan variabel nama santri, tanggal, surat, ayat, dan status hafalan
3. IF orang tua memiliki lebih dari satu anak, THE System SHALL mengirim notifikasi terpisah untuk setiap anak
4. THE System SHALL mengirim notifikasi hanya jika field noTlp orang tua terisi dan valid (format E.164)
5. WHEN target hafalan santri tercapai, THE System SHALL mengirim notifikasi pencapaian target ke orang tua dengan template khusus

### Requirement 6

**User Story:** Sebagai Guru, saya ingin menerima notifikasi WhatsApp tentang jadwal mengajar dan absensi, sehingga saya tidak melewatkan jadwal halaqah.

#### Acceptance Criteria

1. WHEN jadwal halaqah akan dimulai dalam 30 menit, THE System SHALL mengirim reminder WhatsApp ke guru yang bertanggung jawab
2. THE System SHALL menggunakan template reminder dengan variabel nama halaqah, waktu mulai, dan lokasi
3. WHEN santri melakukan absensi dengan status alpha atau izin, THE System SHALL mengirim notifikasi ke guru halaqah terkait
4. THE System SHALL mengirim summary absensi harian ke guru setiap akhir hari pada pukul 18:00 WIB
5. IF guru memiliki permission untuk multiple halaqah, THE System SHALL mengirim notifikasi terpisah untuk setiap halaqah

### Requirement 7

**User Story:** Sebagai Santri, saya ingin menerima notifikasi WhatsApp tentang nilai ujian dan raport, sehingga saya dapat mengetahui hasil evaluasi saya.

#### Acceptance Criteria

1. WHEN nilai ujian santri diverifikasi oleh guru, THE System SHALL mengirim notifikasi WhatsApp ke santri dengan informasi jenis ujian, nilai akhir, dan catatan guru
2. WHEN raport santri di-generate, THE System SHALL mengirim notifikasi WhatsApp dengan link download PDF raport
3. THE System SHALL menggunakan template approved dengan variabel nama santri, semester, tahun akademik, dan nilai rata-rata
4. IF santri mendapat prestasi baru yang validated, THE System SHALL mengirim notifikasi selamat ke santri dan orang tua
5. THE System SHALL mengirim notifikasi hanya ke santri yang memiliki nomor WhatsApp terdaftar di field noTlp

### Requirement 8

**User Story:** Sebagai Super Admin, saya ingin melihat log dan statistik pengiriman WhatsApp, sehingga saya dapat memonitor performa dan biaya penggunaan API.

#### Acceptance Criteria

1. THE System SHALL mencatat setiap pengiriman pesan ke tabel WhatsAppMessageLog dengan field recipient, template, status, cost, dan timestamp
2. WHEN Super Admin mengakses dashboard WhatsApp, THE System SHALL menampilkan statistik harian, mingguan, dan bulanan (total pesan, success rate, failed rate, total cost)
3. THE System SHALL menghitung estimasi biaya berdasarkan conversation type (service, marketing) dengan rate per conversation
4. THE System SHALL menampilkan grafik trend pengiriman pesan per kategori (forgot passcode, hafalan, pengumuman, ujian, absensi)
5. THE System SHALL menyediakan filter dan export data log ke format CSV untuk analisis lebih lanjut

### Requirement 9

**User Story:** Sebagai Sistem, saya ingin menangani webhook callback dari WhatsApp, sehingga status pengiriman pesan dapat diperbarui secara real-time.

#### Acceptance Criteria

1. WHEN WhatsApp mengirim webhook callback, THE System SHALL memverifikasi signature request untuk memastikan authenticity
2. THE System SHALL memproses webhook event types (message status, incoming message) dan memperbarui database sesuai event type
3. WHEN status pesan berubah menjadi delivered atau read, THE System SHALL memperbarui field messageStatus dan timestamp di tabel WhatsAppMessageLog
4. IF webhook callback gagal diproses, THEN THE System SHALL mencatat error ke audit log dan mengirim alert ke Super Admin
5. THE System SHALL merespons webhook dengan status 200 OK dalam waktu maksimal 5 detik untuk menghindari retry dari WhatsApp

### Requirement 10

**User Story:** Sebagai Super Admin, saya ingin mengatur rate limiting dan quota pengiriman pesan, sehingga biaya WhatsApp API dapat dikontrol.

#### Acceptance Criteria

1. WHEN Super Admin mengakses pengaturan quota, THE System SHALL menyediakan form untuk set daily limit, monthly limit, dan cost threshold
2. THE System SHALL menghitung total pesan terkirim per hari dan per bulan secara real-time
3. WHEN daily limit tercapai, THE System SHALL menghentikan pengiriman pesan baru dan mengirim alert ke Super Admin
4. WHEN cost threshold mencapai 80 persen, THE System SHALL mengirim warning notification ke Super Admin via email dan WhatsApp
5. THE System SHALL menyediakan opsi untuk bypass limit pada kategori pesan tertentu (contoh: forgot passcode, emergency announcement)

### Requirement 11

**User Story:** Sebagai Pengguna, saya ingin memvalidasi dan memformat nomor WhatsApp saya, sehingga notifikasi dapat diterima dengan benar.

#### Acceptance Criteria

1. WHEN pengguna memasukkan nomor telepon di form profile, THE System SHALL memvalidasi format nomor sesuai standar E.164 (contoh: +628123456789)
2. THE System SHALL menyediakan auto-format untuk nomor Indonesia (menambahkan +62 jika dimulai dengan 08)
3. IF nomor tidak valid, THEN THE System SHALL menampilkan pesan error dengan contoh format yang benar
4. THE System SHALL menyimpan nomor dalam format E.164 di database untuk konsistensi
5. WHEN nomor berhasil disimpan, THE System SHALL mengirim test message WhatsApp untuk verifikasi nomor aktif

### Requirement 12

**User Story:** Sebagai Developer, saya ingin sistem memiliki error handling dan retry mechanism yang robust, sehingga pengiriman pesan tidak gagal karena masalah sementara.

#### Acceptance Criteria

1. WHEN WhatsApp API mengembalikan error 429 (rate limit), THE System SHALL menunda pengiriman selama waktu yang ditentukan di Retry-After header
2. WHEN WhatsApp API mengembalikan error 5xx (server error), THE System SHALL melakukan retry dengan exponential backoff maksimal 3 kali
3. IF semua retry gagal, THEN THE System SHALL memindahkan pesan ke dead letter queue dan mengirim alert ke admin
4. THE System SHALL mencatat setiap error dengan detail error code, error message, dan request payload untuk debugging
5. WHEN koneksi ke WhatsApp API timeout (lebih dari 30 detik), THE System SHALL membatalkan request dan menandai pesan sebagai failed
