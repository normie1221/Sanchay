import { prisma } from '@/lib/prisma';
import { sum, average, calculatePercentage } from '@/lib/utils';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * AI Service for Financial Health Analysis
 * Analyzes user's overall financial condition
 */
export class FinancialHealthService {
  
  /**
   * Calculate comprehensive financial health score (0-100)
   */
  static async calculateHealthScore(userId: string) {
    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    // Get current month's data
    const [incomes, expenses, goals, budgets] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.financialGoal.findMany({
        where: { userId, status: 'IN_PROGRESS' },
      }),
      prisma.budget.findMany({
        where: {
          userId,
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      }),
    ]);

    const totalIncome = sum(incomes.map((i: any) => i.amount));
    const totalExpenses = sum(expenses.map((e: any) => e.amount));
    const savingsAmount = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

    // Scoring components (each out of 100)
    const scores = {
      // 1. Savings Rate Score (30% weight)
      savingsRate: Math.min(100, savingsRate * 3), // 33% savings = 100 score
      
      // 2. Budget Adherence Score (25% weight)
      budgetAdherence: this.calculateBudgetAdherence(budgets),
      
      // 3. Income Stability Score (20% weight)
      incomeStability: incomes.length > 0 ? 80 : 40, // Simplified
      
      // 4. Goal Progress Score (15% weight)
      goalProgress: this.calculateGoalProgress(goals),
      
      // 5. Emergency Fund Score (10% weight)
      emergencyFund: savingsAmount > (totalExpenses * 3) ? 100 : 
                     savingsAmount > (totalExpenses * 1) ? 60 : 30,
    };

    // Calculate weighted average
    const overallScore = Math.round(
      scores.savingsRate * 0.30 +
      scores.budgetAdherence * 0.25 +
      scores.incomeStability * 0.20 +
      scores.goalProgress * 0.15 +
      scores.emergencyFund * 0.10
    );

    const rating = overallScore >= 80 ? 'Excellent' :
                   overallScore >= 60 ? 'Good' :
                   overallScore >= 40 ? 'Fair' : 'Needs Improvement';

