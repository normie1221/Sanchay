'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Target, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const categories = [
  'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare',
  'Entertainment', 'Shopping', 'Education', 'Insurance', 'Other'
];

const periods = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];

export default function CreateBudgetPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/budgets', {
        category: formData.category,
        limit: parseFloat(formData.limit),
        period: formData.period,
        startDate: new Date(formData.startDate),
      });

      router.push('/budgets');
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Failed to create budget. Please try again.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/budgets">
            <button className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition mb-4">
              <ArrowLeft className="w-5 h-5" />
              Back to Budgets
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Budget</h1>
          <p className="text-gray-600">Set spending limits for your categories</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
              >
                <option value="" >Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Limit Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Budget Limit *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold text-xl">₹</span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Maximum amount you want to spend in this category</p>
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Period *
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                required
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
              >
                {periods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Link href="/budgets" className="flex-1">
              <button
                type="button"
                className="w-full px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Budget Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Start with conservative limits and adjust based on actual spending</li>
            <li>• Review and update your budgets monthly</li>
            <li>• Set alerts when you reach 80% of your budget</li>
            <li>• Consider seasonal variations in categories like utilities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
