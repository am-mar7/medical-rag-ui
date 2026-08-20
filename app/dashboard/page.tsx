import React from 'react';
import DashboardClient from '@/components/dashboard/DashboardClient';

type QueryItem = {
  id: string;
  query_text: string;
  created_at: string;
  abstained: boolean;
  evidence_score: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://52.28.26.147:8000';

async function fetchQueries(limit = 50): Promise<QueryItem[]> {
  try {
    const res = await fetch(`${API_URL}/dev/queries?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch queries from backend:', err);
    return [];
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { limit?: string };
}) {
  const limit = searchParams?.limit ? Number(searchParams.limit) : 50;
  const queries: QueryItem[] = await fetchQueries(limit);

  return <DashboardClient initialQueries={queries} />;
}
