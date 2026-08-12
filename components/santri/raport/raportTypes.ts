export interface RaportData {
  id: number;
  semester: string;
  tahunAkademik: string;
  nilaiAkhir: number;
  catatan: string;
  tanggalCetak: string;
  details: Array<{
    mataPelajaran: string;
    nilai: number;
    keterangan: string;
  }>;
}

export interface PrestasiData {
  id: number;
  namaPrestasi: string;
  keterangan: string;
  kategori: string;
  tahun: number;
  validated: boolean;
}
