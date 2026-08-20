'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RagResponse } from '@/types/api';
import { ApiError } from '@/types/api';
import { askRag } from '@/lib/api/client';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import UserMessage from './UserMessage';

type ConversationMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; response: RagResponse };

export default function ChatThread() {
  const router = useRouter();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [dev, setDev] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (query: string) => {
    setError(null);
    const userMsg: ConversationMessage = { id: `u-${Date.now()}`, role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const result = await askRag({ query, dev });
      const assistantMsg: ConversationMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        response: result,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          router.push('/login');
          return;
        }
        if (e.status === 403) {
          setError('Access denied. You do not have permission to execute this operation.');
        } else {
          setError(e.detail || e.message);
        }
      } else {
        setError(
          e instanceof Error ? e.message : 'Something went wrong while generating the answer.'
        );
      }
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:min-h-screen">
      <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-lg font-semibold text-slate-950">Medical Q&amp;A</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ask questions and review the evidence behind each answer.
          </p>
        </div>
      </div>

      <div className="flex-1">
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-[55vh] max-w-4xl items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-xl">
                ✦
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Ask a medical question</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Answers are grounded in your uploaded documents and include evidence citations when
                available.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) =>
            m.role === 'user' ? (
              <UserMessage key={m.id} text={m.text} />
            ) : (
              <ChatMessage key={m.id} response={m.response} />
            )
          )
        )}

        {loading && (
          <div className="border-b border-slate-100 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-4xl text-sm text-slate-500">Reviewing evidence…</div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-4xl px-4 pb-4 sm:px-6 lg:px-10">
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          </div>
        )}
      </div>

      <MessageInput loading={loading} dev={dev} onDevChange={setDev} onSubmit={send} />
    </div>
  );
}
