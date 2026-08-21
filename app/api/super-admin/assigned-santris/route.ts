import { ApiResponse, withAuth } from '@/lib/api-helpers';
import { UserService, UserServiceError } from '@/lib/services/user.service';

export async function GET(request: Request) {
  try {
    const { user, error } = await withAuth(request, ['super_admin']);
    if (error || !user) return ApiResponse.unauthorized(error || undefined);

    const data = await UserService.getAllAssignedSantriIds(user);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof UserServiceError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.serverError('Failed to fetch assigned santris');
  }
}
