'use client';

import Link from 'next/link';
import { 
  TrendingUp, Shield, Target, BarChart3, 
  Sparkles, CheckCircle, ArrowRight, Menu, X 
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Sanchay
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-cyan-600 transition">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-cyan-600 transition">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-cyan-600 transition">
                Pricing
              </a>
              <Link href="/sign-in">
                <button className="text-cyan-600 hover:text-cyan-700 font-medium">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition">
                  Get Started Free
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-cyan-600 py-2">
                Features
              </a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-cyan-600 py-2">
                How It Works
              </a>
              <a href="#pricing" className="block text-gray-700 hover:text-cyan-600 py-2">
                Pricing
              </a>
              <Link href="/sign-in">
                <button className="w-full text-left text-cyan-600 py-2">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg">
                  Get Started Free
                </button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Finance Management
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Take Control of Your
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent animate-gradient"> Finances </span>
            with AI
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Smart expense tracking, intelligent budgeting, fraud detection, and personalized insights 
            powered by artificial intelligence. Your financial freedom starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/sign-up">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 animate-gradient">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <a href="#features">
              <button className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-cyan-200 hover:border-cyan-500 hover:shadow-xl transition-all duration-300 hover:scale-105 glow-border-animate">
                Learn More
              </button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Smart Finance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage, track, and grow your wealth in one intelligent platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover-lift border-2 border-transparent hover:border-cyan-300">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 hover:rotate-12 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Smart Expense Tracking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically categorize and track expenses with AI. Get real-time insights into your spending patterns.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover-lift border-2 border-transparent hover:border-green-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6 hover:rotate-12 transition-transform duration-300">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Intelligent Budgeting
              </h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered budget recommendations based on your income and spending habits. Stay on track effortlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover-lift border-2 border-transparent hover:border-orange-300">
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center mb-6 hover:rotate-12 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Fraud Detection
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced AI monitors your transactions 24/7 to detect suspicious activities and protect your money.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Financial Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Deep insights and visualizations help you understand your financial health and make better decisions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                AI Recommendations
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Personalized financial advice and savings opportunities identified by machine learning algorithms.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-2xl hover:shadow-xl transition">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Goal Tracking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Set financial goals and let AI help you create actionable plans to achieve them faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Getting Started is Easy
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to financial clarity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign Up Free</h3>
              <p className="text-gray-600">
                Create your account in seconds. No credit card required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Add Your Data</h3>
              <p className="text-gray-600">
                Input your income and expenses. Our AI will do the rest.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Insights</h3>
              <p className="text-gray-600">
                Receive personalized recommendations and watch your wealth grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                ₹0<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Basic expense tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Up to 3 budgets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Basic reports</span>
                </li>
              </ul>
              <Link href="/sign-up">
                <button className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-8 rounded-2xl border-2 border-cyan-600 transform scale-105 shadow-xl">
              <div className="bg-white text-cyan-600 text-sm font-bold px-3 py-1 rounded-full inline-block mb-4">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="text-4xl font-bold text-white mb-6">
                ₹749<span className="text-lg text-indigo-200">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Everything in Free</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Unlimited budgets & goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">AI recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Fraud detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Advanced analytics</span>
                </li>
              </ul>
              <Link href="/sign-up">
                <button className="w-full bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
                  Start Free Trial
                </button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">
                Custom
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Dedicated account manager</span>
                </li>
              </ul>
              <button className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of users who have taken control of their financial future with Sanchay
          </p>
          <Link href="/sign-up">
            <button className="bg-white text-cyan-600 px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition inline-flex items-center gap-2">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <p className="text-sm text-indigo-200 mt-4">
            No credit card required • Cancel anytime • 14-day free trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Sanchay</span>
              </div>
              <p className="text-gray-400">
                AI-powered personal finance management for everyone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Updates</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Sanchay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
