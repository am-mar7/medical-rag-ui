import type { UploadResponse } from '@/types/api';

export default function UploadStatus({ result }: { result: UploadResponse }) {
  const isPendingReview = result.status === 'pending_review';

  return (
    <div
      className={`mt-6 rounded-xl border p-4 ${
        isPendingReview
          ? 'border-amber-200 bg-amber-50'
          : 'border-emerald-200 bg-emerald-50'
      }`}
    >
      <div
        className={`font-semibold ${
          isPendingReview ? 'text-amber-800' : 'text-emerald-800'
        }`}
      >
        {isPendingReview
          ? 'Document submitted for administrative review'
          : 'Document uploaded successfully'}
      </div>
      <div className={`mt-2 text-sm ${isPendingReview ? 'text-amber-700' : 'text-emerald-700'}`}>
        {result.filename}
      </div>
      <div
        className={`mt-3 inline-flex rounded-full border bg-white px-2.5 py-1 text-xs font-semibold ${
          isPendingReview
            ? 'border-amber-200 text-amber-700'
            : 'border-emerald-200 text-emerald-700'
        }`}
      >
        Status: {result.status}
      </div>
      <p className={`mt-3 text-sm leading-6 ${isPendingReview ? 'text-amber-700' : 'text-emerald-700'}`}>
        {result.message}
      </p>
    </div>
  );
}
