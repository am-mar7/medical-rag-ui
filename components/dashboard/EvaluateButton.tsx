'use client';
import { useState } from 'react';

export default function EvaluateButton({
  queryId,
  onResult,
  onError,
  stopPropagation = false,
}: {
  queryId: string;
  onResult?: (res: any) => void;
  onError?: (err: string) => void;
  stopPropagation?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://52.28.26.147:8000';
      const res = await fetch(`${API_URL}/dev/queries/${queryId}/evaluate`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: '',
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server responded ${res.status}: ${text}`);
      }

      const json = await res.json();
      if (onResult) onResult(json);
    } catch (e: any) {
      const msg = e.message ?? String(e);
      setError(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={e => {
          if (stopPropagation) e.stopPropagation();
          void handleEvaluate();
        }}
        className="inline-flex items-center gap-2 rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Evaluating...' : 'Evaluate'}
      </button>

      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
}
