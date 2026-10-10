import React from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';

export const HelpDocsPage: React.FC = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-slate-300">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Help & Academic Documentation</h2>
        <p className="text-xs text-slate-400 mt-1">DocuMind AI Major B.Tech IT Project Guide</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-lg text-white">How to Use the Application</h3>
          </div>
          <ol className="space-y-3 text-sm list-decimal list-inside text-slate-300">
            <li>Navigate to <strong className="text-white">Document Library</strong> and drop your PDF document.</li>
            <li>Wait for PyMuPDF text parsing, pdfplumber table extraction, and FAISS vector indexing to complete.</li>
            <li>Open the <strong className="text-white">AI Workspace</strong>. Select document scope and retrieval mode (Hybrid RAG recommended).</li>
            <li>Ask questions grounded in uploaded documents. Click citation badges <span className="text-cyan-400 font-mono">[Document, Page X]</span> to inspect source excerpts.</li>
            <li>Run the <strong className="text-white">Research Evaluation</strong> suite to generate Recall@5 and Citation Accuracy comparative charts.</li>
          </ol>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-semibold">
            <GraduationCap className="w-5 h-5" />
            <h3 className="text-lg text-white">Viva Presentation Highlights</h3>
          </div>
          <ul className="space-y-3 text-sm list-disc list-inside text-slate-300">
            <li><strong className="text-white">Problem Addressed:</strong> Standard RAG frameworks suffer from hallucinations and fail to handle tables or scanned PDF pages.</li>
            <li><strong className="text-white">Hybrid Retrieval:</strong> Reciprocal Rank Fusion (RRF) combines BM25 keyword matching with FAISS vector similarity.</li>
            <li><strong className="text-white">Reliability & Defense:</strong> Abstention Engine rejects low-relevance queries, while input sanitization protects against prompt injection attacks.</li>
            <li><strong className="text-white">Reproducible Research:</strong> Benchmarked against synthetic DocVQA datasets with CSV export capabilities.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
