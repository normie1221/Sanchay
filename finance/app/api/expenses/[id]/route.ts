import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { updateExpenseSchema } from '@/lib/validations';
import { handleApiError, success, error } from '@/lib/api-response';

// GET /api/expenses/[id] - Get specific expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!expense) {
      return error('Expense not found', 404);
    }

    return success(expense);
  } catch (err) {
    return handleApiError(err);
  }
}

// PATCH /api/expenses/[id] - Update expense
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);

    // Verify ownership
    const existingExpense = await prisma.expense.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingExpense) {
      return error('Expense not found', 404);
    }

    const updateData: any = { ...validatedData };
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    return success(expense);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/expenses/[id] - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    // Verify ownership
    const existingExpense = await prisma.expense.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingExpense) {
      return error('Expense not found', 404);
    }

    await prisma.expense.delete({
      where: { id },
    });

    return success({ message: 'Expense deleted successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}
