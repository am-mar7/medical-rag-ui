import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askRag, uploadDocument, fetchWithAuth } from '@/lib/api/client';
import { ApiError } from '@/types/api';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      refreshSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe('Centralized API Client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('attaches Authorization Bearer token when session exists', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-access-token',
        } as any,
      },
      error: null,
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ answer: 'Test answer', citations: [] }),
    } as Response);
    global.fetch = mockFetch;

    await askRag({ query: 'Hello' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    const headers = options.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer mock-access-token');
  });

  it('retries request on 401 if refreshSession succeeds', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'expired-token' } as any },
      error: null,
    });

    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { user: null, session: { access_token: 'new-refreshed-token' } as any },
      error: null,
    });

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Token expired' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ answer: 'Success after refresh' }),
      } as Response);

    global.fetch = mockFetch;

    const res = await askRag({ query: 'Test' });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
    expect(res.answer).toBe('Success after refresh');
  });

  it('signs out and throws ApiError(401) if refreshSession fails', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'invalid-token' } as any },
      error: null,
    });

    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Refresh failed' } as any,
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' }),
    } as Response);

    global.fetch = mockFetch;

    await expect(askRag({ query: 'Test' })).rejects.toThrow(ApiError);
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('throws ApiError immediately on 403 without retrying', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'user-token' } as any },
      error: null,
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ detail: 'Admin access required' }),
    } as Response);

    global.fetch = mockFetch;

    try {
      await askRag({ query: 'Test' });
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(403);
      expect(e.detail).toBe('Admin access required');
    }

    expect(supabase.auth.refreshSession).not.toHaveBeenCalled();
  });
});
