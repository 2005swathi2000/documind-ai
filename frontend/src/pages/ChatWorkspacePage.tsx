import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Clock,
  ShieldAlert,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { qaService, documentService } from '../services/api';
import type { QueryResponse, Citation, DocumentItem } from '../types';

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
  abstained?: boolean;
  latency_ms?: number;
  retrieved_passages?: any[];
}

export const ChatWorkspacePage: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am **DocuMind AI**. Upload PDF documents and ask questions grounded strictly in your document evidence. Every answer includes verifiable source page citations.'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [retrievalMode, setRetrievalMode] = useState<'keyword' | 'vector' | 'hybrid'>('hybrid');
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await documentService.listDocuments();
        setDocuments(docs.filter(d => d.status === 'COMPLETED'));
      } catch (e) {
        console.error(e);
      }
    };
    fetchDocs();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery;
    setInputQuery('');
    
    const userMsg: MessageItem = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const docIds = selectedDocId === 'all' ? undefined : [selectedDocId];
      const res: QueryResponse = await qaService.query({
        question: userText,
        retrieval_mode: retrievalMode,
        document_ids: docIds,
        top_k: 5,
        abstention_threshold: 0.35
      });

      const botMsg: MessageItem = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.answer,
        citations: res.citations,
        abstained: res.abstained,
        latency_ms: res.latency_ms,
        retrieved_passages: res.retrieved_passages
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: MessageItem = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'An error occurred while communicating with the document intelligence backend.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-1 flex flex-col bg-slate-950">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Document Scope:</span>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Documents ({documents.length})</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setRetrievalMode('keyword')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                retrievalMode === 'keyword'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Keyword (BM25)
            </button>
            <button
              onClick={() => setRetrievalMode('vector')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                retrievalMode === 'vector'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vector (FAISS)
            </button>
            <button
              onClick={() => setRetrievalMode('hybrid')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                retrievalMode === 'hybrid'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hybrid RAG (RRF)
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-4xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-gradient-to-tr from-cyan-600 to-blue-600'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-3 max-w-2xl ${
                msg.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-slate-100 rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.abstained && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Low Evidence Confidence: Answer abstained to prevent model hallucinations.</span>
                    </div>
                  )}
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Verifiable Evidence Sources:</span>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cit, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveCitation(cit)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 text-xs font-mono transition-all"
                        >
                          <BookOpen className="w-3 h-3 text-cyan-400" />
                          <span>[{cit.filename}, Page {cit.page_number}]</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.latency_ms !== undefined && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Latency: {msg.latency_ms} ms</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-4xl">
              <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm flex items-center gap-3">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Searching vector store & verifying page evidence...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-slate-900/80 border-t border-slate-800">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-3 max-w-4xl mx-auto"
          >
            <input
              type="text"
              placeholder="Ask a question grounded in your PDF documents..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {activeCitation && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-5 space-y-4 overflow-y-auto z-10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white tracking-tight">Source Citation Details</h4>
            <button
              onClick={() => setActiveCitation(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Document File</span>
              <p className="font-semibold text-cyan-400 break-all">{activeCitation.filename}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Source Page</span>
              <p className="font-bold text-white font-mono">Page {activeCitation.page_number}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Relevance Score</span>
              <p className="font-bold text-emerald-400 font-mono">{activeCitation.score}</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-slate-400 font-medium">Extracted Text Excerpt</span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                "{activeCitation.excerpt}"
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
