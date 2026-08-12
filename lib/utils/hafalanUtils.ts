export interface Santri {
  id: number;
  namaLengkap: string;
  username: string;
}

export interface Hafalan {
  id: number;
  santriId?: number | string;
  santri: Santri;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: "ziyadah" | "murojaah";
  tanggal: string;
}

export interface HafalanSummary {
  santri: Santri;
  totalHafalan: number;
  ziyadahCount: number;
  murojaahCount: number;
  lastHafalan: Hafalan;
  hafalanList: Hafalan[];
}

// Kelompokkan hafalan per santri untuk ringkasan
export const buildHafalanSummaryBySantri = (hafalanList: Hafalan[]): HafalanSummary[] => {
  const summary: Record<number, HafalanSummary> = {};

  hafalanList.forEach(hafalan => {
    // Skip bila data santri tidak ada
    if (!hafalan.santri || !hafalan.santri.id) {
      return;
    }

    const santriId = hafalan.santri.id;
    if (!summary[santriId]) {
      summary[santriId] = {
        santri: hafalan.santri,
        totalHafalan: 0,
        ziyadahCount: 0,
        murojaahCount: 0,
        lastHafalan: hafalan,
        hafalanList: []
      };
    }

    summary[santriId].totalHafalan++;
    summary[santriId].hafalanList.push(hafalan);

    if (hafalan.status === 'ziyadah') {
      summary[santriId].ziyadahCount++;
    } else {
      summary[santriId].murojaahCount++;
    }

    // Update last hafalan bila yang ini lebih baru
    if (new Date(hafalan.tanggal) > new Date(summary[santriId].lastHafalan.tanggal)) {
      summary[santriId].lastHafalan = hafalan;
    }
  });

  return Object.values(summary);
};

export interface HafalanFormValues {
  santriId: number;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: "ziyadah" | "murojaah";
  keterangan?: string;
}

// Bangun payload API dari nilai form
export const buildHafalanPayload = (
  values: HafalanFormValues,
  tanggal: string
) => ({
  santriId: values.santriId,
  surat: values.surat,
  ayatMulai: values.ayatMulai,
  ayatSelesai: values.ayatSelesai,
  status: values.status,
  tanggal,
  keterangan: values.keterangan || null
});
