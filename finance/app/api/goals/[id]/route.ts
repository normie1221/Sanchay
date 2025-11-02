import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { updateGoalSchema } from '@/lib/validations';
import { handleApiError, success, error } from '@/lib/api-response';

// GET /api/goals/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const goal = await prisma.financialGoal.findFirst({
      where: { id, userId: user.id },
    });

    if (!goal) {
      return error('Goal not found', 404);
    }

    return success(goal);
  } catch (err) {
    return handleApiError(err);
  }
}

// PATCH /api/goals/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateGoalSchema.parse(body);

    const existingGoal = await prisma.financialGoal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingGoal) {
      return error('Goal not found', 404);
    }

    const updateData: any = { ...validatedData };
    if (validatedData.deadline) {
      updateData.deadline = new Date(validatedData.deadline);
    }

    const goal = await prisma.financialGoal.update({
      where: { id },
      data: updateData,
    });

    return success(goal);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/goals/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const existingGoal = await prisma.financialGoal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingGoal) {
      return error('Goal not found', 404);
    }

    await prisma.financialGoal.delete({
      where: { id },
    });

    return success({ message: 'Goal deleted successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}
