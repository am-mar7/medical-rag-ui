'use client';
import { useState } from 'react';
import type { Citation, CitationValidation } from '@/types/api';
import SourcesPanel from './SourcesPanel';
export default function SourcesToggle({
  citations,
  validations,
  evidenceScore,
  disclaimer,
  activeChunkId,
  onHover,
}: {
  citations: Citation[];
  validations: CitationValidation[];
  evidenceScore: number;
  disclaimer: string;
  activeChunkId: string | null;
  onHover: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 ${open ? 'bg-slate-50' : 'bg-white'}`}
      >
        <span className="text-slate-400">{open ? '⌄' : '›'}</span>
        <span>Sources &amp; citations ({citations.length})</span>
      </button>
      {open && (
        <div className="mt-3">
          <SourcesPanel
            citations={citations}
            validations={validations}
            evidenceScore={evidenceScore}
            disclaimer={disclaimer}
            activeChunkId={activeChunkId}
          />
        </div>
      )}
    </div>
  );
}
