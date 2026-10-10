import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { conversationService } from '../services/api';
import type { ConversationItem, ChatMessage } from '../types';

export const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const fetchConversations = async () => {
    try {
      const data = await conversationService.listConversations();
      setConversations(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConv = async (id: string) => {
    setSelectedConvId(id);
    try {
      const msgs = await conversationService.getMessages(id);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation thread?')) return;
    try {
      await conversationService.deleteConversation(id);
      if (selectedConvId === id) setSelectedConvId(null);
      fetchConversations();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-white tracking-tight">Conversation History</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 h-[600px] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No conversations recorded yet. Ask a question in the AI Workspace to start a thread.
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                  selectedConvId === conv.id
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="space-y-1 flex-1 pr-2">
                  <h4 className="text-sm font-semibold truncate">{conv.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>{conv.message_count} Messages</span>
                    <span>•</span>
                    <span>{new Date(conv.updated_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(conv.id, e)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-[600px] overflow-y-auto space-y-4">
          {!selectedConvId ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
              <MessageSquare className="w-10 h-10 text-slate-600 mb-2" />
              <span>Select a conversation thread to inspect question-answering history</span>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="space-y-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">Question: {m.query}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{m.latency_ms} ms</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{m.answer}</p>
                {m.abstained && (
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                    Abstained
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
