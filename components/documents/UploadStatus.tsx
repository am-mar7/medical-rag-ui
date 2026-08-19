import type { UploadResponse } from '@/types/api';
export default function UploadStatus({ result }: { result: UploadResponse }) {
  return (
    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="font-semibold text-emerald-800">Document uploaded successfully</div>
      <div className="mt-2 text-sm text-emerald-700">{result.filename}</div>
      <div className="mt-3 inline-flex rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Status: {result.status}
      </div>
      <p className="mt-3 text-sm leading-6 text-emerald-700">{result.message}</p>
    </div>
  );
}
