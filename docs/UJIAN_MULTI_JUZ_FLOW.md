# Flow Ujian Multi-Juz - Per Halaman

## Overview
Ketika guru memilih ujian tipe **per-halaman** dengan **rentang juz > 1**, sistem harus:
1. Menampilkan navigasi juz
2. Memungkinkan perpindahan antar juz
3. Penilaian bisa dilakukan per juz
4. Form penilaian ter-update sesuai juz aktif

---

## Skenario: Ujian Per-Halaman, Juz 1-3

### Setup Ujian
```
Tipe Ujian: Per-Halaman
Juz Mulai: 1
Juz Sampai: 3
Total Halaman: 63 (21 + 20 + 22)
```

### Flow Ujian

#### 1. Mulai Ujian - Juz 1
```
┌─────────────────────────────────────────┐
│  MUSHAF DIGITAL                         │
│  📄 Per Halaman | 📚 Juz 1-3            │
├─────────────────────────────────────────┤
│  صفحة 1 (Juz 1)                         │
│  [Al-Fatihah content]                   │
├─────────────────────────────────────────┤
│  ✅ NAVIGASI JUZ                        │
│  [← Juz Prev] [Juz 1] [Juz Next →]     │
│     (disabled)  (active)  (enabled)     │
│                                         │
│  ✅ NAVIGASI HALAMAN                    │
│  [← Hal Prev] [Hal 1/63] [Hal Next →]  │
│     (disabled)   (1/21)    (enabled)    │
├─────────────────────────────────────────┤
│  FORM PENILAIAN - JUZ 1                 │
│  Kelancaran: [___] / 100                │
│  Tajwid: [___] / 100                    │
│  Makhorijul Huruf: [___] / 100          │
│  [Simpan Nilai Juz 1]                   │
└─────────────────────────────────────────┘
```

#### 2. Navigasi ke Juz 2
**User klik "Juz Next" atau navigasi ke halaman 22**

```
┌─────────────────────────────────────────┐
│  MUSHAF DIGITAL                         │
│  📄 Per Halaman | 📚 Juz 1-3            │
├─────────────────────────────────────────┤
│  صفحة 22 (Juz 2) ← Auto jump!          │
│  [Al-Baqarah content]                   │
├─────────────────────────────────────────┤
│  ✅ NAVIGASI JUZ                        │
│  [← Juz Prev] [Juz 2] [Juz Next →]     │
│     (enabled)  (active)  (enabled)      │
│                                         │
│  ✅ NAVIGASI HALAMAN                    │
│  [← Hal Prev] [Hal 22/63] [Hal Next →] │
│     (enabled)   (22/41)    (enabled)    │
├─────────────────────────────────────────┤
│  FORM PENILAIAN - JUZ 2 ← Updated!     │
│  Kelancaran: [___] / 100                │
│  Tajwid: [___] / 100                    │
│  Makhorijul Huruf: [___] / 100          │
│  [Simpan Nilai Juz 2]                   │
└─────────────────────────────────────────┘
```

#### 3. Navigasi ke Juz 3
**User klik "Juz Next" atau navigasi ke halaman 42**

```
┌─────────────────────────────────────────┐
│  MUSHAF DIGITAL                         │
│  📄 Per Halaman | 📚 Juz 1-3            │
├─────────────────────────────────────────┤
│  صفحة 42 (Juz 3) ← Auto jump!          │
│  [Al-Baqarah/Ali Imran content]         │
├─────────────────────────────────────────┤
│  ✅ NAVIGASI JUZ                        │
│  [← Juz Prev] [Juz 3] [Juz Next →]     │
│     (enabled)  (active)  (disabled)     │
│                                         │
│  ✅ NAVIGASI HALAMAN                    │
│  [← Hal Prev] [Hal 42/63] [Hal Next →] │
│     (enabled)   (42/61)    (enabled)    │
├─────────────────────────────────────────┤
│  FORM PENILAIAN - JUZ 3 ← Updated!     │
│  Kelancaran: [___] / 100                │
│  Tajwid: [___] / 100                    │
│  Makhorijul Huruf: [___] / 100          │
│  [Simpan Nilai Juz 3]                   │
└─────────────────────────────────────────┘
```

---

## Implementation

### 1. Navigasi Juz (Sudah Ada)
```typescript
// Kondisi: juzSampai > juzMulai
{juzSampai > juzMulai && (
  <Card>
    <Button onClick={handlePrevJuz}>الجزء السابق</Button>
    <Text>الجزء {activeJuz}</Text>
    <Button onClick={handleNextJuz}>الجزء التالي</Button>
  </Card>
)}
```

