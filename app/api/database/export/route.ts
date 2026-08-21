import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@/lib/api-helpers';
import { DatabaseService, DatabaseServiceError } from '@/lib/services/database.service';

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await withAuth(request, ['super_admin']);
    if (authError || !user) return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    const { tables } = await request.json();
    const result = await DatabaseService.exportTables(tables, user, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip'), request.headers.get('user-agent'));
    return new NextResponse(result.buffer as any, { headers: { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${result.filename}"` } });
  } catch (error) {
    if (error instanceof DatabaseServiceError) return NextResponse.json({ error: error.message }, { status: error.statusCode });
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export database' }, { status: 500 });
  }
}
