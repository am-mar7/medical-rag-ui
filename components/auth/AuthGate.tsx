'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isAdmin, loading } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    if (loading) return;

    if (!session) {
      if (!isAuthPage) {
        router.replace('/login');
      }
    } else {
      if (isAuthPage) {
        router.replace('/chat');
      } else if (isAdminPage && !isAdmin) {
        router.replace('/chat');
      }
    }
  }, [session, isAdmin, loading, pathname, isAuthPage, isAdminPage, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="text-xs font-medium text-slate-500">Restoring session…</p>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content before redirect effect fires
  if (!session && !isAuthPage) {
    return null;
  }

  if (session && isAuthPage) {
    return null;
  }

  if (session && isAdminPage && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