    return {
      overallScore,
      rating,
      breakdown: scores,
      insights: this.generateHealthInsights(scores, {
        totalIncome,
        totalExpenses,
        savingsAmount,
        savingsRate,
      }),
      metrics: {
        totalIncome,
        totalExpenses,
        savingsAmount,
        savingsRate: Math.round(savingsRate * 100) / 100,
      },
    };
  }

  /**
   * Calculate budget adherence score
   */
  private static calculateBudgetAdherence(budgets: any[]): number {
    if (budgets.length === 0) return 50; // Neutral score if no budgets

    const adherenceScores = budgets.map(budget => {
      const utilization = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
      
      // Optimal range is 70-95% utilization
      if (utilization >= 70 && utilization <= 95) return 100;
      if (utilization < 70) return 70 + utilization; // Under-utilization
      if (utilization > 95 && utilization <= 100) return 90;
      return Math.max(0, 100 - (utilization - 100)); // Over-budget penalty
    });

    return average(adherenceScores);
  }

  /**
   * Calculate goal progress score
   */
  private static calculateGoalProgress(goals: any[]): number {
    if (goals.length === 0) return 50;

    const progressScores = goals.map(goal => {
      const progress = goal.targetAmount > 0 
        ? (goal.currentAmount / goal.targetAmount) * 100 
        : 0;
      return Math.min(100, progress);
    });

    return average(progressScores);
  }

  /**
   * Generate actionable insights based on health scores
   */
  private static generateHealthInsights(scores: any, metrics: any): string[] {
    const insights: string[] = [];

    if (scores.savingsRate < 60) {
      insights.push(`Your savings rate is ${Math.round(metrics.savingsRate)}%. Try to save at least 20% of your income.`);
    }

    if (scores.budgetAdherence < 70) {
      insights.push('You\'re not adhering well to your budgets. Review and adjust your spending limits.');
    }

    if (scores.emergencyFund < 60) {
      insights.push('Build an emergency fund covering at least 3-6 months of expenses.');
    }

    if (metrics.savingsRate > 30) {
      insights.push('Great job! Your savings rate is above 30%. Keep up the good work!');
    }

    if (scores.goalProgress > 70) {
      insights.push('You\'re making excellent progress towards your financial goals!');
    }

    return insights;
  }

  /**
   * Analyze spending patterns
   */
  static async analyzeSpendingPatterns(userId: string) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: threeMonthsAgo },
      },
    });

    if (expenses.length === 0) {
      return {
        success: false,
        message: 'No expense data available',
      };
    }

    // Calculate category distribution
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((expense: any) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const totalSpent = sum(Object.values(categoryTotals));
    
    const distribution = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage: Math.round(calculatePercentage(amount, totalSpent) * 100) / 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Identify top spending categories
    const topCategories = distribution.slice(0, 3);
    
    return {
      success: true,
      distribution,
      topCategories,
      totalSpent: Math.round(totalSpent * 100) / 100,
      averageTransaction: Math.round((totalSpent / expenses.length) * 100) / 100,
      transactionCount: expenses.length,
    };
  }

  /**
   * Generate personalized financial recommendations
   */
  static async generateRecommendations(userId: string) {
    const healthScore = await this.calculateHealthScore(userId);
    const spendingPatterns = await this.analyzeSpendingPatterns(userId);
    const savingsInsights = await this.calculateSavingsOpportunities(userId);
    
    let recommendations: Array<{
      id: string;
      title: string;
      description: string;
      priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      category: string;
      impact: string;
      actionable: boolean;
      potentialSavings?: number;
      type: string;
    }> = [];

    // Based on health score
    if (healthScore.overallScore < 60) {
      recommendations.push({
        id: 'health-1',
        title: 'Improve Your Financial Health',
        description: 'Your financial health score is below average. Focus on increasing savings and reducing unnecessary expenses.',
        priority: 'HIGH',
        category: 'FINANCIAL_HEALTH',
        impact: 'HIGH',
        actionable: true,
        type: 'GENERAL',
      });
    }

    // Based on spending patterns
    if (spendingPatterns.success && spendingPatterns.topCategories) {
      const topCategory = spendingPatterns.topCategories[0];
      if (topCategory && topCategory.percentage > 40) {
        recommendations.push({
          id: 'spending-1',
          title: `High Spending in ${topCategory.category}`,
          description: `${topCategory.percentage}% of your spending is on ${topCategory.category}. Consider reducing expenses in this category by 10-15%.`,
          priority: 'MEDIUM',
          category: 'SPENDING',
          impact: 'MEDIUM',
          actionable: true,
          potentialSavings: topCategory.amount * 0.15,
          type: 'BEHAVIORAL_ANOMALY',
        });
      }
    }

    // Savings recommendation
    if (healthScore.metrics.savingsRate < 20) {
      const potentialIncrease = healthScore.metrics.totalIncome * 0.20 - healthScore.metrics.savingsAmount;
      recommendations.push({
        id: 'savings-1',
        title: 'Increase Your Savings Rate',
        description: `Your savings rate is ${Math.round(healthScore.metrics.savingsRate)}%. Aim to save at least 20% of your monthly income. Consider automating transfers to a savings account.`,
        priority: 'HIGH',
        category: 'SAVINGS',
        impact: 'HIGH',
        actionable: true,
        potentialSavings: potentialIncrease > 0 ? potentialIncrease : undefined,
        type: 'SAVINGS_OPPORTUNITY',
      });
    }

    // Emergency fund recommendation
    if (healthScore.breakdown.emergencyFund < 60) {
      const targetEmergencyFund = healthScore.metrics.totalExpenses * 3;
      const currentSavings = healthScore.metrics.savingsAmount;
      recommendations.push({
        id: 'emergency-1',
        title: 'Build Your Emergency Fund',
        description: `You should have 3-6 months of expenses (₹${targetEmergencyFund.toFixed(2)}) in an emergency fund. Start by setting aside 10% of your income monthly.`,
        priority: 'CRITICAL',
        category: 'SAVINGS',
        impact: 'CRITICAL',
        actionable: true,
        type: 'EMERGENCY_FUND',
      });
    }

    // Budget recommendation
    if (healthScore.breakdown.budgetAdherence < 70) {
      recommendations.push({
        id: 'budget-1',
        title: 'Improve Budget Adherence',
        description: 'Create realistic budgets for each spending category and track your expenses regularly. Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
        priority: 'MEDIUM',
        category: 'BUDGET',
        impact: 'MEDIUM',
        actionable: true,
        type: 'BEHAVIORAL_CHANGE',
      });
    }

    // Goal progress recommendation
    if (healthScore.breakdown.goalProgress < 50) {
      recommendations.push({
        id: 'goal-1',
        title: 'Accelerate Goal Progress',
        description: 'Your financial goals are progressing slowly. Review your goals and increase monthly contributions by redirecting money from discretionary spending.',
        priority: 'MEDIUM',
        category: 'INVESTMENT',
        impact: 'MEDIUM',
        actionable: true,
        type: 'GOAL_OPTIMIZATION',
      });
    }

    // Try to fetch external AI-powered recommendations if configured.
    let external: any = null;
    try {
      external = await this.fetchExternalRecommendations(userId, {
        healthScore: healthScore.overallScore,
        metrics: healthScore.metrics,
        spendingPatterns,
      });
    } catch (err) {
      console.error('Error fetching external recommendations:', err);
      external = null;
    }

    // If external recommendations are available, merge them
    if (external && Array.isArray(external.recommendations) && external.recommendations.length > 0) {
      const normalizedExternal = external.recommendations.map((r: any, idx: number) => ({
        id: `external-${idx}`,
        title: r.title || r.heading || 'Recommendation',
        description: r.description || r.body || r.text || '',
        priority: r.priority || 'LOW',
        category: r.category || 'EXTERNAL',
        impact: r.impact || 'LOW',
        actionable: r.actionable !== false,
        potentialSavings: r.potentialSavings,
        type: r.type || 'EXTERNAL',
      }));

      recommendations = [...normalizedExternal, ...recommendations];
    }

    return {
      success: true,
      recommendations,
      savingsInsights: savingsInsights.insights,
      healthScore: healthScore.overallScore,
      latestExternalRecommendation: external && external.recommendations ? external.recommendations[0] : null,
    };
  }

  /**
   * Calculate savings opportunities by category
   */
  static async calculateSavingsOpportunities(userId: string) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    if (expenses.length === 0) {
      return { insights: [] };
    }

    // Calculate spending by category
    const categorySpending: Record<string, number> = {};
    expenses.forEach((expense: any) => {
      categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
    });

    // Industry benchmarks (percentage of income recommended)
    const benchmarks: Record<string, number> = {
      'Housing': 0.30,
      'Transportation': 0.15,
      'Food': 0.15,
      'Utilities': 0.10,
      'Healthcare': 0.10,
      'Entertainment': 0.05,
      'Shopping': 0.05,
      'Other': 0.10,
    };

    const totalSpending = sum(Object.values(categorySpending));
    const insights: Array<{
      category: string;
      currentSpending: number;
      recommendedSpending: number;
      potentialSavings: number;
      percentageReduction: number;
    }> = [];

    Object.entries(categorySpending).forEach(([category, amount]) => {
      const currentPercentage = (amount / totalSpending) * 100;
      const benchmarkPercentage = (benchmarks[category] || 0.10) * 100;
      
      // If spending is more than 5% above benchmark
      if (currentPercentage > benchmarkPercentage + 5) {
        const recommendedSpending = (totalSpending * (benchmarks[category] || 0.10));
        const potentialSavings = amount - recommendedSpending;
        
        if (potentialSavings > 50) { // Only show if savings potential > ₹50
          insights.push({
            category,
            currentSpending: Math.round(amount * 100) / 100,
            recommendedSpending: Math.round(recommendedSpending * 100) / 100,
            potentialSavings: Math.round(potentialSavings * 100) / 100,
            percentageReduction: Math.round(((potentialSavings / amount) * 100) * 10) / 10,
          });
        }
      }
    });

    return {
      insights: insights.sort((a, b) => b.potentialSavings - a.potentialSavings),
    };
  }


  /**
   * Call an external finance AI service to fetch additional recommendations.
   * Expects environment variables FINANCE_API_URL and FINANCE_API_KEY to be set.
   */
  private static async fetchExternalRecommendations(userId: string, payload: any) {
    const url = process.env.FINANCE_API_URL;
    const key = process.env.FINANCE_API_KEY;

    if (!url || !key) return null;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // prefer Bearer but accept a generic API key header as well
          Authorization: `Bearer ${key}`,
          'x-api-key': key,
        },
        body: JSON.stringify({ userId, ...payload }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('External recommendations responded with non-OK status', res.status, text);
        return null;
      }

      const json = await res.json();
      return json;
    } catch (err) {
      console.error('Failed to call external finance AI:', err);
      return null;
    }
  }
}
