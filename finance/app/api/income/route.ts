import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { createIncomeSchema } from '@/lib/validations';
import { handleApiError, success } from '@/lib/api-response';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ maxRequests: 100 });

// GET /api/income - Get all income for user
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    // Rate limiting
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    const where: any = { userId: user.id };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (category) {
      where.category = category;
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return success(incomes);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/income - Create new income
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    // Rate limiting
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const body = await request.json();
    const validatedData = createIncomeSchema.parse(body);

    const income = await prisma.income.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        userId: user.id,
      },
    });

    return success(income, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
