import prisma from '@/lib/prisma';
import { NextResponse } from "next/server";
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import * as Sentry from '@sentry/nextjs';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: { tanggalBackup: 'desc' },
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error("GET /api/backups error:", error);
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to fetch backups" }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Automated backup using pg_dump
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.sql`;
    const backupPath = path.join(process.cwd(), 'backups', fileName);

    // Ensure backups directory exists
    await execAsync(`mkdir -p ${path.dirname(backupPath)}`);

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
        action: 'BACKUP_CREATED',
        keterangan: `Database backup created: ${fileName}`,
        userId: 1, // Assuming super-admin user ID
      }
    });

    return NextResponse.json({
      backup,
      message: "Backup created successfully"
    });
  } catch (error) {
    console.error("POST /api/backups error:", error);
    Sentry.captureException(error);
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 });
  }
}