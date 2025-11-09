# Implementation Plan

- [ ] 1. Setup database schema dan konfigurasi dasar
  - Tambahkan model WhatsApp ke Prisma schema (WhatsAppConfig, WhatsAppTemplate, WhatsAppMessage, WhatsAppQuota, WhatsAppWebhookLog)
  - Buat migration file untuk semua tabel baru
  - Jalankan migration dan verifikasi struktur database
  - Buat seed data untuk WhatsAppConfig dan WhatsAppQuota dengan nilai default
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [ ] 2. Implementasi utility functions dan helpers
  - Buat encryption/decryption utility untuk API key di `lib/utils/encryption.ts`
  - Buat phone number validator dan formatter untuk format E.164 di `lib/utils/phone-validator.ts`
  - Buat retry utility dengan exponential backoff di `lib/utils/retry.ts`
  - Buat cost calculator utility untuk menghitung biaya conversation di `lib/utils/cost-calculator.ts`
  - _Requirements: 1.4, 11.1, 11.2, 11.4, 12.1, 12.2, 8.3_

- [ ] 3. Setup Redis connection dan queue service
  - Install dependencies Redis (`ioredis`, `bull` atau `bullmq`)
  - Buat Redis client connection di `lib/database/redis.ts`
  - Implementasi QueueService di `lib/services/queue.service.ts` dengan methods enqueue, dequeue, enqueueBatch
  - Implementasi dead letter queue management
  - Buat unit test untuk queue operations
  - _Requirements: 4.3, 12.3_

- [ ] 4. Implementasi WhatsApp Service core
  - Buat WhatsAppService class di `lib/services/whatsapp.service.ts`
  - Implementasi method verifyConnection untuk test API connection
  - Implementasi method sendTemplateMessage untuk kirim pesan dengan template
  - Implementasi method sendTextMessage untuk kirim pesan text biasa
  - Implementasi error handling dan retry logic
  - Tambahkan logging untuk setiap API call
  - _Requirements: 1.2, 1.3, 3.1, 3.4, 12.1, 12.2, 12.4_

- [ ] 5. Implementasi Template Service
  - Buat TemplateService class di `lib/services/template.service.ts`
  - Implementasi CRUD operations untuk template (create, update, delete, findAll, findByName)
  - Implementasi method renderTemplate untuk replace variabel dengan nilai aktual
  - Implementasi method validateVariables untuk validasi variabel sebelum kirim
  - Implementasi method submitToWhatsApp untuk submit template ke WhatsApp API
  - Implementasi method syncStatus untuk sync status approval dari WhatsApp
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6. Buat API routes untuk WhatsApp configuration
  - Buat GET `/api/whatsapp/config` untuk ambil konfigurasi WhatsApp
  - Buat POST `/api/whatsapp/config` untuk simpan/update konfigurasi dengan enkripsi API key
  - Buat POST `/api/whatsapp/config/verify` untuk test connection ke WhatsApp API
  - Tambahkan authorization check (hanya Super Admin)
  - Tambahkan validation untuk required fields
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 7. Buat API routes untuk template management
  - Buat GET `/api/whatsapp/templates` untuk list semua template dengan filter
  - Buat POST `/api/whatsapp/templates` untuk create template baru
  - Buat PUT `/api/whatsapp/templates/[id]` untuk update template
  - Buat DELETE `/api/whatsapp/templates/[id]` untuk delete template
  - Buat POST `/api/whatsapp/templates/[id]/submit` untuk submit ke WhatsApp
  - Buat POST `/api/whatsapp/templates/[id]/sync` untuk sync status dari WhatsApp
  - Tambahkan authorization check (Super Admin dan Admin Yayasan)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 8. Implementasi webhook handler
  - Buat POST `/api/webhooks/whatsapp` untuk terima callback dari WhatsApp
  - Implementasi webhook signature verification
  - Implementasi handler untuk message status events (sent, delivered, read, failed)
  - Implementasi handler untuk incoming message events
  - Update status pesan di database berdasarkan webhook event
  - Log semua webhook events ke WhatsAppWebhookLog
  - Return 200 OK response dalam 5 detik
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 9. Implementasi notification trigger untuk forgot passcode
  - Update API route `/api/notifications/forgot-passcode` untuk trigger WhatsApp notification
  - Buat function `sendForgotPasscodeNotification` di `lib/services/notification-trigger.service.ts`
  - Implementasi logic untuk pilih template berdasarkan isRegistered (registered vs unregistered)
  - Map variabel template (tanggal, nama, passcode, nomor)
  - Queue message ke Redis untuk async processing
  - Update ForgotPasscode record dengan whatsapp message ID
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 10. Implementasi notification trigger untuk hafalan
  - Buat function `sendHafalanNotification` untuk notifikasi hafalan baru ke orang tua
  - Buat function `sendTargetAchievedNotification` untuk notifikasi target tercapai
  - Ambil nomor WhatsApp orang tua dari tabel OrangTuaSantri
  - Map variabel template (nama santri, tanggal, surat, ayat, status)
  - Queue message untuk setiap orang tua
  - Tambahkan trigger di API route create hafalan
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 11. Implementasi notification trigger untuk pengumuman broadcast
  - Update API route create pengumuman untuk support WhatsApp broadcast
  - Buat function `sendPengumumanBroadcast` di notification-trigger.service
  - Ambil daftar recipient berdasarkan targetAudience
  - Filter user yang memiliki nomor WhatsApp valid
  - Implementasi batch processing (100 pesan per batch dengan delay 2 detik)
  - Tampilkan progress pengiriman di UI
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 12. Implementasi notification trigger untuk ujian dan raport
  - Buat function `sendUjianVerifiedNotification` untuk notifikasi nilai ujian
  - Buat function `sendRaportGeneratedNotification` untuk notifikasi raport dengan link download
  - Map variabel template (nama santri, jenis ujian, nilai, semester, tahun akademik)
  - Queue message ke santri dan orang tua
  - Tambahkan trigger di API route verify ujian dan generate raport
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 13. Implementasi notification trigger untuk absensi dan jadwal
  - Buat function `sendAbsensiAlertNotification` untuk notifikasi absensi alpha/izin ke guru
  - Buat function `sendDailyAbsensiSummary` untuk summary absensi harian
  - Buat function `sendJadwalReminder` untuk reminder 30 menit sebelum jadwal
  - Setup cron job untuk daily summary (18:00 WIB) dan jadwal reminder (setiap 30 menit)
  - Map variabel template (nama halaqah, waktu, status absensi)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 14. Implementasi notification trigger untuk prestasi
  - Buat function `sendPrestasiNotification` untuk notifikasi prestasi validated
  - Kirim ke santri dan orang tua
  - Map variabel template (nama santri, nama prestasi, kategori, tahun)
  - Tambahkan trigger di API route validate prestasi
  - _Requirements: 7.4_

