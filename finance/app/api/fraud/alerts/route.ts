import { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';
import { handleApiError, success } from '@/lib/api-response';
import { FraudDetectionService } from '@/services/fraud-detection.service';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit();

// GET /api/fraud/alerts - Get fraud alerts
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const alerts = await FraudDetectionService.getFraudAlerts(user.id, status);

    return success(alerts);
  } catch (error) {
    return handleApiError(error);
  }
}
