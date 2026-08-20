'use client';

import { useState } from 'react';
import type { RagResponse } from '@/types/api';
import { askRagStream } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';
import { detectPersonalInfo } from '@/lib/personal-info-detector';
import { useChatStore, ConversationMessage } from '@/lib/store/useChatStore';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import UserMessage from './UserMessage';
import PersonalMemoryModal from './PersonalMemoryModal';

export default function ChatThread() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // use zustand store for messages and dev flag
  const messages = useChatStore((s) => s.messages);
  const setMessages = useChatStore((s) => s.setMessages);
  const dev = useChatStore((s) => s.dev);
  const setDev = useChatStore((s) => s.setDev);

  // Auth and Personal Memory context
  const {
    user,
    activePersonalContext,
    personalMemories,
    savePersonalMemory,
    removePersonalMemory,
    clearPersonalMemories,
  } = useAuth();

  // Modal control state
  const [modalOpen, setModalOpen] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [showMemoriesDrawer, setShowMemoriesDrawer] = useState(false);

  const executeSend = async (query: string, overridePersonalContext?: string) => {
    setError(null);
    const userMsg: ConversationMessage = { id: `u-${Date.now()}`, role: 'user', text: query };
    const assistantId = `a-${Date.now()}`;
    const assistantMsg: ConversationMessage = {
      id: assistantId,
      role: 'assistant',
      isStreaming: true,
      streamingText: '',
    };

    setMessages([...useChatStore.getState().messages, userMsg, assistantMsg]);
    setLoading(true);

    const contextToUse = overridePersonalContext !== undefined ? overridePersonalContext : activePersonalContext;

    try {
      const finalResult = await askRagStream(
        {
          query,
          dev,
          personal_context: contextToUse.trim() ? contextToUse : undefined,
        },
        (token: string) => {
          setMessages(
            useChatStore.getState().messages.map((msg: ConversationMessage) =>
              msg.id === assistantId && msg.role === 'assistant'
                ? { ...msg, streamingText: (msg.streamingText || '') + token }
                : msg
            )
          );
        }
      );

      setMessages(
        useChatStore.getState().messages.map((msg: ConversationMessage) =>
          msg.id === assistantId && msg.role === 'assistant'
            ? {
                ...msg,
                isStreaming: false,
                response: finalResult,
                streamingText: finalResult.answer,
              }
            : msg
        )
      );

      // Check if backend detected personal medical info in query
      if (finalResult.has_personal_info && finalResult.extracted_personal_info) {
        const extracted = finalResult.extracted_personal_info;
        const isAlreadySaved = personalMemories.some(
          (m) => m.toLowerCase().includes(extracted.toLowerCase()) || extracted.toLowerCase().includes(m.toLowerCase())
        );

        if (!isAlreadySaved) {
          setDetectedText(extracted);
          setModalOpen(true);
        }
      }
    } catch (e) {
      setMessages(useChatStore.getState().messages.filter((msg: ConversationMessage) => msg.id !== assistantId));
      setError(e instanceof Error ? e.message : 'Something went wrong while generating the answer.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (query: string) => {
    // Detect if the query contains personal medical/history details ONLY for logged in users
    if (user) {
      const detection = detectPersonalInfo(query);

      if (detection.hasPersonalInfo && detection.extractedContext) {
        // Check if this exact fact is already saved
        const isAlreadySaved = personalMemories.some(m =>
          m.toLowerCase().includes(detection.extractedContext.toLowerCase())
        );

        if (!isAlreadySaved) {
          setDetectedText(detection.extractedContext);
          setPendingQuery(query);
          setModalOpen(true);
          return;
        }
      }
    }

    // No new personal info detected or user is guest, proceed with normal execution
    await executeSend(query);
  };

  const handleSaveMemoryModal = async (factToSave: string) => {
    setModalOpen(false);
    await savePersonalMemory(factToSave);
    const updatedContext = activePersonalContext
      ? `${activePersonalContext}; ${factToSave}`
      : factToSave;

    if (pendingQuery) {
      const q = pendingQuery;
      setPendingQuery(null);
      await executeSend(q, updatedContext);
    }
  };

  const handleSkipMemoryModal = async () => {
    setModalOpen(false);
    if (pendingQuery) {
      const q = pendingQuery;
      setPendingQuery(null);
      await executeSend(q);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:min-h-screen">
      {/* Header Bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-950">Medical Q&amp;A</h1>
            <p className="mt-1 text-sm text-slate-500">
              Ask questions and review the evidence behind each answer.
            </p>
          </div>

          {/* Active Personal Memory Pill */}
          {personalMemories.length > 0 && (
            <button
              onClick={() => setShowMemoriesDrawer(!showMemoriesDrawer)}
              className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <span>🧠</span>
              <span>
                {personalMemories.length} Personal Context {personalMemories.length === 1 ? 'Fact' : 'Facts'} Active
              </span>
              <span className="text-slate-400">▼</span>
            </button>
          )}
        </div>

        {/* Collapsible Active Memories Drawer */}
        {showMemoriesDrawer && personalMemories.length > 0 && (
          <div className="mx-auto max-w-4xl mt-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Saved Personal Context (Sent with future chats):
              </span>
              <button
                onClick={clearPersonalMemories}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Clear All Context
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {personalMemories.map((mem, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm"
                >
                  <span>{mem}</span>
                  <button
                    onClick={() => removePersonalMemory(mem)}
                    title="Remove this item"
                    className="ml-1 text-slate-400 hover:text-rose-500 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1">
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-[55vh] max-w-4xl items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-xl text-blue-600 shadow-sm">
                ✦
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Ask a medical question</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Answers are grounded in your uploaded documents and include evidence citations when available.
              </p>
              
              {/* Sample personal question suggestion pills */}
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                <button
                  onClick={() => handleUserSubmit("I am 45 years old with hypertension (165/105). What lifestyle changes are recommended?")}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50/50 transition"
                >
                  💡 &quot;I am 45 years old with hypertension (165/105)...&quot;
                </button>
                <button
                  onClick={() => handleUserSubmit("What are the primary WHO guidelines for blood pressure management?")}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50/50 transition"
                >
                  💡 &quot;What are WHO guidelines for blood pressure management?&quot;
                </button>
              </div>
            </div>
          </div>
        ) : (
          messages.map((m: ConversationMessage) =>
            m.role === 'user' ? (
              <UserMessage key={m.id} text={m.text} />
            ) : (
              <ChatMessage
                key={m.id}
                response={m.response}
                isStreaming={m.isStreaming}
                streamingText={m.streamingText}
              />
            )
          )
        )}

        {error && (
          <div className="mx-auto max-w-4xl px-4 pb-4 sm:px-6 lg:px-10 mt-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          </div>
        )}
      </div>

      <MessageInput loading={loading} dev={dev} onDevChange={setDev} onSubmit={handleUserSubmit} />

      {/* Pop-up modal for saving personal memory */}
      <PersonalMemoryModal
        isOpen={modalOpen}
        detectedText={detectedText}
        onSave={handleSaveMemoryModal}
        onSkip={handleSkipMemoryModal}
      />
    </div>
  );
}
