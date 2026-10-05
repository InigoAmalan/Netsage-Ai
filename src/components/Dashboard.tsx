import React, { useEffect, useState } from 'react';
import { DashboardMetrics, HumanReviewRecord, ResponsibleAICase } from '../types/network';
import { api } from '../services/api';
import { 
  Activity, 
  CheckCircle2, 
  Edit3, 
  XCircle, 
  ShieldAlert, 
  Layers, 
  Server, 
  Cpu, 
  ArrowUpRight, 
  AlertCircle,
  FileCheck,
  RefreshCw,
  Sparkles,
  UploadCloud
} from 'lucide-react';

interface DashboardProps {
  onNavigateToCases: () => void;
  onNavigateToDemo: () => void;
  onNavigateToConsole: () => void;
  onNavigateToResponsibleAI: () => void;
  onNavigateToUpload?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToCases,
  onNavigateToDemo,
  onNavigateToConsole,
  onNavigateToResponsibleAI,
  onNavigateToUpload
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentReviews, setRecentReviews] = useState<HumanReviewRecord[]>([]);
  const [raiCases, setRaiCases] = useState<ResponsibleAICase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [m, r, rai] = await Promise.all([
        api.getMetrics(),
        api.getReviews(),
        api.getResponsibleAICases()
      ]);
      setMetrics(m);
      setRecentReviews(r);
      setRaiCases(rai);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          Loading NetSage AI Analytics...
        </div>
      </div>
    );
  }

  const severityEntries = Object.entries(metrics.severity_distribution || {}) as [string, number][];
  const severityValues = Object.values(metrics.severity_distribution || {}) as number[];
  const totalSeverityCount = severityValues.reduce((a, b) => a + Number(b), 0) || 1;

  const issueEntries = (Object.entries(metrics.issue_type_distribution || {}) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const maxIssueCount = issueEntries.length > 0 ? Math.max(...issueEntries.map(e => Number(e[1]))) : 1;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Applied AI + Network Engineering Architecture</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              NetSage AI Diagnostic Operations Center
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Cisco Packet Tracer lab assistant pairing Gemini reasoning models with deterministic rule checkers and mandatory human-in-the-loop audit governance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {onNavigateToUpload && (
              <button
                onClick={onNavigateToUpload}
                className="px-4 py-2.5 bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4 text-indigo-300" /> Upload .PKT File
              </button>
            )}
            <button
              onClick={onNavigateToConsole}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Cpu className="w-4 h-4" /> Run Live Diagnosis
            </button>
            <button
              onClick={onNavigateToDemo}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" /> Broken Lab Demo
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Cases */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Benchmark Cases</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.total_cases}</span>
            <span className="text-xs text-slate-500">Official Labs</span>
          </div>
          <p className="text-[11px] text-slate-500">Coverage across 8 networking domains</p>
        </div>

        {/* AI-Human Agreement Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Agreement Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{metrics.agreement_rate}%</span>
            <span className="text-xs text-slate-500">AI vs Human</span>
          </div>
          <p className="text-[11px] text-slate-500">{metrics.accepted_count} Accepted of {metrics.total_reviewed} Reviewed</p>
        </div>

        {/* Edited / Corrections */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Human Corrections</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Edit3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{metrics.edited_count}</span>
            <span className="text-xs text-slate-500">Overrides</span>
          </div>
          <p className="text-[11px] text-slate-500">Human engineer calibrated outputs</p>
        </div>

        {/* Responsible AI Corrections */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Responsible AI</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600">{metrics.responsible_ai_corrections_count}</span>
            <span className="text-xs text-slate-500">Documented</span>
          </div>
          <p className="text-[11px] text-slate-500">Failure modes studied & mitigated</p>
        </div>

      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Issue Types Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Network Issue Domains Distribution</h2>
              <p className="text-xs text-slate-500">Breakdown of benchmark cases across Layer 2 to Layer 7 concepts</p>
            </div>
            <button
              onClick={onNavigateToCases}
              className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
            >
              Browse All Cases <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {issueEntries.map(([concept, count]) => {
              const pct = Math.round((count / maxIssueCount) * 100);
              return (
                <div key={concept} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{concept}</span>
                    <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {count} cases
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity & Review Status Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Severity Breakdown</h2>
            <p className="text-xs text-slate-500 mb-3">Outage impact classification</p>

            <div className="space-y-2.5">
              {severityEntries.map(([sev, count]) => {
                const colors: Record<string, { bar: string; text: string; bg: string }> = {
                  low: { bar: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-50' },
                  medium: { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                  high: { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
                  critical: { bar: 'bg-purple-600', text: 'text-purple-700', bg: 'bg-purple-50' }
                };
                const style = colors[sev.toLowerCase()] || colors.medium;
                const percentage = Math.round((count / totalSeverityCount) * 100);

                return (
                  <div key={sev} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold capitalize ${style.text}`}>{sev} Severity</span>
                      <span className="text-slate-600 font-mono">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.bar}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Human Review Status</h2>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-emerald-700 font-bold text-lg">{metrics.accepted_count}</div>
                <div className="text-emerald-900 text-[11px] font-medium">Accepted</div>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-amber-700 font-bold text-lg">{metrics.edited_count}</div>
                <div className="text-amber-900 text-[11px] font-medium">Edited</div>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                <div className="text-rose-700 font-bold text-lg">{metrics.rejected_count}</div>
                <div className="text-rose-900 text-[11px] font-medium">Rejected</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Responsible AI Highlights & Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Responsible AI Calibration Log Preview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-md">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Responsible AI Audit Cases</h2>
                <p className="text-xs text-slate-500">Documented examples where humans corrected the AI</p>
              </div>
            </div>
            <button
              onClick={onNavigateToResponsibleAI}
              className="text-xs text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1"
            >
              View All 5+ Cases <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {raiCases.slice(0, 3).map((item) => (
              <div key={item.id} className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 font-mono">{item.case_id}</span>
                  <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                    Flaw: {item.initial_ai_diagnosis.flaw_type}
                  </span>
                </div>
                <p className="font-medium text-slate-800">{item.title}</p>
                <div className="text-slate-600 bg-white p-2 rounded border border-purple-100">
                  <strong className="text-amber-800">Human Correction: </strong>
                  {item.human_correction.actual_root_cause}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Human Review Decision Audit Trail */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Recent Human Review Log</h2>
                <p className="text-xs text-slate-500">Live verified sign-offs and rationales</p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="text-xs text-slate-500 hover:text-slate-700 p-1 rounded transition"
              title="Refresh Reviews"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {recentReviews.slice(0, 4).map((rev, idx) => {
              const badgeColors = {
                Accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                Edited: 'bg-amber-100 text-amber-800 border-amber-200',
                Rejected: 'bg-rose-100 text-rose-800 border-rose-200'
              };
              return (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">{rev.case_id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeColors[rev.human_decision]}`}>
                        {rev.human_decision}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {rev.reviewed_at ? new Date(rev.reviewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium">{rev.ai_diagnosis?.root_cause}</p>
                  <p className="text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                    "{rev.review_reason}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
