import React, { useState, useEffect } from 'react';
import { AIDiagnosis, DeterministicCheckResult, TroubleshootingCase } from '../types/network';
import { api, DiagnosisResponse } from '../services/api';
import { HumanReviewModal } from './HumanReviewModal';
import { 
  Play, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ListChecks, 
  ArrowRight,
  FileCode,
  RotateCcw,
  Sparkles,
  HelpCircle,
  UploadCloud
} from 'lucide-react';

interface DiagnosticConsoleProps {
  initialCaseId?: string;
  initialData?: {
    symptom: string;
    topology_note: string;
    show_output: string;
    config_snippet: string;
    case_id: string;
  };
  onReviewCompleted?: () => void;
  onNavigateToUpload?: () => void;
}

export const DiagnosticConsole: React.FC<DiagnosticConsoleProps> = ({
  initialCaseId,
  initialData,
  onReviewCompleted,
  onNavigateToUpload
}) => {
  const [cases, setCases] = useState<TroubleshootingCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialCaseId || initialData?.case_id || '');
  
  // Input fields
  const [symptom, setSymptom] = useState(initialData?.symptom || '');
  const [topologyNote, setTopologyNote] = useState(initialData?.topology_note || '');
  const [showOutput, setShowOutput] = useState(initialData?.show_output || '');
  const [configSnippet, setConfigSnippet] = useState(initialData?.config_snippet || '');

  // Results & States
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setSelectedCaseId(initialData.case_id);
      setSymptom(initialData.symptom);
      setTopologyNote(initialData.topology_note);
      setShowOutput(initialData.show_output);
      setConfigSnippet(initialData.config_snippet);
      return;
    }

    api.getCases().then(data => {
      setCases(data);
      if (initialCaseId) {
        const found = data.find(c => c.case_id === initialCaseId);
        if (found) loadCase(found);
      } else if (data.length > 0 && !symptom) {
        // Default to Case 1
        loadCase(data[0]);
      }
    }).catch(err => console.error(err));
  }, [initialCaseId, initialData]);

  const loadCase = (c: TroubleshootingCase) => {
    setSelectedCaseId(c.case_id);
    setSymptom(c.symptom);
    setTopologyNote(c.topology_note);
    setShowOutput(c.show_output);
    setConfigSnippet(c.config_snippet || '');
    setDiagnosisResult(null);
    setReviewSuccessMsg('');
    setErrorMsg('');
  };

  const handleCaseSelect = (caseId: string) => {
    if (!caseId) {
      setSelectedCaseId('');
      setSymptom('');
      setTopologyNote('');
      setShowOutput('');
      setConfigSnippet('');
      setDiagnosisResult(null);
      return;
    }
    const found = cases.find(c => c.case_id === caseId);
    if (found) loadCase(found);
  };

  const handleRunDiagnosis = async () => {
    if (!symptom.trim() && !showOutput.trim()) {
      setErrorMsg('Please provide network symptoms or show-command output.');
      return;
    }

    setErrorMsg('');
    setReviewSuccessMsg('');
    setIsDiagnosing(true);

    try {
      const res = await api.runDiagnosis({
        symptom,
        topology_note: topologyNote,
        show_output: showOutput,
        config_snippet: configSnippet,
        case_id: selectedCaseId || 'CUSTOM_CASE'
      });
      setDiagnosisResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Diagnostic service error');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleReviewSubmitted = async (decision: any, correction?: string, reason?: string) => {
    if (!diagnosisResult) return;
    await api.submitReview({
      case_id: selectedCaseId || 'CUSTOM_CASE',
      ai_diagnosis: diagnosisResult.ai_diagnosis,
      deterministic_rules: diagnosisResult.deterministic_rules,
      human_decision: decision,
      human_correction: correction,
      review_reason: reason || 'Verified through Diagnostic Console',
      is_responsible_ai_example: decision !== 'Accepted'
    });
    setReviewSuccessMsg(`Human review recorded successfully as "${decision}". Audit trail updated.`);
    if (onReviewCompleted) onReviewCompleted();
  };

  const confidenceBadges = {
    high: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    low: 'bg-rose-100 text-rose-800 border-rose-300'
  };

  const severityBadges = {
    low: 'bg-slate-100 text-slate-800 border-slate-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    high: 'bg-rose-100 text-rose-800 border-rose-300',
    critical: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            Live Network Troubleshooting Console
          </h2>
          <p className="text-xs text-slate-500">
            Accepts Packet Tracer topology notes, show commands, and symptoms for AI + deterministic evaluation.
          </p>
        </div>

        {/* Actions & Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToUpload && (
            <button
              type="button"
              onClick={onNavigateToUpload}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition flex items-center gap-1.5 shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload .PKT File</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Load Preset Case:</label>
            <select
              value={selectedCaseId}
              onChange={(e) => handleCaseSelect(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="">-- Custom Lab Input --</option>
              {cases.map((c) => (
                <option key={c.case_id} value={c.case_id}>
                  {c.case_id}: {c.concept} - {c.symptom.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Input / Form Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Panels (7 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-600" /> Network Lab Evidence Input
              </span>
              <span className="text-[11px] text-slate-400">All fields strictly grounded</span>
            </div>

            {/* 1. Symptom */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. Observed Network Symptom <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="e.g., PC1 can ping gateway but cannot reach PC2 on VLAN 20..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* 2. Topology Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2. Packet Tracer Topology & Addressing Notes
              </label>
              <textarea
                rows={2}
                value={topologyNote}
                onChange={(e) => setTopologyNote(e.target.value)}
                placeholder="e.g., PC1 on Fa0/1 (VLAN 10), PC2 on Fa0/2 (VLAN 20), SW1 connected to Router G0/0..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* 3. Show Command Output */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                3. Cisco Show-Command Outputs <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                value={showOutput}
                onChange={(e) => setShowOutput(e.target.value)}
                placeholder="Paste CLI outputs: show vlan brief, show ip route, show ip interface brief, ipconfig /all..."
                className="w-full text-xs p-2.5 font-mono bg-slate-900 text-emerald-400 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* 4. Optional Config Snippet */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                4. Optional Configuration Snippet (Running-Config / IOS)
              </label>
              <textarea
                rows={3}
                value={configSnippet}
                onChange={(e) => setConfigSnippet(e.target.value)}
                placeholder="interface GigabitEthernet0/0 ... switchport mode trunk ..."
                className="w-full text-xs p-2.5 font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleCaseSelect('')}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Form
              </button>

              <button
                type="button"
                onClick={handleRunDiagnosis}
                disabled={isDiagnosing}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-2"
              >
                {isDiagnosing ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    Analyzing Evidence...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Run AI & Rule Diagnosis
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Right Column: Diagnostic Results & Rule Validation (5 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          {reviewSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2.5 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{reviewSuccessMsg}</span>
            </div>
          )}

          {!diagnosisResult && !isDiagnosing && (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">Diagnostic Pipeline Ready</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a preset case or supply symptoms and show commands on the left, then click "Run AI & Rule Diagnosis".
              </p>
            </div>
          )}

          {isDiagnosing && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs text-center space-y-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Evaluating Network Evidence</h3>
                <p className="text-xs text-slate-500">
                  Calling Gemini reasoning engine + executing deterministic Python rule checker...
                </p>
              </div>
            </div>
          )}

          {diagnosisResult && (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Mandatory Safety Notice */}
              <div className="p-3 bg-amber-500/10 border border-amber-400/40 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Mandatory Human Review Required Before Any Fix Is Applied</span>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold transition"
                >
                  Review Diagnosis
                </button>
              </div>

              {/* AI Diagnostic Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    AI Root-Cause Diagnosis
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${confidenceBadges[diagnosisResult.ai_diagnosis.confidence]}`}>
                      {diagnosisResult.ai_diagnosis.confidence.toUpperCase()} CONFIDENCE
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${severityBadges[diagnosisResult.ai_diagnosis.severity]}`}>
                      {diagnosisResult.ai_diagnosis.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  
                  {/* Root cause */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Likely Root Cause</span>
                    <p className="text-sm font-semibold text-slate-900 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                      {diagnosisResult.ai_diagnosis.root_cause}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-3 p-2.5 bg-slate-50 rounded-lg text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">OSI Target Layer</span>
                      <strong className="text-slate-900">{diagnosisResult.ai_diagnosis.osi_layer}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Concept Category</span>
                      <strong className="text-slate-900">{diagnosisResult.ai_diagnosis.issue_type}</strong>
                    </div>
                  </div>

                  {/* Evidence Referenced */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Supporting Evidence (Directly Quoted)
                    </span>
                    <ul className="space-y-1">
                      {diagnosisResult.ai_diagnosis.evidence.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Evidence if any */}
                  {diagnosisResult.ai_diagnosis.missing_evidence && diagnosisResult.ai_diagnosis.missing_evidence.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" /> Missing Evidence for Full Certainty
                      </span>
                      <ul className="space-y-1">
                        {diagnosisResult.ai_diagnosis.missing_evidence.map((mev, i) => (
                          <li key={i} className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                            {mev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Command */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recommended Next Command</span>
                    <div className="p-2 bg-slate-900 text-emerald-400 font-mono rounded-lg border border-slate-800 text-[11px]">
                      {diagnosisResult.ai_diagnosis.next_command}
                    </div>
                  </div>

                  {/* Step-by-Step Fix */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recommended Cisco CLI Fix</span>
                    <div className="bg-slate-900 p-3 rounded-lg text-slate-100 font-mono text-[11px] space-y-1">
                      {diagnosisResult.ai_diagnosis.fix_steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-slate-500 select-none">$</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification Steps */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verification Steps</span>
                    <ul className="space-y-1">
                      {diagnosisResult.ai_diagnosis.verification_steps.map((v, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-700 bg-emerald-50/60 p-2 rounded border border-emerald-100">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Human-Review Status: <strong>Pending Signoff</strong></span>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" /> Open Review Modal
                  </button>
                </div>

              </div>

              {/* Deterministic Rule Engine Result */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Terminal className="w-4 h-4 text-slate-600" />
                    Deterministic Rule Checker Output
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    diagnosisResult.deterministic_rules.has_violations ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {diagnosisResult.deterministic_rules.has_violations ? 'Violations Found' : 'Clean'}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  {diagnosisResult.deterministic_rules.summary}
                </p>

                {diagnosisResult.deterministic_rules.violations.map((viol, i) => (
                  <div key={i} className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-amber-900">
                      <span>{viol.name}</span>
                      <span className="text-[10px] uppercase bg-amber-200 px-1.5 py-0.2 rounded font-mono">{viol.category}</span>
                    </div>
                    <p className="text-slate-700">{viol.description}</p>
                    <div className="text-[11px] font-mono text-slate-600 bg-white p-1.5 rounded border border-amber-200">
                      <strong>Fix:</strong> {viol.recommendation}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Human Review Modal */}
      {diagnosisResult && (
        <HumanReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          caseId={selectedCaseId || 'CUSTOM_CASE'}
          aiDiagnosis={diagnosisResult.ai_diagnosis}
          deterministicRules={diagnosisResult.deterministic_rules}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

    </div>
  );
};
