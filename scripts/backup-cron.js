const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function createBackup() {
  try {
    console.log('Starting automated backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-auto-${timestamp}.sql`;
    const backupPath = path.join(process.cwd(), 'backups', fileName);

    // Ensure backups directory exists
    await fs.promises.mkdir(path.dirname(backupPath), { recursive: true });

    // Run pg_dump
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    const dumpCommand = `pg_dump "${dbUrl}" > "${backupPath}"`;
    await execAsync(dumpCommand);

    // Save backup record to DB
    const backup = await prisma.backup.create({
      data: {
        namaFile: fileName,
      },
    });

    // Log backup creation
    await prisma.auditLog.create({
      data: {
        action: 'AUTO_BACKUP_CREATED',
        keterangan: `Automated database backup created: ${fileName}`,
        userId: 1, // System user
      }
    });

    console.log(`Backup created successfully: ${fileName}`);

    // Clean up old backups (keep last 30)
    await cleanupOldBackups();

  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupOldBackups() {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: { tanggalBackup: 'desc' },
      take: 31, // Get 31 to check if we have more than 30
    });

    if (backups.length > 30) {
      const toDelete = backups.slice(30); // Keep first 30, delete the rest

      for (const backup of toDelete) {
        // Delete file
        const filePath = path.join(process.cwd(), 'backups', backup.namaFile);
        try {
          await fs.promises.unlink(filePath);
        } catch (fileError) {
          console.warn(`Could not delete file ${backup.namaFile}:`, fileError);
        }

        // Delete database record
        await prisma.backup.delete({
          where: { id: backup.id }
        });

        console.log(`Cleaned up old backup: ${backup.namaFile}`);
      }
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Run backup if called directly
if (require.main === module) {
  createBackup();
}

module.exports = { createBackup };