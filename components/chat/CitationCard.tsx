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
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'contradicts'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-amber-200 bg-amber-50 text-amber-700';
  return (
    <article
      id={`citation-${citation.chunk_id}`}
      className={`rounded-xl border p-4 transition ${active ? 'border-emerald-300 bg-emerald-50/30 ring-2 ring-emerald-100' : 'border-slate-200 bg-white'}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
          {citation.filename ? citation.filename.charAt(0).toUpperCase() : '1'}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-800">{citation.filename}</div>
          <div className="text-xs text-slate-500">
            Pages {citation.page_start}–{citation.page_end}
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm leading-6 text-slate-800">{citation.claim}</div>
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
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${validation.risk_level === 'high' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
          >
            Risk: {validation.risk_level === 'high' ? 'High' : 'Standard'}
          </span>
        </div>
      )}
      {validation?.reason && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-medium text-slate-600">
            Validation details
          </summary>
          <p className="mt-2 leading-6 text-slate-600">{validation.reason}</p>
        </details>
      )}
    </article>
  );
}
