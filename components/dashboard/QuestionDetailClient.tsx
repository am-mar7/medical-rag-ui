"use client";
import Link from 'next/link';
import { useState } from 'react';
import EvaluateButton from './EvaluateButton';
import QuestionTrace from './QuestionTrace';

export default function QuestionDetailClient({ data, queryId }: { data: any; queryId: string }) {
  const [openChunkId, setOpenChunkId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState<boolean>(false);

  const handleResult = (res: any) => {
    setEvaluation(res);
    setPanelOpen(true);
  };

  const handleError = (err: string) => {
    setError(err);
    setPanelOpen(true);
  };

  const openChunk = (chunkId: string) => {
    setOpenChunkId(chunkId);
  };

  return (
    <div className="space-y-4 p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100">
      <div>
        <QuestionTrace data={data} openChunkId={openChunkId ?? undefined} />
      </div>

      <div className="mt-4 mx-auto max-w-4xl">
        <details
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
          open={panelOpen}
          onToggle={e => setPanelOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
            <div className="flex items-center justify-between w-full">
              <span>AI-Judge Evaluation</span>
              <span onClick={e => e.stopPropagation()}>
                <EvaluateButton
                  queryId={queryId}
                  onResult={handleResult}
                  onError={handleError}
                  stopPropagation
                />
              </span>
            </div>
          </summary>
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            {error && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/60 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {!evaluation && !error && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                No evaluation yet. Click Evaluate to run AI-Judge assessment.
              </div>
            )}

            {evaluation && (
              <div className="space-y-4">
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Query: <span className="font-semibold text-slate-900 dark:text-white">{evaluation.query_text}</span>
                </div>

                <div className="space-y-3">
                  {evaluation.methods?.map((m: any) => (
                    <div
                      key={m.retrieval_method}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">{m.retrieval_method}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          p@3: {m.precision_at_3 ?? '-'} • p@5: {m.precision_at_5 ?? '-'}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {(m.judgments || []).map((j: any) => (
                          <div key={j.chunk_id} className="flex items-start justify-between gap-3 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                            <div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">{j.reason}</div>
                              <div
                                className={`text-xs font-bold mt-0.5 ${
                                  j.relevant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {j.relevant ? '✓ Relevant' : '✕ Not relevant'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openChunk(j.chunk_id)}
                                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                              >
                                Open chunk
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Raw JSON:</div>
                <pre className="mt-2 max-h-64 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-xs font-mono text-slate-800 dark:text-slate-200">
                  {JSON.stringify(evaluation, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
