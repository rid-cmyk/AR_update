// Compatibility shim — all functions moved to tahun-akademik.ts
export {
  getCurrentAcademicYear,
  generateAcademicYears,
  isDateInTahunAkademik,
  getTahunAkademikBySemester,
  getPreviousTahunAkademik,
  getNextTahunAkademik,
  formatTahunAkademik,
  type TahunAkademikInfo,
} from './tahun-akademik';

// Legacy aliases
export { getCurrentAcademicYear as getTahunAkademikFromDate } from './tahun-akademik';
export { getCurrentAcademicYear as getCurrentTahunAkademik } from './tahun-akademik';
export { generateAcademicYears as getTahunAkademikRange } from './tahun-akademik';
