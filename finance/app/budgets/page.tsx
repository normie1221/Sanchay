'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Plus, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import NavigationButtons from '@/components/NavigationButtons';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: string;
  startDate: string;
  endDate: string;
}

export default function BudgetsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetchBudgets();
    }
  }, [isSignedIn]);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/api/budgets');
      // API returns { success: true, data: [...] }
      const budgetsData = response.data?.data || response.data || [];
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (percentage >= 80) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  if (!isLoaded || !isSignedIn) {
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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <NavigationButtons />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Budget Management</h1>
                <p className="text-gray-600">Set limits and track your spending by category</p>
              </div>
            </div>
            <Link href="/budgets/new">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Budget
              </button>
            </Link>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">AI Budget Recommendations</h3>
              <p className="opacity-90 mb-4">
                Based on your spending patterns, we recommend creating budgets for these categories:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                  Food: ₹600/month
                </span>
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                  Entertainment: ₹200/month
                </span>
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                  Shopping: ₹300/month
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budgets List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !Array.isArray(budgets) || budgets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No budgets yet</h3>
            <p className="text-gray-600 mb-6">
              Start managing your finances by creating your first budget
            </p>
            <Link href="/budgets/new">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition">
                Create Your First Budget
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const percentage = ((budget.spent || 0) / (budget.limit || 1)) * 100;
              const remaining = (budget.limit || 0) - (budget.spent || 0);

              return (
                <div key={budget.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{budget.category || 'Uncategorized'}</h3>
                      <p className="text-sm text-gray-500">{budget.period || 'N/A'}</p>
                    </div>
                    {getStatusIcon(percentage)}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Spent</span>
                        <span className="font-semibold text-gray-900">
                          ₹{budget.spent.toFixed(2)} / ₹{budget.limit.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(percentage)} transition-all duration-500`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {percentage.toFixed(1)}% used
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Remaining</p>
                        <p className={`text-2xl font-bold ₹{remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{Math.abs(remaining).toFixed(2)}
                        </p>
                      </div>
                      {percentage >= 80 && (
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${percentage >= 100 ? 'text-red-600' : 'text-yellow-600'}`}>
                            {percentage >= 100 ? 'Budget Exceeded!' : 'Approaching Limit'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Budget Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
            <li>• Review and adjust your budgets monthly based on actual spending</li>
            <li>• Set alerts to notify you when you reach 80% of your budget</li>
            <li>• Track irregular expenses separately to avoid budget surprises</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
