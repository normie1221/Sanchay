import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { createExpenseSchema } from '@/lib/validations';
import { handleApiError, success } from '@/lib/api-response';
import { rateLimit } from '@/lib/rate-limit';
import { FraudDetectionService } from '@/services/fraud-detection.service';

const limiter = rateLimit({ maxRequests: 100 });

// GET /api/expenses - Get all expenses for user
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
    const isSuspicious = searchParams.get('isSuspicious');

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

    if (isSuspicious !== null && isSuspicious !== undefined) {
      where.isSuspicious = isSuspicious === 'true';
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return success(expenses);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/expenses - Create new expense
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    // Rate limiting
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const body = await request.json();
    const validatedData = createExpenseSchema.parse(body);

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        userId: user.id,
      },
    });

    // Trigger fraud detection analysis (async - don't wait for completion)
    FraudDetectionService.analyzeExpense(user.id, expense.id).catch(err => {
      console.error('Fraud detection failed:', err);
    });

    return success(expense, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
