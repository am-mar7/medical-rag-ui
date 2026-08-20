import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthGate } from '@/components/auth/AuthGate';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

describe('AuthGate Component', () => {
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useRouter).mockReturnValue({ replace: mockReplace } as any);
  });

  it('renders loading spinner when loading is true', () => {
    vi.mocked(usePathname).mockReturnValue('/chat');
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      isAdmin: false,
      loading: true,
      user: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthGate>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGate>
    );

    expect(screen.getByText('Restoring session…')).toBeDefined();
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('redirects unauthenticated user from protected page /chat to /login', () => {
    vi.mocked(usePathname).mockReturnValue('/chat');
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      isAdmin: false,
      loading: false,
      user: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthGate>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGate>
    );

    expect(mockReplace).toHaveBeenCalledWith('/login');
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });

  it('redirects authenticated user from /login page to /chat', () => {
    vi.mocked(usePathname).mockReturnValue('/login');
    vi.mocked(useAuth).mockReturnValue({
      session: {} as any,
      isAdmin: false,
      loading: false,
      user: { email: 'test@example.com' } as any,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthGate>
        <div data-testid="auth-page">Login Page</div>
      </AuthGate>
    );

    expect(mockReplace).toHaveBeenCalledWith('/chat');
    expect(screen.queryByTestId('auth-page')).toBeNull();
  });

  it('renders children when authenticated user accesses /chat', () => {
    vi.mocked(usePathname).mockReturnValue('/chat');
    vi.mocked(useAuth).mockReturnValue({
      session: {} as any,
      isAdmin: false,
      loading: false,
      user: { email: 'test@example.com' } as any,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AuthGate>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGate>
    );

    expect(screen.getByTestId('protected-content')).toBeDefined();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
