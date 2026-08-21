import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { DatabaseService, DatabaseServiceError } from '@/lib/services/database.service';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    const result = await DatabaseService.getBackupHistory();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DatabaseServiceError) return NextResponse.json({ error: error.message }, { status: error.statusCode });
    console.error('Error fetching backup history:', error);
    return NextResponse.json({ error: 'Failed to fetch backup history' }, { status: 500 });
  }
}
