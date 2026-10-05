import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { DiagnosticConsole } from './components/DiagnosticConsole';
import { CaseDatasetView } from './components/CaseDatasetView';
import { ResponsibleAILog } from './components/ResponsibleAILog';
import { InteractiveDemo } from './components/InteractiveDemo';
import { PacketTracerUpload } from './components/PacketTracerUpload';
import { 
  Activity, 
  Layers, 
  Cpu, 
  ShieldAlert, 
  PlayCircle, 
  Sparkles,
  Network,
  UploadCloud
} from 'lucide-react';

type TabType = 'dashboard' | 'console' | 'pkt-upload' | 'cases' | 'responsible-ai' | 'demo';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedCaseForConsole, setSelectedCaseForConsole] = useState<string | undefined>(undefined);
  const [consoleInitialData, setConsoleInitialData] = useState<{
    symptom: string;
    topology_note: string;
    show_output: string;
    config_snippet: string;
    case_id: string;
  } | undefined>(undefined);

  const handleNavigateToConsoleWithCase = (caseId: string) => {
    setSelectedCaseForConsole(caseId);
    setConsoleInitialData(undefined);
    setActiveTab('console');
  };

  const handleSendFileToConsole = (data: {
    symptom: string;
    topology_note: string;
    show_output: string;
    config_snippet: string;
    case_id: string;
  }) => {
    setConsoleInitialData(data);
    setSelectedCaseForConsole(data.case_id);
    setActiveTab('console');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white">NetSage AI</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-400/20">
                    v2.0 • Human-in-the-Loop
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Cisco Packet Tracer Network Troubleshooting Assistant</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </button>

              <button
                onClick={() => { setSelectedCaseForConsole(undefined); setConsoleInitialData(undefined); setActiveTab('console'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'console'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span className="hidden md:inline">Diagnostic Console</span>
              </button>

              <button
                onClick={() => setActiveTab('pkt-upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'pkt-upload'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-indigo-300 hover:text-white hover:bg-slate-800 bg-indigo-950/40 border border-indigo-500/30'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                <span className="hidden md:inline">Upload .PKT Lab</span>
              </button>

              <button
                onClick={() => setActiveTab('cases')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'cases'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden md:inline">30 Benchmark Cases</span>
              </button>

              <button
                onClick={() => setActiveTab('responsible-ai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'responsible-ai'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden md:inline">Responsible AI Log</span>
              </button>

              <button
                onClick={() => setActiveTab('demo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'demo'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-emerald-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                <span className="hidden md:inline">Interactive Lab Demo</span>
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateToCases={() => setActiveTab('cases')}
            onNavigateToDemo={() => setActiveTab('demo')}
            onNavigateToConsole={() => { setSelectedCaseForConsole(undefined); setConsoleInitialData(undefined); setActiveTab('console'); }}
            onNavigateToResponsibleAI={() => setActiveTab('responsible-ai')}
            onNavigateToUpload={() => setActiveTab('pkt-upload')}
          />
        )}

        {activeTab === 'console' && (
          <DiagnosticConsole
            initialCaseId={selectedCaseForConsole}
            initialData={consoleInitialData}
            onNavigateToUpload={() => setActiveTab('pkt-upload')}
            onReviewCompleted={() => {}}
          />
        )}

        {activeTab === 'pkt-upload' && (
          <PacketTracerUpload
            onSendToConsole={handleSendFileToConsole}
            onReviewCompleted={() => {}}
          />
        )}

        {activeTab === 'cases' && (
          <CaseDatasetView
            onSelectCaseForDiagnosis={handleNavigateToConsoleWithCase}
          />
        )}

        {activeTab === 'responsible-ai' && (
          <ResponsibleAILog
            onSelectCaseForDiagnosis={handleNavigateToConsoleWithCase}
          />
        )}

        {activeTab === 'demo' && (
          <InteractiveDemo />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NetSage AI • Applied AI & Cisco Network Troubleshooting Project</span>
          <span className="font-mono text-[11px] text-slate-400">
            Safety Constraint: Human Review Required for All Actions
          </span>
        </div>
      </footer>

    </div>
  );
}
