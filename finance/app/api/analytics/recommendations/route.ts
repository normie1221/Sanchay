import { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';
import { handleApiError, success } from '@/lib/api-response';
import { FinancialHealthService } from '@/services/financial-health.service';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit();

// GET /api/analytics/recommendations - Get personalized recommendations
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const recommendations = await FinancialHealthService.generateRecommendations(user.id);

    return success(recommendations);
  } catch (error) {
    return handleApiError(error);
  }
}
