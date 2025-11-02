'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Plus, Search, Filter, DollarSign, Calendar, Tag, Trash2, Edit, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { format } from 'date-fns';
import NavigationButtons from '@/components/NavigationButtons';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  merchant: string | null;
  date: string;
  paymentMethod: string | null;
}

export default function ExpensesPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['All', 'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare', 
    'Entertainment', 'Shopping', 'Education', 'Insurance', 'Other'];

  useEffect(() => {
    if (isSignedIn) {
      fetchExpenses();
    }
  }, [isSignedIn]);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('/api/expenses');
      // API returns { success: true, data: [...] }
      const expenseData = response.data?.data || response.data || [];
      setExpenses(expenseData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await axios.delete(`/api/expenses/${id}`);
      setExpenses(Array.isArray(expenses) ? expenses.filter(exp => exp.id !== id) : []);
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const filteredExpenses = Array.isArray(expenses) ? expenses.filter(expense => {
    const matchesSearch = (expense.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.merchant || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || 
                           expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const totalExpenses = Array.isArray(filteredExpenses) ? filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) : 0;

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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">My Expenses</h1>
                <p className="text-gray-600">Track and manage all your spending</p>
              </div>
            </div>
            <Link href="/expenses/new">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Expense
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-100 rounded-full">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900">₹{totalExpenses.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{filteredExpenses.length} transactions</p>
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
                placeholder="Search expenses..."
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

        {/* Expenses List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full text-gray-400 mx-auto mb-4 flex items-center justify-center text-8xl font-bold">₹</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-600 mb-6">Start tracking your spending by adding your first expense</p>
            <Link href="/expenses/new">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition">
                Add Expense
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm font-semibold rounded-full">
                        {expense.category || 'Uncategorized'}
                      </span>
                      {expense.paymentMethod && (
                        <span className="text-sm text-gray-500">{expense.paymentMethod}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{expense.description || 'No description'}</h3>
                    {expense.merchant && (
                      <p className="text-gray-600 text-sm mb-2">@ {expense.merchant}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {expense.date ? format(new Date(expense.date), 'MMM dd, yyyy') : 'No date'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600 mb-3">-₹{(expense.amount || 0).toFixed(2)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