- [ ] 15. Implementasi quota management system
  - Buat QuotaService di `lib/services/quota.service.ts`
  - Implementasi method checkQuota untuk cek apakah masih dalam limit
  - Implementasi method incrementCount untuk increment daily/monthly count
  - Implementasi method calculateCost untuk hitung biaya berdasarkan conversation type
  - Implementasi method resetDailyQuota dan resetMonthlyQuota
  - Implementasi bypass logic untuk kategori tertentu (forgot passcode, emergency)
  - Setup cron job untuk reset daily quota setiap midnight
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 16. Buat background worker untuk process message queue
  - Buat worker script di `lib/workers/whatsapp-worker.ts`
  - Implementasi loop untuk dequeue dan process messages
  - Implementasi batch processing dengan delay antar batch
  - Implementasi retry logic untuk failed messages
  - Move message ke dead letter queue setelah max retry
  - Setup cron job atau long-running process untuk worker
  - _Requirements: 3.4, 4.4, 12.2, 12.3_

- [ ] 17. Implementasi message log dan statistics API
  - Buat GET `/api/whatsapp/messages` untuk list message log dengan filter
  - Buat GET `/api/whatsapp/statistics` untuk ambil statistik (daily, weekly, monthly)
  - Implementasi aggregation untuk success rate, failed rate, total cost
  - Implementasi grouping by notification type
  - Buat GET `/api/whatsapp/messages/[id]` untuk detail message
  - Tambahkan export to CSV functionality
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 18. Buat UI page untuk WhatsApp configuration
  - Buat page `/super-admin/whatsapp/config` untuk konfigurasi WhatsApp
  - Buat form untuk input API credentials (Phone Number ID, Business Account ID, API Key)
  - Tambahkan button "Test Connection" untuk verify credentials
  - Tampilkan status koneksi (connected, disconnected, error)
  - Tampilkan last verified timestamp
  - Tambahkan validation dan error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 19. Buat UI page untuk template management
  - Buat page `/super-admin/whatsapp/templates` untuk list template
  - Buat modal/form untuk create/edit template
  - Implementasi form fields (name, category, language, body, header, footer, buttons)
  - Tambahkan preview template dengan sample variables
  - Tambahkan button "Submit to WhatsApp" untuk template approval
  - Tampilkan status template (draft, pending_approval, approved, rejected)
  - Implementasi filter by status dan category
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 20. Buat UI page untuk message log dan monitoring
  - Buat page `/super-admin/whatsapp/messages` untuk list message log
  - Tampilkan table dengan kolom (recipient, template, status, cost, timestamp)
  - Implementasi filter by status, notification type, date range
  - Tambahkan detail modal untuk view message details
  - Implementasi export to CSV functionality
  - Tampilkan color coding untuk status (green=delivered, red=failed, yellow=pending)
  - _Requirements: 8.1, 8.5_

