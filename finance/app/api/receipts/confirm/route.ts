import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { success, error } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/receipts/confirm
 * Confirm and save receipt data to expenses
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return error('Unauthorized', 401);
    }

    const body = await req.json();
    const { amount, category, merchant, description, date } = body;

    // Validate required fields
    if (!amount || !category) {
      return error('Amount and category are required', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return error('User not found', 404);
    }

    // Create expense from receipt data
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        category: category,
        merchant: merchant || 'Unknown',
        description: description || '',
        date: date ? new Date(date) : new Date(),
        paymentMethod: 'CASH',
      },
    });

    return success({
      expense,
      message: 'Receipt confirmed and expense created successfully',
    });
  } catch (err) {
    console.error('Error confirming receipt:', err);
    return error('Failed to confirm receipt', 500);
  }
}
