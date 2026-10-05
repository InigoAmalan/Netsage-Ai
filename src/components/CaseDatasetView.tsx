import React, { useState, useEffect } from 'react';
import { TroubleshootingCase } from '../types/network';
import { api } from '../services/api';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Layers, 
  ChevronRight,
  Terminal,
  Cpu
} from 'lucide-react';

interface CaseDatasetViewProps {
  onSelectCaseForDiagnosis: (caseId: string) => void;
}

export const CaseDatasetView: React.FC<CaseDatasetViewProps> = ({ onSelectCaseForDiagnosis }) => {
  const [cases, setCases] = useState<TroubleshootingCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<TroubleshootingCase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCases().then(data => {
      setCases(data);
      if (data.length > 0) setSelectedCase(data[0]);
    }).finally(() => setLoading(false));
  }, []);

  const concepts = ['ALL', ...Array.from(new Set(cases.map(c => c.concept)))];
  const severities = ['ALL', 'Low', 'Medium', 'High', 'Critical'];

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.expected_fault.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.concept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesConcept = selectedConcept === 'ALL' || c.concept === selectedConcept;
    const matchesSeverity = selectedSeverity === 'ALL' || c.severity.toLowerCase() === selectedSeverity.toLowerCase();

    return matchesSearch && matchesConcept && matchesSeverity;
  });

  const handleDownloadCsv = () => {
    const headers = 'case_id,symptom,topology_note,show_output,expected_fault,osi_layer,concept,severity\n';
    const rows = cases.map(c => {
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      return [
        c.case_id,
        escape(c.symptom),
        escape(c.topology_note),
        escape(c.show_output),
        escape(c.expected_fault),
        escape(c.osi_layer),
        escape(c.concept),
        c.severity
      ].join(',');
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cases.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'low': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'critical': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Official Benchmark Troubleshooting Cases Dataset ({cases.length} Labs)
          </h2>
          <p className="text-xs text-slate-500">
            Covers VLAN, Gateway, DHCP, DNS, Static/Dynamic Routing, OSPF, ACL, NAT, and Wireless domains.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download cases.csv
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symptoms, faults, or Case ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Concept Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedConcept}
              onChange={(e) => setSelectedConcept(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
            >
              {concepts.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Concepts' : c}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
            >
              {severities.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Severities' : `${s} Severity`}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Case List (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Case Master List ({filteredCases.length})</span>
            <span className="text-[11px] text-slate-400">Click to inspect</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
            {filteredCases.map(c => {
              const isSelected = selectedCase?.case_id === c.case_id;
              return (
                <div
                  key={c.case_id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-3.5 cursor-pointer transition text-xs space-y-1.5 ${
                    isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{c.case_id}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {c.concept}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadge(c.severity)}`}>
                        {c.severity}
                      </span>
                    </div>
                  </div>
                  <p className="font-medium text-slate-800 line-clamp-1">{c.symptom}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>{c.osi_layer}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}

            {filteredCases.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No troubleshooting cases match the selected filters.
              </div>
            )}
          </div>
        </div>

        {/* Case Detail Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCase ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                      {selectedCase.case_id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-800">
                      {selectedCase.concept}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${getSeverityBadge(selectedCase.severity)}`}>
                      {selectedCase.severity.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-2">
                    {selectedCase.symptom}
                  </h3>
                </div>

                <button
                  onClick={() => onSelectCaseForDiagnosis(selectedCase.case_id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <Cpu className="w-4 h-4" /> Diagnose in Console
                </button>
              </div>

              {/* Detail Sections */}
              <div className="space-y-4 text-xs">
                
                {/* Topology Notes */}
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Packet Tracer Topology Note
                  </span>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                    {selectedCase.topology_note}
                  </div>
                </div>

                {/* Show Command Output */}
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Show-Command Output (Grounded Evidence)
                  </span>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap border border-slate-800">
                    {selectedCase.show_output}
                  </pre>
                </div>

                {/* Expected Fault (Ground Truth) */}
                <div>
                  <span className="font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                    Expected Fault (Ground-Truth Correct Diagnosis)
                  </span>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950 font-medium">
                    {selectedCase.expected_fault}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Target OSI Layer</span>
                    <strong className="text-slate-800">{selectedCase.osi_layer}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Concept Tag</span>
                    <strong className="text-slate-800">{selectedCase.concept}</strong>
                  </div>
                </div>

                {/* Config Snippet if present */}
                {selectedCase.config_snippet && (
                  <div>
                    <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Configuration Snippet
                    </span>
                    <pre className="p-2.5 bg-slate-50 text-slate-700 rounded-lg font-mono text-[11px] border border-slate-200 whitespace-pre-wrap">
                      {selectedCase.config_snippet}
                    </pre>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400 text-xs">
              Select a troubleshooting case on the left to view detailed symptoms and evidence.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