### 2. Auto-Update activeJuz (Sudah Ada)
```typescript
// activeJuz ter-update otomatis saat navigasi halaman
useEffect(() => {
  const currentPageData = getCurrentPage();
  if (currentPageData && currentPageData.juz !== activeJuz) {
    setActiveJuz(currentPageData.juz);
  }
}, [currentPage, pages]);
```

### 3. Handle Juz Navigation (Sudah Ada)
```typescript
const handleNextJuz = () => {
  if (activeJuz < juzSampai) {
    const newJuz = activeJuz + 1;
    setActiveJuz(newJuz);
    onJuzChange?.(newJuz);
    
    // Navigate to first page of next juz
    const firstPage = JUZ_TO_PAGE_MAPPING[newJuz]?.start || 1;
    onPageChange?.(firstPage);
  }
};
```

### 4. Form Penilaian Integration (Perlu Ditambahkan)

**Parent Component (FormUjian):**
```typescript
const [currentJuz, setCurrentJuz] = useState(juzMulai);
const [nilaiPerJuz, setNilaiPerJuz] = useState<Record<number, any>>({});

// Handle juz change from MushafDigital
const handleJuzChange = (juz: number) => {
  setCurrentJuz(juz);
  // Load nilai for this juz if exists
  if (nilaiPerJuz[juz]) {
    form.setFieldsValue(nilaiPerJuz[juz]);
  } else {
    form.resetFields();
  }
};

// Save nilai for current juz
const handleSaveNilai = (values: any) => {
  setNilaiPerJuz(prev => ({
    ...prev,
    [currentJuz]: values
  }));
  message.success(`Nilai Juz ${currentJuz} disimpan!`);
};
```

**MushafDigital Component:**
```typescript
<MushafDigital
  juzMulai={1}
  juzSampai={3}
  tipeUjian="per-halaman"
  currentPage={currentPage}
  currentJuz={currentJuz}
  onPageChange={setCurrentPage}
  onJuzChange={handleJuzChange} // ← Important!
/>
```

**Form Penilaian:**
```typescript
<Card title={`Penilaian Juz ${currentJuz}`}>
  <Form
    form={form}
    onFinish={handleSaveNilai}
    initialValues={nilaiPerJuz[currentJuz]}
  >
    <Form.Item label="Kelancaran" name="kelancaran">
      <InputNumber min={0} max={100} />
    </Form.Item>
    <Form.Item label="Tajwid" name="tajwid">
      <InputNumber min={0} max={100} />
    </Form.Item>
    <Form.Item label="Makhorijul Huruf" name="makhorijul">
      <InputNumber min={0} max={100} />
    </Form.Item>
    <Button type="primary" htmlType="submit">
      Simpan Nilai Juz {currentJuz}
    </Button>
  </Form>
</Card>
```

---

## Data Structure

### Nilai Per Juz
```typescript
interface NilaiJuz {
  juz: number;
  kelancaran: number;
  tajwid: number;
  makhorijul: number;
  catatan?: string;
}

// State
const [nilaiPerJuz, setNilaiPerJuz] = useState<Record<number, NilaiJuz>>({
  1: { juz: 1, kelancaran: 85, tajwid: 90, makhorijul: 88 },
  2: { juz: 2, kelancaran: 0, tajwid: 0, makhorijul: 0 }, // Belum diisi
  3: { juz: 3, kelancaran: 0, tajwid: 0, makhorijul: 0 }  // Belum diisi
});
```

### Submit Final
```typescript
const handleSubmitUjian = async () => {
  // Validate all juz have been graded
  const allJuzGraded = Object.keys(nilaiPerJuz).length === (juzSampai - juzMulai + 1);
  
  if (!allJuzGraded) {
    message.warning('Harap nilai semua juz terlebih dahulu!');
    return;
  }

  // Calculate total score
  const totalScore = Object.values(nilaiPerJuz).reduce((sum, nilai) => {
    return sum + (nilai.kelancaran + nilai.tajwid + nilai.makhorijul) / 3;
  }, 0) / Object.keys(nilaiPerJuz).length;

  // Submit to API
  const response = await fetch('/api/guru/ujian', {
    method: 'POST',
    body: JSON.stringify({
      santriId,
      jenisUjian,
      juzRange: { dari: juzMulai, sampai: juzSampai },
      nilaiPerJuz,
      totalScore
    })
  });
};
```

---

## User Flow

### Step-by-Step

