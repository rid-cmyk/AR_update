import { ApiResponse, withAuth } from "@/lib/api-helpers";
import { UserService } from '@/lib/services/user.service';

export async function POST(request: Request) {
  const { user, error } = await withAuth(request, ['super_admin']);
  if (!user || error) return ApiResponse.unauthorized(error || 'Unauthorized');
  try {
    const result = await UserService.refreshAssignments();
    return ApiResponse.success(result);
  } catch (error) {
    return ApiResponse.serverError('Failed to refresh assignments');
  }
}
