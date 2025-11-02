import { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';
import { handleApiError, success } from '@/lib/api-response';
import { FraudDetectionService } from '@/services/fraud-detection.service';

// POST /api/fraud/scan - Scan recent expenses for fraud
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    const body = await request.json();
    const days = body.days || 7;

    const result = await FraudDetectionService.analyzRecentExpenses(user.id, days);

    return success(result);
  } catch (error) {
    return handleApiError(error);
  }
}
