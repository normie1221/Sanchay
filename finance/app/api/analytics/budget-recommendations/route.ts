import { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';
import { handleApiError, success } from '@/lib/api-response';
import { BudgetPlanningService } from '@/services/budget-planning.service';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit();

// GET /api/analytics/budget-recommendations - Get AI budget recommendations
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'MONTHLY') as 'MONTHLY' | 'WEEKLY' | 'QUARTERLY';

    const recommendations = await BudgetPlanningService.generateBudgetRecommendations(user.id, period);

    return success(recommendations);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/analytics/budget-recommendations - Create AI budgets
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const result = await BudgetPlanningService.createAIBudgets(user.id);

    return success(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
