import type { Citation, CitationValidation } from '@/types/api';

export default function CitationCard({
  citation,
  validation,
  active,
}: {
  citation: Citation;
  validation?: CitationValidation;
  active: boolean;
}) {
  const status = validation?.status;
  const statusStyle =
    status === 'supports'
      ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
      : status === 'contradicts'
        ? 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
        : 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300';
  return (
    <article
      id={`citation-${citation.chunk_id}`}
      className={`rounded-xl border p-4 transition ${
        active
          ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-200 dark:ring-emerald-900'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
          {citation.filename ? citation.filename.charAt(0).toUpperCase() : '1'}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-900 dark:text-white">{citation.filename}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Pages {citation.page_start}–{citation.page_end}
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm leading-6 text-slate-800 dark:text-slate-200">{citation.claim}</div>
      {validation && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle}`}>
            {status === 'supports'
              ? '✓ Supports'
              : status === 'contradicts'
                ? '✕ Contradicts'
                : '? Unclear'}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              validation.risk_level === 'high'
                ? 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
            }`}
          >
            Risk: {validation.risk_level === 'high' ? 'High' : 'Standard'}
          </span>
        </div>
      )}
      {validation?.reason && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            Validation details
          </summary>
          <p className="mt-2 leading-6 text-slate-600 dark:text-slate-400">{validation.reason}</p>
        </details>
      )}
    </article>
  );
}
