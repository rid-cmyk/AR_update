import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get backup history from audit logs
    const backupLogs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['DATABASE_EXPORT', 'DATABASE_IMPORT']
        }
      },
      include: {
        user: {
          select: {
            namaLengkap: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Last 20 backup activities
    });

    const history = backupLogs.map(log => {
      const isExport = log.action === 'DATABASE_EXPORT';
      const tables = extractTablesFromKeterangan(log.keterangan);
      
      return {
        id: log.id.toString(),
        timestamp: log.createdAt.toISOString(),
        type: tables.length > 10 ? 'full' : 'partial',
        tables: tables,
        size: estimateBackupSize(tables.length),
        status: 'success', // Assuming all logged activities were successful
        action: isExport ? 'export' : 'import',
        user: log.user?.namaLengkap || 'System'
      };
    });

    return NextResponse.json({
      history,
      total: history.length
    });

  } catch (error) {
    console.error('Error fetching backup history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backup history' },
      { status: 500 }
    );
  }
}

// Helper function to extract table names from keterangan
function extractTablesFromKeterangan(keterangan: string): string[] {
  const match = keterangan.match(/tables?:\s*(.+)$/i);
  if (match) {
    return match[1].split(',').map(t => t.trim());
  }
  return [];
}

// Helper function to estimate backup size
function estimateBackupSize(tableCount: number): string {
  if (tableCount <= 5) return '< 1 MB';
  if (tableCount <= 10) return '1-5 MB';
  if (tableCount <= 20) return '5-10 MB';
  return '> 10 MB';
}