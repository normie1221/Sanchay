import { prisma } from '@/lib/prisma';
import { average, standardDeviation, detectOutliers } from '@/lib/utils';

/**
 * AI Service for Fraud Detection
 * Uses anomaly detection and behavioral analytics
 */
export class FraudDetectionService {
  
  /**
   * Analyze a single expense for fraud indicators
   */
  static async analyzeExpense(userId: string, expenseId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // Get user's behavioral profile
    let userBehavior = await prisma.userBehavior.findUnique({
      where: { userId },
    });

    // If no behavior profile exists, create one
    if (!userBehavior) {
      userBehavior = await this.updateUserBehavior(userId);
    }

    const riskFactors = [];
    let riskScore = 0;

    // 1. Amount Anomaly Detection
    if (userBehavior.avgTransactionAmount) {
      const amountDeviation = Math.abs(expense.amount - userBehavior.avgTransactionAmount);
      const threshold = userBehavior.avgTransactionAmount * 2; // 2x average
      
      if (amountDeviation > threshold) {
        riskFactors.push({
          type: 'UNUSUAL_AMOUNT',
          severity: 'HIGH',
          description: `Amount ₹${expense.amount} is significantly higher than your average of ₹${userBehavior.avgTransactionAmount}`,
        });
        riskScore += 30;
      }
    }

    // 2. Merchant Analysis
    if (expense.merchant && userBehavior.commonMerchants) {
      if (!userBehavior.commonMerchants.includes(expense.merchant)) {
        riskFactors.push({
          type: 'UNUSUAL_MERCHANT',
          severity: 'MEDIUM',
          description: `Transaction at unfamiliar merchant: ${expense.merchant}`,
        });
        riskScore += 20;
      }
    }

    // 3. Location Analysis
    if (expense.location && userBehavior.commonLocations) {
      if (!userBehavior.commonLocations.includes(expense.location)) {
        riskFactors.push({
          type: 'UNUSUAL_LOCATION',
          severity: 'MEDIUM',
          description: `Transaction from unusual location: ${expense.location}`,
        });
        riskScore += 20;
      }
    }

    // 4. Category Analysis
    if (userBehavior.commonCategories && !userBehavior.commonCategories.includes(expense.category)) {
      riskFactors.push({
        type: 'UNUSUAL_CATEGORY',
        severity: 'LOW',
        description: `Unusual spending category: ${expense.category}`,
      });
      riskScore += 10;
    }

    // 5. Duplicate Transaction Detection
    const recentDuplicate = await prisma.expense.findFirst({
      where: {
        userId,
        amount: expense.amount,
        merchant: expense.merchant,
        date: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
        id: { not: expenseId },
      },
    });

    if (recentDuplicate) {
      riskFactors.push({
        type: 'DUPLICATE_TRANSACTION',
        severity: 'HIGH',
        description: 'Potential duplicate transaction detected',
      });
      riskScore += 35;
    }

    // Determine overall risk level
    const isSuspicious = riskScore >= 30;
    const severity = riskScore >= 60 ? 'CRITICAL' : 
                     riskScore >= 40 ? 'HIGH' : 
                     riskScore >= 20 ? 'MEDIUM' : 'LOW';

    // Update expense with fraud indicators
    await prisma.expense.update({
      where: { id: expenseId },
      data: {
        isSuspicious,
        riskScore,
      },
    });

    // Create fraud alert if suspicious
    if (isSuspicious) {
      await this.createFraudAlert(userId, {
        expenseId,
        alertType: riskFactors[0]?.type || 'BEHAVIORAL_ANOMALY',
        severity,
        description: `Suspicious transaction detected: ₹${expense.amount} at ${expense.merchant || 'unknown merchant'}`,
        riskScore,
        features: riskFactors,
      });
    }

    return {
      isSuspicious,
      riskScore,
      severity,
      riskFactors,
      expense,
    };
  }

