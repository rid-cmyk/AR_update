const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Remove enum Semester
schema = schema.replace(/enum Semester \{\s*S1\s*S2\s*\}/, '');

// 2. Add StatusSantri
schema = schema + '\n\nenum StatusSantri {\n  aktif\n  alumni\n  nonaktif\n}\n';

// 3. User model
schema = schema.replace('  foto                          String?', '  foto                          String?\n  jenisKelamin                  String?');
schema = schema.replace('  email                         String?', '  email                         String?\n  guru                          Guru?\n  santri                        Santri?\n  orangTua                      OrangTua?');
schema = schema.replace('  notif                         Notifikasi[]', '  notif                         Notifikasi[]\n  notifikasiDiterima            NotifikasiPenerima[]');

// 4. New Models
const newModels = 
model Guru {
  id            Int      @id @default(autoincrement())
  userId        Int      @unique
  nip           String?
  tugasTambahan String?
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Santri {
  id            Int          @id @default(autoincrement())
  userId        Int          @unique
  nis           String?      @unique
  tempatLahir   String?
  tanggalLahir  DateTime?
  angkatan      Int?
  status        StatusSantri @default(aktif)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model OrangTua {
  id         Int      @id @default(autoincrement())
  userId     Int      @unique
  pekerjaan  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Semester {
  id             Int          @id @default(autoincrement())
  tahunAjaranId  Int
  namaSemester   String
  semesterUrutan Int
  deskripsi      String?
  tanggalMulai   DateTime
  tanggalSelesai DateTime
  isActive       Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  createdBy      Int?

  tahunAjaran    TahunAjaran  @relation(fields: [tahunAjaranId], references: [id], onDelete: Cascade)
  creator        User?        @relation(fields: [createdBy], references: [id])

  halaqahSantri  HalaqahSantri[]
  templateUjian  TemplateUjian[]
  ujianSantri    UjianSantri[]
  templateRaport TemplateRaport[]
  raportSantri   RaportSantri[]
  hafalan        Hafalan[]
  targetHafalan  TargetHafalan[]
  prestasi       Prestasi[]
  absensi        Absensi[]
  halaqah        Halaqah[]
  jadwal         Jadwal[]

  @@index([tahunAjaranId])
  @@index([isActive])
  @@index([tahunAjaranId, semesterUrutan])
}

model Surah {
  id            Int             @id @default(autoincrement())
  nomor         Int             @unique
  namaArab      String
  namaLatin     String
  jumlahAyat    Int
  urutan        Int
  hafalan       Hafalan[]
  targetHafalan TargetHafalan[]
}
;

schema = schema.replace('model TahunAjaran {', newModels + '\nmodel TahunAjaran {');

// 5. Update TahunAjaran
schema = schema.replace('  semester       Semester\n', '');
schema = schema.replace('  creator        User?            @relation(fields: [createdBy], references: [id])', '  creator        User?            @relation(fields: [createdBy], references: [id])\n  semesters      Semester[]');
schema = schema.replace('@@unique([tahunMulai, tahunSelesai, semester])', '@@unique([tahunMulai, tahunSelesai])');

// 6. Update Halaqah
schema = schema.replace('  guruId      Int?', '  guruId      Int?\n  semesterId  Int?');
schema = schema.replace('  guru        User?            @relation(fields: [guruId], references: [id])', '  guru        User?            @relation(fields: [guruId], references: [id])\n  semester    Semester?        @relation(fields: [semesterId], references: [id])');
schema = schema.replace('  namaHalaqah String', '  namaHalaqah String\n  deskripsi   String?');

// 7. Update HalaqahSantri
schema = schema.replace('  tahunAjaranId Int?', '  tahunAjaranId Int?\n  semesterId   Int?\n  status       String?\n  createdAt    DateTime    @default(now())');
schema = schema.replace('  tahunAjaran   TahunAjaran? @relation(fields: [tahunAjaranId], references: [id])', '  tahunAjaran   TahunAjaran? @relation(fields: [tahunAjaranId], references: [id])\n  semester      Semester?    @relation(fields: [semesterId], references: [id])');

// 8. Update Jadwal
schema = schema.replace('  halaqahId      Int', '  halaqahId      Int\n  semesterId     Int?');
schema = schema.replace('  halaqah        Halaqah   @relation(fields: [halaqahId], references: [id])', '  halaqah        Halaqah   @relation(fields: [halaqahId], references: [id])\n  semester       Semester? @relation(fields: [semesterId], references: [id])');

// 9. Update Absensi
schema = schema.replace('  jadwalId Int', '  jadwalId Int\n  semesterId Int?\n  keterangan String?');
schema = schema.replace('  jadwal   Jadwal        @relation(fields: [jadwalId], references: [id], onDelete: Cascade)', '  jadwal   Jadwal        @relation(fields: [jadwalId], references: [id], onDelete: Cascade)\n  semester   Semester?     @relation(fields: [semesterId], references: [id])');

// 10. Update TargetHafalan
schema = schema.replace('  surat      String', '  surat      String\n  surahId    Int?\n  semesterId Int?');
schema = schema.replace('  santri     User         @relation(fields: [santriId], references: [id], onDelete: Cascade)', '  santri     User         @relation(fields: [santriId], references: [id], onDelete: Cascade)\n  surah      Surah?       @relation(fields: [surahId], references: [id])\n  semester   Semester?    @relation(fields: [semesterId], references: [id])');

// 11. Update Hafalan
schema = schema.replace('  surat       String', '  surat       String\n  surahId     Int?\n  semesterId  Int?');
schema = schema.replace('  santri      User          @relation(fields: [santriId], references: [id], onDelete: Cascade)', '  santri      User          @relation(fields: [santriId], references: [id], onDelete: Cascade)\n  surah       Surah?        @relation(fields: [surahId], references: [id])\n  semester    Semester?     @relation(fields: [semesterId], references: [id])');

// 12. Update Prestasi
schema = schema.replace('  santriId     Int', '  santriId     Int\n  semesterId   Int?\n  tingkat      String?');
schema = schema.replace('  santri       User      @relation(fields: [santriId], references: [id], onDelete: Cascade)', '  santri       User      @relation(fields: [santriId], references: [id], onDelete: Cascade)\n  semester     Semester? @relation(fields: [semesterId], references: [id])');

// 13. Update TemplateUjian
schema = schema.replace('  tahunAjaranId     Int', '  tahunAjaranId     Int\n  semesterId        Int?');
schema = schema.replace('  tahunAjaran       TahunAjaran         @relation(fields: [tahunAjaranId], references: [id], onDelete: Cascade)', '  tahunAjaran       TahunAjaran         @relation(fields: [tahunAjaranId], references: [id], onDelete: Cascade)\n  semester          Semester?           @relation(fields: [semesterId], references: [id], onDelete: Cascade)');

// 14. Update UjianSantri
schema = schema.replace('  tahunAjaranId     Int', '  tahunAjaranId     Int\n  semesterId        Int?');
schema = schema.replace('  tahunAjaran       TahunAjaran   @relation(fields: [tahunAjaranId], references: [id], onDelete: Cascade)', '  tahunAjaran       TahunAjaran   @relation(fields: [tahunAjaranId], references: [id], onDelete: Cascade)\n  semester          Semester?     @relation(fields: [semesterId], references: [id], onDelete: Cascade)');

// 15. Update TemplateRaport
schema = schema.replace('  tahunAjaranId     Int', '  tahunAjaranId     Int\n  semesterId        Int?');
schema = schema.replace('  tahunAjaran       TahunAjaran    @relation(fields: [tahunAjaranId], references: [id], onDelete: Cascade)', '  tahunAjaran       TahunAjaran    @relation(fields: [tahunAjaranId], references: [id], onDelete: Cascade)\n  semester          Semester?      @relation(fields: [semesterId], references: [id], onDelete: Cascade)');

// 16. Update RaportSantri
schema = schema.replace('  tahunAjaranId    Int', '  tahunAjaranId    Int\n  semesterId       Int?');
schema = schema.replace('  tahunAjaran      TahunAjaran    @relation(fields: [tahunAjaranId], references: [id], onDelete: Cascade)', '  tahunAjaran      TahunAjaran    @relation(fields: [tahunAjaranId], references: [id], onDelete: Cascade)\n  semester         Semester?      @relation(fields: [semesterId], references: [id], onDelete: Cascade)');

// 17. Update OrangTuaSantri
schema = schema.replace('  santriId   Int', '  santriId   Int\n  hubungan   String?');

// 18. Update Notifikasi & NotifikasiPenerima & TargetNotifikasi
schema = schema.replace(/model Notifikasi \{[\s\S]*?\}/, model Notifikasi {
  id          Int      @id @default(autoincrement())
  judul       String?
  isi         String?
  pesan       String
  kategori    String?
  channel     String?
  prioritas   String?
  tanggal     DateTime  @default(now())
  type        NotifType
  refId       Int?
  userId      Int?
  isRead      Boolean   @default(false)
  readAt      DateTime?
  createdBy   Int?
  createdAt   DateTime  @default(now())
  
  user        User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  creator     User?     @relation("NotifCreator", fields: [createdBy], references: [id])
  penerima    NotifikasiPenerima[]
  target      TargetNotifikasi[]

  @@index([userId, tanggal])
  @@index([userId, isRead])
}

model NotifikasiPenerima {
  id           Int       @id @default(autoincrement())
  notifikasiId Int
  userId       Int
  isRead       Boolean   @default(false)
  readAt       DateTime?
  deletedAt    DateTime?
  notifikasi   Notifikasi @relation(fields: [notifikasiId], references: [id], onDelete: Cascade)
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([notifikasiId, userId])
}

model TargetNotifikasi {
  id           Int        @id @default(autoincrement())
  notifikasiId Int
  role         String?
  angkatan     Int?
  halaqahId    Int?
  notifikasi   Notifikasi @relation(fields: [notifikasiId], references: [id], onDelete: Cascade)
  halaqah      Halaqah?   @relation(fields: [halaqahId], references: [id])
});

// Inject "NotifCreator" to User
schema = schema.replace('  notif                         Notifikasi[]', '  notif                         Notifikasi[]\n  notifDibuat                   Notifikasi[] @relation("NotifCreator")');

fs.writeFileSync('prisma/schema.prisma', schema);
