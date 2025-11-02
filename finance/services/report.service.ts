import { prisma } from '@/lib/prisma';
import { createObjectCsvWriter } from 'csv-writer';
import { formatCurrency, getDateRange } from '@/lib/utils';
import { format } from 'date-fns';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Service for generating financial reports
 */
export class ReportService {
  
  /**
   * Generate monthly summary report
   */
  static async generateMonthlySummary(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [incomes, expenses, budgets, goals] = await Promise.all([
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
      prisma.budget.findMany({
        where: {
          userId,
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      }),
      prisma.financialGoal.findMany({
        where: { userId },
      }),
    ]);

    const totalIncome = incomes.reduce((sum: number, i: any) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach((expense: any) => {
      categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
    });

    return {
      period: {
        year,
        month,
        startDate,
        endDate,
      },
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netSavings: Math.round(netSavings * 100) / 100,
        savingsRate: Math.round(savingsRate * 100) / 100,
      },
      incomeBreakdown: this.groupByCategory(incomes, 'category'),
      expenseBreakdown: categoryBreakdown,
      budgetPerformance: budgets.map((b: any) => ({
        category: b.category,
        limit: b.limit,
        spent: b.spent,
        utilization: b.limit > 0 ? Math.round((b.spent / b.limit) * 100 * 100) / 100 : 0,
      })),
      topExpenses: expenses
        .sort((a: any, b: any) => b.amount - a.amount)
        .slice(0, 10)
        .map((e: any) => ({
          date: e.date,
          amount: e.amount,
          category: e.category,
          merchant: e.merchant,
          description: e.description,
        })),
    };
  }

  /**
   * Generate expense analysis report
   */
  static async generateExpenseAnalysis(userId: string, startDate: Date, endDate: Date) {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });

    const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const average = expenses.length > 0 ? total / expenses.length : 0;

    const categoryAnalysis: Record<string, any> = {};
    expenses.forEach((expense: any) => {
      if (!categoryAnalysis[expense.category]) {
        categoryAnalysis[expense.category] = {
          count: 0,
          total: 0,
          average: 0,
          percentage: 0,
        };
      }
      categoryAnalysis[expense.category].count++;
      categoryAnalysis[expense.category].total += expense.amount;
    });

    Object.keys(categoryAnalysis).forEach(category => {
      const cat = categoryAnalysis[category];
      cat.average = cat.total / cat.count;
      cat.percentage = (cat.total / total) * 100;
      cat.total = Math.round(cat.total * 100) / 100;
      cat.average = Math.round(cat.average * 100) / 100;
      cat.percentage = Math.round(cat.percentage * 100) / 100;
    });

    return {
      period: { startDate, endDate },
      summary: {
        totalExpenses: Math.round(total * 100) / 100,
        transactionCount: expenses.length,
        averageTransaction: Math.round(average * 100) / 100,
      },
      categoryAnalysis,
      expenses,
    };
  }

  /**
   * Export report to CSV
   */
  static async exportToCSV(userId: string, reportType: string, data: any) {
    const timestamp = Date.now();
    const filename = `${reportType}-${timestamp}.csv`;
    const filePath = path.join(process.cwd(), 'public', 'reports', filename);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let csvWriter;
    let records: any[] = [];

    switch (reportType) {
      case 'expenses':
        csvWriter = createObjectCsvWriter({
          path: filePath,
          header: [
            { id: 'date', title: 'Date' },
            { id: 'amount', title: 'Amount' },
            { id: 'category', title: 'Category' },
            { id: 'merchant', title: 'Merchant' },
            { id: 'description', title: 'Description' },
            { id: 'paymentMethod', title: 'Payment Method' },
          ],
        });
        records = data.expenses.map((e: any) => ({
          date: format(new Date(e.date), 'yyyy-MM-dd'),
          amount: e.amount,
          category: e.category,
          merchant: e.merchant || '',
          description: e.description || '',
          paymentMethod: e.paymentMethod || '',
        }));
        break;

      case 'monthly-summary':
        csvWriter = createObjectCsvWriter({
          path: filePath,
          header: [
            { id: 'metric', title: 'Metric' },
            { id: 'value', title: 'Value' },
          ],
        });
        records = [
          { metric: 'Total Income', value: data.summary.totalIncome },
          { metric: 'Total Expenses', value: data.summary.totalExpenses },
          { metric: 'Net Savings', value: data.summary.netSavings },
          { metric: 'Savings Rate (%)', value: data.summary.savingsRate },
        ];
        break;

      default:
        throw new Error('Unsupported report type');
    }

    await csvWriter.writeRecords(records);

    // Save report metadata to database
    const report = await prisma.report.create({
      data: {
        userId,
        type: reportType.toUpperCase() as any,
        title: `${reportType} Report`,
        format: 'CSV',
        startDate: data.period?.startDate || new Date(),
        endDate: data.period?.endDate || new Date(),
        categories: [],
        fileUrl: `/reports/${filename}`,
        fileSize: fs.statSync(filePath).size,
      },
    });

    return {
      success: true,
      report,
      downloadUrl: `/reports/${filename}`,
    };
  }

  /**
   * Get all reports for a user
   */
  static async getUserReports(userId: string) {
    return prisma.report.findMany({
      where: { userId },
      orderBy: { generatedAt: 'desc' },
    });
  }

  /**
   * Helper: Group items by category
   */
  private static groupByCategory(items: any[], field: string): Record<string, number> {
    const result: Record<string, number> = {};
    items.forEach(item => {
      const category = item[field] || 'Other';
      result[category] = (result[category] || 0) + item.amount;
    });
    return result;
  }
}
