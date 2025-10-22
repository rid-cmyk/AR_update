// 🔄 Konverter Hafalan: Surat ↔ Juz
// Mengkonversi antara progress hafalan per surat dengan target per juz

import { JUZ_MAPPING, getJuzMappingBySurat, getJuzMappingByJuz } from './juz-mapping';

export interface HafalanData {
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  status: 'ziyadah' | 'murojaah';
}

export interface JuzProgress {
  juz: number;
  progress: number; // persentase 0-100
  ayatHafal: number;
  totalAyat: number;
  detail: string;
  status: 'selesai' | 'proses' | 'belum';
}

export interface SuratProgress {
  surat: string;
  progress: number;
  ayatHafal: number;
  totalAyat: number;
  juzTerkait: number[];
}

/**
 * Menghitung overlap antara dua range ayat
 */
function calculateOverlap(start1: number, end1: number, start2: number, end2: number): number {
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  
  return overlapEnd >= overlapStart ? overlapEnd - overlapStart + 1 : 0;
}

/**
 * Mengkonversi hafalan per surat menjadi progress per juz
 */
export function calculateJuzProgress(hafalanData: HafalanData[]): JuzProgress[] {
  const juzProgress: { [key: number]: { hafal: number; total: number; details: string[] } } = {};
  
  // Inisialisasi semua juz dengan 0
  for (let i = 1; i <= 30; i++) {
    juzProgress[i] = { hafal: 0, total: 0, details: [] };
  }
  
  // Hitung total ayat per juz dari mapping
  JUZ_MAPPING.forEach(mapping => {
    juzProgress[mapping.juzNumber].total += mapping.totalAyat;
  });
  
  // Hitung hafalan yang sudah dicapai per juz
  hafalanData.forEach(hafalan => {
    // Hanya hitung ziyadah untuk progress (murojaah tidak dihitung sebagai progress baru)
    if (hafalan.status !== 'ziyadah') return;
    
    const mappings = getJuzMappingBySurat(hafalan.surat);
    
    mappings.forEach(mapping => {
      const overlap = calculateOverlap(
        hafalan.ayatMulai, hafalan.ayatSelesai,
        mapping.ayatMulai, mapping.ayatSelesai
      );
      
      if (overlap > 0) {
        juzProgress[mapping.juzNumber].hafal += overlap;
        
        // Tambahkan detail
        const detail = `${hafalan.surat}: ${overlap} ayat`;
        if (!juzProgress[mapping.juzNumber].details.includes(detail)) {
          juzProgress[mapping.juzNumber].details.push(detail);
        }
      }
    });
  });
  
  // Konversi ke format hasil
  return Object.entries(juzProgress).map(([juz, data]) => {
    const juzNumber = parseInt(juz);
    const progress = data.total > 0 ? Math.round((data.hafal / data.total) * 100) : 0;
    
    let status: 'selesai' | 'proses' | 'belum';
    if (progress === 100) status = 'selesai';
    else if (progress > 0) status = 'proses';
    else status = 'belum';
    
    return {
      juz: juzNumber,
      progress,
      ayatHafal: data.hafal,
      totalAyat: data.total,
      detail: data.details.join(', ') || 'Belum ada hafalan',
      status
    };
  }).sort((a, b) => a.juz - b.juz);
}

/**
 * Mengkonversi target juz menjadi rencana surat yang harus dihafal
 */
