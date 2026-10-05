import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle,
  Monitor,
  Server,
  Network
} from 'lucide-react';

export const InteractiveDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [humanDecision, setHumanDecision] = useState<'Pending' | 'Accepted' | 'Edited'>('Pending');
  const [reviewReason, setReviewReason] = useState('Fa0/2 port VLAN membership confirmed incorrect in show vlan brief.');
  const [cliApplied, setCliApplied] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleRunInitialPing = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      setPingResult(`C:\\> ping 192.168.20.20

Pinging 192.168.20.20 with 32 bytes of data:
Request timed out.
Request timed out.
Request timed out.
Request timed out.

Ping statistics for 192.168.20.20:
    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)`);
    }, 1000);
  };

  const handleRunDiagnosis = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      setIsDiagnosing(false);
      setCurrentStep(3);
    }, 1200);
  };

  const handleAcceptReview = () => {
    setHumanDecision('Accepted');
    setCurrentStep(4);
  };

  const handleApplyCliFix = () => {
    setCliApplied(true);
    setTimeout(() => {
      setCurrentStep(5);
    }, 800);
  };

  const handleRunVerificationPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setVerificationDone(true);
      setPingResult(`C:\\> ping 192.168.20.20

Pinging 192.168.20.20 with 32 bytes of data:
Reply from 192.168.20.20: bytes=32 time=3ms TTL=128
Reply from 192.168.20.20: bytes=32 time=1ms TTL=128
Reply from 192.168.20.20: bytes=32 time=1ms TTL=128
Reply from 192.168.20.20: bytes=32 time=2ms TTL=128

Ping statistics for 192.168.20.20:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 1ms, Maximum = 3ms, Average = 1ms`);
    }, 1200);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setHumanDecision('Pending');
    setCliApplied(false);
    setVerificationDone(false);
    setPingResult(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive College Demonstration Scenario</span>
          </div>
          <h1 className="text-xl font-bold">End-to-End Broken Network Remediation Lab</h1>
          <p className="text-xs text-slate-300">
            Witness the entire safety lifecycle: Broken Network → AI Diagnosis → Deterministic Checking → Human Review Signoff → Cisco CLI Fix → Verification.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4" /> Reset Demonstration
        </button>
      </div>

      {/* Interactive Step Progress Tracker */}
      <div className="grid grid-cols-5 gap-2 text-xs">
        {[
          { num: 1, label: '1. Symptom' },
          { num: 2, label: '2. Show Commands' },
          { num: 3, label: '3. AI & Rule Diagnosis' },
          { num: 4, label: '4. Human Review' },
          { num: 5, label: '5. Fix & Verification' }
        ].map((step) => {
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          return (
            <div
              key={step.num}
              onClick={() => { if (isCompleted) setCurrentStep(step.num); }}
              className={`p-3 rounded-xl border text-center transition ${
                isActive
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs'
                  : isCompleted
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800 cursor-pointer font-medium'
                  : 'bg-white border-slate-200 text-slate-400 font-normal'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step.num}
                  </span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Step Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        
        {/* STEP 1: Topology & Initial Failure */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 1: Network Topology & Symptom Verification</h2>
              <p className="text-xs text-slate-500">
                In Packet Tracer, PC1 (Engineering, VLAN 10) can ping its local router gateway, but cannot reach PC2 (Finance, VLAN 20).
              </p>
            </div>

            {/* Visual Topology Diagram */}
            <div className="bg-slate-900 p-6 rounded-xl text-white space-y-4 border border-slate-800">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" /> Packet Tracer Lab Topology View
              </div>

              <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
                
                {/* PC1 */}
                <div className="flex flex-col items-center p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center w-40">
                  <Monitor className="w-8 h-8 text-blue-400 mb-1" />
                  <span className="font-bold text-xs">PC1</span>
                  <span className="text-[10px] text-slate-400 font-mono">192.168.10.10/24</span>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-1 bg-emerald-950/60 px-2 py-0.5 rounded">
                    Expected: VLAN 10
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Port: Fa0/1</span>
                </div>

                <div className="text-slate-500 font-mono text-xs flex flex-col items-center">
                  <span>◄── Fa0/1 (Access) ──►</span>
                </div>

                {/* Switch SW1 */}
                <div className="flex flex-col items-center p-4 bg-indigo-950/60 rounded-xl border border-indigo-700 text-center w-48 shadow-lg">
                  <Server className="w-10 h-10 text-indigo-400 mb-1" />
                  <span className="font-bold text-xs text-white">Switch SW1 (2960)</span>
                  <span className="text-[10px] text-indigo-300 font-mono">Layer 2 Switch</span>
                  <span className="text-[10px] text-amber-300 font-semibold mt-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    Fa0/2 Fault Present
                  </span>
                </div>

                <div className="text-slate-500 font-mono text-xs flex flex-col items-center">
                  <span>◄── Fa0/2 (Access) ──►</span>
                </div>

                {/* PC2 */}
                <div className="flex flex-col items-center p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center w-40">
                  <Monitor className="w-8 h-8 text-indigo-400 mb-1" />
                  <span className="font-bold text-xs">PC2</span>
                  <span className="text-[10px] text-slate-400 font-mono">192.168.20.20/24</span>
                  <span className="text-[10px] text-amber-400 font-semibold mt-1 bg-amber-950/60 px-2 py-0.5 rounded">
                    Expected: VLAN 20
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Port: Fa0/2</span>
                </div>

              </div>
            </div>

            {/* Live Terminal Ping Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Test Connectivity from PC1 Command Prompt:</span>
                <button
                  onClick={handleRunInitialPing}
                  disabled={isPinging}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {isPinging ? 'Sending ICMP Packets...' : 'Execute "ping 192.168.20.20"'}
                </button>
              </div>

              {pingResult && (
                <pre className="p-4 bg-slate-900 text-rose-400 font-mono text-xs rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap animate-in fade-in">
                  {pingResult}
                </pre>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-2"
              >
                Proceed to Show Commands <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Show Commands Evidence */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 2: Collect Cisco Show-Command Output</h2>
              <p className="text-xs text-slate-500">
                Let's inspect SW1's VLAN database and MAC address table to gather grounded evidence for the AI assistant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* show vlan brief */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 font-mono">SW1# show vlan brief</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs border border-slate-800 h-44 overflow-y-auto">
{`VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/3, Fa0/4, Fa0/5
10   Engineering                      active    Fa0/1, Fa0/2
20   Finance                          active    
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup `}
                </pre>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ <strong>Notice:</strong> Interface <code>Fa0/2</code> is assigned to VLAN 10 instead of VLAN 20!
                </p>
              </div>

              {/* show mac address-table */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 font-mono">SW1# show mac address-table</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs border border-slate-800 h-44 overflow-y-auto">
{`          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0001.423a.1101    DYNAMIC     Fa0/1
  10    0001.423a.2202    DYNAMIC     Fa0/2
Total Mac Addresses for this criterion: 2`}
                </pre>
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                  Both host MACs are currently learning within broadcast domain VLAN 10.
                </p>
              </div>

            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Back to Topology
              </button>

              <button
                onClick={handleRunDiagnosis}
                disabled={isDiagnosing}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center gap-2"
              >
                {isDiagnosing ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    Running AI & Rule Check...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Run AI & Deterministic Diagnosis
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AI & Rule Diagnosis Output */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Step 3: AI & Deterministic Engine Diagnosis</h2>
                <p className="text-xs text-slate-500">
                  Gemini API and the deterministic rule checker have analyzed the show-command output.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold">
                HIGH CONFIDENCE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* AI Output Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between text-indigo-700 font-bold uppercase tracking-wider text-[11px]">
                  <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> Gemini AI Diagnosis</span>
                  <span className="text-slate-500">Layer 2 • VLAN</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block text-[10px] uppercase">Identified Root Cause:</span>
                  <p className="text-slate-900 font-bold mt-0.5">
                    PC2 is assigned to the wrong VLAN. Interface FastEthernet0/2 is currently in VLAN 10 instead of VLAN 20.
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                  <span className="font-semibold text-slate-600 block text-[10px] uppercase">Direct Evidence Cited:</span>
                  <ul className="space-y-0.5 text-slate-700 list-disc list-inside">
                    <li>show vlan brief lists Fa0/2 under VLAN 10</li>
                    <li>Topology notes designate PC2 for Finance (VLAN 20)</li>
                  </ul>
                </div>
              </div>

              {/* Deterministic Rules */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <span className="flex items-center gap-1.5"><Terminal className="w-4 h-4" /> Deterministic Rule Checker</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Rule Flag</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-amber-200 text-amber-950 font-medium">
                  <strong>RULE-VLAN-002:</strong> Interface Fa0/2 VLAN membership mismatch detected. Port is assigned to VLAN 10 while endpoint requires VLAN 20.
                </div>
                <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono rounded text-[11px]">
                  Recommended Next Command: show vlan brief
                </div>
              </div>

            </div>

            {/* Safety Warning */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  <strong>Safety Protocol Enforced:</strong> The AI is prohibited from modifying network device configurations automatically.
                </span>
              </div>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Open Review Gate
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Mandatory Human Review */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 4: Human Engineer Review & Decision Record</h2>
              <p className="text-xs text-slate-500">
                You are the Lead Network Reviewer. Review the proposed fix commands before applying to Switch SW1.
              </p>
            </div>

            {/* Review Decision Workspace */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-bold uppercase tracking-wider text-slate-700">Proposed Cisco IOS Remediation Commands</span>
                <span className="text-emerald-700 font-mono font-semibold">SW1(config-if)#</span>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg border border-slate-800 space-y-1">
{`SW1# configure terminal
SW1(config)# interface FastEthernet0/2
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 20
SW1(config-if)# end
SW1# write memory`}
              </pre>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Human Engineer Review Rationale:</label>
                <input
                  type="text"
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-slate-500">
                  Reviewer: <strong className="text-slate-700">Lead NetOps Engineer</strong>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setHumanDecision('Edited'); setCurrentStep(5); }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition"
                  >
                    Edit Commands
                  </button>
                  <button
                    onClick={handleAcceptReview}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept & Authorize Fix
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CLI Fix Application & Live Verification */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Step 5: Apply Cisco Fix & Verify Connectivity</h2>
                <p className="text-xs text-slate-500">
                  Review status: <span className="font-bold text-emerald-600 uppercase">{humanDecision}</span>. Apply CLI changes to SW1 and verify.
                </p>
              </div>

              {!cliApplied ? (
                <button
                  onClick={handleApplyCliFix}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Terminal className="w-4 h-4" /> Apply Fix to SW1 Console
                </button>
              ) : (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> CLI Fix Deployed
                </span>
              )}
            </div>

            {/* CLI Console execution view */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 font-mono">SW1 Serial Console Log:</span>
              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap">
{cliApplied ? `SW1# configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
SW1(config)# interface FastEthernet0/2
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 20
SW1(config-if)# end
SW1#
%SYS-5-CONFIG_I: Configured from console by NetOps_Reviewer
SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/3, Fa0/4, Fa0/5
10   Engineering                      active    Fa0/1
20   Finance                          active    Fa0/2
[OK - Fa0/2 successfully mapped to VLAN 20]` : `(Waiting for CLI Fix Deployment...)`}
              </pre>
            </div>

            {/* Verification Ping */}
            {cliApplied && (
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 uppercase tracking-wider">
                    Final Verification: Ping Test from PC1 to PC2 (192.168.20.20)
                  </span>
                  <button
                    onClick={handleRunVerificationPing}
                    disabled={isPinging}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    {isPinging ? 'Pinging 192.168.20.20...' : 'Execute Final Ping Verification'}
                  </button>
                </div>

                {pingResult && verificationDone && (
                  <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 whitespace-pre-wrap">
                    {pingResult}
                  </pre>
                )}

                {verificationDone && (
                  <div className="p-3 bg-white rounded-lg border border-emerald-300 text-emerald-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Network Problem Completely Resolved:</strong> 0% packet loss. PC1 and PC2 now communicate across isolated VLAN boundaries via router gateway.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleReset}
                className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Start New Lab Demonstration
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
