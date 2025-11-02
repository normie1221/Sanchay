import { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';
import { handleApiError, success } from '@/lib/api-response';
import { ExpensePredictionService } from '@/services/expense-prediction.service';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit();

// GET /api/analytics/predictions - Get expense predictions
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'next-month';

    let predictions;

    switch (type) {
      case 'next-month':
        predictions = await ExpensePredictionService.predictNextMonthExpenses(user.id);
        break;
      case 'recurring':
        predictions = await ExpensePredictionService.predictRecurringExpenses(user.id);
        break;
      case 'upcoming-bills':
        const days = parseInt(searchParams.get('days') || '30');
        predictions = await ExpensePredictionService.predictUpcomingBills(user.id, days);
        break;
      default:
        predictions = await ExpensePredictionService.predictNextMonthExpenses(user.id);
    }

    return success(predictions);
  } catch (error) {
    return handleApiError(error);
  }
}
