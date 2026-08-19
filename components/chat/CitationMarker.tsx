'use client';
export default function CitationMarker({
  index,
  chunkId,
  active,
  onHover,
}: {
  index: number;
  chunkId: string;
  active: boolean;
  onHover: (chunkId: string | null) => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Citation ${index}`}
      onMouseEnter={() => onHover(chunkId)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(chunkId)}
      onBlur={() => onHover(null)}
      className={`mx-0.5 inline-flex min-w-6 items-center justify-center rounded-md border px-1 py-0.5 align-baseline text-xs font-semibold transition ${active ? 'border-emerald-400 bg-emerald-100 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
    >
      [{index}]
    </button>
  );
}
