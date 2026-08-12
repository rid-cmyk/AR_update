export interface KomponenPenilaian {
  id: number
  namaKomponen: string
  bobotNilai: number
  nilaiMaksimal: number
  deskripsi?: string
  urutan: number
}

export interface TemplateUjian {
  id: number
  namaTemplate: string
  jenisUjian: string
  deskripsi?: string
  isActive: boolean
  tahunAjaran?: {
    namaLengkap: string
  }
  komponenPenilaian: KomponenPenilaian[]
  _count: {
    ujianSantri: number
  }
}

const JENIS_UJIAN_LABELS: Record<string, string> = {
  tasmi: "Tasmi'",
  mhq: "MHQ",
  uas: "UAS",
  kenaikan_juz: "Kenaikan Juz",
  tahfidz: "Tahfidz",
  lainnya: "Lainnya"
}

export function getJenisUjianLabel(jenis: string) {
  return JENIS_UJIAN_LABELS[jenis] || jenis
}
