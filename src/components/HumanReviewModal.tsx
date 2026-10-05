import React, { useState } from 'react';
import { AIDiagnosis, DeterministicCheckResult, HumanDecision } from '../types/network';
import { CheckCircle2, Edit3, XCircle, AlertTriangle, ShieldCheck, UserCheck, Terminal, Cpu } from 'lucide-react';

interface HumanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  aiDiagnosis: AIDiagnosis;
  deterministicRules?: DeterministicCheckResult;
  onReviewSubmitted: (decision: HumanDecision, correction?: string, reason?: string) => Promise<void>;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  isOpen,
  onClose,
  caseId,
  aiDiagnosis,
  deterministicRules,
  onReviewSubmitted,
}) => {
  const [decision, setDecision] = useState<HumanDecision>('Accepted');
  const [reviewerName, setReviewerName] = useState('Network Engineer (Reviewer)');
  const [correctedRootCause, setCorrectedRootCause] = useState('');
  const [correctedFixSteps, setCorrectedFixSteps] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewReason.trim()) {
      setErrorMsg('Please provide a technical rationale/reason for your review decision.');
      return;
    }

    if (decision === 'Edited' && !correctedRootCause.trim()) {
      setErrorMsg('Please provide the corrected root cause when editing.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const correctionPayload = decision === 'Edited'
        ? `Corrected Root Cause: ${correctedRootCause}\nCorrected Fix: ${correctedFixSteps}`
        : (decision === 'Rejected' ? `Diagnosis Rejected: ${correctedRootCause}` : undefined);

      await onReviewSubmitted(decision, correctionPayload, reviewReason);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Human-in-the-Loop Network Review</h3>
              <p className="text-xs text-slate-300">Case Reference: <span className="font-mono text-emerald-300 font-bold">{caseId}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          
          {/* AI vs Deterministic Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* AI Diagnosis Summary */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> AI Diagnostic Output
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  aiDiagnosis.confidence === 'high' ? 'bg-emerald-100 text-emerald-800' :
                  aiDiagnosis.confidence === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {aiDiagnosis.confidence.toUpperCase()} Confidence
                </span>
              </div>
              <p className="font-medium text-slate-900">{aiDiagnosis.root_cause}</p>
              <div className="text-xs text-slate-500 flex gap-2">
                <span>OSI: <strong className="text-slate-700">{aiDiagnosis.osi_layer}</strong></span>
                <span>•</span>
                <span>Type: <strong className="text-slate-700">{aiDiagnosis.issue_type}</strong></span>
              </div>
            </div>

            {/* Deterministic Rule Status */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> Deterministic Rule Engine
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  deterministicRules?.has_violations ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {deterministicRules?.has_violations ? `${deterministicRules.violations.length} Rule Flags` : 'Rules Clear'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {deterministicRules?.summary || 'Deterministic validation completed.'}
              </p>
              {deterministicRules?.violations && deterministicRules.violations.length > 0 && (
                <div className="text-xs bg-amber-50 p-1.5 rounded border border-amber-200 text-amber-900 font-mono">
                  {deterministicRules.violations[0].name}
                </div>
              )}
            </div>

          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Decision Radio Group */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Mandatory Review Decision <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('Accepted')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                    decision === 'Accepted'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${decision === 'Accepted' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="font-semibold text-xs">Accept AI Diagnosis</span>
                  <span className="text-[11px] text-slate-500">Diagnosis & fix verified accurate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('Edited')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                    decision === 'Edited'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs ring-1 ring-amber-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Edit3 className={`w-5 h-5 ${decision === 'Edited' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="font-semibold text-xs">Edit / Correct AI</span>
                  <span className="text-[11px] text-slate-500">Adjust root cause or CLI commands</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('Rejected')}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                    decision === 'Rejected'
                      ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs ring-1 ring-rose-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <XCircle className={`w-5 h-5 ${decision === 'Rejected' ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span className="font-semibold text-xs">Reject Diagnosis</span>
                  <span className="text-[11px] text-slate-500">AI hallucinated or misidentified</span>
                </button>
              </div>
            </div>

            {/* Conditional Correction Fields if Edited or Rejected */}
            {(decision === 'Edited' || decision === 'Rejected') && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Human Correction Details (Logged in Responsible AI Audit Trail)
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Verified Correct Root Cause <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={correctedRootCause}
                    onChange={(e) => setCorrectedRootCause(e.target.value)}
                    placeholder="e.g., Static default gateway misconfigured on client station..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                {decision === 'Edited' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Corrected Step-by-Step Remediation
                    </label>
                    <textarea
                      rows={2}
                      value={correctedFixSteps}
                      onChange={(e) => setCorrectedFixSteps(e.target.value)}
                      placeholder="e.g., interface FastEthernet0/2 -> switchport access vlan 20..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Reviewer Rationale */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Technical Review Rationale <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder="Explain why this diagnosis is accepted, edited, or rejected based on show-command evidence..."
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Reviewer Identity */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 mb-1">Reviewer Title / Name</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-md border border-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 text-xs font-semibold rounded-lg text-white transition flex items-center gap-2 ${
                  decision === 'Accepted' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  decision === 'Edited' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmitting ? 'Recording...' : `Confirm & Record ${decision}`}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
