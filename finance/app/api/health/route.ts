import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      income: '/api/income',
      expenses: '/api/expenses',
      budgets: '/api/budgets',
      goals: '/api/goals',
      analytics: '/api/analytics/*',
      fraud: '/api/fraud/*',
      dashboard: '/api/dashboard',
      reports: '/api/reports',
    },
  });
}