1. **Guru memilih ujian:**
   - Tipe: Per-Halaman
   - Juz: 1-3
   - Santri: Ahmad

2. **Mulai ujian - Juz 1:**
   - Mushaf menampilkan halaman 1 (Juz 1)
   - Form penilaian untuk Juz 1
   - Guru bisa navigasi halaman 1-21

3. **Guru menilai Juz 1:**
   - Kelancaran: 85
   - Tajwid: 90
   - Makhorijul: 88
   - Klik "Simpan Nilai Juz 1"

4. **Navigasi ke Juz 2:**
   - Klik button "الجزء التالي"
   - Mushaf auto jump ke halaman 22
   - Form penilaian berubah ke Juz 2
   - Nilai Juz 1 tersimpan

5. **Guru menilai Juz 2:**
   - Kelancaran: 82
   - Tajwid: 85
   - Makhorijul: 87
   - Klik "Simpan Nilai Juz 2"

6. **Navigasi ke Juz 3:**
   - Klik button "الجزء التالي"
   - Mushaf auto jump ke halaman 42
   - Form penilaian berubah ke Juz 3
   - Nilai Juz 1 & 2 tersimpan

7. **Guru menilai Juz 3:**
   - Kelancaran: 88
   - Tajwid: 92
   - Makhorijul: 90
   - Klik "Simpan Nilai Juz 3"

8. **Submit ujian:**
   - Semua juz sudah dinilai
   - Klik "Submit Ujian"
   - Sistem calculate total score
   - Data tersimpan ke database

---

## Visual Indicators

### Juz Status
```typescript
<Space>
  <Tag color={nilaiPerJuz[1] ? 'green' : 'default'}>
    Juz 1 {nilaiPerJuz[1] && '✓'}
  </Tag>
  <Tag color={nilaiPerJuz[2] ? 'green' : 'default'}>
    Juz 2 {nilaiPerJuz[2] && '✓'}
  </Tag>
  <Tag color={nilaiPerJuz[3] ? 'green' : 'default'}>
    Juz 3 {nilaiPerJuz[3] && '✓'}
  </Tag>
</Space>
```

### Progress Bar
```typescript
const progress = (Object.keys(nilaiPerJuz).length / (juzSampai - juzMulai + 1)) * 100;

<Progress 
  percent={progress} 
  format={() => `${Object.keys(nilaiPerJuz).length}/${juzSampai - juzMulai + 1} Juz`}
/>
```

---

## Benefits

### For Guru
- ✅ Mudah navigasi antar juz
- ✅ Penilaian terorganisir per juz
- ✅ Tidak kehilangan nilai saat pindah juz
- ✅ Visual indicator juz yang sudah dinilai

### For System
- ✅ Data terstruktur per juz
- ✅ Easy to track progress
- ✅ Flexible untuk multi-juz
- ✅ Clear separation of concerns

---

## Testing Checklist

### Navigation
- [ ] Klik "Juz Next" → Jump ke halaman pertama juz berikutnya
- [ ] Klik "Juz Prev" → Jump ke halaman pertama juz sebelumnya
- [ ] Navigasi halaman → activeJuz auto-update
- [ ] Button disabled di juz pertama/terakhir

### Form Penilaian
- [ ] Form berubah saat ganti juz
- [ ] Nilai tersimpan saat ganti juz
- [ ] Nilai ter-load kembali saat kembali ke juz
- [ ] Form reset untuk juz yang belum dinilai

### Data Persistence
- [ ] Nilai tidak hilang saat navigasi
- [ ] Semua juz bisa dinilai
- [ ] Submit hanya bisa jika semua juz dinilai
- [ ] Data tersimpan dengan benar

---

## API Endpoint

### Submit Ujian Multi-Juz
```typescript
POST /api/guru/ujian

Body:
{
  "santriId": "123",
  "jenisUjianId": "tasmi",
  "tipeUjian": "per-halaman",
  "juzRange": {
    "dari": 1,
    "sampai": 3
  },
  "nilaiPerJuz": {
    "1": {
      "kelancaran": 85,
      "tajwid": 90,
      "makhorijul": 88
    },
    "2": {
      "kelancaran": 82,
      "tajwid": 85,
      "makhorijul": 87
    },
    "3": {
      "kelancaran": 88,
      "tajwid": 92,
      "makhorijul": 90
    }
  },
  "totalScore": 87.33,
  "timestamp": "2025-11-08T10:30:00Z"
}
```

---

**Status**: ✅ Navigation Implemented, Form Integration Needed
**Version**: 1.0.0
**Last Updated**: November 2025
