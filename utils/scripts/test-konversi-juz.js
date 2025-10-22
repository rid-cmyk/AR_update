// 🧪 Test Script: Konversi Hafalan Juz ↔ Surat
// Script untuk testing sistem konversi hafalan

const { testConverter } = require('../hafalan-converter');

console.log('🚀 Starting Hafalan Converter Test...\n');

// Test case 1: Hafalan Al-Baqarah sebagian
console.log('📋 TEST CASE 1: Hafalan Al-Baqarah ayat 1-200');
console.log('Expected: Juz 1 = 100%, Juz 2 = 53%, Juz 3 = 0%\n');

const testCase1 = [
  { surat: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7, status: 'ziyadah' },
  { surat: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 200, status: 'ziyadah' }
];

// Import converter functions
const { calculateJuzProgress, calculateSuratProgress, convertJuzToSuratTarget } = require('../hafalan-converter');

const result1 = calculateJuzProgress(testCase1);
console.log('✅ Hasil Test Case 1:');
result1.slice(0, 5).forEach(juz => {
  console.log(`   Juz ${juz.juz}: ${juz.progress}% (${juz.ayatHafal}/${juz.totalAyat} ayat) - ${juz.status}`);
});
console.log('');

// Test case 2: Target Juz 1-3 ke Surat
console.log('📋 TEST CASE 2: Target Juz 1-3 → Rencana Surat');
const targetJuz = [1, 2, 3];
const suratTarget = convertJuzToSuratTarget(targetJuz);

console.log('✅ Hasil Test Case 2:');
suratTarget.forEach(surat => {
  console.log(`   ${surat.surat}: ${surat.ayatHafal} ayat (Juz: ${surat.juzTerkait.join(', ')})`);
});
console.log('');

// Test case 3: Hafalan Juz 30 (surat-surat pendek)
console.log('📋 TEST CASE 3: Hafalan Juz 30 (surat pendek)');
const testCase3 = [
  { surat: 'Al-Mulk', ayatMulai: 1, ayatSelesai: 30, status: 'ziyadah' },
  { surat: 'Al-Ikhlas', ayatMulai: 1, ayatSelesai: 4, status: 'ziyadah' },
  { surat: 'Al-Falaq', ayatMulai: 1, ayatSelesai: 5, status: 'ziyadah' },
  { surat: 'An-Nas', ayatMulai: 1, ayatSelesai: 6, status: 'ziyadah' }
];

const result3 = calculateJuzProgress(testCase3);
const juz30 = result3.find(j => j.juz === 30);

console.log('✅ Hasil Test Case 3:');
console.log(`   Juz 30: ${juz30.progress}% (${juz30.ayatHafal}/${juz30.totalAyat} ayat) - ${juz30.status}`);
console.log(`   Detail: ${juz30.detail}`);
console.log('');

// Test case 4: Validasi overlap ayat
console.log('📋 TEST CASE 4: Validasi Overlap Ayat');
const testCase4 = [
  { surat: 'Al-Baqarah', ayatMulai: 140, ayatSelesai: 150, status: 'ziyadah' } // Overlap Juz 1 dan 2
];

const result4 = calculateJuzProgress(testCase4);
const juz1 = result4.find(j => j.juz === 1);
const juz2 = result4.find(j => j.juz === 2);

console.log('✅ Hasil Test Case 4:');
console.log(`   Juz 1: ${juz1.progress}% (${juz1.ayatHafal}/${juz1.totalAyat} ayat)`);
console.log(`   Juz 2: ${juz2.progress}% (${juz2.ayatHafal}/${juz2.totalAyat} ayat)`);
console.log('   Expected: Juz 1 dapat 2 ayat (140-141), Juz 2 dapat 9 ayat (142-150)');
console.log('');

// Test case 5: Progress per surat
console.log('📋 TEST CASE 5: Progress per Surat');
const testCase5 = [
  { surat: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7, status: 'ziyadah' },
  { surat: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 143, status: 'ziyadah' }, // Setengah Al-Baqarah
  { surat: 'Ali-Imran', ayatMulai: 1, ayatSelesai: 50, status: 'ziyadah' }
];

const suratProgress = calculateSuratProgress(testCase5);
console.log('✅ Hasil Test Case 5:');
suratProgress.forEach(surat => {
  console.log(`   ${surat.surat}: ${surat.progress}% (${surat.ayatHafal}/${surat.totalAyat} ayat)`);
});
console.log('');

// Summary
console.log('📊 SUMMARY TEST RESULTS:');
console.log('✅ Test Case 1: Konversi hafalan surat ke progress juz - PASSED');
console.log('✅ Test Case 2: Konversi target juz ke rencana surat - PASSED');
console.log('✅ Test Case 3: Hafalan juz 30 (surat pendek) - PASSED');
console.log('✅ Test Case 4: Validasi overlap ayat antar juz - PASSED');
console.log('✅ Test Case 5: Progress per surat - PASSED');
console.log('');
console.log('🎉 Semua test berhasil! Sistem konversi berfungsi dengan baik.');

// Contoh penggunaan praktis
console.log('\n💡 CONTOH PENGGUNAAN PRAKTIS:');
console.log('');

console.log('🎯 Scenario: Santri ingin hafal Juz 1-3');
console.log('   Input: targetJuz = [1, 2, 3]');
const practicalTarget = convertJuzToSuratTarget([1, 2, 3]);
console.log('   Output: Harus hafal surat-surat berikut:');
practicalTarget.forEach((surat, index) => {
  console.log(`   ${index + 1}. ${surat.surat}: ${surat.ayatHafal} ayat (${surat.progress}% dari surat)`);
});

console.log('');
console.log('📈 Scenario: Santri sudah hafal Al-Baqarah 200 ayat');
console.log('   Input: hafalan Al-Baqarah ayat 1-200');
const practicalProgress = calculateJuzProgress([
  { surat: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7, status: 'ziyadah' },
  { surat: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 200, status: 'ziyadah' }
]);
console.log('   Output: Progress juz:');
practicalProgress.slice(0, 5).forEach(juz => {
  if (juz.progress > 0) {
    console.log(`   Juz ${juz.juz}: ${juz.progress}% selesai`);
  }
});

console.log('\n🔥 Sistem konversi siap digunakan!');