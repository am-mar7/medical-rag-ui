'use client';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { RagResponse } from '@/types/api';
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
              className="text-emerald-600 dark:text-emerald-400 underline font-medium"
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

interface ChatMessageProps {
  response?: RagResponse;
  isStreaming?: boolean;
  streamingText?: string;
}

export default function ChatMessage({ response, isStreaming, streamingText }: ChatMessageProps) {
  const [activeChunkId, setActiveChunkId] = useState<string | null>(null);

  const displayText = isStreaming ? (streamingText || '') : (response?.answer || '');
  const citations = response?.citations || [];

  const answer = useMemo(
    () => renderAnswer(displayText, citations, activeChunkId, setActiveChunkId),
    [displayText, citations, activeChunkId]
  );

  return (
    <article className="border-b border-slate-100 dark:border-slate-800/60 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Assistant
        </div>
        {response?.abstained && <AbstainedNotice />}

        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold shadow-sm">
            AI
          </div>
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-slate-800 dark:text-slate-100">
            {displayText ? (
              <>
                {answer}
                {isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 bg-emerald-500 animate-pulse align-middle" />
                )}
              </>
            ) : isStreaming ? (
              <span className="text-slate-400 dark:text-slate-500 italic animate-pulse">
                Reviewing evidence…
              </span>
            ) : null}
          </div>
        </div>
        {response && response.citations.length > 0 && (
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
