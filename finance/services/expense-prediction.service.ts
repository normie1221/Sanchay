import { prisma } from '@/lib/prisma';
import { average, sum, groupBy } from '@/lib/utils';
import { startOfMonth, endOfMonth, addMonths } from 'date-fns';

/**
 * AI Service for Expense Prediction
 * Predicts future expenses based on historical patterns
 */
export class ExpensePredictionService {
  
  /**
   * Predict expenses for the next month
   */
  static async predictNextMonthExpenses(userId: string) {
    // Get last 6 months of data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
    });

    if (expenses.length < 10) {
      return {
        success: false,
        message: 'Insufficient data for prediction',
      };
    }

    // Group by category and calculate trends
    const expensesByCategory = groupBy(expenses, 'category');
    
    const predictions = Object.entries(expensesByCategory).map(([category, categoryExpenses]) => {
      const amounts = (categoryExpenses as any[]).map((e: any) => e.amount);
      const avgAmount = average(amounts);
      
      // Simple trend calculation (last month vs average)
      const lastMonth = (categoryExpenses as any[]).filter((e: any) => {
        const expenseDate = new Date(e.date);
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        return expenseDate >= lastMonthStart;
      });
      
      const lastMonthTotal = sum(lastMonth.map((e: any) => e.amount));
      const trend = lastMonthTotal > avgAmount ? 'increasing' : 'decreasing';
      const trendPercentage = avgAmount > 0 ? ((lastMonthTotal - avgAmount) / avgAmount) * 100 : 0;
      
      // Predict next month (weighted average with recent trend)
      const predictedAmount = avgAmount * (1 + (trendPercentage / 200)); // Dampened trend
      
      return {
        category,
        predictedAmount: Math.round(predictedAmount * 100) / 100,
        historicalAverage: Math.round(avgAmount * 100) / 100,
        trend,
        trendPercentage: Math.round(trendPercentage * 100) / 100,
        confidence: categoryExpenses.length >= 10 ? 'high' : categoryExpenses.length >= 5 ? 'medium' : 'low',
      };
    });

    const totalPredicted = sum(predictions.map(p => p.predictedAmount));

    return {
      success: true,
      predictions,
      totalPredicted: Math.round(totalPredicted * 100) / 100,
      nextMonth: {
        start: startOfMonth(addMonths(new Date(), 1)),
        end: endOfMonth(addMonths(new Date(), 1)),
      },
    };
  }

  /**
   * Predict recurring expenses
   */
  static async predictRecurringExpenses(userId: string) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: threeMonthsAgo },
      },
      orderBy: { date: 'asc' },
    });

    // Group by merchant to identify recurring patterns
    const expensesByMerchant = groupBy(expenses, 'merchant');
    
    const recurringExpenses = Object.entries(expensesByMerchant)
      .filter(([_, merchantExpenses]) => merchantExpenses.length >= 2)
      .map(([merchant, merchantExpenses]) => {
        const amounts = (merchantExpenses as any[]).map((e: any) => e.amount);
        const avgAmount = average(amounts);
        
        // Calculate frequency (days between transactions)
        const dates = (merchantExpenses as any[]).map((e: any) => new Date(e.date).getTime());
        const intervals = [];
        for (let i = 1; i < dates.length; i++) {
          intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)); // Convert to days
        }
        const avgInterval = average(intervals);
        
        // Estimate next occurrence
        const lastDate = new Date((merchantExpenses as any[])[merchantExpenses.length - 1].date);
        const nextDate = new Date(lastDate.getTime() + avgInterval * 24 * 60 * 60 * 1000);
        
        return {
          merchant: merchant || 'Unknown',
          category: (merchantExpenses as any[])[0].category,
          averageAmount: Math.round(avgAmount * 100) / 100,
          frequency: Math.round(avgInterval),
          occurrences: merchantExpenses.length,
          nextExpectedDate: nextDate,
          isRecurring: avgInterval < 35, // Monthly or more frequent
        };
      })
      .filter(e => e.isRecurring);

    return {
      success: true,
      recurringExpenses,
      totalRecurringCount: recurringExpenses.length,
    };
  }

  /**
   * Predict upcoming bills and subscriptions
   */
  static async predictUpcomingBills(userId: string, daysAhead: number = 30) {
    const recurring = await this.predictRecurringExpenses(userId);
    
    if (!recurring.success) {
      return recurring;
    }

    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const upcomingBills = recurring.recurringExpenses!
      .filter(expense => {
        const nextDate = new Date(expense.nextExpectedDate);
        return nextDate >= now && nextDate <= futureDate;
      })
      .sort((a, b) => new Date(a.nextExpectedDate).getTime() - new Date(b.nextExpectedDate).getTime());

    const totalUpcoming = sum(upcomingBills.map(b => b.averageAmount));

    return {
      success: true,
      upcomingBills,
      totalAmount: Math.round(totalUpcoming * 100) / 100,
      period: { start: now, end: futureDate },
    };
  }
}
