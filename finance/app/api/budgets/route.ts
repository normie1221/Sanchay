import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { createBudgetSchema } from '@/lib/validations';
import { handleApiError, success } from '@/lib/api-response';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ maxRequests: 100 });

// GET /api/budgets - Get all budgets for user
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const period = searchParams.get('period');
    const active = searchParams.get('active');

    const where: any = { userId: user.id };

    if (category) {
      where.category = category;
    }

    if (period) {
      where.period = period;
    }

    // Filter active budgets
    if (active === 'true') {
      const now = new Date();
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    }

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate budget utilization
    const budgetsWithStats = budgets.map((budget: any) => ({
      ...budget,
      utilization: budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0,
      remaining: budget.limit - budget.spent,
      isOverBudget: budget.spent > budget.limit,
      shouldAlert: budget.spent >= (budget.limit * budget.alertThreshold) / 100,
    }));

    return success(budgetsWithStats);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/budgets - Create new budget
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const body = await request.json();
    const validatedData = createBudgetSchema.parse(body);

    const budget = await prisma.budget.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        userId: user.id,
      },
    });

    return success(budget, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
