import React, { useEffect, useState } from 'react';
import { Database, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';
import { systemService } from '../../services/api';
import type { SystemHealth } from '../../types';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await systemService.getHealth();
        setHealth(data);
      } catch {
        setHealth(null);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>FAISS Index:</span>
          <span className="font-mono font-semibold text-white">
            {health?.vector_index_status?.indexed_chunks ?? 0} Chunks
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>Model:</span>
          <span className="font-mono text-cyan-300">
            {health?.ollama_online ? health.default_model : 'Local Grounding'}
          </span>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
          health?.status === 'online'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          {health?.status === 'online' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backend Ready</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
