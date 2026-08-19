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
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-10 md:min-h-screen">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Upload Documents</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Add PDF documents to the knowledge base used by the medical RAG assistant.
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
          className={`rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-12 ${drag ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-white'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={e => select(e.target.files?.[0])}
          />
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl">
            ↑
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">Drop a PDF here</h2>
          <p className="mt-1 text-sm text-slate-500">or select a document from your computer</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Select PDF
          </button>
          {file && (
            <div className="mx-auto mt-6 max-w-md rounded-xl border border-blue-100 bg-blue-50 p-3 text-left text-sm text-blue-800">
              <div className="font-medium">Selected document</div>
              <div className="mt-1 truncate">{file.name}</div>
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={!file || loading}
            onClick={() => void submit()}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Uploading…' : 'Upload Document'}
          </button>
        </div>
        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}
        {result && <UploadStatus result={result} />}
      </div>
    </div>
  );
}
