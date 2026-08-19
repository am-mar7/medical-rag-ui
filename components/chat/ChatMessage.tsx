'use client';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { RagResponse } from '@/types/api';
import ConfidenceBadge from './ConfidenceBadge';
import AbstainedNotice from './AbstainedNotice';
import CitationMarker from './CitationMarker';
import SourcesToggle from './SourcesToggle';
import Link from 'next/link';

function renderAnswer(
  text: string,
  citations: RagResponse['citations'],
  activeChunkId: string | null,
  onHover: (id: string | null) => void
) {
  // Split on citation tokens like [1] but render each non-citation segment as Markdown
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      const index = Number(match[1]);
      const citation = citations[index - 1];
      if (!citation) return <span key={i}>{part}</span>;
      return (
        <CitationMarker
          key={i}
          index={index}
          chunkId={citation.chunk_id}
          active={activeChunkId === citation.chunk_id}
          onHover={onHover}
        />
      );
    }

    // Render markdown inline — ensure paragraphs render as spans so layout stays inline
    return (
      <ReactMarkdown
        key={i}
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <span>{children}</span>,
          a: ({ href, children }) => (
            <Link
              href={href!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 underline"
            >
              {children}
            </Link>
          ),
        }}
      >
        {part}
      </ReactMarkdown>
    );
  });
}

export default function ChatMessage({ response }: { response: RagResponse }) {
  const [activeChunkId, setActiveChunkId] = useState<string | null>(null);
  const answer = useMemo(
    () => renderAnswer(response.answer, response.citations, activeChunkId, setActiveChunkId),
    [response.answer, response.citations, activeChunkId]
  );
  return (
    <article className="border-b border-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Assistant
        </div>
        {response.abstained && <AbstainedNotice />}

        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
            AI
          </div>
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-slate-800">{answer}</div>
        </div>
        {response.citations.length > 0 && (
          <div className="mt-4">
            <SourcesToggle
              citations={response.citations}
              validations={response.citation_validations}
              evidenceScore={response.evidence_score}
              disclaimer={response.disclaimer}
              activeChunkId={activeChunkId}
              onHover={setActiveChunkId}
            />
          </div>
        )}
      </div>
    </article>
  );
}
