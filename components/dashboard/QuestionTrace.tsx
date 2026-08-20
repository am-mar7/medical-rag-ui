'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, FileText, Sparkles, Layers, CheckCircle2, Award } from 'lucide-react';

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
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="text-lg font-semibold text-slate-900">{data.query_text}</div>
        <div className="mt-1 text-xs text-slate-500">{formattedDate}</div>
        <div className="mt-3 text-sm text-slate-700">
          Evidence score:{' '}
          <span className="font-semibold">
            {typeof data.evidence_score === 'number' ? data.evidence_score.toFixed(2) : (data.evidence_score ?? 'N/A')}
          </span>
        </div>
      </div>

      {/* Traces List */}
      {Object.keys(traces).length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No traces available.
        </div>
      ) : (
        Object.entries(traces).map(([type, chunks]) => (
          <div key={type} className="rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => toggleType(type)}
              className="w-full text-left px-4 py-3 font-medium text-sm flex items-center justify-between"
            >
              <span className="capitalize">
                {type.replace('_', ' ')} <span className="text-xs text-slate-500">({chunks.length})</span>
              </span>
              <span className="text-slate-400">{openTypes[type] ? '▾' : '▸'}</span>
            </button>

            {openTypes[type] && (
              <div className="divide-y divide-slate-100 px-4 py-2">
                {chunks.map((chunk, idx) => (
                  <div key={chunk.chunk_id || idx} id={chunk.chunk_id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {chunk.filename ? `Document: ${chunk.filename}` : `Chunk ID: ${chunk.chunk_id}`}
                        </div>
                        <div className="text-xs text-slate-500">
                          rank: {chunk.rank ?? idx + 1} • score: {typeof chunk.score === 'number' ? chunk.score.toFixed(3) : (chunk.score ?? '-')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleChunk(chunk.chunk_id)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                        >
                          {openChunks[chunk.chunk_id] ? 'Hide chunk' : 'View chunk'}
                        </button>
                      </div>
                    </div>

                    {openChunks[chunk.chunk_id] && (
                      <pre className="mt-3 whitespace-pre-wrap rounded-md border border-slate-100 bg-slate-50 p-3 text-sm text-slate-800 font-mono">
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
