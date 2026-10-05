import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  Network, 
  Server, 
  Router as RouterIcon, 
  Monitor, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Play, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  FileCode, 
  ArrowRight,
  RefreshCw,
  Layers,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { 
  parsePacketTracerContent, 
  extractTextFromPacketTracerBuffer, 
  PacketTracerAnalysisResult, 
  SAMPLE_PKT_LABS, 
  SamplePacketTracerLab,
  ParsedDevice
} from '../services/packetTracerParser';
import { api, DiagnosisResponse } from '../services/api';
import { HumanReviewModal } from './HumanReviewModal';

interface PacketTracerUploadProps {
  onSendToConsole?: (data: { symptom: string; topology_note: string; show_output: string; config_snippet: string; case_id: string }) => void;
  onReviewCompleted?: () => void;
}

export const PacketTracerUpload: React.FC<PacketTracerUploadProps> = ({
  onSendToConsole,
  onReviewCompleted
}) => {
  const [analysisResult, setAnalysisResult] = useState<PacketTracerAnalysisResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedLabId, setSelectedLabId] = useState<string>('');
  const [customSymptom, setCustomSymptom] = useState<string>('');

  // Diagnostic state
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a built-in sample lab
  const handleLoadSampleLab = (lab: SamplePacketTracerLab) => {
    setSelectedLabId(lab.id);
    setErrorMsg('');
    setDiagnosisResult(null);
    setReviewSuccessMsg('');
    const parsed = parsePacketTracerContent(lab.fileContent, lab.fileName, lab.fileContent.length);
    setAnalysisResult(parsed);
    setCustomSymptom(parsed.suggestedSymptom);
  };

  // Download a sample lab as a .pkt file to test local upload
  const handleDownloadSample = (lab: SamplePacketTracerLab, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([lab.fileContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lab.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Process uploaded file
  const handleFileProcess = async (file: File) => {
    setIsParsing(true);
    setErrorMsg('');
    setDiagnosisResult(null);
    setReviewSuccessMsg('');
    setSelectedLabId('');

    try {
      const buffer = await file.arrayBuffer();
      const extractedText = extractTextFromPacketTracerBuffer(buffer);
      const parsed = parsePacketTracerContent(extractedText, file.name, file.size);
      setAnalysisResult(parsed);
      setCustomSymptom(parsed.suggestedSymptom);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMsg(`Failed to parse file "${file.name}": ${err.message || 'Unknown error'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Run AI & Rule Diagnosis on the parsed Packet Tracer file
  const handleRunDiagnosisFromFile = async () => {
    if (!analysisResult) return;

    setIsDiagnosing(true);
    setErrorMsg('');
    setReviewSuccessMsg('');

    try {
      const payload = {
        symptom: customSymptom || analysisResult.suggestedSymptom,
        topology_note: analysisResult.inferredTopologyNote,
        show_output: analysisResult.synthesizedShowOutput,
        config_snippet: analysisResult.consolidatedConfigSnippet,
        case_id: `PKT-${analysisResult.fileName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15)}`
      };

      const res = await api.runDiagnosis(payload);
      setDiagnosisResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to diagnose Packet Tracer file');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleReviewSubmitted = async (decision: any, correction?: string, reason?: string) => {
    if (!diagnosisResult || !analysisResult) return;
    const caseId = `PKT-${analysisResult.fileName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15)}`;
    await api.submitReview({
      case_id: caseId,
      ai_diagnosis: diagnosisResult.ai_diagnosis,
      deterministic_rules: diagnosisResult.deterministic_rules,
      human_decision: decision,
      human_correction: correction,
      review_reason: reason || 'Reviewed from Packet Tracer file upload',
      is_responsible_ai_example: decision !== 'Accepted'
    });
    setReviewSuccessMsg(`Human review recorded as "${decision}". Audit trail updated.`);
    if (onReviewCompleted) onReviewCompleted();
  };

  const getDeviceIcon = (type: ParsedDevice['type']) => {
    switch (type) {
      case 'router':
        return <RouterIcon className="w-5 h-5 text-sky-600" />;
      case 'switch':
        return <Layers className="w-5 h-5 text-indigo-600" />;
      case 'server':
        return <Server className="w-5 h-5 text-emerald-600" />;
      case 'pc':
        return <Monitor className="w-5 h-5 text-amber-600" />;
      default:
        return <Network className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cisco Packet Tracer File Analyzer (.pkt / .pka / .cfg)
              </h2>
              <p className="text-xs text-slate-500">
                Upload your Packet Tracer lab file or IOS configuration to automatically extract topology, scan for misconfigurations, and run AI root-cause diagnosis.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> .PKT, .PKA, .CFG, .TXT Supported
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upload Zone & Sample Labs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Drag and Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
              isDragOver 
                ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]' 
                : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              accept=".pkt,.pka,.pkz,.cfg,.txt,.ios,.log,.xml,.json"
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Drag & drop your <span className="text-indigo-600">.pkt</span> or <span className="text-indigo-600">.cfg</span> file here
              </p>
              <p className="text-xs text-slate-500">
                or browse your computer (Packet Tracer .pkt, .pka, IOS .cfg, .txt)
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs transition flex items-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5" /> Select Local File
              </button>
            </div>
          </div>

          {/* Quick Sample Packet Tracer Labs */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Pre-Packaged Packet Tracer Labs
              </span>
              <span className="text-[11px] text-slate-400">1-Click Test</span>
            </div>

            <p className="text-xs text-slate-500">
              Don't have a `.pkt` file on hand? Click any sample below to load it instantly or download it to test uploading:
            </p>

            <div className="space-y-2">
              {SAMPLE_PKT_LABS.map((lab) => {
                const isSelected = selectedLabId === lab.id;
                return (
                  <div
                    key={lab.id}
                    onClick={() => handleLoadSampleLab(lab)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{lab.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded shrink-0">
                          {lab.concept}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {lab.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        title="Download sample .pkt file"
                        onClick={(e) => handleDownloadSample(lab, e)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Parsed Topology, Anomalies, and AI Diagnosis (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {errorMsg && (
            <div className="text-xs text-rose-600 bg-rose-50 p-3.5 rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {reviewSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2.5 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{reviewSuccessMsg}</span>
            </div>
          )}

          {!analysisResult && !isParsing && (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">No Packet Tracer File Loaded</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Upload a `.pkt`, `.pka`, or `.cfg` file on the left, or select one of the pre-packaged Cisco lab scenarios to see the extracted topology and run AI error detection.
              </p>
            </div>
          )}

          {isParsing && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs text-center space-y-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Parsing Packet Tracer File & Extracting Topology...</h3>
              <p className="text-xs text-slate-500">Scanning interface definitions, VLAN tables, and routing tables</p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4 animate-in fade-in">
              
              {/* File Info Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{analysisResult.fileName}</h3>
                    <p className="text-[11px] text-slate-500">
                      {analysisResult.fileFormat} • {(analysisResult.fileSize / 1024).toFixed(1)} KB • {analysisResult.parsedDevices.length} Discovered Devices
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRunDiagnosisFromFile}
                    disabled={isDiagnosing}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                  >
                    {isDiagnosing ? (
                      <>
                        <Cpu className="w-4 h-4 animate-spin" />
                        Analyzing Lab...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        Diagnose Error with AI
                      </>
                    )}
                  </button>

                  {onSendToConsole && (
                    <button
                      type="button"
                      onClick={() => onSendToConsole({
                        symptom: customSymptom || analysisResult.suggestedSymptom,
                        topology_note: analysisResult.inferredTopologyNote,
                        show_output: analysisResult.synthesizedShowOutput,
                        config_snippet: analysisResult.consolidatedConfigSnippet,
                        case_id: `PKT-${analysisResult.fileName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15)}`
                      })}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                    >
                      <FileCode className="w-3.5 h-3.5" /> Transfer to Console
                    </button>
                  )}
                </div>
              </div>

              {/* Observed Symptom Input */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Observed Network Symptom / Fault Description
                </label>
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="e.g., PC2 cannot ping PC1, or OSPF adjacency is stuck in INIT..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-900"
                />
              </div>

              {/* Detected Anomalies / Pre-Checks */}
              {analysisResult.detectedAnomalies.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Pre-Diagnostic Anomalies Detected in File ({analysisResult.detectedAnomalies.length})
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      Suspicious Config Found
                    </span>
                  </div>

                  <div className="space-y-2">
                    {analysisResult.detectedAnomalies.map((anom, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-amber-200 text-xs space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span className="text-amber-950">{anom.title}</span>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{anom.category}</span>
                        </div>
                        <p className="text-slate-600">{anom.description}</p>
                        <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50/70 p-1.5 rounded border border-emerald-100">
                          <strong>Fix Hint:</strong> {anom.suggestedFix}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parsed Device & Interface Grid */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-indigo-600" /> Discovered Topology Devices ({analysisResult.parsedDevices.length})
                  </span>
                  <span className="text-[11px] text-slate-400">Extracted from Packet Tracer Data</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.parsedDevices.map((dev, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                          {getDeviceIcon(dev.type)}
                          <span>{dev.name}</span>
                          {dev.model && <span className="text-[10px] font-normal text-slate-500">({dev.model})</span>}
                        </div>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                          {dev.type}
                        </span>
                      </div>

                      {dev.defaultGateway && (
                        <div className="text-[11px] text-slate-600">
                          Gateway: <span className="font-mono font-medium text-slate-800">{dev.defaultGateway}</span>
                        </div>
                      )}

                      {/* Interfaces list */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Interfaces</span>
                        {dev.interfaces.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">No explicit interfaces</p>
                        ) : (
                          dev.interfaces.map((intf, iIdx) => (
                            <div key={iIdx} className="text-[11px] flex items-center justify-between bg-white p-1.5 rounded border border-slate-200 font-mono">
                              <span className="text-slate-800 font-semibold">{intf.name}</span>
                              <div className="flex items-center gap-1 text-[10px]">
                                {intf.ip && <span className="text-emerald-700 font-medium">{intf.ip}</span>}
                                {intf.vlan && <span className="bg-indigo-100 text-indigo-800 px-1 rounded">VLAN {intf.vlan}</span>}
                                {intf.mode && <span className="bg-slate-100 text-slate-600 px-1 rounded">{intf.mode}</span>}
                                {intf.status === 'admin-down' && <span className="bg-rose-100 text-rose-800 px-1 rounded">DOWN</span>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Diagnosis Result (When run) */}
              {diagnosisResult && (
                <div className="space-y-4 pt-2">
                  
                  {/* Safety Gate Banner */}
                  <div className="p-3.5 bg-amber-500/10 border border-amber-400/40 rounded-xl flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>AI Diagnosis Ready • Mandatory Human Review Required Before Fix Deployment</span>
                    </div>
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold transition"
                    >
                      Review & Sign Off
                    </button>
                  </div>

                  {/* Diagnosis Card */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        AI Diagnosis for {analysisResult.fileName}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {diagnosisResult.ai_diagnosis.confidence.toUpperCase()} CONFIDENCE
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                          {diagnosisResult.ai_diagnosis.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4 text-xs">
                      
                      {/* Root cause */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Root Cause Identified</span>
                        <p className="text-sm font-semibold text-slate-900 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 leading-relaxed">
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

                      {/* Evidence */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Cited Evidence from Packet Tracer File
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

                      {/* Step-by-Step Fix */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recommended Packet Tracer CLI Fix</span>
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

                    {/* Footer */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Human Sign-off: <strong>Pending Review</strong></span>
                      <button
                        type="button"
                        onClick={() => setIsReviewModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4" /> Open Human Review Gate
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Human Review Modal */}
      {diagnosisResult && (
        <HumanReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          caseId={`PKT-${analysisResult?.fileName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15) || 'LAB'}`}
          aiDiagnosis={diagnosisResult.ai_diagnosis}
          deterministicRules={diagnosisResult.deterministic_rules}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

    </div>
  );
};
