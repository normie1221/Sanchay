'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Target, Calendar } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function CreateGoalPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'Savings'
  });

  const categories = ['Savings', 'Investment', 'Debt Payment', 'Emergency Fund', 'Education', 'Travel', 'Home', 'Car', 'Retirement', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/goals', {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        deadline: new Date(formData.deadline),
        category: formData.category
      });

      router.push('/goals');
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal. Please try again.');
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
          <Link href="/goals">
            <button className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition mb-4">
              <ArrowLeft className="w-5 h-5" />
              Back to Goals
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Goal</h1>
          <p className="text-gray-600">Set a financial goal and track your progress</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Goal Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Goal Name *
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Emergency Fund, New Car, Vacation"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold text-xl">₹</span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">The total amount you want to achieve</p>
          </div>

          {/* Current Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Amount (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold text-xl">₹</span>
              <input
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Amount you've already saved towards this goal</p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Deadline *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">When do you want to achieve this goal?</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Link href="/goals" className="flex-1">
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Goal Setting Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Make your goals specific and measurable</li>
            <li>• Set realistic deadlines based on your income</li>
            <li>• Break large goals into smaller milestones</li>
            <li>• Review and adjust your goals regularly</li>
            <li>• Celebrate when you achieve your goals!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
