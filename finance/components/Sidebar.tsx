'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Wallet, 
  PieChart,
  Shield,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: TrendingDown },
  { name: 'Income', href: '/income', icon: TrendingUp },
  { name: 'Budgets', href: '/budgets', icon: Wallet },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'AI Advisor', href: '/recommendations', icon: Sparkles },
  { name: 'Fraud Detection', href: '/fraud', icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Don't show sidebar on landing page or auth pages
  if (pathname === '/' || pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')) {
    return null;
  }

  return (
    <>
      {/* Hover trigger area */}
      <div
        className="fixed top-0 left-0 w-16 h-screen z-30"
        onMouseEnter={() => setIsHovered(true)}
      />

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-2xl transition-transform duration-300 ease-in-out z-40"
        style={{
          transform: isHovered ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and User Profile */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">₹</span>
                </div>
                <span className="text-xl font-bold text-gray-900 whitespace-nowrap">Sanchay</span>
              </Link>
              <div className="flex items-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                    ${isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Show indicator when collapsed */}
        {!isHovered && (
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-r-lg shadow-lg p-2 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white animate-pulse" />
          </div>
        )}
      </aside>
    </>
  );
}
