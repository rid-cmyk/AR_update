import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-helpers';
import { TemplateRaportService, TemplateRaportServiceError } from '@/lib/services/template-raport.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const exportData = await TemplateRaportService.exportAsJson(user, parseInt(id));

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="template-raport-${id}.json"`
      }
    });
  } catch (error: any) {
    if (error instanceof TemplateRaportServiceError) return NextResponse.json({ error: error.message }, { status: error.statusCode });
    console.error('Error exporting template raport:', error);
    return NextResponse.json({ error: 'Gagal mengekspor template raport' }, { status: 500 });
  }
}
