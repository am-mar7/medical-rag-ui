import React from 'react';
import dynamic from 'next/dynamic';

const QuestionDetailClient = dynamic(() => import('@/components/dashboard/QuestionDetailClient'), {
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://52.28.26.147:8000';

async function fetchTrace(id: string) {
  const res = await fetch(`${API_URL}/dev/queries/${id}/trace`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch trace: ${res.status}`);
  return res.json();
}

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const { id } = params;
  let data: any = null;
  try {
    data = await fetchTrace(id);
  } catch (e) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold mb-4">Query details</h1>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
            Could not load trace: {(e as Error).message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4">Query details</h1>
        {/* client wrapper handles evaluation UI + trace interaction */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <QuestionDetailClient data={data} queryId={id} />
      </div>
    </div>
  );
}
