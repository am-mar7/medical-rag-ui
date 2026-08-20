'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { MemoryItem, UserResponse } from '@/types/api';
import {
  deleteMemoryApi,
  getMeApi,
  getMemoriesApi,
  loginApi,
  saveMemoryApi,
  signUpApi,
} from './api/client';

export interface User {
  id: string;
  email: string;
  user_metadata?: { full_name?: string };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;

  // Personal Memory Context state
  memoryItems: MemoryItem[];
  personalMemories: string[];
  activePersonalContext: string;
  savePersonalMemory: (fact: string) => Promise<void>;
  removePersonalMemory: (fact: string) => Promise<void>;
  clearPersonalMemories: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  memoryItems: [],
  personalMemories: [],
  activePersonalContext: '',
  savePersonalMemory: async () => {},
  removePersonalMemory: async () => {},
  clearPersonalMemories: async () => {},
});

const STORAGE_KEY = 'medical_rag_user_memories';
const TOKEN_KEY = 'medical_rag_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [personalMemories, setPersonalMemories] = useState<string[]>([]);

  // Load local memories on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPersonalMemories(JSON.parse(stored));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Validate stored token and fetch memories on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    getMeApi(storedToken)
      .then((userProfile: UserResponse) => {
        setUser({
          id: userProfile.user_id,
          email: userProfile.email,
          user_metadata: { full_name: userProfile.full_name },
        });
        fetchUserMemories(storedToken);
      })
      .catch(() => {
        // Invalid or expired token
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchUserMemories = async (authToken: string) => {
    try {
      const res = await getMemoriesApi(authToken);
      if (res && res.memories) {
        setMemoryItems(res.memories);
        const remoteTexts = res.memories.map((m) => m.memory_text).filter(Boolean);
        setPersonalMemories((prev) => {
          const merged = Array.from(new Set([...prev, ...remoteTexts]));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.warn('Failed to fetch user memories from backend API:', err);
    }
  };

  const signIn = async (email: string, pass: string) => {
    try {
      const res = await loginApi({ email, password: pass });
      const authToken = res.access_token;
      localStorage.setItem(TOKEN_KEY, authToken);
      setToken(authToken);

      const uProfile = res.user;
      setUser({
        id: uProfile.user_id,
        email: uProfile.email,
        user_metadata: { full_name: uProfile.full_name },
      });

      await fetchUserMemories(authToken);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Login failed') };
    }
  };

  const signUp = async (email: string, pass: string, fullName?: string) => {
    try {
      const res = await signUpApi({ email, password: pass, full_name: fullName });
      const authToken = res.access_token;

      if (authToken) {
        localStorage.setItem(TOKEN_KEY, authToken);
        setToken(authToken);

        const uProfile = res.user;
        setUser({
          id: uProfile.user_id,
          email: uProfile.email,
          user_metadata: { full_name: uProfile.full_name },
        });
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Registration failed') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setMemoryItems([]);
    setPersonalMemories([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const savePersonalMemory = async (fact: string) => {
    if (!fact || !fact.trim()) return;
    const cleanFact = fact.trim();

    setPersonalMemories((prev) => {
      if (prev.includes(cleanFact)) return prev;
      const updated = [...prev, cleanFact];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });

    if (token) {
      try {
        const newItem = await saveMemoryApi(cleanFact, token);
        if (newItem) {
          setMemoryItems((prev) => [newItem, ...prev]);
        }
      } catch (err) {
        console.warn('Failed to save memory to backend API:', err);
      }
    }
  };

  const removePersonalMemory = async (fact: string) => {
    setPersonalMemories((prev) => {
      const updated = prev.filter((m) => m !== fact);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });

    const targetItem = memoryItems.find((m) => m.memory_text === fact);
    if (token && targetItem) {
      try {
        await deleteMemoryApi(targetItem.id, token);
        setMemoryItems((prev) => prev.filter((m) => m.id !== targetItem.id));
      } catch (err) {
        console.warn('Failed to delete memory from backend API:', err);
      }
    }
  };

  const clearPersonalMemories = async () => {
    const currentItems = [...memoryItems];
    setPersonalMemories([]);
    setMemoryItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }

    if (token && currentItems.length > 0) {
      for (const item of currentItems) {
        try {
          await deleteMemoryApi(item.id, token);
        } catch {
          /* ignore */
        }
      }
    }
  };

  const activePersonalContext = personalMemories.join('; ');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        memoryItems,
        personalMemories,
        activePersonalContext,
        savePersonalMemory,
        removePersonalMemory,
        clearPersonalMemories,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
