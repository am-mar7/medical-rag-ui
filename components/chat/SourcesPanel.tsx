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
    <div className="mt-3 ml-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-sm text-slate-600 flex items-center justify-between">
        <span className="font-semibold text-slate-700">Evidence score:</span>
        <span>{evidenceScore.toFixed(2)}</span>
      </div>
      <div className="divide-y divide-slate-200 bg-white p-4 space-y-3">
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
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 text-xs leading-5 text-slate-500">
        {' '}
        <span className="font-semibold text-slate-700">Disclaimer:</span> {disclaimer}
      </div>
    </div>
  );
}
