import React from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  History,
  FlaskConical,
  Settings,
  HelpCircle,
  BrainCircuit,
  Home
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Document Library', icon: FileText },
    { id: 'chat', label: 'AI Workspace', icon: MessageSquare },
    { id: 'conversations', label: 'Conversations', icon: History },
    { id: 'evaluation', label: 'Research & Evaluation', icon: FlaskConical },
    { id: 'settings', label: 'System Health', icon: Settings },
    { id: 'help', label: 'Help & Docs', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 text-slate-300 select-none z-30">
      {/* Brand Logo */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight leading-none">DocuMind AI</h1>
          <span className="text-[11px] text-cyan-400 font-medium">Multimodal RAG Framework</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Academic Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
        <div className="text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Final-Year B.Tech Major Project</p>
          <p className="text-[11px] text-slate-400">Team Size: 5–6 Students</p>
          <p className="text-[10px] text-cyan-500 font-mono">v1.0.0 • Verified Runnable</p>
        </div>
      </div>
    </aside>
  );
};
