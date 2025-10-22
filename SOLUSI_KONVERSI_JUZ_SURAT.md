# 🔄 Solusi Konversi Sistem JUZ ↔ SURAT

## 🎯 Masalah yang Diselesaikan

**AKAR MASALAH**: Target hafalan berbasis JUZ vs Progress hafalan berbasis SURAT

### Contoh Kasus:
- **Target**: "Hafal Juz 1, 2, 3" 
- **Progress**: "Hafal Surat Al-Baqarah ayat 1-200"
- **Hasil**: Tidak bisa dihitung progress yang akurat

## 💡 Solusi: Sistem Konversi Otomatis

### 1. **Database Mapping Juz-Surat-Ayat**

Buat tabel referensi yang memetakan setiap ayat ke juz yang sesuai:

```sql
-- Tabel mapping juz ke surat dan ayat
CREATE TABLE juz_mapping (
  id SERIAL PRIMARY KEY,
  juz_number INTEGER NOT NULL,
  surat_name VARCHAR(50) NOT NULL,
  ayat_mulai INTEGER NOT NULL,
  ayat_selesai INTEGER NOT NULL,
  total_ayat INTEGER NOT NULL
);

-- Contoh data untuk Juz 1-3:
INSERT INTO juz_mapping VALUES
-- JUZ 1
(1, 1, 'Al-Fatihah', 1, 7, 7),
(2, 1, 'Al-Baqarah', 1, 141, 141),

-- JUZ 2  
(3, 2, 'Al-Baqarah', 142, 252, 111),

-- JUZ 3
(4, 3, 'Al-Baqarah', 253, 286, 34),
(5, 3, 'Ali-Imran', 1, 92, 92);
```

### 2. **API Konversi Progress**

#### Endpoint: `GET /api/konversi/progress-juz`
Mengkonversi hafalan per surat menjadi progress per juz:

```typescript
// Input: Hafalan santri per surat
const hafalanSantri = [
  { surat: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7 },
  { surat: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 200 }
];

// Output: Progress per juz
const progressJuz = [
  { 
    juz: 1, 
    progress: 100, // Al-Fatihah (7/7) + Al-Baqarah (141/141) = 148/148 = 100%
    detail: "Al-Fatihah: 7/7, Al-Baqarah: 141/141"
  },
  { 
    juz: 2, 
    progress: 53, // Al-Baqarah ayat 142-200 = 59/111 = 53%
    detail: "Al-Baqarah: 59/111 ayat"
  },
  { 
    juz: 3, 
    progress: 0, // Belum hafal ayat 253-286 Al-Baqarah
    detail: "Al-Baqarah: 0/34, Ali-Imran: 0/92"
  }
];
```

#### Endpoint: `GET /api/konversi/target-surat`
Mengkonversi target per juz menjadi rencana per surat:

```typescript
// Input: Target juz
const targetJuz = [1, 2, 3];

// Output: Rencana surat yang harus dihafal
const rencanaSurat = [
  { surat: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7, juz: 1 },
  { surat: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 252, juz: [1,2] },
  { surat: 'Ali-Imran', ayatMulai: 1, ayatSelesai: 92, juz: 3 }
];
```

### 3. **Dashboard Terintegrasi**

#### Dashboard Santri - View Progress Juz:
```typescript
// Tampilkan progress dalam format juz
const dashboardData = {
  progressJuz: [
    { juz: 1, progress: 100, status: '✅ SELESAI' },
    { juz: 2, progress: 53, status: '🔄 PROSES' },
    { juz: 3, progress: 0, status: '❌ BELUM' }
  ],
  progressSurat: [
    { surat: 'Al-Fatihah', progress: 100, ayat: '7/7' },
    { surat: 'Al-Baqarah', progress: 70, ayat: '200/286' }
  ]
};
```

#### Dashboard Guru - Input Target Fleksibel:
```typescript
// Guru bisa set target dalam format juz ATAU surat
const targetOptions = {
  formatJuz: {
    juzTarget: [1, 2, 3],
    deadline: '2024-03-01'
  },
  formatSurat: {
    suratTarget: [
      { surat: 'Al-Baqarah', ayatTarget: 286 },
      { surat: 'Ali-Imran', ayatTarget: 200 }
    ],
    deadline: '2024-03-01'
  }
};
```

### 4. **Algoritma Konversi**

