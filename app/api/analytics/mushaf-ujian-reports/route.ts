import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: [],
      message: 'Mushaf ujian reports endpoint'
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
