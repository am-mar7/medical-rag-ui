'use client';
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
    <div className="space-y-4">
      <div>
        <QuestionTrace data={data} openChunkId={openChunkId ?? undefined} />
      </div>

      <div className="mt-4">
        <details
          className="rounded border border-slate-200 bg-white"
          open={panelOpen}
          onToggle={e => setPanelOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="cursor-pointer px-4 py-3 font-medium">
            <div className="flex items-center justify-between w-full">
              <span>Evaluation</span>
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
          <div className="px-4 py-3">
            {error && (
              <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            {!evaluation && !error && (
              <div className="text-sm text-slate-500">
                No evaluation yet. Click Evaluate to run.
              </div>
            )}

            {evaluation && (
              <div className="space-y-3">
                <div className="text-sm text-slate-700">
                  Query: <span className="font-medium">{evaluation.query_text}</span>
                </div>

                <div className="space-y-2">
                  {evaluation.methods?.map((m: any) => (
                    <div
                      key={m.retrieval_method}
                      className="rounded border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{m.retrieval_method}</div>
                        <div className="text-xs text-slate-500">
                          p@3: {m.precision_at_3 ?? '-'} • p@5: {m.precision_at_5 ?? '-'}
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        {(m.judgments || []).map((j: any) => (
                          <div key={j.chunk_id} className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs text-slate-600">{j.reason}</div>
                              <div
                                className={`text-sm ${
                                  j.relevant ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {j.relevant ? 'Relevant' : 'Not relevant'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openChunk(j.chunk_id)}
                                className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                              >
                                Open chunk
                              </button>
                              <a
                                href={`#${j.chunk_id}`}
                                className="text-xs text-slate-500 underline"
                                onClick={e => {
                                  e.preventDefault();
                                  openChunk(j.chunk_id);
                                }}
                              >
                                Link
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs text-slate-500">Raw JSON:</div>
                <pre className="mt-2 max-h-64 overflow-auto rounded border border-slate-100 bg-slate-50 p-3 text-xs">
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
