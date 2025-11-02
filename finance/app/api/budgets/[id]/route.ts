import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { updateBudgetSchema } from '@/lib/validations';
import { handleApiError, success, error } from '@/lib/api-response';

// GET /api/budgets/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const budget = await prisma.budget.findFirst({
      where: { id, userId: user.id },
    });

    if (!budget) {
      return error('Budget not found', 404);
    }

    return success(budget);
  } catch (err) {
    return handleApiError(err);
  }
}

// PATCH /api/budgets/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateBudgetSchema.parse(body);

    const existingBudget = await prisma.budget.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingBudget) {
      return error('Budget not found', 404);
    }

    const updateData: any = { ...validatedData };
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: updateData,
    });

    return success(budget);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/budgets/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const existingBudget = await prisma.budget.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingBudget) {
      return error('Budget not found', 404);
    }

    await prisma.budget.delete({
      where: { id },
    });

    return success({ message: 'Budget deleted successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}
