import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePathname } from 'next/navigation';

vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('AppShell Component', () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(usePathname).mockReturnValue('/chat');
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'doctor@hospital.org' } as any,
      session: {} as any,
      isAdmin: false,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    });
  });

  it('renders user email and handles logout click', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    expect(screen.getByText('doctor@hospital.org')).toBeDefined();

    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('shows Document Review link for admin user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'admin@hospital.org' } as any,
      session: {} as any,
      isAdmin: true,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    });

    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );

    expect(screen.getByText('Document Review')).toBeDefined();
    expect(screen.getByText('Admin')).toBeDefined();
  });
});
