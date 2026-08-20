'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  Zap,
  RotateCw,
} from 'lucide-react';

type QueryItem = {
  id: string;
  query_text: string;
  created_at: string;
  abstained: boolean;
  evidence_score: number;
};

export default function DashboardClient({ initialQueries }: { initialQueries: QueryItem[] }) {
  const [queries, setQueries] = useState<QueryItem[]>(initialQueries);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'answered' | 'abstained'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Analytics Metrics
  const totalQueries = queries.length;
  const answeredQueries = useMemo(() => queries.filter(q => !q.abstained), [queries]);
  const abstainedQueries = useMemo(() => queries.filter(q => q.abstained), [queries]);
  
  const answeredRate = totalQueries > 0 
    ? Math.round((answeredQueries.length / totalQueries) * 100) 
    : 0;

  const avgEvidenceScore = useMemo(() => {
    if (totalQueries === 0) return 0;
    const totalScore = queries.reduce((acc, q) => acc + (q.evidence_score || 0), 0);
    return (totalScore / totalQueries).toFixed(2);
  }, [queries, totalQueries]);

  // Filtered queries list
  const filteredQueries = useMemo(() => {
    return queries.filter(q => {
      const matchesSearch = q.query_text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === 'all'
          ? true
          : filterStatus === 'answered'
          ? !q.abstained
          : q.abstained;
      return matchesSearch && matchesFilter;
    });
  }, [queries, searchTerm, filterStatus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://52.28.26.147:8000';
      const res = await fetch(`${API_URL}/dev/queries?limit=50`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setQueries(data);
      }
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="min-h-screen p-8 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Dashboard — Recent Queries
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review live telemetry, evidence scores, and query execution traces.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            Refresh Feed
          </button>
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Queries */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Queries
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{totalQueries}</span>
              <span className="text-xs text-slate-500">logged sessions</span>
            </div>
          </div>

          {/* Card 2: System Answer Rate */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Answer Rate
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-700">{answeredRate}%</span>
              <span className="text-xs text-slate-500">({answeredQueries.length} answered)</span>
            </div>
          </div>

          {/* Card 3: Avg Groundedness */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Avg Evidence Score
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{avgEvidenceScore}</span>
              <span className="text-xs text-slate-500">/ 1.00 threshold</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search query text or keywords..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            {(['all', 'answered', 'abstained'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  filterStatus === status
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Queries List */}
        <div className="space-y-3">
          {filteredQueries.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No queries found.
            </div>
          ) : (
            filteredQueries.map(q => {
              const isAbstained = q.abstained;
              const formattedDate = new Date(q.created_at).toLocaleString();

              return (
                <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-md font-medium text-slate-800">
                      <Link href={`/question/${q.id}`} className="hover:text-emerald-800 transition-colors">
                        {q.query_text}
                      </Link>
                    </div>
                    <div className="text-xs text-slate-500 shrink-0 font-mono">
                      {formattedDate}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isAbstained
                            ? 'border border-rose-200 bg-rose-50 text-rose-700'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isAbstained ? 'Abstained' : 'Answered'}
                      </span>
                      <span className="text-slate-600">
                        Evidence score:{' '}
                        <span className="font-semibold text-slate-800">
                          {typeof q.evidence_score === 'number'
                            ? q.evidence_score.toFixed(2)
                            : String(q.evidence_score || '0.00')}
                        </span>
                      </span>
                    </div>

                    <Link
                      href={`/question/${q.id}`}
                      className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      View Trace <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
