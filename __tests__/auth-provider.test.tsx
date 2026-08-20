import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

function TestConsumer() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div data-testid="loading">Loading...</div>;
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="is-admin">{isAdmin ? 'Admin' : 'User'}</div>
    </div>
  );
}

describe('AuthProvider Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('restores session and detects admin role correctly', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: {
            email: 'admin@example.com',
            app_metadata: { app_role: 'admin' },
          },
        } as any,
      },
      error: null,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('admin@example.com');
      expect(screen.getByTestId('is-admin').textContent).toBe('Admin');
    });
  });

  it('restores session for regular non-admin user', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: {
            email: 'user@example.com',
            app_metadata: { app_role: 'user' },
          },
        } as any,
      },
      error: null,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('user@example.com');
      expect(screen.getByTestId('is-admin').textContent).toBe('User');
    });
  });
});
