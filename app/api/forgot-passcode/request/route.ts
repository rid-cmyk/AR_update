import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from '@/lib/api-helpers';
import { ForgotPasscodeService, ForgotPasscodeServiceError } from "@/lib/services/forgot-passcode.service";

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = (request.headers.get("x-forwarded-for") || "").split(",").map((p) => p.trim()).filter(Boolean);
  return forwardedFor.length > 0 ? forwardedFor[forwardedFor.length - 1] : request.headers.get("x-real-ip") || "unknown";
};

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();
    const result = await ForgotPasscodeService.resetPasscode(phoneNumber, message, getClientIp(request));
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof ForgotPasscodeServiceError) {
      if (error.statusCode === 429) {
        return NextResponse.json({ error: 'Terlalu banyak permintaan.', message: error.message }, { status: 429 });
      }
      return ApiResponse.error(error.message, error.statusCode);
    }
    console.error('Error creating forgot passcode request:', error);
    return ApiResponse.error('Gagal memproses permintaan. Silakan coba lagi.', 500);
  }
}
