import React, { useEffect, useState } from 'react';
import { Database, Terminal } from 'lucide-react';
import { systemService } from '../services/api';
import type { SystemHealth } from '../types';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    systemService.getHealth().then(setHealth).catch(console.error);
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-white tracking-tight">System Settings & Health Diagnostics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-cyan-400">
            <Terminal className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-white">Python Backend Environment</h3>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Python Version:</span>
              <span className="text-white">{health?.python_version ?? '3.12'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">PyMuPDF Version:</span>
              <span className="text-white">{health?.pymupdf_version ?? '1.28'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Tesseract OCR Available:</span>
              <span className={health?.ocr_available ? 'text-emerald-400' : 'text-amber-400'}>
                {health?.ocr_available ? 'YES (Installed)' : 'Fallback (Digital Extraction)'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-blue-400">
            <Database className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-white">AI Engine & FAISS Vector Store</h3>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Embedding Model:</span>
              <span className="text-cyan-300">{health?.embedding_model ?? 'all-MiniLM-L6-v2'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">FAISS Index Type:</span>
              <span className="text-white">{health?.vector_index_status?.index_type ?? 'IndexFlatIP (Cosine)'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Ollama LLM Service:</span>
              <span className={health?.ollama_online ? 'text-emerald-400' : 'text-slate-400'}>
                {health?.ollama_online ? `Online (${health.default_model})` : 'Offline (Local Grounding Fallback)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
