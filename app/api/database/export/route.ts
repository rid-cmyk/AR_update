import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import JSZip from 'jszip';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function POST(request: NextRequest) {
  try {
    const { tables } = await request.json();
    
    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json(
        { error: 'No tables specified for export' },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    const exportTimestamp = new Date().toISOString().split('T')[0];
    
    // Create metadata file
    const metadata = {
      exportDate: new Date().toISOString(),
      tables: tables,
      version: '1.0',
      source: 'AR-Hafalan System'
    };
    
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // Export each table
    for (const tableName of tables) {
      try {
        console.log(`Exporting table: ${tableName}`);
        
        let data: any[] = [];
        
        // Get data based on table name using Prisma models
        switch (tableName) {
          case 'User':
            data = await prisma.user.findMany({
              include: {
                role: true
              }
            });
            break;
          case 'Role':
            data = await prisma.role.findMany();
            break;
          case 'Halaqah':
            data = await prisma.halaqah.findMany({
              include: {
                guru: true
              }
            });
            break;
          case 'HalaqahSantri':
            data = await prisma.halaqahSantri.findMany({
              include: {
                halaqah: true,
                santri: true
              }
            });
            break;
          case 'Hafalan':
            data = await prisma.hafalan.findMany({
              include: {
                santri: true
              }
            });
            break;
          case 'TargetHafalan':
            data = await prisma.targetHafalan.findMany({
              include: {
                santri: true
              }
            });
            break;
          case 'Absensi':
            data = await prisma.absensi.findMany({
              include: {
                santri: true
              }
            });
            break;
          case 'Prestasi':
            data = await prisma.prestasi.findMany({
              include: {
                santri: true
              }
            });
            break;
          case 'Ujian':
            data = await prisma.ujian.findMany({
              include: {
                halaqah: true
              }
            });
            break;
          case 'UjianSantri':
            data = await prisma.ujianSantri.findMany({
              include: {
                santri: true,
                ujian: true,
                createdBy: true,
                verifiedBy: true
              }
            });
            break;
          case 'Pengumuman':
            data = await prisma.pengumuman.findMany({
              include: {
                createdBy: true
              }
            });
            break;
          case 'PengumumanRead':
            data = await prisma.pengumumanRead.findMany({
              include: {
                user: true,
                pengumuman: true
              }
            });
            break;
          case 'OrangTuaSantri':
            data = await prisma.orangTuaSantri.findMany({
              include: {
                orangTua: true,
                santri: true
              }
            });
            break;
          case 'Jadwal':
            data = await prisma.jadwal.findMany({
              include: {
                halaqah: true
              }
            });
            break;
          case 'Notifikasi':
            data = await prisma.notifikasi.findMany({
              include: {
                user: true
              }
            });
            break;
          case 'AuditLog':
            data = await prisma.auditLog.findMany({
              include: {
                user: true
              }
            });
            break;
          case 'ForgotPasscode':
            data = await prisma.forgotPasscode.findMany({
              include: {
                user: true
              }
            });
            break;
          case 'TahunAjaran':
            data = await prisma.tahunAjaran.findMany({
              include: {
                createdBy: true
              }
            });
            break;
          case 'TemplateUjian':
            data = await prisma.templateUjian.findMany({
              include: {
                createdBy: true
              }
            });
            break;
          case 'TemplateRaport':
            data = await prisma.templateRaport.findMany({
              include: {
                createdBy: true
              }
            });
            break;
          case 'RaportSantri':
            data = await prisma.raportSantri.findMany({
              include: {
                santri: true,
                createdBy: true
              }
            });
            break;
          case 'JenisUjian':
            data = await prisma.jenisUjian.findMany({
              include: {
                createdBy: true
              }
            });
            break;
          case 'KomponenPenilaianJenis':
            data = await prisma.komponenPenilaianJenis.findMany({
              include: {
                jenisUjian: true,
                createdBy: true
              }
            });
            break;
          case 'UjianGuru':
            data = await prisma.ujianGuru.findMany({
              include: {
                santri: true,
                guru: true
              }
            });
            break;
          case 'GuruPermission':
            data = await prisma.guruPermission.findMany({
              include: {
                guru: true,
                halaqah: true
              }
            });
            break;
          default:
            console.warn(`Unknown table: ${tableName}`);
            continue;
        }

        if (data.length === 0) {
          console.log(`Table ${tableName} is empty, adding empty CSV...`);
          // Still create an empty CSV file to maintain structure
          zip.file(`${tableName}.csv`, 'No data available');
          continue;
        }

        // Convert to CSV format
        const csvContent = convertToCSV(data);
        zip.file(`${tableName}.csv`, csvContent);
        
        console.log(`Exported ${data.length} records from ${tableName}`);
        
      } catch (tableError) {
        console.error(`Error exporting table ${tableName}:`, tableError);
        // Continue with other tables even if one fails
        zip.file(`${tableName}_ERROR.txt`, `Error exporting table: ${tableError}`);
      }
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Log the export activity
    try {
      // Try to get user ID from request headers (set by middleware)
      let userId = null;
      const userIdHeader = request.headers.get('x-user-id');
      
      if (userIdHeader) {
        userId = parseInt(userIdHeader);
      } else {
        // Fallback: try to get from JWT token
        const token = request.cookies.get("auth_token")?.value;
        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            userId = decoded.id;
          } catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
          }
        }
      }
      
      if (userId) {
        // Verify user exists before creating audit log
        const userExists = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (userExists) {
          await prisma.auditLog.create({
            data: {
              action: 'DATABASE_EXPORT',
              keterangan: `Exported ${tables.length} tables: ${tables.join(', ')}`,
              userId: userId
            }
          });
        } else {
          console.log(`User ${userId} not found, skipping audit log`);
        }
      } else {
        console.log('No user ID available for audit log');
      }
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the export if audit log fails
    }

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="database_backup_${exportTimestamp}.zip"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export database' },
      { status: 500 }
    );
  }
}

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  // Get all unique keys from all objects (in case of nested objects)
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(flattenObject(item)).forEach(key => allKeys.add(key));
  });

  const headers = Array.from(allKeys);
  const csvRows = [headers.join(',')];

  data.forEach(item => {
    const flatItem = flattenObject(item);
    const row = headers.map(header => {
      const value = flatItem[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma or quote
        const escaped = value.replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
          ? `"${escaped}"` 
          : escaped;
      }
      return String(value);
    });
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// Helper function to flatten nested objects
function flattenObject(obj: any, prefix = ''): any {
  const flattened: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = JSON.stringify(value);
      } else if (value instanceof Date) {
        flattened[newKey] = value.toISOString();
      } else {
        flattened[newKey] = value;
      }
    }
  }
  
  return flattened;
}