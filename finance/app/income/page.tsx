'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, Search, Filter, TrendingUp, Calendar, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import NavigationButtons from '@/components/NavigationButtons';

interface Income {
  id: string;
  amount: number;
  source: string;
  category: string;
  description: string | null;
  date: string;
  frequency: string;
  isRecurring: boolean;
}

export default function IncomePage() {
  const { isLoaded, isSignedIn } = useUser();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['All', 'Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Bonus', 'Gift', 'Other'];

  useEffect(() => {
    if (isSignedIn) {
      fetchIncomes();
    }
  }, [isSignedIn]);

  const fetchIncomes = async () => {
    try {
      const response = await axios.get('/api/income');
      // API returns { success: true, data: [...] }
      const incomeData = response.data?.data || response.data || [];
      setIncomes(incomeData);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteIncome = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income?')) return;

    try {
      await axios.delete(`/api/income/${id}`);
      setIncomes(Array.isArray(incomes) ? incomes.filter(inc => inc.id !== id) : []);
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Failed to delete income');
    }
  };

  const filteredIncomes = Array.isArray(incomes) ? incomes.filter(income => {
    const matchesSearch = (income.source || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (income.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || 
                           income.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const totalIncome = Array.isArray(filteredIncomes) ? filteredIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0) : 0;

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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">My Income</h1>
                <p className="text-gray-600">Track and manage all your income sources</p>
              </div>
            </div>
            <Link href="/income/new">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Income
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-full">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Income</p>
              <p className="text-3xl font-bold text-gray-900">₹{totalIncome.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{filteredIncomes.length} transactions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search income..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Income List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : filteredIncomes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full text-gray-400 mx-auto mb-4 flex items-center justify-center text-8xl font-bold">₹</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No income found</h3>
            <p className="text-gray-600 mb-6">Start tracking your income by adding your first entry</p>
            <Link href="/income/new">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition">
                Add Income
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredIncomes.map((income) => (
              <div
                key={income.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{income.source}</h3>
                        <p className="text-sm text-gray-600">{income.category}</p>
                      </div>
                    </div>
                    
                    {income.description && (
                      <p className="text-gray-700 mb-3 ml-12">{income.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 ml-12 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(income.date), 'MMM dd, yyyy')}
                      </div>
                      {income.frequency && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {income.frequency}
                        </span>
                      )}
                      {income.isRecurring && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          Recurring
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        +₹{income.amount.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteIncome(income.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
