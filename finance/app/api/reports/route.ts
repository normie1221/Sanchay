import { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';
import { handleApiError, success } from '@/lib/api-response';
import { ReportService } from '@/services/report.service';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit();

// GET /api/reports - Get all user reports
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const reports = await ReportService.getUserReports(user.id);

    return success(reports);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/reports - Generate a new report
export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    
    const rateLimitResult = await limiter(user.id);
    if (!rateLimitResult.success) {
      return success({ error: 'Too many requests' }, 429);
    }

    const body = await request.json();
    const { type, format, startDate, endDate, year, month } = body;

    let reportData;

    switch (type) {
      case 'monthly-summary':
        reportData = await ReportService.generateMonthlySummary(
          user.id,
          year || new Date().getFullYear(),
          month || new Date().getMonth() + 1
        );
        break;

      case 'expense-analysis':
        reportData = await ReportService.generateExpenseAnalysis(
          user.id,
          new Date(startDate),
          new Date(endDate)
        );
        break;

      default:
        return success({ error: 'Invalid report type' }, 400);
    }

    // If format is CSV, export to file
    if (format === 'csv' || format === 'CSV') {
      const exportResult = await ReportService.exportToCSV(user.id, type, reportData);
      return success(exportResult, 201);
    }

    // Otherwise return JSON data
    return success(reportData);
  } catch (error) {
    return handleApiError(error);
  }
}
