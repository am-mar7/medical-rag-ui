'use client';

import React, { useState, useEffect } from 'react';

interface PersonalMemoryModalProps {
  isOpen: boolean;
  detectedText: string;
  onSave: (factToSave: string) => void;
  onSkip: () => void;
}

export default function PersonalMemoryModal({
  isOpen,
  detectedText,
  onSave,
  onSkip,
}: PersonalMemoryModalProps) {
  const [text, setText] = useState(detectedText);

  useEffect(() => {
    setText(detectedText);
  }, [detectedText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-slate-900">
        <button
          onClick={onSkip}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
        >
          ✕
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-2xl text-blue-600">
            🧠
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-950">
              Save Personal Information?
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              We noticed your question contains personal medical context. Would you like to save this fact so future chats automatically tailor answers to your history?
            </p>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Extracted Information (You can edit before saving):
          </label>
          <textarea
            rows={3}
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Skip for Now
          </button>
          <button
            type="button"
            onClick={() => {
              if (text.trim()) {
                onSave(text.trim());
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors"
          >
            <span>💾</span> Save to My Profile
          </button>
        </div>
      </div>
    </div>
  );
}
