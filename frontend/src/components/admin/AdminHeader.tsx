'use client';

import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ExternalLink, ShieldAlert } from 'lucide-react';

export function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-krishi-light px-2.5 py-1 text-xs font-bold text-krishi-dark">
          {user?.role || 'ADMIN'}
        </span>
        <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-krishi-primary"
        >
          <span>স্টোরফ্রন্ট দেখুন</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        <button
          onClick={async () => {
            await logout();
            router.push('/login');
          }}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="h-3.5 w-3.5 text-red-500" />
          <span>লগআউট</span>
        </button>
      </div>
    </header>
  );
}
