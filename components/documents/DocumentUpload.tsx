'use client';
import { useRef, useState } from 'react';
import type { UploadResponse } from '@/types/api';
import { uploadDocument } from '@/lib/api/client';
import UploadStatus from './UploadStatus';

export default function DocumentUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const select = (candidate: File | undefined) => {
    if (!candidate) return;
    setResult(null);
    setError(null);
    if (candidate.type !== 'application/pdf' && !candidate.name.toLowerCase().endsWith('.pdf')) {
      setFile(null);
      setError('Only PDF documents are supported.');
      return;
    }
    setFile(candidate);
  };

  const submit = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await uploadDocument(file));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Something went wrong while uploading the document.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-10 md:min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Upload Documents
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Submit medical PDF documents for administrative review before ingestion into the Beats4U cardiovascular knowledge base.
          </p>
        </div>
        <div
          onDragOver={e => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => {
            e.preventDefault();
            setDrag(false);
            select(e.dataTransfer.files?.[0]);
          }}
          className={`rounded-3xl border-2 border-dashed p-8 text-center transition sm:p-12 ${
            drag
              ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={e => select(e.target.files?.[0])}
          />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-2xl text-slate-700 dark:text-slate-300 shadow-sm">
            ↑
          </div>
          <h2 className="mt-4 font-bold text-slate-900 dark:text-white">Drop a PDF here</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            or select a document from your computer
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
          >
            Select PDF
          </button>
          {file && (
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/60 p-4 text-left text-sm text-blue-900 dark:text-blue-200">
              <div className="font-semibold">Selected document</div>
              <div className="mt-1 truncate font-mono">{file.name}</div>
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={!file || loading}
            onClick={() => void submit()}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 shadow-md transition"
          >
            {loading ? 'Uploading…' : 'Upload Document'}
          </button>
        </div>
        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/60 p-4 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}
        {result && <UploadStatus result={result} />}
      </div>
    </div>
  );
}
