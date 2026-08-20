'use client';
import { useState } from 'react';

export default function MessageInput({
  loading,
  dev,
  onDevChange,
  onSubmit,
}: {
  loading: boolean;
  dev: boolean;
  onDevChange: (v: boolean) => void;
  onSubmit: (query: string) => Promise<void>;
}) {
  const [value, setValue] = useState('');

  const submit = async () => {
    const q = value.trim();
    if (!q || loading) return;
    setValue('');
    try {
      await onSubmit(q);
    } catch {
      setValue(q);
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 p-4 backdrop-blur sm:p-5">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md dark:shadow-none focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40">
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            disabled={loading}
            rows={2}
            placeholder="Ask a medical question..."
            className="w-full resize-none rounded-t-2xl border-0 bg-transparent px-4 py-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60"
            aria-label="Medical question"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 px-3 py-2">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={dev}
                onChange={e => onDevChange(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 dark:bg-slate-800 focus:ring-blue-500"
              />
              Dev Mode
            </label>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!value.trim() || loading}
              className="ml-auto rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
            >
              {loading ? 'Thinking…' : 'Send'}
            </button>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}
