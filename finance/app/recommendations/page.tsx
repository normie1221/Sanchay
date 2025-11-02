'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sparkles, TrendingUp, PiggyBank, Target, AlertCircle, CheckCircle, Lightbulb, RefreshCw, ArrowRight } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import NavigationButtons from '@/components/NavigationButtons';

interface Recommendation {
  id: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  impact: string;
  actionable: boolean;
  category: string;
  potentialSavings?: number;
}

interface SavingsInsight {
  category: string;
  currentSpending: number;
  recommendedSpending: number;
  potentialSavings: number;
  percentageReduction: number;
}

export default function AIRecommendationsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [savingsInsights, setSavingsInsights] = useState<SavingsInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    if (isSignedIn) {
      fetchRecommendations();
    }
  }, [isSignedIn]);

  const fetchRecommendations = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get('/api/analytics/recommendations');
      const data = response.data?.data || response.data || {};
      
      setRecommendations(data.recommendations || []);
      setSavingsInsights(data.savingsInsights || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'HIGH': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'MEDIUM': return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'LOW': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default: return <Sparkles className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'savings': return <PiggyBank className="w-6 h-6" />;
      case 'budget': return <Target className="w-6 h-6" />;
      case 'investment': return <TrendingUp className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  const categories = ['ALL', 'SAVINGS', 'BUDGET', 'INVESTMENT', 'SPENDING', 'DEBT'];

  const filteredRecommendations = categoryFilter === 'ALL' 
    ? recommendations 
    : recommendations.filter(r => r.category?.toUpperCase() === categoryFilter);

  const totalPotentialSavings = savingsInsights.reduce((sum, insight) => sum + insight.potentialSavings, 0);

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
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Sparkles className="w-10 h-10 text-cyan-600" />
                  AI Financial Advisor
                </h1>
                <p className="text-gray-600">Personalized recommendations to optimize your finances and maximize savings</p>
              </div>
            </div>
            <button
              onClick={fetchRecommendations}
              disabled={refreshing}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Savings Potential Card */}
        {totalPotentialSavings > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <PiggyBank className="w-8 h-8" />
                  Total Savings Potential
                </h2>
                <p className="text-green-100 mb-4">Based on AI analysis of your spending patterns</p>
                <p className="text-5xl font-bold">₹{totalPotentialSavings.toFixed(2)}</p>
                <p className="text-green-100 mt-2">per month</p>
              </div>
              <div className="text-right">
                <p className="text-6xl font-bold opacity-20">💰</p>
              </div>
            </div>
          </div>
        )}

        {/* Savings Insights */}
        {savingsInsights.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-cyan-600" />
              Savings Opportunities by Category
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savingsInsights.map((insight, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-2">{insight.category}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-semibold text-gray-900">₹{insight.currentSpending.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recommended:</span>
                      <span className="font-semibold text-green-600">₹{insight.recommendedSpending.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-600">Save:</span>
                        <span className="font-bold text-green-600 text-lg">₹{insight.potentialSavings.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">({insight.percentageReduction.toFixed(0)}% reduction)</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  categoryFilter === category
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Sparkles className="w-24 h-24 text-cyan-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {recommendations.length === 0 ? 'No Recommendations Yet' : 'No Recommendations in This Category'}
            </h3>
            <p className="text-gray-600 mb-6">
              {recommendations.length === 0 
                ? 'Add some expenses and income to get personalized AI recommendations'
                : 'Try selecting a different category to see recommendations'}
            </p>
            {recommendations.length === 0 && (
              <div className="flex gap-4 justify-center">
                <Link href="/expenses/new">
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition">
                    Add Expense
                  </button>
                </Link>
                <Link href="/income/new">
                  <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition">
                    Add Income
                  </button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-l-4 ${
                  recommendation.priority === 'CRITICAL' ? 'border-red-500' : 
                  recommendation.priority === 'HIGH' ? 'border-orange-500' : 
                  recommendation.priority === 'MEDIUM' ? 'border-yellow-500' : 'border-blue-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    recommendation.priority === 'CRITICAL' ? 'bg-red-100' :
                    recommendation.priority === 'HIGH' ? 'bg-orange-100' :
                    recommendation.priority === 'MEDIUM' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {getCategoryIcon(recommendation.category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getPriorityIcon(recommendation.priority)}
                      <h3 className="text-xl font-bold text-gray-900">{recommendation.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{recommendation.description}</p>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full font-medium">
                          {recommendation.category}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                          Impact: {recommendation.impact}
                        </span>
                        {recommendation.actionable && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Actionable
                          </span>
                        )}
                      </div>
                      
                      {recommendation.potentialSavings && recommendation.potentialSavings > 0 && (
                        <div className="ml-auto text-right">
                          <p className="text-sm text-gray-600">Potential Savings</p>
                          <p className="text-2xl font-bold text-green-600">₹{recommendation.potentialSavings.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Take Action Now</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/budgets/new">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition cursor-pointer">
                <Target className="w-8 h-8 mb-2" />
                <h4 className="font-semibold mb-1">Create Budget</h4>
                <p className="text-sm text-cyan-100">Set spending limits for categories</p>
              </div>
            </Link>
            <Link href="/goals/new">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition cursor-pointer">
                <TrendingUp className="w-8 h-8 mb-2" />
                <h4 className="font-semibold mb-1">Set Goal</h4>
                <p className="text-sm text-cyan-100">Create a savings or investment goal</p>
              </div>
            </Link>
            <Link href="/analytics">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition cursor-pointer">
                <Sparkles className="w-8 h-8 mb-2" />
                <h4 className="font-semibold mb-1">View Analytics</h4>
                <p className="text-sm text-cyan-100">Deep dive into your spending patterns</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
