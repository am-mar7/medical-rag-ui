'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from '@/components/theme-toggle';
import { AuthProvider, useAuth } from '@/lib/auth-context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, signOut, personalMemories } = useAuth();
  const active = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/onboarding';

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        {/* Minimal Auth Header */}
        <header className="w-full flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 py-3.5 backdrop-blur">
          <Link href="/chat" className="flex items-center gap-3">
            <img src="/logo.png" alt="Beats4U Logo" className="h-8 w-auto object-contain rounded-md" />
            <div>
              <div className="font-bold tracking-tight text-slate-950 dark:text-white leading-tight">Beats4U</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Cardiovascular AI Assistant</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/chat"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              💬 Go to Chat
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Top Header */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 backdrop-blur md:hidden">
        <div className="flex items-center">
          <button
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="mr-3 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            ☰
          </button>
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Beats4U Logo" className="h-8 w-auto object-contain rounded-md" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white leading-tight">Beats4U</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Evidence-grounded assistant</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link
              href="/onboarding"
              className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
            >
              🫀 Medical Profile
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-slate-900 dark:bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-blue-500 transition shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Backdrop */}
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/30 dark:bg-slate-950/70 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Beats4U Logo" className="h-9 w-auto object-contain rounded-lg" />
            <div>
              <div className="font-bold tracking-tight text-slate-950 dark:text-white">Beats4U</div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Evidence-grounded assistant</div>
            </div>
          </div>
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 md:hidden"
          >
            ×
          </button>
        </div>

        <nav className="space-y-2 p-4" aria-label="Main navigation">
          <NavItem href="/chat" active={active('/chat')} onClick={() => setOpen(false)} icon="💬" label="Chat" />
          <NavItem href="/onboarding" active={active('/onboarding')} onClick={() => setOpen(false)} icon="🫀" label="Medical Profile" />
          <NavItem href="/dashboard" active={active('/dashboard')} onClick={() => setOpen(false)} icon="📊" label="Dashboard" />
          <NavItem href="/upload" active={active('/upload')} onClick={() => setOpen(false)} icon="📄" label="Upload Documents" />
        </nav>

        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-4 space-y-3">
          {user ? (
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3">
              <div className="flex items-center justify-between">
                <div className="truncate text-xs font-medium text-slate-900 dark:text-slate-100">
                  {user.email}
                </div>
                <span className="ml-2 inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:text-blue-300">
                  User
                </span>
              </div>

              {personalMemories.length > 0 && (
                <div className="mt-2 rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/60 px-2.5 py-1.5 text-[11px] text-blue-700 dark:text-blue-300">
                  🧠 {personalMemories.length} saved context {personalMemories.length === 1 ? 'item' : 'items'}
                </div>
              )}

              <button
                onClick={() => signOut()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              >
                <span>🚪</span>
                Sign out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl bg-slate-900 dark:bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-blue-500 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] leading-4 text-slate-400 dark:text-slate-500">
            <span>Evidence grounded assistant</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-screen pt-16 md:ml-72 md:pt-0">{children}</main>
    </div>
  );
}

function NavItem({
  href,
  active,
  onClick,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
        active
          ? 'border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
          : 'border-transparent text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </Link>
  );
}
