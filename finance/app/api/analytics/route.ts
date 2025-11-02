import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/auth';
import { handleApiError, success } from '@/lib/api-response';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

// GET /api/analytics - Get comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    // Get last 6 months of data for trends
    const sixMonthsAgo = subMonths(now, 5);
    
    // Fetch current month income and expenses
    const [currentIncomes, currentExpenses] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId: user.id,
          date: { gte: currentMonthStart, lte: currentMonthEnd }
        }
      }),
      prisma.expense.findMany({
        where: {
          userId: user.id,
          date: { gte: currentMonthStart, lte: currentMonthEnd }
        }
      })
    ]);

    // Fetch last 6 months expenses for trends
    const historicalExpenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        date: { gte: sixMonthsAgo, lte: now }
      },
      orderBy: { date: 'asc' }
    });

    const historicalIncomes = await prisma.income.findMany({
      where: {
        userId: user.id,
        date: { gte: sixMonthsAgo, lte: now }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate summary
    const totalIncome = currentIncomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Category breakdown
    const categoryMap = new Map<string, number>();
    currentExpenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });
    
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100
    })).sort((a, b) => b.amount - a.amount);

    // Monthly trend (last 6 months)
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    
    historicalIncomes.forEach(income => {
      const monthKey = format(new Date(income.date), 'MMM yyyy');
      const current = monthlyMap.get(monthKey) || { income: 0, expenses: 0 };
      current.income += income.amount;
      monthlyMap.set(monthKey, current);
    });

    historicalExpenses.forEach(expense => {
      const monthKey = format(new Date(expense.date), 'MMM yyyy');
      const current = monthlyMap.get(monthKey) || { income: 0, expenses: 0 };
      current.expenses += expense.amount;
      monthlyMap.set(monthKey, current);
    });

    const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: Math.round(data.income * 100) / 100,
      expenses: Math.round(data.expenses * 100) / 100
    }));

    // Top expenses
    const topExpenses = currentExpenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(expense => ({
        description: expense.description || expense.category,
        amount: Math.round(expense.amount * 100) / 100,
        category: expense.category
      }));

    return success({
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netSavings: Math.round(netSavings * 100) / 100,
        savingsRate: Math.round(savingsRate * 100) / 100
      },
      categoryBreakdown,
      monthlyTrend,
      topExpenses
    });
  } catch (error) {
    return handleApiError(error);
  }
}
