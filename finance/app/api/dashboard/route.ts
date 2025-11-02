import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { handleApiError, success } from '@/lib/api-response';
import { getDateRange } from '@/lib/utils';

// GET /api/dashboard - Get dashboard overview
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    
    const { start, end } = getDateRange(period as any);

    // Fetch all data in parallel
    const [
      incomes,
      expenses,
      budgets,
      goals,
      recentAlerts,
      totalGoals,
    ] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId: user.id,
          date: { gte: start, lte: end },
        },
      }),
      prisma.expense.findMany({
        where: {
          userId: user.id,
          date: { gte: start, lte: end },
        },
      }),
      prisma.budget.findMany({
        where: {
          userId: user.id,
          startDate: { lte: end },
          endDate: { gte: start },
        },
      }),
      prisma.financialGoal.findMany({
        where: {
          userId: user.id,
          status: 'IN_PROGRESS',
        },
      }),
      prisma.fraudAlert.findMany({
        where: {
          userId: user.id,
          status: 'PENDING',
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.financialGoal.count({
        where: { userId: user.id },
      }),
    ]);

    const totalIncome = incomes.reduce((sum: number, i: any) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Calculate budget status
    const budgetStatus = budgets.map((b: any) => ({
      id: b.id,
      category: b.category,
      limit: b.limit,
      spent: b.spent,
      remaining: b.limit - b.spent,
      utilization: b.limit > 0 ? (b.spent / b.limit) * 100 : 0,
      isOverBudget: b.spent > b.limit,
    }));

    // Calculate goal progress
    const goalProgress = goals.map((g: any) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      progress: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0,
      remaining: g.targetAmount - g.currentAmount,
    }));

    // Recent transactions
    const recentExpenses = expenses
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return success({
      overview: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netSavings: Math.round(netSavings * 100) / 100,
        savingsRate: Math.round(savingsRate * 100) / 100,
      },
      budgets: budgetStatus,
      goals: goalProgress,
      recentTransactions: recentExpenses,
      alerts: recentAlerts,
      stats: {
        totalBudgets: budgets.length,
        activeBudgets: budgets.filter((b: any) => new Date(b.endDate) >= new Date()).length,
        totalGoals,
        activeGoals: goals.length,
        pendingAlerts: recentAlerts.length,
      },
      period: {
        start,
        end,
        type: period,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