- [ ] 21. Buat UI dashboard untuk WhatsApp statistics
  - Buat page `/super-admin/whatsapp/dashboard` untuk monitoring
  - Tampilkan statistics cards (total messages, success rate, failed rate, total cost)
  - Buat chart untuk message trend (line chart)
  - Buat chart untuk messages by notification type (pie chart)
  - Buat chart untuk cost trend (line chart)
  - Tampilkan recent activity (last 10 messages)
  - Tampilkan current queue size dan dead letter queue size
  - Auto refresh setiap 30 detik
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 22. Buat UI untuk quota management
  - Buat section di `/super-admin/whatsapp/config` untuk quota settings
  - Buat form untuk set daily limit, monthly limit, cost threshold
  - Tampilkan current usage (daily count, monthly count, current cost)
  - Tampilkan progress bar untuk quota usage
  - Tampilkan alert jika mendekati limit (80%)
  - Buat multi-select untuk bypass categories
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 23. Implementasi alert system
  - Buat AlertService di `lib/services/alert.service.ts`
  - Implementasi method sendAlert untuk kirim alert ke Super Admin
  - Implementasi alert conditions (failure rate > 10%, queue size > 1000, cost > 80%)
  - Setup cron job untuk check alert conditions setiap 5 menit
  - Kirim alert via email dan WhatsApp
  - Log semua alerts ke database
  - _Requirements: 10.4_

- [ ] 24. Update existing notification pages untuk WhatsApp integration
  - Update page `/super-admin/notifications/forgot-passcode` untuk tampilkan WhatsApp status
  - Tambahkan kolom "WhatsApp Status" di table
  - Tambahkan button "Resend WhatsApp" untuk retry failed messages
  - Update detail modal untuk tampilkan WhatsApp message details
  - Tambahkan filter by WhatsApp status
  - _Requirements: 3.5_

- [ ] 25. Implementasi phone number validation di user profile
  - Update form profile user untuk validasi nomor WhatsApp
  - Implementasi auto-format untuk nomor Indonesia (08xxx → +628xxx)
  - Tampilkan error message jika format tidak valid dengan contoh format benar
  - Tambahkan button "Send Test Message" untuk verifikasi nomor aktif
  - Update API route untuk save nomor dalam format E.164
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 26. Setup environment variables dan configuration
  - Tambahkan environment variables ke `.env.example`
  - Dokumentasikan semua required environment variables
  - Buat validation untuk check required env vars saat startup
  - Setup encryption key generation script
  - Dokumentasikan cara setup WhatsApp Business Account
  - _Requirements: 1.1, 1.4_

- [ ] 27. Implementasi error handling dan logging
  - Buat centralized error handler untuk WhatsApp operations
  - Implementasi error logging ke database dan file
  - Implementasi error categorization (API error, business logic error, network error)
  - Tambahkan error details ke message log (error code, error message, request payload)
  - Implementasi PII masking di error logs
  - _Requirements: 12.4, 12.5_

- [ ]* 28. Write integration tests
  - Test WhatsApp API connection dan authentication
  - Test template creation dan sync dengan WhatsApp
  - Test message sending flow (queue → send → webhook callback)
  - Test retry mechanism untuk failed messages
  - Test quota limiting dan bypass logic
  - Test webhook signature verification
  - Test notification triggers untuk semua event types
  - _Requirements: All_

- [ ]* 29. Write end-to-end tests
  - Test complete forgot passcode flow dengan WhatsApp notification
  - Test hafalan notification flow ke orang tua
  - Test pengumuman broadcast flow ke multiple recipients
  - Test ujian notification flow
  - Test quota exceeded scenario
  - Test webhook callback processing
  - _Requirements: All_

- [ ] 30. Create documentation
  - Buat user guide untuk Super Admin (setup WhatsApp, create template, monitor messages)
  - Buat developer documentation untuk WhatsApp service API
  - Dokumentasikan template variables untuk setiap notification type
  - Buat troubleshooting guide untuk common issues
  - Dokumentasikan cost calculation dan quota management
  - Buat deployment guide dengan checklist
  - _Requirements: All_
