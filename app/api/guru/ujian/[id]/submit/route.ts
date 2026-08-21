import { NextRequest } from 'next/server'
import { ApiResponse, withAuth } from "@/lib/api-helpers"
import { UjianService } from '@/lib/services/ujian.service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await withAuth(request, ['guru'])
    if (!user || error) return ApiResponse.unauthorized()

    const { id } = await params
    let body: any = {};
    try { body = await request.json(); } catch {}

    const ujian = await UjianService.submit(parseInt(id), user, body)
    return ApiResponse.success(ujian)
  } catch (err: any) {
    console.error('Error submitting ujian:', err)
    if (err.requireRemedialDecision) {
      return new Response(JSON.stringify({
        error: err.message,
        requireRemedialDecision: true,
        juzRemedialList: err.juzRemedialList,
        kkm: err.kkm,
      }), { status: 422, headers: { 'Content-Type': 'application/json' } });
    }
    return ApiResponse.serverError()
  }
}
