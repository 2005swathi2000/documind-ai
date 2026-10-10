import React, { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle,
  Database,
  MessageSquare,
  Clock,
  ShieldAlert,
  Grid
} from 'lucide-react';
import { dashboardService } from '../services/api';
import type { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading real-time application metrics...</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Completed', value: stats?.completed_documents || 0, color: '#10B981' },
    { name: 'Failed', value: stats?.failed_documents || 0, color: '#EF4444' },
    { name: 'Pending', value: stats?.pending_documents || 0, color: '#F59E0B' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Uploaded Docs</span>
            <h3 className="text-2xl font-bold text-white mt-0.5">{stats?.total_documents ?? 0}</h3>
            <span className="text-[11px] text-slate-400">{stats?.total_pages ?? 0} total pages</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Processed</span>
            <h3 className="text-2xl font-bold text-white mt-0.5">{stats?.completed_documents ?? 0}</h3>
            <span className="text-[11px] text-emerald-400">{stats?.total_tables ?? 0} tables extracted</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">FAISS Chunks</span>
            <h3 className="text-2xl font-bold text-white mt-0.5">{stats?.vector_index_size ?? 0}</h3>
            <span className="text-[11px] text-slate-400">Indexed vectors</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Queries Asked</span>
            <h3 className="text-2xl font-bold text-white mt-0.5">{stats?.total_queries ?? 0}</h3>
            <span className="text-[11px] text-purple-400">{stats?.abstention_rate_pct ?? 0}% abstention rate</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">Document Ingestion Pipeline Status</h3>
            <span className="text-xs text-slate-400">Real-time DB Data</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-5">
          <h3 className="text-lg font-bold text-white tracking-tight">Retrieval & Latency</h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Avg Query Latency</p>
                  <p className="text-lg font-bold text-white font-mono">{stats?.avg_query_latency_ms ?? 0} ms</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Abstained Queries</p>
                  <p className="text-lg font-bold text-amber-400 font-mono">{stats?.abstained_queries ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Grid className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Extracted Markdown Tables</p>
                  <p className="text-lg font-bold text-white font-mono">{stats?.total_tables ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
