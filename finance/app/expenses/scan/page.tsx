'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ScanExpensePage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/expenses">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
              <ArrowLeft className="w-5 h-5" />
              Back to Expenses
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan Receipt</h1>
          <p className="text-gray-600 mb-8">Upload or capture a receipt to automatically extract expense details</p>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-cyan-500 transition">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600 mb-4">Receipt scanning feature is under development</p>
              <Link href="/expenses/new">
                <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition">
                  Add Expense Manually
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
