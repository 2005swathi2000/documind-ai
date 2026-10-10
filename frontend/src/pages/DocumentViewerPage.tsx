import React, { useEffect, useState } from 'react';
import { FileText, ArrowLeft, Grid, ScanLine } from 'lucide-react';
import { documentService } from '../services/api';

interface DocumentViewerProps {
  docId: string;
  onBack: () => void;
}

export const DocumentViewerPage: React.FC<DocumentViewerProps> = ({ docId, onBack }) => {
  const [docDetail, setDocDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoc = async () => {
      try {
        const data = await documentService.getDocumentDetails(docId);
        setDocDetail(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDoc();
  }, [docId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading document page structure...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{docDetail?.filename}</h2>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span>{docDetail?.page_count} Pages</span>
            <span>•</span>
            <span>{docDetail?.chunks_count} Vector Chunks</span>
            {docDetail?.table_count > 0 && (
              <>
                <span>•</span>
                <span className="text-blue-400">{docDetail?.table_count} Markdown Tables</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Document ID</span>
            <p className="text-xs text-slate-200 font-mono break-all">{docDetail?.id}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">File Hash (SHA-256)</span>
            <p className="text-xs text-slate-200 font-mono truncate">{docDetail?.file_hash || 'SHA-256 Computed'}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Processing Status</span>
            <p className="text-xs text-emerald-400 font-semibold">{docDetail?.status}</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h4 className="text-sm font-semibold text-white mb-3">Extracted Layout & Processing Features</h4>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Digital PyMuPDF Text Stream</span>
            </div>
            {docDetail?.table_count > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <Grid className="w-4 h-4 text-blue-400" />
                <span>pdfplumber Table Extraction</span>
              </div>
            )}
            {docDetail?.has_scanned_pages && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <ScanLine className="w-4 h-4 text-amber-400" />
                <span>Tesseract OCR Engine</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
