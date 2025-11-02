import { prisma } from '@/lib/prisma';
import { average, sum, groupBy, standardDeviation } from '@/lib/utils';

/**
 * AI Service for Budget Planning
 * Uses historical expense data to generate optimized budgets
 */
export class BudgetPlanningService {
  
  /**
   * Generate AI-powered budget recommendations based on historical data
   */
  static async generateBudgetRecommendations(userId: string, period: 'MONTHLY' | 'WEEKLY' | 'QUARTERLY' = 'MONTHLY') {
    // Get historical expense data (last 3-6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
    });

    if (expenses.length === 0) {
      return {
        success: false,
        message: 'Not enough historical data to generate recommendations',
      };
    }

    // Group expenses by category
    const expensesByCategory = groupBy(expenses, 'category');
    
    const recommendations = Object.entries(expensesByCategory).map(([category, categoryExpenses]) => {
      const amounts = (categoryExpenses as any[]).map((e: any) => e.amount);
      const avgAmount = average(amounts);
      const stdDev = standardDeviation(amounts);
      const totalSpent = sum(amounts);
      
      // Calculate recommended budget with buffer (avg + 1 std dev)
      const recommendedBudget = avgAmount + stdDev;
      
      // Calculate confidence based on data consistency
      const confidence = stdDev / avgAmount > 0.5 ? 'low' : stdDev / avgAmount > 0.3 ? 'medium' : 'high';
      
      return {
        category,
        currentAverage: avgAmount,
        recommendedLimit: Math.round(recommendedBudget * 100) / 100,
        totalSpentLast6Months: totalSpent,
        transactionCount: categoryExpenses.length,
        confidence,
        period,
      };
    });

    return {
      success: true,
      recommendations: recommendations.sort((a, b) => b.recommendedLimit - a.recommendedLimit),
      period,
      analysisDate: new Date(),
    };
  }

  /**
   * Create AI-generated budgets automatically
   */
  static async createAIBudgets(userId: string) {
    const recommendations = await this.generateBudgetRecommendations(userId);
    
    if (!recommendations.success) {
      return recommendations;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const createdBudgets = [];

    for (const rec of recommendations.recommendations!) {
      const budget = await prisma.budget.create({
        data: {
          userId,
          category: rec.category,
          limit: rec.recommendedLimit,
          spent: 0,
          period: 'MONTHLY',
          startDate: startOfMonth,
          endDate: endOfMonth,
          isAiGenerated: true,
          aiConfidence: rec.confidence === 'high' ? 0.9 : rec.confidence === 'medium' ? 0.7 : 0.5,
        },
      });
      createdBudgets.push(budget);
    }

    return {
      success: true,
      budgets: createdBudgets,
      message: `Created ${createdBudgets.length} AI-generated budgets`,
    };
  }

  /**
   * Adjust existing budgets based on spending patterns
   */
  static async adjustBudgets(userId: string) {
    const activeBudgets = await prisma.budget.findMany({
      where: {
        userId,
        endDate: { gte: new Date() },
      },
    });

    const adjustments = [];

    for (const budget of activeBudgets) {
      const utilization = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
      
      let recommendation = null;
      
      // If consistently under budget, suggest reducing
      if (utilization < 50 && budget.isAiGenerated) {
        recommendation = {
          budgetId: budget.id,
          category: budget.category,
          currentLimit: budget.limit,
          suggestedLimit: Math.round(budget.limit * 0.8 * 100) / 100,
          reason: 'Consistently under budget - consider reducing limit',
        };
      }
      
      // If consistently over budget, suggest increasing
      if (utilization > 90) {
        recommendation = {
          budgetId: budget.id,
          category: budget.category,
          currentLimit: budget.limit,
          suggestedLimit: Math.round(budget.limit * 1.2 * 100) / 100,
          reason: 'Frequently exceeding budget - consider increasing limit',
        };
      }
      
      if (recommendation) {
        adjustments.push(recommendation);
      }
    }

    return {
      success: true,
      adjustments,
    };
  }
}
