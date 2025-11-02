'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Plus, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';
import NavigationButtons from '@/components/NavigationButtons';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  description: string | null;
}

export default function GoalsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetchGoals();
    }
  }, [isSignedIn]);

  const fetchGoals = async () => {
    try {
      const response = await axios.get('/api/goals');
      // API returns { success: true, data: [...] }
      const goalsData = response.data?.data || response.data || [];
      setGoals(goalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'from-green-500 to-emerald-500';
    if (percentage >= 50) return 'from-blue-500 to-cyan-500';
    if (percentage >= 25) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-blue-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Emergency Fund': '🛡️',
      'Vacation': '✈️',
      'Home': '🏠',
      'Car': '🚗',
      'Education': '🎓',
      'Retirement': '💰',
      'Wedding': '💍',
      'Business': '💼',
      'Other': '🎯'
    };
    return icons[category] || '🎯';
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalSaved = Array.isArray(goals) ? goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0) : 0;
  const totalTarget = Array.isArray(goals) ? goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <NavigationButtons />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Goals</h1>
                <p className="text-gray-600">Track your progress towards your dreams</p>
              </div>
            </div>
            <Link href="/goals/new">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Goal
              </button>
            </Link>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Total Goals</p>
              <p className="text-4xl font-bold text-gray-900">{Array.isArray(goals) ? goals.length : 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Total Saved</p>
              <p className="text-4xl font-bold text-green-600">₹{totalSaved.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Total Target</p>
              <p className="text-4xl font-bold text-blue-600">₹{totalTarget.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">AI Goal Insights</h3>
              <p className="opacity-90 mb-4">
                Based on your current savings rate, you're on track to achieve {Array.isArray(goals) ? goals.filter(g => ((g.currentAmount || 0) / (g.targetAmount || 1)) >= 0.5).length : 0} goals ahead of schedule! 🎉
              </p>
              <p className="text-sm opacity-80">
                Tip: Consider allocating 20% of your monthly income towards goal savings for optimal progress.
              </p>
            </div>
          </div>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !Array.isArray(goals) || goals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-6">
              Start achieving your dreams by setting your first financial goal
            </p>
            <Link href="/goals/new">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition">
                Create Your First Goal
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const percentage = ((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100;
              const remaining = (goal.targetAmount || 0) - (goal.currentAmount || 0);
              const daysRemaining = differenceInDays(new Date(goal.deadline), new Date());

              return (
                <div key={goal.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getCategoryIcon(goal.category || 'Other')}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{goal.name || 'Unnamed Goal'}</h3>
                        <p className="text-sm text-gray-500">{goal.category || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      daysRemaining < 0 ? 'bg-red-100 text-red-700' :
                      daysRemaining < 30 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days left`}
                    </span>
                  </div>

                  {goal.description && (
                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                  )}

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-500`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">Current</span>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                          ₹{(goal.currentAmount || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Target className="w-4 h-4" />
                          <span className="text-sm">Target</span>
                        </div>
                        <p className="text-xl font-bold text-blue-600">
                          ₹{(goal.targetAmount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Remaining</p>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{remaining.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {percentage < 100 && (
                      <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition">
                        Add Funds
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Motivation Section */}
        <div className="mt-8 bg-blue-50 border border-purple-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💪 Stay Motivated</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Break large goals into smaller milestones for better tracking</li>
            <li>• Automate savings transfers to make progress effortless</li>
            <li>• Visualize your goals daily to stay committed</li>
            <li>• Celebrate milestones along the way to maintain momentum</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