export function convertJuzToSuratTarget(targetJuz: number[]): SuratProgress[] {
  const suratTargets: { [key: string]: { ayatTarget: Set<number>; juzTerkait: Set<number> } } = {};
  
  targetJuz.forEach(juz => {
    const mappings = getJuzMappingByJuz(juz);
    
    mappings.forEach(mapping => {
      if (!suratTargets[mapping.suratName]) {
        suratTargets[mapping.suratName] = {
          ayatTarget: new Set(),
          juzTerkait: new Set()
        };
      }
      
      // Tambahkan semua ayat dalam range ini
      for (let ayat = mapping.ayatMulai; ayat <= mapping.ayatSelesai; ayat++) {
        suratTargets[mapping.suratName].ayatTarget.add(ayat);
      }
      
      suratTargets[mapping.suratName].juzTerkait.add(juz);
    });
  });
  
  return Object.entries(suratTargets).map(([surat, data]) => {
    const totalAyatSurat = getTotalAyatSurat(surat);
    const ayatTarget = data.ayatTarget.size;
    const progress = totalAyatSurat > 0 ? Math.round((ayatTarget / totalAyatSurat) * 100) : 0;
    
    return {
      surat,
      progress,
      ayatHafal: ayatTarget,
      totalAyat: totalAyatSurat,
      juzTerkait: Array.from(data.juzTerkait).sort()
    };
  }).sort((a, b) => a.surat.localeCompare(b.surat));
}

/**
 * Mendapatkan total ayat dalam surat berdasarkan mapping juz
 */
function getTotalAyatSurat(suratName: string): number {
  const mappings = getJuzMappingBySurat(suratName);
  if (mappings.length === 0) return 0;
  
  // Cari ayat terakhir dari surat ini
  const maxAyat = Math.max(...mappings.map(m => m.ayatSelesai));
  return maxAyat;
}

/**
 * Menghitung progress hafalan per surat
 */
export function calculateSuratProgress(hafalanData: HafalanData[]): SuratProgress[] {
  const suratProgress: { [key: string]: { ayatHafal: Set<number>; juzTerkait: Set<number> } } = {};
  
  hafalanData.forEach(hafalan => {
    if (hafalan.status !== 'ziyadah') return;
    
    if (!suratProgress[hafalan.surat]) {
      suratProgress[hafalan.surat] = {
        ayatHafal: new Set(),
        juzTerkait: new Set()
      };
    }
    
    // Tambahkan ayat yang sudah dihafal
    for (let ayat = hafalan.ayatMulai; ayat <= hafalan.ayatSelesai; ayat++) {
      suratProgress[hafalan.surat].ayatHafal.add(ayat);
    }
    
    // Tambahkan juz terkait
    const mappings = getJuzMappingBySurat(hafalan.surat);
    mappings.forEach(mapping => {
      suratProgress[hafalan.surat].juzTerkait.add(mapping.juzNumber);
    });
  });
  
  return Object.entries(suratProgress).map(([surat, data]) => {
    const totalAyat = getTotalAyatSurat(surat);
    const ayatHafal = data.ayatHafal.size;
    const progress = totalAyat > 0 ? Math.round((ayatHafal / totalAyat) * 100) : 0;
    
    return {
      surat,
      progress,
      ayatHafal,
      totalAyat,
      juzTerkait: Array.from(data.juzTerkait).sort()
    };
  }).sort((a, b) => a.surat.localeCompare(b.surat));
}

/**
 * Contoh penggunaan dan testing
 */
export function testConverter() {
  // Contoh data hafalan santri
  const hafalanSantri: HafalanData[] = [
    { surat: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7, status: 'ziyadah' },
    { surat: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 200, status: 'ziyadah' },
    { surat: 'Al-Mulk', ayatMulai: 1, ayatSelesai: 30, status: 'ziyadah' }
  ];
  
  console.log('🧪 Testing Hafalan Converter');
  console.log('📊 Data Hafalan:', hafalanSantri);
  
  const juzProgress = calculateJuzProgress(hafalanSantri);
  console.log('📈 Progress per Juz:', juzProgress.slice(0, 5)); // Tampilkan 5 juz pertama
  
  const suratProgress = calculateSuratProgress(hafalanSantri);
  console.log('📖 Progress per Surat:', suratProgress);
  
  const targetJuz = [1, 2, 3];
  const suratTarget = convertJuzToSuratTarget(targetJuz);
  console.log('🎯 Target Surat untuk Juz 1-3:', suratTarget);
  
  return {
    juzProgress,
    suratProgress,
    suratTarget
  };
}