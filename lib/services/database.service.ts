import { prisma } from '@/lib/database/prisma';
import { type AuthUser } from '@/lib/auth';
import JSZip from 'jszip';
import os from 'os';

const TABLE_DEFINITIONS = [
  { name: 'User', displayName: 'Users (Pengguna)', category: 'core', description: 'Data pengguna sistem (admin, guru, santri, ortu, yayasan)' },
  { name: 'Role', displayName: 'Roles (Peran)', category: 'core', description: 'Peran dan hak akses pengguna' },
  { name: 'Halaqah', displayName: 'Halaqah', category: 'data', description: 'Data halaqah dan pembagian kelas' },
  { name: 'HalaqahSantri', displayName: 'Halaqah Santri', category: 'data', description: 'Relasi santri dengan halaqah' },
  { name: 'Hafalan', displayName: 'Data Hafalan', category: 'data', description: 'Progress hafalan santri' },
  { name: 'TargetHafalan', displayName: 'Target Hafalan', category: 'data', description: 'Target hafalan yang ditetapkan' },
  { name: 'Absensi', displayName: 'Absensi', category: 'data', description: 'Data kehadiran santri' },
  { name: 'Prestasi', displayName: 'Prestasi', category: 'data', description: 'Pencapaian dan prestasi santri' },
  { name: 'UjianSantri', displayName: 'Ujian Santri', category: 'data', description: 'Hasil ujian santri (termasuk ujian guru)' },
  { name: 'Pengumuman', displayName: 'Pengumuman', category: 'system', description: 'Pengumuman dan notifikasi' },
  { name: 'PengumumanRead', displayName: 'Status Baca Pengumuman', category: 'system', description: 'Status baca pengumuman per user' },
  { name: 'OrangTuaSantri', displayName: 'Relasi Orang Tua - Santri', category: 'data', description: 'Hubungan orang tua dengan santri' },
  { name: 'Jadwal', displayName: 'Jadwal', category: 'system', description: 'Jadwal kegiatan dan pembelajaran' },
  { name: 'Notifikasi', displayName: 'Notifikasi', category: 'system', description: 'Sistem notifikasi' },
  { name: 'AuditLog', displayName: 'Audit Log', category: 'logs', description: 'Log aktivitas sistem' },
  { name: 'ForgotPasscode', displayName: 'Forgot Passcode Requests', category: 'logs', description: 'Permintaan reset passcode' },
  { name: 'TahunAjaran', displayName: 'Tahun Ajaran', category: 'system', description: 'Data tahun ajaran' },
  { name: 'TemplateUjian', displayName: 'Template Ujian', category: 'system', description: 'Template untuk ujian' },
  { name: 'TemplateRaport', displayName: 'Template Raport', category: 'system', description: 'Template untuk raport' },
  { name: 'RaportSantri', displayName: 'Raport Santri', category: 'data', description: 'Raport dan laporan santri' },
  { name: 'JenisUjian', displayName: 'Jenis Ujian', category: 'system', description: 'Kategori dan jenis ujian' },
  { name: 'KomponenPenilaian', displayName: 'Komponen Penilaian', category: 'system', description: 'Komponen penilaian ujian' },
  { name: 'GuruPermission', displayName: 'Permission Guru', category: 'system', description: 'Hak akses guru' },
] as const;

