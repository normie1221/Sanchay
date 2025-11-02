import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { createGoalSchema } from '@/lib/validations';
import { handleApiError, success } from '@/lib/api-response';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ maxRequests: 100 });

// GET /api/goals - Get all goals for user
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: any = { userId: user.id };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const goals = await prisma.financialGoal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return success(goals);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/goals - Create new goal
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const body = await request.json();
    const validatedData = createGoalSchema.parse(body);

    const goalData: any = {
      ...validatedData,
      userId: user.id,
    };

    if (validatedData.deadline) {
      goalData.deadline = new Date(validatedData.deadline);
    }

    const goal = await prisma.financialGoal.create({
      data: goalData,
    });

    return success(goal, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
