import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import JSZip from 'jszip';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Only ZIP files are supported' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(buffer);
    
    // Check for metadata file
    const metadataFile = zipContent.file('metadata.json');
    if (!metadataFile) {
      return NextResponse.json(
        { error: 'Invalid backup file: missing metadata' },
        { status: 400 }
      );
    }

    const metadata = JSON.parse(await metadataFile.async('text'));
    console.log('Import metadata:', metadata);

    let totalRecordsImported = 0;
    const importResults: any[] = [];

    // Process each CSV file in the ZIP
    for (const [filename, file] of Object.entries(zipContent.files)) {
      if (!filename.endsWith('.csv')) continue;
      
      const tableName = filename.replace('.csv', '');
      console.log(`Importing table: ${tableName}`);
      
      try {
        const csvContent = await file.async('text');
        const records = parseCSV(csvContent);
        
        if (records.length === 0) {
          console.log(`No records to import for ${tableName}`);
          continue;
        }

        // Import records based on table name
        const importedCount = await importTableData(tableName, records);
        totalRecordsImported += importedCount;
        
        importResults.push({
          table: tableName,
          recordsImported: importedCount,
          status: 'success'
        });
        
        console.log(`Imported ${importedCount} records to ${tableName}`);
        
      } catch (tableError) {
        console.error(`Error importing table ${tableName}:`, tableError);
        importResults.push({
          table: tableName,
          recordsImported: 0,
          status: 'error',
          error: String(tableError)
        });
      }
    }

    // Log the import activity
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
              action: 'DATABASE_IMPORT',
              keterangan: `Imported ${totalRecordsImported} records from ${importResults.length} tables`,
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
      // Don't fail the import if audit log fails
    }

    return NextResponse.json({
      message: 'Import completed',
      recordsImported: totalRecordsImported,
      results: importResults
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: `Failed to import database: ${error}` },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV content
function parseCSV(csvContent: string): any[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const records: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const record: any = {};
    headers.forEach((header, index) => {
      const value = values[index];
      record[header] = parseValue(value);
    });

    records.push(unflattenObject(record));
  }

  return records;
}

// Helper function to parse a CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

// Helper function to parse individual values
function parseValue(value: string): any {
  if (value === '' || value === 'null' || value === 'undefined') return null;
  
  // Try to parse as number
  if (/^\d+$/.test(value)) return parseInt(value);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  
  // Try to parse as boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Try to parse as date
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  
  // Try to parse as JSON array
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  
  return value;
}

// Helper function to unflatten objects
function unflattenObject(obj: any): any {
  const result: any = {};
  
  for (const key in obj) {
    const keys = key.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = obj[key];
  }
  
  return result;
}

// Helper function to import data to specific tables
async function importTableData(tableName: string, records: any[]): Promise<number> {
  // Note: This is a simplified import that only handles basic cases
  // In a production system, you'd want more sophisticated handling
  // including foreign key relationships, data validation, etc.
  
  try {
    switch (tableName) {
      case 'Role':
        // Clear existing roles (except core ones)
        await prisma.role.deleteMany({
          where: {
            name: {
              notIn: ['super_admin', 'admin', 'guru', 'santri', 'ortu', 'yayasan']
            }
          }
        });
        
        // Import new roles
        for (const record of records) {
          await prisma.role.upsert({
            where: { name: record.name },
            update: {},
            create: {
              name: record.name
            }
          });
        }
        return records.length;

      case 'User':
        // This is more complex due to relationships
        // For now, we'll skip user import to avoid conflicts
        console.log('Skipping User table import to avoid conflicts');
        return 0;

      case 'Halaqah':
        await prisma.halaqah.deleteMany();
        for (const record of records) {
          await prisma.halaqah.create({
            data: {
              namaHalaqah: record.namaHalaqah,
              guruId: record.guruId || null
            }
          });
        }
        return records.length;

      case 'AuditLog':
        // Import audit logs (skip if userId doesn't exist)
        let importedLogs = 0;
        for (const record of records) {
          try {
            // Check if user exists before creating audit log
            if (record.userId) {
              const userExists = await prisma.user.findUnique({
                where: { id: record.userId }
              });
              
              if (userExists) {
                await prisma.auditLog.create({
                  data: {
                    action: record.action,
                    keterangan: record.keterangan,
                    userId: record.userId,
                    createdAt: record.createdAt ? new Date(record.createdAt) : new Date()
                  }
                });
                importedLogs++;
              } else {
                console.log(`Skipping audit log: user ${record.userId} not found`);
              }
            }
          } catch (logError) {
            console.error('Error importing audit log:', logError);
            // Continue with next record
          }
        }
        return importedLogs;

      default:
        console.log(`Import not implemented for table: ${tableName}`);
        return 0;
    }
  } catch (error) {
    console.error(`Error importing ${tableName}:`, error);
    throw error;
  }
}