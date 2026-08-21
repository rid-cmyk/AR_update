import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { UserService, UserServiceError } from '@/lib/services/user.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const { searchParams } = new URL(request.url);
    const halaqahId = searchParams.get('halaqahId');
    if (!halaqahId) return ApiResponse.error('halaqahId is required', 400);

    const data = await UserService.listAvailable(user, parseInt(halaqahId));
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof UserServiceError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.serverError('Failed to fetch available santri');
  }
}
