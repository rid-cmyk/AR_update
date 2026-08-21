// Compatibility shim — all functions moved to tahun-akademik.ts
export {
  getActiveTahunAkademik,
  withTahunAkademik,
  createTahunAkademikFilter,
  getWhereWithTahunAkademik,
  formatTahunAkademik as formatTahunAkademikDisplay,
  validateTahunAkademik,
  getTahunAkademikStats,
  type TahunAkademikContext,
} from './tahun-akademik';
