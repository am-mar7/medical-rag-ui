'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { AuthContextValue } from '@/types/api';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const updateAuthState = (currentSession: Session | null) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    const role = currentSession?.user?.app_metadata?.app_role;
    setIsAdmin(role === 'admin');
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          updateAuthState(data.session);
        }
      } catch {
        /* fallback to null session */
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        updateAuthState(newSession);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    }
    updateAuthState(data.session);
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<{ confirmationRequired: boolean }> => {
    const redirectUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to register account.');
    }

    const confirmationRequired = !data.session;
    return { confirmationRequired };
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    updateAuthState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
