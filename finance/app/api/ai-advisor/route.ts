import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiAdvisorService } from '@/services/ai-advisor.service';
import { success, error } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { GoalStatus } from '@prisma/client';

/**
 * POST /api/ai-advisor
 * Get AI financial advice based on user query and financial data
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return error('Unauthorized', 401);
    }

    const body = await req.json();
    const { query, type = 'general' } = body;

    if (!query || typeof query !== 'string') {
      return error('Query is required', 400);
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return error('User not found', 404);
    }

    // Fetch goals
    const goals = await prisma.financialGoal.findMany({
      where: { 
        userId: user.id,
        status: GoalStatus.IN_PROGRESS 
      },
      orderBy: { priority: 'asc' },
      take: 1,
    });

    // Fetch budgets
    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    // Fetch incomes
    const incomes = await prisma.income.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Fetch expenses
    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Calculate financial data
    const currentGoal = goals[0] || {
      name: 'Financial Stability',
      targetAmount: 10000,
      currentAmount: 0,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };

    const totalBudget = budgets.reduce((sum: number, b) => sum + Number(b.limit), 0) || 3000;
    const monthlyIncome = incomes.reduce((sum: number, i) => sum + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((sum: number, e) => sum + Number(e.amount), 0);
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalExpenses) / monthlyIncome) * 100 : 0;

    const financialData = {
      currentGoal: {
        name: currentGoal.name,
        target: Number(currentGoal.targetAmount),
        current: Number(currentGoal.currentAmount),
        deadline: currentGoal.deadline?.toISOString().split('T')[0] || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      budget: totalBudget,
      monthlyIncome,
      totalExpenses,
      savingsRate,
    };

    // Get AI advice based on type
    let advice: string;
    
    switch (type) {
      case 'purchase':
        advice = await aiAdvisorService.analyzePurchase(query, financialData);
        break;
      case 'spending':
        const expenseData = expenses.map((e) => ({
          category: e.category,
          amount: Number(e.amount),
          date: e.date.toISOString(),
        }));
        advice = await aiAdvisorService.analyzeSpendingPatterns(expenseData, financialData);
        break;
      case 'budget':
        advice = await aiAdvisorService.getBudgetRecommendations(financialData);
        break;
      default:
        advice = await aiAdvisorService.getGeneralAdvice(query, financialData);
    }

    return success({
      advice,
      financialSummary: {
        goal: currentGoal.name,
        progress: `${((Number(currentGoal.currentAmount) / Number(currentGoal.targetAmount)) * 100).toFixed(1)}%`,
        monthlyIncome,
        totalExpenses,
        savingsRate: savingsRate.toFixed(1),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error in AI advisor API:', err);
    return error('Failed to generate advice', 500);
  }
}

/**
 * GET /api/ai-advisor
 * Get conversation history (if we implement it later)
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return error('Unauthorized', 401);
    }

    // For now, return empty history
    // In the future, we could store conversations in the database
    return success({
      history: [],
      message: 'Conversation history feature coming soon',
    });
  } catch (err) {
    console.error('Error fetching AI advisor history:', err);
    return error('Failed to fetch history', 500);
  }
}

