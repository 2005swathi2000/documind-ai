import React from 'react';
import {
  ShieldCheck,
  BarChart3,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="space-y-12 p-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Academic Research & Major Engineering Project
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            An Evidence-Grounded <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Multimodal RAG Framework</span> for Intelligent Document Understanding
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            DocuMind AI combines digital text parsing, table extraction, Tesseract OCR fallback, FAISS vector indexing, Reciprocal Rank Fusion hybrid retrieval, and evidence validation for hallucination-free question answering with exact source page citations.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onStart}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white tracking-tight">Key Architectural Innovations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-semibold text-white">Hybrid Retrieval (RRF)</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Combines BM25 keyword matching with FAISS vector similarity using Reciprocal Rank Fusion (RRF) to retrieve relevant text and tables across digital and scanned PDF pages.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-semibold text-white">Abstention Engine</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Calculates relevance confidence metrics. Explicitly abstains ("Answer could not be established") when context is missing, preventing AI hallucinations.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-semibold text-white">Reproducible Research Suite</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Evaluates Recall@5, Precision@5, MRR, Citation Accuracy, and Abstention Quality against benchmark datasets with CSV export capabilities.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Implemented Workflow Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>Digital PDF text extraction (PyMuPDF / pdfplumber)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>Table detection & Markdown grid parsing</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>Scanned page detection & Tesseract OCR fallback</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>FAISS L2 Normalized Cosine Vector Store</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>Multi-turn Chat & Verifiable Page Citations</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>Prompt Injection Defense & Untrusted Input Filtering</span>
          </div>
        </div>
      </div>
    </div>
  );
};
