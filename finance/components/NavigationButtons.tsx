'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function NavigationButtons() {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => router.back()}
        className="p-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md group"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-cyan-600 transition-colors" />
      </button>
      <button
        onClick={() => router.forward()}
        className="p-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md group"
        title="Go Forward"
      >
        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-600 transition-colors" />
      </button>
    </div>
  );
}
