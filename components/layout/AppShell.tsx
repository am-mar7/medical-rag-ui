'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from '@/components/theme-toggle';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import AuthModal from '@/components/auth/AuthModal';

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  const { user, signOut, personalMemories } = useAuth();
  const active = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const openAuth = (tab: 'login' | 'signup') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile Top Header */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:hidden">
        <div className="flex items-center">
          <button
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="mr-3 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            ☰
          </button>
          <div>
            <div className="font-semibold text-slate-900">Medical RAG</div>
            <div className="text-xs text-slate-500">Evidence-grounded assistant</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => openAuth('login')}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
            >
              👤 Account
            </button>
          ) : (
            <button
              onClick={() => openAuth('login')}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Mobile Backdrop */}
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div>
            <div className="font-semibold tracking-tight text-slate-950">Medical RAG</div>
            <div className="mt-0.5 text-xs text-slate-500">Evidence-grounded assistant</div>
          </div>
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-slate-400 hover:text-slate-600 md:hidden"
          >
            ×
          </button>
        </div>

        <nav className="space-y-2 p-4" aria-label="Main navigation">
          <NavItem href="/chat" active={active('/chat')} onClick={() => setOpen(false)} icon="💬" label="Chat" />
          <NavItem href="/dashboard" active={active('/dashboard')} onClick={() => setOpen(false)} icon="📊" label="Dashboard" />
          <NavItem href="/upload" active={active('/upload')} onClick={() => setOpen(false)} icon="📄" label="Upload Documents" />
        </nav>

        <div className="mt-auto border-t border-slate-100 p-4 space-y-3">
          {user ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="truncate text-xs font-medium text-slate-900">
                  {user.email}
                </div>
                <span className="ml-2 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                  User
                </span>
              </div>

              {personalMemories.length > 0 && (
                <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50/80 px-2.5 py-1.5 text-[11px] text-blue-700">
                  🧠 {personalMemories.length} saved context {personalMemories.length === 1 ? 'item' : 'items'}
                </div>
              )}

              <button
                onClick={() => signOut()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <span>🚪</span>
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuth('login')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Sign In
            </button>
          )}

          <div className="text-[11px] leading-4 text-slate-400">
            Use evidence and citations to review every medical answer.
          </div>
        </div>
      </aside>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab={authTab}
        onClose={() => setAuthModalOpen(false)}
      />

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
          ? 'border-blue-100 bg-blue-50 text-blue-700'
          : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </Link>
  );
}