export class DatabaseService {
  static async getInfo() {
    const tablesWithStats = await Promise.all(
      TABLE_DEFINITIONS.map(async (table) => {
        try {
          const countResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table.name}"`) as Record<string, unknown>[];
          const recordCount = Number(countResult[0]?.count || 0);
          const estimatedSize = recordCount < 100 ? '< 1 KB' : recordCount < 1000 ? '< 10 KB' : recordCount < 10000 ? '< 100 KB' : recordCount < 100000 ? '< 1 MB' : '> 1 MB';
          return { ...table, recordCount, size: estimatedSize, lastUpdated: new Date().toISOString() };
        } catch {
          return { ...table, recordCount: 0, size: 'Unknown', lastUpdated: new Date().toISOString() };
        }
      })
    );
    return { tables: tablesWithStats, totalTables: tablesWithStats.length, totalRecords: tablesWithStats.reduce((sum, t) => sum + t.recordCount, 0) };
  }

  static async exportTables(tableNames: string[], user: AuthUser, ipAddress?: string | null, userAgent?: string | null) {
    if (!tableNames || !Array.isArray(tableNames) || tableNames.length === 0) throw new DatabaseServiceError('No tables specified for export', 400);

    const zip = new JSZip();
    const exportTimestamp = new Date().toISOString().split('T')[0];
    zip.file('metadata.json', JSON.stringify({ exportDate: new Date().toISOString(), tables: tableNames, version: '1.0', source: 'AR-Hafalan System' }, null, 2));

    for (const tableName of tableNames) {
      try {
        const data = await DatabaseService.fetchTableData(tableName);
        if (data.length === 0) { zip.file(`${tableName}.csv`, 'No data available'); continue; }
        zip.file(`${tableName}.csv`, DatabaseService.convertToCSV(data));
      } catch (tableError) {
        zip.file(`${tableName}_ERROR.txt`, `Error exporting table: ${tableError}`);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    try {
      await prisma.auditLog.create({
        data: { action: 'DATABASE_EXPORT', keterangan: `Exported ${tableNames.length} tables: ${tableNames.join(', ')}`, userId: user.id, ipAddress: ipAddress || null, userAgent: userAgent || null, module: 'DATABASE' }
      });
    } catch { /* Don't fail export if audit log fails */ }

    return { buffer: zipBuffer, filename: `database_backup_${exportTimestamp}.zip` };
  }

  static async importFromZip(file: File, user: AuthUser, ipAddress?: string | null, userAgent?: string | null) {
    if (!file) throw new DatabaseServiceError('No file provided', 400);
    if (!file.name.endsWith('.zip')) throw new DatabaseServiceError('Only ZIP files are supported', 400);

    const buffer = await file.arrayBuffer();
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(buffer);

    const metadataFile = zipContent.file('metadata.json');
    if (!metadataFile) throw new DatabaseServiceError('Invalid backup file: missing metadata', 400);
    const metadata = JSON.parse(await metadataFile.async('text'));

    let totalRecordsImported = 0;
    const importResults: Record<string, unknown>[] = [];

    for (const [filename, csvFile] of Object.entries(zipContent.files)) {
      if (!filename.endsWith('.csv')) continue;
      const tableName = filename.replace('.csv', '');
      try {
        const csvContent = await csvFile.async('text');
        const records = DatabaseService.parseCSV(csvContent);
        if (records.length === 0) continue;
        const importedCount = await DatabaseService.importTableData(tableName, records);
        totalRecordsImported += importedCount;
        importResults.push({ table: tableName, recordsImported: importedCount, status: 'success' });
      } catch (tableError) {
        importResults.push({ table: tableName, recordsImported: 0, status: 'error', error: String(tableError) });
      }
    }

    try {
      await prisma.auditLog.create({
        data: { action: 'DATABASE_IMPORT', keterangan: `Imported ${totalRecordsImported} records from ${importResults.length} tables`, userId: user.id, ipAddress: ipAddress || null, userAgent: userAgent || null, module: 'DATABASE' }
      });
    } catch { /* Don't fail import if audit log fails */ }

    return { message: 'Import completed', recordsImported: totalRecordsImported, results: importResults };
  }

  static async getBackupHistory() {
    const backupLogs = await prisma.auditLog.findMany({
      where: { action: { in: ['DATABASE_EXPORT', 'DATABASE_IMPORT'] } },
      include: { user: { select: { namaLengkap: true, username: true } } },
      orderBy: { tanggal: 'desc' }, take: 20
    });

    return {
      history: backupLogs.map((log: any) => {
        const isExport = log.action === 'DATABASE_EXPORT';
        const tables = DatabaseService.extractTablesFromKeterangan(log.keterangan || '');
        return {
          id: log.id.toString(), timestamp: log.tanggal.toISOString(), type: tables.length > 10 ? 'full' : 'partial',
          tables, size: DatabaseService.estimateBackupSize(tables.length), status: 'success',
          action: isExport ? 'export' : 'import', user: log.user?.namaLengkap || 'System'
        };
      }),
      total: backupLogs.length
    };
  }

  static async getBackupStats() {
    const backups = await prisma.auditLog.findMany({ where: { action: 'BACKUP' }, orderBy: { tanggal: 'desc' }, take: 20 });
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

    let dbSize = 'Unknown';
    try {
      const result = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
      if (Array.isArray(result) && result.length > 0) dbSize = (result[0] as any).size;
    } catch { dbSize = '-'; }

    return {
      backups: backups.map(b => ({ id: b.id, namaFile: b.keterangan, tanggal: b.tanggal.toISOString() })),
      stats: { dbSize, memoryUsage: usedMemPercent, totalBackups: backups.length, lastBackup: backups.length > 0 ? backups[0].tanggal.toISOString() : null }
    };
  }

  static async createBackup(user: AuthUser, ipAddress?: string | null, userAgent?: string | null) {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const namaFile = `backup_${timestamp}.sql`;

    const backup = await prisma.auditLog.create({
      data: { action: 'BACKUP', keterangan: namaFile, userId: user.id, ipAddress: ipAddress || null, userAgent: userAgent || null, module: 'BACKUP' }
    });

    return { backup: { id: backup.id, namaFile: backup.keterangan, tanggal: backup.tanggal.toISOString() } };
  }

  private static async fetchTableData(tableName: string): Promise<Record<string, unknown>[]> {
    const selectWithInclude: Record<string, () => Promise<Record<string, unknown>[]>> = {
      User: () => prisma.user.findMany({ select: { id: true, username: true, namaLengkap: true, email: true, noTlp: true, alamat: true, foto: true, roleId: true, createdAt: true, updatedAt: true, role: true } }),
      Role: () => prisma.role.findMany(),
      Halaqah: () => prisma.halaqah.findMany({ include: { guru: true } }),
      HalaqahSantri: () => prisma.halaqahSantri.findMany({ include: { halaqah: true, santri: true } }),
      Hafalan: () => prisma.hafalan.findMany({ include: { santri: true } }),
      TargetHafalan: () => prisma.targetHafalan.findMany({ include: { santri: true } }),
      Absensi: () => prisma.absensi.findMany({ include: { santri: true } }),
      Prestasi: () => prisma.prestasi.findMany({ include: { santri: true } }),
      UjianSantri: () => prisma.ujianSantri.findMany({ include: { santri: true, templateUjian: true, creator: true, verifikator: true, guru: true } }),
      Pengumuman: () => prisma.pengumuman.findMany({ include: { creator: true } }),
      PengumumanRead: () => prisma.pengumumanRead.findMany({ include: { user: true, pengumuman: true } }),
      OrangTuaSantri: () => prisma.orangTuaSantri.findMany({ include: { orangTua: true, santri: true } }),
      Jadwal: () => prisma.jadwal.findMany({ include: { halaqah: true } }),
      Notifikasi: () => prisma.notifikasi.findMany({ include: { user: true } }),
      AuditLog: () => prisma.auditLog.findMany({ include: { user: true } }),
      ForgotPasscode: () => prisma.forgotPasscode.findMany({ include: { user: true } }),
      TahunAjaran: () => prisma.tahunAjaran.findMany({ include: { creator: true } }),
      TemplateUjian: () => prisma.templateUjian.findMany({ include: { creator: true } }),
      TemplateRaport: () => prisma.templateRaport.findMany({ include: { creator: true } }),
      RaportSantri: () => prisma.raportSantri.findMany({ include: { santri: true, creator: true } }),
      JenisUjian: () => prisma.jenisUjian.findMany({ include: { creator: true } }),
      KomponenPenilaian: () => prisma.komponenPenilaian.findMany({ include: { templateUjian: true, jenisUjian: true } }),
      GuruPermission: () => prisma.guruPermission.findMany({ include: { guru: true, halaqah: true } }),
    };

    const fetcher = selectWithInclude[tableName];
    if (!fetcher) { console.warn(`Unknown table: ${tableName}`); return []; }
    return fetcher() as Promise<Record<string, unknown>[]>;
  }

  private static async importTableData(tableName: string, records: any[]): Promise<number> {
    switch (tableName) {
      case 'Role':
        await prisma.role.deleteMany({ where: { name: { notIn: ['super_admin', 'guru', 'santri', 'ortu', 'yayasan'] } } });
        for (const record of records) {
          await prisma.role.upsert({ where: { name: record.name as string }, update: {}, create: { name: record.name as string } });
        }
        return records.length;
      case 'User':
        console.log('Skipping User table import to avoid conflicts');
        return 0;
      case 'Halaqah':
        await prisma.halaqah.deleteMany();
        for (const record of records) {
          await prisma.halaqah.create({ data: { namaHalaqah: record.namaHalaqah, guruId: record.guruId || null } });
        }
        return records.length;
      case 'AuditLog': {
        let importedLogs = 0;
        for (const record of records) {
          try {
            if (record.userId) {
              const userExists = await prisma.user.findUnique({ where: { id: record.userId } });
              if (userExists) {
                await prisma.auditLog.create({ data: { action: record.action, keterangan: record.keterangan, userId: record.userId, tanggal: record.createdAt ? new Date(record.createdAt) : new Date() } });
                importedLogs++;
              }
            }
          } catch { /* continue */ }
        }
        return importedLogs;
      }
      default:
        console.log(`Import not implemented for table: ${tableName}`);
        return 0;
    }
  }

  private static convertToCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';
    const allKeys = new Set<string>();
    data.forEach(item => Object.keys(DatabaseService.flattenObject(item)).forEach(key => allKeys.add(key)));
    const headers = Array.from(allKeys);
    const csvRows = [headers.join(',')];
    data.forEach(item => {
      const flatItem = DatabaseService.flattenObject(item);
      csvRows.push(headers.map(header => {
        const value = flatItem[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') { const escaped = value.replace(/"/g, '""'); return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') ? `"${escaped}"` : escaped; }
        return String(value);
      }).join(','));
    });
    return csvRows.join('\n');
  }

  private static flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const flattened: Record<string, unknown> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) Object.assign(flattened, DatabaseService.flattenObject(value as Record<string, unknown>, newKey));
        else if (Array.isArray(value)) flattened[newKey] = JSON.stringify(value);
        else if (value instanceof Date) flattened[newKey] = value.toISOString();
        else flattened[newKey] = value;
      }
    }
    return flattened;
  }

  private static parseCSV(csvContent: string): Record<string, unknown>[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const records: Record<string, unknown>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = DatabaseService.parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;
      const record: Record<string, unknown> = {};
      headers.forEach((header, index) => { record[header] = DatabaseService.parseValue(values[index]); });
      records.push(DatabaseService.unflattenObject(record));
    }
    return records;
  }

  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') { if (inQuotes && line[i + 1] === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; } }
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += char; }
    }
    values.push(current.trim());
    return values;
  }

  private static parseValue(value: string): unknown {
    if (value === '' || value === 'null' || value === 'undefined') return null;
    if (/^\d+$/.test(value)) return parseInt(value);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return new Date(value);
    if (value.startsWith('[') && value.endsWith(']')) { try { return JSON.parse(value); } catch { return value; } }
    return value;
  }

  private static unflattenObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      const keys = key.split('.');
      let current = result;
      for (let i = 0; i < keys.length - 1; i++) { if (!current[keys[i]]) current[keys[i]] = {}; current = current[keys[i]] as any; }
      current[keys[keys.length - 1]] = obj[key];
    }
    return result;
  }

  private static extractTablesFromKeterangan(keterangan: string): string[] {
    const match = keterangan.match(/tables?:\s*(.+)$/i);
    return match ? match[1].split(',').map(t => t.trim()) : [];
  }

  private static estimateBackupSize(tableCount: number): string {
    if (tableCount <= 5) return '< 1 MB';
    if (tableCount <= 10) return '1-5 MB';
    if (tableCount <= 20) return '5-10 MB';
    return '> 10 MB';
  }
}

export class DatabaseServiceError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'DatabaseServiceError';
  }
}
