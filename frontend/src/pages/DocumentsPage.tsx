import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Grid,
  ScanLine
} from 'lucide-react';
import { documentService } from '../services/api';
import type { DocumentItem } from '../types';

interface DocumentsPageProps {
  onViewDoc?: (docId: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onViewDoc }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const data = await documentService.listDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocs();
    const interval = setInterval(fetchDocs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Invalid file type. Only PDF documents are supported.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File size exceeds maximum allowed limit of 50MB.');
      return;
    }

    setErrorMsg(null);
    setUploading(true);
    try {
      await documentService.uploadDocument(file);
      setSuccessMsg(`Uploaded '${file.name}' successfully. Processing started.`);
      fetchDocs();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document and its vector embeddings?')) return;
    try {
      await documentService.deleteDocument(docId);
      setSuccessMsg('Document deleted successfully.');
      fetchDocs();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to delete document.');
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Upload PDF Document</h3>
            <p className="text-slate-400 text-sm mt-1">Drag and drop your PDF here, or click to browse</p>
            <p className="text-xs text-slate-400 mt-0.5">Supports Digital PDF, Tables, and Scanned OCR pages (Max 50MB)</p>
          </div>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold cursor-pointer transition-all shadow-md">
            <span>Select PDF File</span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={uploading}
            />
          </label>

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm font-medium pt-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Uploading & Parsing PDF...</span>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs text-rose-400 underline">Dismiss</button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-400 underline">Dismiss</button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white tracking-tight">Document Library</h3>
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Pages</th>
                <th className="px-6 py-4">Features</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Uploaded</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No documents uploaded yet. Upload a PDF above to get started.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white tracking-tight">{doc.filename}</p>
                        <p className="text-xs text-slate-400 font-mono">{(doc.file_size_bytes / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {doc.page_count} Pages
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {doc.table_count > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                            <Grid className="w-3 h-3" /> {doc.table_count} Tables
                          </span>
                        )}
                        {doc.has_scanned_pages && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                            <ScanLine className="w-3 h-3" /> OCR Scanned
                          </span>
                        )}
                        {doc.table_count === 0 && !doc.has_scanned_pages && (
                          <span className="text-xs text-slate-400">Standard Text</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {doc.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Indexed
                        </span>
                      )}
                      {doc.status === 'PROCESSING' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing
                        </span>
                      )}
                      {doc.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onViewDoc && (
                          <button
                            onClick={() => onViewDoc(doc.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Inspect Document Pages"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
