# 📊 Admin Dashboard Components

## StatistikTemplate

Komponen untuk menampilkan statistik template ujian dan raport di dashboard admin.

### Fitur:
- ✅ Menampilkan total template ujian
- ✅ Menampilkan total template raport
- ✅ Breakdown aktif vs non-aktif
- ✅ Progress bar visual
- ✅ Loading state
- ✅ Empty state

### Data yang Ditampilkan:

#### Template Ujian:
- Total template
- Jumlah aktif (hijau)
- Jumlah non-aktif (merah)
- Progress bar persentase

#### Template Raport:
- Total template
- Jumlah aktif (hijau)
- Jumlah non-aktif (merah)
- Progress bar persentase

### API Endpoint:
`GET /api/admin/template-stats`

**Response**:
```json
{
  "templateUjian": {
    "total": 15,
    "aktif": 12,
    "nonAktif": 3
  },
  "templateRaport": {
    "total": 8,
    "aktif": 6,
    "nonAktif": 2
  }
}
```

### Usage:
```tsx
import { StatistikTemplate } from '@/components/admin/dashboard/StatistikTemplate'

<StatistikTemplate />
```

---

## SystemStatus

**Status**: Belum dibuat

Komponen untuk menampilkan status sistem (database, memory, disk, dll).

---

**Last Updated**: 2025-11-07