  /**
   * Batch analyze all recent expenses for fraud
   */
  static async analyzRecentExpenses(userId: string, days: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: since },
      },
    });

    const analyses = await Promise.all(
      expenses.map((expense: any) => this.analyzeExpense(userId, expense.id))
    );

    const suspiciousExpenses = analyses.filter(a => a.isSuspicious);

    return {
      totalAnalyzed: expenses.length,
      suspiciousCount: suspiciousExpenses.length,
      suspiciousExpenses,
      averageRiskScore: average(analyses.map(a => a.riskScore)),
    };
  }

  /**
   * Update user behavioral profile based on historical data
   */
  static async updateUserBehavior(userId: string) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: threeMonthsAgo },
        isSuspicious: false, // Only use legitimate transactions
      },
    });

    if (expenses.length === 0) {
      return prisma.userBehavior.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
    }

    const amounts = expenses.map((e: any) => e.amount);
    const avgAmount = average(amounts);

    // Calculate transaction frequency (per day)
    const daysDiff = (Date.now() - threeMonthsAgo.getTime()) / (1000 * 60 * 60 * 24);
    const frequency = expenses.length / daysDiff;

    // Extract common merchants, locations, categories
    const merchants = expenses.map((e: any) => e.merchant).filter(Boolean);
    const locations = expenses.map((e: any) => e.location).filter(Boolean);
    const categories = expenses.map((e: any) => e.category);

    const commonMerchants = [...new Set(merchants)].slice(0, 20); // Top 20
    const commonLocations = [...new Set(locations)].slice(0, 10); // Top 10
    const commonCategories = [...new Set(categories)];

    return prisma.userBehavior.upsert({
      where: { userId },
      create: {
        userId,
        avgTransactionAmount: avgAmount,
        transactionFrequency: frequency,
        commonMerchants,
        commonLocations,
        commonCategories,
      },
      update: {
        avgTransactionAmount: avgAmount,
        transactionFrequency: frequency,
        commonMerchants,
        commonLocations,
        commonCategories,
      },
    });
  }

  /**
   * Create a fraud alert
   */
  private static async createFraudAlert(userId: string, data: {
    expenseId?: string;
    alertType: string;
    severity: string;
    description: string;
    riskScore: number;
    features?: any;
  }) {
    return prisma.fraudAlert.create({
      data: {
        userId,
        expenseId: data.expenseId,
        alertType: data.alertType as any,
        severity: data.severity as any,
        description: data.description,
        riskScore: data.riskScore,
        detectionMethod: 'behavioral_analysis',
        features: data.features,
        status: 'PENDING',
      },
    });
  }

  /**
   * Get all fraud alerts for a user
   */
  static async getFraudAlerts(userId: string, status?: string) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return prisma.fraudAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resolve a fraud alert
   */
  static async resolveFraudAlert(alertId: string, resolution: string, isConfirmed: boolean) {
    return prisma.fraudAlert.update({
      where: { id: alertId },
      data: {
        status: isConfirmed ? 'CONFIRMED' : 'FALSE_POSITIVE',
        resolution,
        resolvedAt: new Date(),
      },
    });
  }

  /**
   * Statistical anomaly detection using Z-score
   */
  static async detectAnomalies(userId: string) {
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
        message: 'Insufficient data for anomaly detection',
      };
    }

    const amounts = expenses.map((e: any) => e.amount);
    const outliers = detectOutliers(amounts, 2); // 2 standard deviations
    
    const anomalousExpenses = expenses.filter((e: any) => outliers.includes(e.amount));

    return {
      success: true,
      totalExpenses: expenses.length,
      anomalyCount: anomalousExpenses.length,
      anomalies: anomalousExpenses,
      statistics: {
        average: average(amounts),
        stdDev: standardDeviation(amounts),
        min: Math.min(...amounts),
        max: Math.max(...amounts),
      },
    };
  }
}
