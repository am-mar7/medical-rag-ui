'use client';

import React from 'react';

export default function AdminDocumentsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-10 md:min-h-screen">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            <span>🛡️</span> Administrative Portal
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Document Moderation Queue
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review submitted medical documents for approval or rejection prior to knowledge base ingestion.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl">
            📑
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            Moderation Portal Active
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Admin verification active. Full moderation controls (approve/reject with reason) will be integrated in Phase 4.
          </p>
        </div>
      </div>
    </div>
  );
}
