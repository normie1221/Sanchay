'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, 
  Target, Plus, ArrowRight, BarChart3, Shield, Sparkles, IndianRupee
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [latestExternal, setLatestExternal] = useState<any | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchDashboardData();
      fetchRecommendations();
    }
  }, [isSignedIn]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats({
          totalIncome: data.data.overview?.totalIncome || 0,
          totalExpenses: data.data.overview?.totalExpenses || 0,
          netSavings: data.data.overview?.netSavings || 0,
          savingsRate: data.data.overview?.savingsRate || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const response = await fetch('/api/analytics/recommendations');
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data.recommendations || []);
        // backend may expose a latestExternalRecommendation field
        setLatestExternal(data.data.latestExternalRecommendation || (data.data.recommendations ? data.data.recommendations[0] : null));
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setRecLoading(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/20 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'User'}! 👋
              </h1>
              <p className="text-gray-600 mt-2 font-medium">Here's your financial overview</p>
            </div>
            <div className="flex gap-3">
              <Link href="/expenses/new">
                <button className="group bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2 hover:scale-105 font-semibold">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Add Expense
                </button>
              </Link>
              <Link href="/income/new">
                <button className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2 hover:scale-105 font-semibold">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Add Income
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Total Income</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  ₹{stats?.totalIncome.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-green-600 font-medium">↑ This month</p>
              </div>

              <div className="group bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-red-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Total Expenses</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform duration-300">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  ₹{stats?.totalExpenses.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-red-600 font-medium">↓ This month</p>
              </div>

              <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Net Savings</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform duration-300">
                    <IndianRupee className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className={`text-4xl font-bold mb-2 ${
                  (stats?.netSavings || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₹{Math.abs(stats?.netSavings || 0).toLocaleString()}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  (stats?.netSavings || 0) >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {(stats?.netSavings || 0) >= 0 ? '✓ Surplus' : '⚠ Deficit'}
                </span>
              </div>

              <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Savings Rate</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform duration-300">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-3">
                  {stats?.savingsRate.toFixed(1) || '0'}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(stats?.savingsRate || 0, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Of total income</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Link href="/expenses">
                <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-6 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-cyan-100 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Expenses</h3>
                  <p className="text-sm text-gray-600">Track and manage your spending</p>
                </div>
              </Link>

              <Link href="/budgets">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-green-100 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Budgets</h3>
                  <p className="text-sm text-gray-600">Set and track your budgets</p>
                </div>
              </Link>

              <Link href="/goals">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-blue-100 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Goals</h3>
                  <p className="text-sm text-gray-600">Set and achieve financial goals</p>
                </div>
              </Link>

              <Link href="/analytics">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-orange-100 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600">AI-powered insights and reports</p>
                </div>
              </Link>

              <Link href="/recommendations">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-purple-100 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Advisor</h3>
                  <p className="text-sm text-gray-600">Get personalized recommendations</p>
                </div>
              </Link>
            </div>

            {/* AI Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-white to-cyan-50/30 rounded-2xl p-8 shadow-xl col-span-1 md:col-span-3 hover:shadow-2xl transition-all duration-300 border border-cyan-200/50">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Latest AI Recommendation</h3>
                      <p className="text-sm text-gray-600 mt-1">Personalized suggestion based on your account activity</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchRecommendations} 
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm hover:scale-105"
                  >
                    🔄 Refresh
                  </button>
                </div>
                <div className="mt-4 bg-white/50 rounded-xl p-6 backdrop-blur-sm">
                  {recLoading ? (
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-600 border-t-transparent"></div>
                      <span className="font-medium">Loading recommendations...</span>
                    </div>
                  ) : (
                    latestExternal ? (
                      <div className="space-y-3">
                        <h4 className="text-xl font-bold text-gray-900">{latestExternal.title || latestExternal.heading}</h4>
                        <p className="text-gray-700 leading-relaxed">{latestExternal.description || latestExternal.body || latestExternal.text}</p>
                      </div>
                    ) : recommendations && recommendations.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-xl font-bold text-gray-900">{recommendations[0].title}</h4>
                        <p className="text-gray-700 leading-relaxed">{recommendations[0].description}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-gray-500">
                        <AlertTriangle className="w-5 h-5" />
                        <span>No recommendations available yet. Add some transactions to get personalized advice.</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Get Started */}
            <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl p-10 text-white shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold">Start Managing Your Finances</h3>
                </div>
                <p className="text-white/90 mb-8 text-lg">
                  Add your first expense or income to get started with tracking your financial health and receive personalized AI recommendations.
                </p>
                <div className="flex gap-4">
                  <Link href="/expenses/new">
                    <button className="group bg-white text-cyan-600 px-8 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3 hover:scale-105">
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      Add First Expense
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </Link>
                  <Link href="/income/new">
                    <button className="group bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3 border-2 border-white/30 hover:scale-105">
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      Add First Income
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
