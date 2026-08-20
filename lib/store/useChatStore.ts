'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ConversationMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; response: any };

type ChatState = {
  messages: ConversationMessage[];
  dev: boolean;
  setMessages: (m: ConversationMessage[]) => void;
  addMessage: (m: ConversationMessage) => void;
  clearMessages: () => void;
  setDev: (v: boolean) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    set => ({
      messages: [],
      dev: false,
      setMessages: (m: ConversationMessage[]) => set({ messages: m }),
      addMessage: (m: ConversationMessage) => set(s => ({ messages: [...s.messages, m] })),
      clearMessages: () => set({ messages: [] }),
      setDev: (v: boolean) => set({ dev: v }),
    }),
    {
      name: 'medical-rag-store-v1',
    }
  )
);
