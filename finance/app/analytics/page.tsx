'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, TrendingUp, TrendingDown, IndianRupee, PieChart as PieChartIcon } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import NavigationButtons from '@/components/NavigationButtons';

interface AnalyticsData {
  categoryBreakdown: Array<{ category: string; amount: number; }>;
  monthlyTrend: Array<{ month: string; income: number; expenses: number; }>;
  topExpenses: Array<{ description: string; amount: number; category: string; }>;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#f97316', '#ef4444'];

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetchAnalytics();
    }
  }, [isSignedIn]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics');
      // API returns { success: true, data: {...} }
      const analyticsData = response.data?.data || response.data || {};
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <NavigationButtons />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Analytics</h1>
              <p className="text-gray-600">Deep insights into your spending patterns and trends</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {analytics && analytics.summary && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Total Income</p>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ₹{(analytics.summary.totalIncome || 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Total Expenses</p>
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">
                  ₹{(analytics.summary.totalExpenses || 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Net Savings</p>
                  <IndianRupee className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{(analytics.summary.netSavings || 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">Savings Rate</p>
                  <PieChartIcon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {(analytics.summary.savingsRate || 0).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Category Breakdown Pie Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-6 h-6 text-cyan-600" />
                  Spending by Category
                </h3>
                {analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.categoryBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry: any) => `${entry.category}: ₹${entry.amount?.toFixed(0) || 0}`}
                        labelLine={true}
                      >
                        {analytics.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value?.toFixed(2) || 0}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <PieChartIcon className="w-16 h-16 mx-auto mb-2 opacity-20" />
                      <p>No spending data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Expenses */}
              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                  Top Expenses
                </h3>
                {analytics.topExpenses && analytics.topExpenses.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topExpenses.slice(0, 5).map((expense, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{expense.description || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">{expense.category || 'N/A'}</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-red-600">
                          ₹{(expense.amount || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <TrendingDown className="w-16 h-16 mx-auto mb-2 opacity-20" />
                      <p>No expense data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Trend Area Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Income vs Expenses Trend
              </h3>
              {analytics.monthlyTrend && analytics.monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analytics.monthlyTrend}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280"
                      style={{ fontSize: '14px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '14px' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => `₹${value?.toFixed(2) || 0}`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                      name="Income"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorExpenses)"
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-2 opacity-20" />
                    <p>No trend data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Category Bar Chart */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart className="w-6 h-6 text-blue-600" />
                  Spending Breakdown
                </h3>
                {analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={analytics.categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="category" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis stroke="#6b7280" style={{ fontSize: '14px' }} />
                      <Tooltip 
                        formatter={(value: number) => `₹${value?.toFixed(2) || 0}`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Bar dataKey="amount" name="Amount Spent" radius={[8, 8, 0, 0]}>
                        {analytics.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <PieChartIcon className="w-16 h-16 mx-auto mb-2 opacity-20" />
                      <p>No category data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Spending Pattern Radar Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-6 h-6 text-purple-600" />
                  Spending Pattern Analysis
                </h3>
                {analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={analytics.categoryBreakdown}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis 
                        dataKey="category" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <PolarRadiusAxis stroke="#6b7280" />
                      <Radar 
                        name="Spending" 
                        dataKey="amount" 
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip 
                        formatter={(value: number) => `₹${value?.toFixed(2) || 0}`}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <PieChartIcon className="w-16 h-16 mx-auto mb-2 opacity-20" />
                      <p>No pattern data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">🤖 AI Financial Insights</h3>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="font-semibold mb-1">Spending Pattern</p>
                  <p className="text-sm opacity-90">
                    Your average monthly spending is ₹{((analytics.summary?.totalExpenses || 0) / 12).toFixed(2)}. 
                    Consider setting up automatic savings to reach your financial goals faster.
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="font-semibold mb-1">Savings Opportunity</p>
                  <p className="text-sm opacity-90">
                    You could save an additional ₹{((analytics.summary?.totalExpenses || 0) * 0.1).toFixed(2)} per month 
                    by reducing discretionary spending by just 10%.
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="font-semibold mb-1">Financial Health Score</p>
                  <p className="text-sm opacity-90">
                    Your savings rate of {(analytics.summary?.savingsRate || 0).toFixed(1)}% is 
                    {(analytics.summary?.savingsRate || 0) >= 20 ? ' excellent! Keep it up! 🌟' : 
                     (analytics.summary?.savingsRate || 0) >= 10 ? ' good. Try to aim for 20% for optimal financial health.' :
                     ' below recommended. Consider reviewing your expenses.'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