#### Fungsi: `calculateJuzProgress(hafalanSantri)`
```typescript
function calculateJuzProgress(hafalanSantri: Hafalan[]) {
  const juzProgress = {};
  
  // Loop setiap hafalan santri
  for (const hafalan of hafalanSantri) {
    // Cari mapping juz untuk surat dan ayat ini
    const mappings = getJuzMappingBySurat(hafalan.surat);
    
    for (const mapping of mappings) {
      // Hitung overlap antara hafalan dan mapping juz
      const overlap = calculateOverlap(
        hafalan.ayatMulai, hafalan.ayatSelesai,
        mapping.ayatMulai, mapping.ayatSelesai
      );
      
      if (overlap > 0) {
        if (!juzProgress[mapping.juzNumber]) {
          juzProgress[mapping.juzNumber] = { hafal: 0, total: 0 };
        }
        
        juzProgress[mapping.juzNumber].hafal += overlap;
        juzProgress[mapping.juzNumber].total += mapping.totalAyat;
      }
    }
  }
  
  // Konversi ke persentase
  return Object.entries(juzProgress).map(([juz, data]) => ({
    juz: parseInt(juz),
    progress: Math.round((data.hafal / data.total) * 100),
    ayatHafal: data.hafal,
    totalAyat: data.total
  }));
}
```

#### Fungsi: `calculateOverlap(start1, end1, start2, end2)`
```typescript
function calculateOverlap(start1: number, end1: number, start2: number, end2: number): number {
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  
  return overlapEnd >= overlapStart ? overlapEnd - overlapStart + 1 : 0;
}
```

### 5. **Implementasi Database**

#### Update Prisma Schema:
```prisma
model JuzMapping {
  id          Int    @id @default(autoincrement())
  juzNumber   Int
  suratName   String
  ayatMulai   Int
  ayatSelesai Int
  totalAyat   Int
  
  @@index([juzNumber])
  @@index([suratName])
}

model TargetHafalan {
  id         Int          @id @default(autoincrement())
  
  // Target bisa berdasarkan juz ATAU surat
  targetType String       // 'juz' atau 'surat'
  
  // Untuk target juz
  juzTarget  Int[]        // Array juz yang ditargetkan
  
  // Untuk target surat (existing)
  surat      String?
  ayatTarget Int?
  
  deadline   DateTime
  status     StatusTarget
  santriId   Int
  santri     User         @relation(fields: [santriId], references: [id])
}
```

### 6. **UI Components**

#### Progress Juz Component:
```tsx
function ProgressJuzCard({ juzNumber, progress, detail }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Juz {juzNumber}</h3>
        <span className={`px-2 py-1 rounded text-sm ${
          progress === 100 ? 'bg-green-100 text-green-800' :
          progress > 0 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {progress}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-sm text-gray-600">{detail}</p>
    </div>
  );
}
```

#### Target Setting Component:
```tsx
function TargetSettingForm() {
  const [targetType, setTargetType] = useState('juz'); // 'juz' atau 'surat'
  
  return (
    <form>
      <div className="mb-4">
        <label>Format Target:</label>
        <select value={targetType} onChange={(e) => setTargetType(e.target.value)}>
          <option value="juz">Berdasarkan Juz</option>
          <option value="surat">Berdasarkan Surat</option>
        </select>
      </div>
      
      {targetType === 'juz' ? (
        <JuzTargetInput />
      ) : (
        <SuratTargetInput />
      )}
    </form>
  );
}
```

## 🎯 Hasil Akhir

### Sebelum (Masalah):
- Target: "Juz 1-3" 
- Progress: "Al-Baqarah ayat 1-200"
- Status: ❌ **Tidak bisa dihitung**

### Sesudah (Solusi):
- Target: "Juz 1-3"
- Progress: "Al-Baqarah ayat 1-200" 
- Status: ✅ **Juz 1: 100%, Juz 2: 53%, Juz 3: 0%**

### Manfaat:
1. **Fleksibilitas**: Guru bisa set target dalam format juz atau surat
2. **Akurasi**: Progress dihitung dengan tepat berdasarkan overlap ayat
3. **Transparansi**: Santri tahu persis progress juz dan surat
4. **Kompatibilitas**: Sistem lama tetap berfungsi, hanya ditambah fitur konversi

## 🚀 Langkah Implementasi

1. **Buat tabel `juz_mapping`** dengan data lengkap 30 juz
2. **Update model `TargetHafalan`** untuk support target juz
3. **Buat API konversi** `/api/konversi/*`
4. **Update dashboard** dengan view progress juz
5. **Update form target** dengan opsi juz/surat
6. **Testing** dengan data real santri

Dengan solusi ini, masalah konversi antara sistem juz dan surat akan teratasi! 🎉