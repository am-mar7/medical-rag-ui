import React from 'react';
import Link from 'next/link';

type QueryItem = {
  id: string;
  query_text: string;
  created_at: string;
  abstained: boolean;
  evidence_score: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
async function fetchQueries(limit = 50): Promise<QueryItem[]> {
  const res = await fetch(`${API_URL}/dev/queries?limit=${limit}`, { cache: 'no-store' });
  const data = await res.json();
  console.log('RES', data);
  if (!res.ok) {
    throw new Error(`Failed to fetch queries: ${res.status}`);
  }
  return data;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { limit?: string };
}) {
  const limit = searchParams?.limit ? Number(searchParams.limit) : 50;
  let queries: QueryItem[] = [];
  try {
    queries = await fetchQueries(limit);
  } catch (e) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold mb-4">Dashboard — Recent Queries</h1>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
            Could not load queries: {(e as Error).message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4">Dashboard — Recent Queries</h1>

        <div className="space-y-4">
          {queries.length === 0 ? (
            <div className="text-sm text-slate-500">No queries found.</div>
          ) : (
            queries.map(q => (
              <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-1">
                  <div className="text-md text-slate-800 font-medium">
                    <Link href={`/question/${q.id}`} className="hover:text-emerald-800">
                      {q.query_text}
                    </Link>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(q.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 font-semibold ${
                      q.abstained
                        ? 'border border-rose-200 bg-rose-50 text-rose-700'
                        : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {q.abstained ? 'Abstained' : 'Answered'}
                  </span>
                  <span className="text-sm text-slate-600">
                    Evidence score:{' '}
                    {typeof q.evidence_score === 'number'
                      ? q.evidence_score.toFixed(2)
                      : String(q.evidence_score)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
