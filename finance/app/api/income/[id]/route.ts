import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { updateIncomeSchema } from '@/lib/validations';
import { handleApiError, success, error } from '@/lib/api-response';

// GET /api/income/[id] - Get specific income
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const income = await prisma.income.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!income) {
      return error('Income not found', 404);
    }

    return success(income);
  } catch (err) {
    return handleApiError(err);
  }
}

// PATCH /api/income/[id] - Update income
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateIncomeSchema.parse(body);

    // Verify ownership
    const existingIncome = await prisma.income.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingIncome) {
      return error('Income not found', 404);
    }

    const updateData: any = { ...validatedData };
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }

    const income = await prisma.income.update({
      where: { id },
      data: updateData,
    });

    return success(income);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/income/[id] - Delete income
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    // Verify ownership
    const existingIncome = await prisma.income.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingIncome) {
      return error('Income not found', 404);
    }

    await prisma.income.delete({
      where: { id },
    });

    return success({ message: 'Income deleted successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}
