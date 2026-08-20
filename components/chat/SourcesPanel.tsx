'use client';
import type { Citation, CitationValidation } from '@/types/api';
import CitationCard from './CitationCard';

export default function SourcesPanel({
  citations,
  validations,
  evidenceScore,
  disclaimer,
  activeChunkId,
}: {
  citations: Citation[];
  validations: CitationValidation[];
  evidenceScore: number;
  disclaimer: string;
  activeChunkId: string | null;
}) {
  return (
    <div className="mt-3 ml-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 flex items-center justify-between">
        <span className="font-semibold text-slate-800 dark:text-white">Evidence score:</span>
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{evidenceScore.toFixed(2)}</span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        {citations.map(citation => (
          <div key={citation.chunk_id} className="py-2">
            <CitationCard
              citation={citation}
              validation={validations.find(v => v.chunk_id === citation.chunk_id)}
              active={activeChunkId === citation.chunk_id}
            />
          </div>
        ))}
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Disclaimer:</span> {disclaimer}
      </div>
    </div>
  );
}
