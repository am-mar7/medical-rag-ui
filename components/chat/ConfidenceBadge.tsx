import type { RagResponse } from '@/types/api';
export default function ConfidenceBadge({ label }: { label: RagResponse['confidence_label'] }) {
  const styles = {
    high: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    low: 'border-rose-200 bg-rose-50 text-rose-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[label]}`}
    >
      {label[0].toUpperCase() + label.slice(1)} confidence
    </span>
  );
}
