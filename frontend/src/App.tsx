import { useState } from 'react';
import { Sidebar } from './components/Navigation/Sidebar';
import { Header } from './components/Navigation/Header';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentViewerPage } from './pages/DocumentViewerPage';
import { ChatWorkspacePage } from './pages/ChatWorkspacePage';
import { ConversationsPage } from './pages/ConversationsPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpDocsPage } from './pages/HelpDocsPage';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [viewDocId, setViewDocId] = useState<string | null>(null);

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'landing': return 'DocuMind AI Overview';
      case 'dashboard': return 'Application Analytics Dashboard';
      case 'documents': return 'Document Management Library';
      case 'doc_viewer': return 'Document Page Inspector';
      case 'chat': return 'Evidence-Grounded AI Workspace';
      case 'conversations': return 'Conversation History';
      case 'evaluation': return 'Research Evaluation & Benchmark';
      case 'settings': return 'System Health & Settings';
      case 'help': return 'Academic Help & Documentation';
      default: return 'DocuMind AI';
    }
  };

  const renderContent = () => {
    if (activeTab === 'doc_viewer' && viewDocId) {
      return (
        <DocumentViewerPage
          docId={viewDocId}
          onBack={() => { setViewDocId(null); setActiveTab('documents'); }}
        />
      );
    }

    switch (activeTab) {
      case 'landing':
        return <LandingPage onStart={() => setActiveTab('chat')} />;
      case 'dashboard':
        return <DashboardPage />;
      case 'documents':
        return (
          <DocumentsPage
            onViewDoc={(id) => { setViewDocId(id); setActiveTab('doc_viewer'); }}
          />
        );
      case 'chat':
        return <ChatWorkspacePage />;
      case 'conversations':
        return <ConversationsPage />;
      case 'evaluation':
        return <EvaluationPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpDocsPage />;
      default:
        return <LandingPage onStart={() => setActiveTab('chat')} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setViewDocId(null); setActiveTab(tab); }} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getHeaderTitle()} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
