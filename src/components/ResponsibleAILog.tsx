import React, { useEffect, useState } from 'react';
import { ResponsibleAICase } from '../types/network';
import { api } from '../services/api';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  HelpCircle, 
  Layers, 
  FileWarning, 
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';

interface ResponsibleAILogProps {
  onSelectCaseForDiagnosis: (caseId: string) => void;
}

export const ResponsibleAILog: React.FC<ResponsibleAILogProps> = ({ onSelectCaseForDiagnosis }) => {
  const [cases, setCases] = useState<ResponsibleAICase[]>([]);
  const [selectedCase, setSelectedCase] = useState<ResponsibleAICase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getResponsibleAICases().then(data => {
      setCases(data);
      if (data.length > 0) setSelectedCase(data[0]);
    }).finally(() => setLoading(false));
  }, []);

  const flawBadges: Record<string, string> = {
    'Hallucination': 'bg-rose-100 text-rose-800 border-rose-200',
    'Premature Certainty': 'bg-amber-100 text-amber-800 border-amber-200',
    'Missing Evidence': 'bg-blue-100 text-blue-800 border-blue-200',
    'Wrong Layer': 'bg-purple-100 text-purple-800 border-purple-200',
    'Overlooked Syntax': 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-purple-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-400/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Responsible AI Governance & Error Calibration Log</span>
            </div>
            <h1 className="text-xl font-bold text-white">
              Responsible AI Audit Registry ({cases.length} Calibrated Cases)
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Documenting documented scenarios where human network engineers audited, caught, and corrected AI misdiagnoses, hallucinations, or premature conclusions before any network configuration was touched.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-900/80 p-3 rounded-xl border border-purple-800/40">
            <div className="text-center px-3 border-r border-purple-800/60">
              <div className="text-xl font-bold text-purple-400">{cases.length}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Audits</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xl font-bold text-emerald-400">100%</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Human Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: List of 5+ Responsible AI Cases */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Human-Corrected AI Cases</span>
            <span className="text-[11px] text-slate-400">{cases.length} Recorded</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {cases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              const badgeClass = flawBadges[c.initial_ai_diagnosis.flaw_type] || 'bg-slate-100 text-slate-800';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 cursor-pointer transition text-xs space-y-2 ${
                    isSelected ? 'bg-purple-50/80 border-l-4 border-purple-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{c.case_id}</span>
                      <span className="text-[10px] font-mono text-slate-400">({c.id})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeClass}`}>
                      {c.initial_ai_diagnosis.flaw_type}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-900">{c.title}</h4>
                  
                  <div className="bg-white p-2 rounded border border-slate-100 text-[11px] text-slate-600">
                    <strong className="text-amber-800">Human Override: </strong>
                    <span className="line-clamp-2">{c.human_correction.actual_root_cause}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-Depth Case Audit Inspector */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCase ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                      {selectedCase.case_id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                      Decision: {selectedCase.human_correction.decision}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${flawBadges[selectedCase.initial_ai_diagnosis.flaw_type]}`}>
                      Flaw: {selectedCase.initial_ai_diagnosis.flaw_type}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-2">
                    {selectedCase.title}
                  </h3>
                </div>

                <button
                  onClick={() => onSelectCaseForDiagnosis(selectedCase.case_id)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
                >
                  Inspect in Console <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scenario */}
              <div className="text-xs space-y-1">
                <span className="font-bold uppercase tracking-wider text-slate-500">Problem Scenario</span>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                  {selectedCase.scenario}
                </p>
              </div>

              {/* Side-by-Side: Initial AI Diagnosis vs Human Correction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* AI Misdiagnosis */}
                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 uppercase text-[11px] tracking-wider">
                    <FileWarning className="w-4 h-4 text-rose-600" />
                    Initial AI Output (Flawed)
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-rose-100 text-slate-800 font-medium">
                    {selectedCase.initial_ai_diagnosis.root_cause}
                  </div>
                  <p className="text-[11px] text-rose-800">
                    <strong>Failure Reason: </strong>{selectedCase.human_correction.why_ai_failed}
                  </p>
                </div>

                {/* Human Verified Correction */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 uppercase text-[11px] tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Human Verified Root Cause
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100 text-slate-900 font-medium">
                    {selectedCase.human_correction.actual_root_cause}
                  </div>
                  <p className="text-[11px] text-emerald-900">
                    <strong>Remediation: </strong>{selectedCase.human_correction.correct_remediation}
                  </p>
                </div>

              </div>

              {/* Responsible AI Safety Lesson */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-purple-900 uppercase text-[11px] tracking-wider">
                  <BookOpen className="w-4 h-4 text-purple-700" />
                  Engineering Safety Lesson & Guardrail
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {selectedCase.human_correction.lesson_learned}
                </p>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400 text-xs">
              Select an audit case from the left to view the full human-AI comparison.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
