'use client';

import { useState, useEffect } from 'react';

type Chunk = {
  rank?: number;
  chunk_id: string;
  chunk_text: string;
  score?: number;
  filename?: string;
  page_start?: number;
};

type Traces = {
  [k: string]: Chunk[];
};

export default function QuestionTrace({ data, openChunkId }: { data: any; openChunkId?: string }) {
  const traces: Traces = data.traces || {};
  const [openTypes, setOpenTypes] = useState<Record<string, boolean>>({});
  const [openChunks, setOpenChunks] = useState<Record<string, boolean>>({});

  const toggleType = (type: string) => setOpenTypes(prev => ({ ...prev, [type]: !prev[type] }));
  const toggleChunk = (id: string) => setOpenChunks(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    if (!openChunkId) return;
    for (const [type, chunks] of Object.entries(traces)) {
      if (chunks.some(c => c.chunk_id === openChunkId)) {
        setOpenTypes(prev => ({ ...prev, [type]: true }));
        setOpenChunks(prev => ({ ...prev, [openChunkId]: true }));
        break;
      }
    }
  }, [openChunkId, traces]);

  const formattedDate = data.created_at ? new Date(data.created_at).toLocaleString() : '';

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Query Summary Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="text-lg font-bold text-slate-950 dark:text-white">{data.query_text}</div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">{formattedDate}</div>
        <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
          Evidence score:{' '}
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {typeof data.evidence_score === 'number' ? data.evidence_score.toFixed(2) : (data.evidence_score ?? 'N/A')}
          </span>
        </div>
      </div>

      {/* Traces List */}
      {Object.keys(traces).length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-500 dark:text-slate-400 text-center">
          No traces available.
        </div>
      ) : (
        Object.entries(traces).map(([type, chunks]) => (
          <div key={type} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => toggleType(type)}
              className="w-full text-left px-5 py-3.5 font-semibold text-sm flex items-center justify-between text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
            >
              <span className="capitalize">
                {type.replace('_', ' ')} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({chunks.length})</span>
              </span>
              <span className="text-slate-400 dark:text-slate-500">{openTypes[type] ? '▾' : '▸'}</span>
            </button>

            {openTypes[type] && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 px-5 py-2">
                {chunks.map((chunk, idx) => (
                  <div key={chunk.chunk_id || idx} id={chunk.chunk_id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {chunk.filename ? `Document: ${chunk.filename}` : `Chunk ID: ${chunk.chunk_id}`}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          rank: {chunk.rank ?? idx + 1} • score: {typeof chunk.score === 'number' ? chunk.score.toFixed(3) : (chunk.score ?? '-')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleChunk(chunk.chunk_id)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                          {openChunks[chunk.chunk_id] ? 'Hide chunk' : 'View chunk'}
                        </button>
                      </div>
                    </div>

                    {openChunks[chunk.chunk_id] && (
                      <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed overflow-x-auto">
                        {chunk.chunk_text}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
