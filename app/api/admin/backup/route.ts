import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getAuthUser } from "@/lib/auth";
import os from "os";

export async function GET() {
  try {
    const { user, error } = await getAuthUser();
    if (error || !user || (user.role.name !== "admin" && user.role.name !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backups = await prisma.backup.findMany({
      orderBy: { tanggalBackup: "desc" },
      take: 20,
    });

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

    let dbSize = "Unknown";
    try {
      const result = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
      if (Array.isArray(result) && result.length > 0) {
        dbSize = (result[0] as any).size;
      }
    } catch {
      dbSize = "-";
    }

    return NextResponse.json({
      success: true,
      backups: backups.map((b) => ({
        id: b.id,
        namaFile: b.namaFile,
        tanggal: b.tanggalBackup.toISOString(),
      })),
      stats: {
        dbSize,
        memoryUsage: usedMemPercent,
        totalBackups: backups.length,
        lastBackup: backups.length > 0 ? backups[0].tanggalBackup.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Backup API error:", error);
    return NextResponse.json({ error: "Gagal memuat data backup" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { user, error } = await getAuthUser();
    if (error || !user || (user.role.name !== "admin" && user.role.name !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    const namaFile = `backup_${timestamp}.sql`;

    const backup = await prisma.backup.create({
      data: { namaFile },
    });

    return NextResponse.json({
      success: true,
      message: "Backup berhasil dibuat",
      backup: {
        id: backup.id,
        namaFile: backup.namaFile,
        tanggal: backup.tanggalBackup.toISOString(),
      },
    });
  } catch (error) {
    console.error("Backup create error:", error);
    return NextResponse.json({ error: "Gagal membuat backup" }, { status: 500 });
  }
}
