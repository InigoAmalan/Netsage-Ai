import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_CASES } from "./src/data/initialCases.ts";
import { INITIAL_RESPONSIBLE_AI_CASES } from "./src/data/responsibleAICases.ts";
import { runDeterministicRuleCheck } from "./src/services/ruleChecker.ts";
import { parsePacketTracerContent, SAMPLE_PKT_LABS } from "./src/services/packetTracerParser.ts";
import { AIDiagnosis, DashboardMetrics, HumanReviewRecord, ResponsibleAICase, TroubleshootingCase } from "./src/types/network.ts";

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// In-memory data store for persistent reviews during session
let casesStore: TroubleshootingCase[] = [...INITIAL_CASES];
let reviewsStore: HumanReviewRecord[] = [
  {
    case_id: 'CASE001',
    ai_diagnosis: {
      root_cause: 'PC2 is assigned to the wrong VLAN. Interface Fa0/2 is currently in VLAN 10 instead of VLAN 20.',
      confidence: 'high',
      osi_layer: 'Layer 2',
      issue_type: 'VLAN',
      severity: 'medium',
      evidence: ['show vlan brief indicates Fa0/1 and Fa0/2 are in VLAN 10', 'PC2 should be VLAN 20 per topology note'],
      next_command: 'show vlan brief',
      fix_steps: ['interface Fa0/2', 'switchport access vlan 20'],
      verification_steps: ['show vlan brief', 'ping from PC1 to PC2'],
      human_review_required: true
    },
    human_decision: 'Accepted',
    review_reason: 'AI accurately cited Fa0/2 port assignment in VLAN 10 and generated correct remediation commands.',
    reviewed_at: '2026-08-27T10:15:00Z',
    reviewer_name: 'Lead NetOps Engineer'
  },
  {
    case_id: 'CASE002',
    ai_diagnosis: {
      root_cause: 'VLAN 20 is inactive or missing from switch VLAN database.',
      confidence: 'high',
      osi_layer: 'Layer 2',
      issue_type: 'VLAN',
      severity: 'high',
      evidence: ['Fa0/3 switchport shows Access Mode VLAN: 20 ((Inactive))', 'show vlan brief shows VLAN 20 absent'],
      next_command: 'show vlan id 20',
      fix_steps: ['vlan 20', 'name Sales', 'exit'],
      verification_steps: ['show vlan brief', 'show interfaces Fa0/3 switchport'],
      human_review_required: true
    },
    human_decision: 'Accepted',
    review_reason: 'Confirmed inactive VLAN 20 in show vlan brief. Solution creates the database entry.',
    reviewed_at: '2026-08-27T10:20:00Z',
    reviewer_name: 'Lead NetOps Engineer'
  },
  {
    case_id: 'CASE007',
    ai_diagnosis: {
      root_cause: 'Router GigabitEthernet0/0 ARP table corruption or upstream ISP routing failure.',
      confidence: 'high',
      osi_layer: 'Layer 3',
      issue_type: 'Routing / ARP',
      severity: 'medium',
      evidence: ['PC has IP 192.168.10.30/24', 'Router G0/0 IP is 192.168.10.1/24'],
      next_command: 'show ip arp on Router',
      fix_steps: ['clear ip arp on R1'],
      verification_steps: ['ping 192.168.10.30 from R1'],
      human_review_required: true
    },
    human_decision: 'Edited',
    human_correction: 'Affected workstation PC-30 has static default gateway incorrectly set to 192.168.10.254 instead of router IP 192.168.10.1.',
    review_reason: 'AI hallucinated router ARP table corruption without checking the ipconfig gateway output (192.168.10.254). Corrected station gateway to 192.168.10.1.',
    reviewed_at: '2026-08-27T11:05:00Z',
    reviewer_name: 'Senior Network Architect',
    is_responsible_ai_example: true
  },
  {
    case_id: 'CASE010',
    ai_diagnosis: {
      root_cause: 'Central DHCP Server at 10.0.0.10 has exhausted its IP address pool.',
      confidence: 'high',
      osi_layer: 'Layer 7',
      issue_type: 'DHCP',
      severity: 'high',
      evidence: ['Clients cannot obtain IP address in 192.168.20.0/24'],
      next_command: 'show ip dhcp pool on Server',
      fix_steps: ['Expand DHCP pool scope on 10.0.0.10'],
      verification_steps: ['ipconfig /renew on client'],
      human_review_required: true
    },
    human_decision: 'Edited',
    human_correction: 'Client gateway interface G0/1 lacks "ip helper-address 10.0.0.10" (DHCP Relay Agent).',
    review_reason: 'Broadcast DHCP discover packets cannot cross routers. Interface G0/1 must be configured with ip helper-address.',
    reviewed_at: '2026-08-27T11:30:00Z',
    reviewer_name: 'Network Field Engineer',
    is_responsible_ai_example: true
  },
  {
    case_id: 'CASE017',
    ai_diagnosis: {
      root_cause: 'OSPF MTU mismatch between R1 and R2 causing adjacency to hang in EXSTART state.',
      confidence: 'medium',
      osi_layer: 'Layer 3',
      issue_type: 'OSPF',
      severity: 'high',
      evidence: ['show ip ospf neighbor is empty'],
      next_command: 'show ip ospf interface G0/1',
      fix_steps: ['ip ospf mtu-ignore on R1 G0/1'],
      verification_steps: ['show ip ospf neighbor'],
      human_review_required: true
    },
    human_decision: 'Edited',
    human_correction: 'Directly connected interfaces are on mismatched subnets (R1 G0/1 has 10.0.12.1/30 and R2 G0/1 has 10.0.23.2/30).',
    review_reason: 'AI jumped to MTU mismatch instead of observing show ip interface brief showing mismatched IP subnets on the point-to-point link.',
    reviewed_at: '2026-08-27T12:00:00Z',
    reviewer_name: 'Lead NetOps Engineer',
    is_responsible_ai_example: true
  },
  {
    case_id: 'CASE023',
    ai_diagnosis: {
      root_cause: 'ACL 105 wildcard mask is inverted or incorrectly formatted.',
      confidence: 'medium',
      osi_layer: 'Layer 4',
      issue_type: 'ACL',
      severity: 'medium',
      evidence: ['show access-lists 105 shows deny ip 192.168.10.0 0.0.0.255 192.168.20.0 0.0.0.255'],
      next_command: 'show access-lists',
      fix_steps: ['Rewrite ACL 105 with standard wildcard masks'],
      verification_steps: ['test ping across subnets'],
      human_review_required: true
    },
    human_decision: 'Edited',
    human_correction: 'ACL 105 is not applied to any router interface. Interface G0/0 shows "Inbound access list is not set".',
    review_reason: 'ACL syntax is valid, but it was never bound to the interface via "ip access-group 105 in".',
    reviewed_at: '2026-08-27T13:10:00Z',
    reviewer_name: 'Senior Network Architect',
    is_responsible_ai_example: true
  },
  {
    case_id: 'CASE028',
    ai_diagnosis: {
      root_cause: 'Access Point VLAN leaking frames into native VLAN due to switchport misconfiguration.',
      confidence: 'low',
      osi_layer: 'Layer 2',
      issue_type: 'Wireless',
      severity: 'high',
      evidence: ['Guest clients on VLAN 40 can reach VLAN 10 server'],
      next_command: 'show interfaces trunk on SW1',
      fix_steps: ['Inspect native VLAN on trunk ports'],
      verification_steps: ['ping server from laptop'],
      human_review_required: true
    },
    human_decision: 'Edited',
    human_correction: 'Missing Layer 3 Access Control List (ACL) to block inter-VLAN routing from Guest VLAN 40 to Internal VLAN 10.',
    review_reason: 'Routers route between all active subnets by default. Isolation must be explicitly enforced via ACL on router subinterface.',
    reviewed_at: '2026-08-27T14:45:00Z',
    reviewer_name: 'Cybersecurity Analyst',
    is_responsible_ai_example: true
  }
];

let responsibleAIStore: ResponsibleAICase[] = [...INITIAL_RESPONSIBLE_AI_CASES];

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), cases_count: casesStore.length });
});

// 2. Get all cases
app.get("/api/cases", (req, res) => {
  res.json(casesStore);
});

// 3. Get single case by ID
app.get("/api/cases/:id", (req, res) => {
  const c = casesStore.find(item => item.case_id.toLowerCase() === req.params.id.toLowerCase());
  if (!c) {
    return res.status(404).json({ error: `Case ${req.params.id} not found` });
  }
  res.json(c);
});

// 4. Deterministic Rule Check Endpoint
app.post("/api/rule-check", (req, res) => {
  const { symptom = "", topology_note = "", show_output = "", config_snippet = "" } = req.body;
  const result = runDeterministicRuleCheck(symptom, topology_note, show_output, config_snippet);
  res.json(result);
});

// 4.1 Parse Packet Tracer or Cisco Config File
app.post("/api/parse-packet-tracer", (req, res) => {
  try {
    const { fileContent = "", fileName = "Topology.pkt", fileSize = 0 } = req.body;
    if (!fileContent) {
      return res.status(400).json({ error: "No file content provided" });
    }
    const result = parsePacketTracerContent(fileContent, fileName, fileSize);
    res.json(result);
  } catch (err: any) {
    console.error("Error parsing Packet Tracer content:", err);
    res.status(500).json({ error: err.message || "Failed to parse file" });
  }
});

// 4.2 Get Sample Packet Tracer Labs
app.get("/api/sample-pkt-labs", (req, res) => {
  res.json(SAMPLE_PKT_LABS);
});

// 5. AI Diagnose Pipeline (Gemini + Deterministic check)
app.post("/api/diagnose", async (req, res) => {
  try {
    const { symptom = "", topology_note = "", show_output = "", config_snippet = "", case_id } = req.body;

    if (!symptom && !show_output && !topology_note) {
      return res.status(400).json({ error: "Please provide symptom, topology note, or show-command output." });
    }

    // Always run deterministic rule check in parallel
    const ruleResult = runDeterministicRuleCheck(symptom, topology_note, show_output, config_snippet);

    const systemInstruction = `You are NetSage AI, an expert AI network troubleshooting assistant for Cisco Packet Tracer and networking lab environments.
You analyze network symptoms, Packet Tracer topology notes, Cisco show-command outputs, and optional config snippets to determine the root cause, OSI layer, confidence, evidence, next command, step-by-step fix, and verification steps.

CRITICAL INSTRUCTIONS:
1. SAFETY MANDATE: Network fixes MUST NEVER be automatically applied. Always set "human_review_required": true.
2. ANTI-HALLUCINATION & EVIDENCE RULE: You must ONLY cite evidence that actually appears in the user input. NEVER invent show commands or topology facts that were not provided.
3. CALIBRATED CONFIDENCE:
   - "high": The provided show output proves the exact failure (e.g. port is in wrong VLAN in show vlan brief, interface is administratively down, IP mismatch is explicit).
   - "medium": The symptom points to likely causes (e.g., gateway ping works but remote server fails), but missing commands (like show ip route or show access-lists) are needed for certainty. Explicitly list what is missing in "missing_evidence".
   - "low": Symptoms are ambiguous or show output is missing.
4. CONFIDENCE must be one of: "low", "medium", "high"
5. SEVERITY must be one of: "low", "medium", "high", "critical"
6. Return strictly valid JSON adhering to the specified schema.`;

    const promptText = `Analyze this Cisco Packet Tracer troubleshooting problem:

SYMPTOM:
${symptom}

TOPOLOGY NOTE:
${topology_note}

SHOW COMMAND OUTPUT / EVIDENCE:
${show_output}

${config_snippet ? `CONFIGURATION SNIPPET:\n${config_snippet}` : ""}

${case_id ? `CASE IDENTIFIER: ${case_id}` : ""}

Perform rigorous evidence-based root-cause diagnosis.`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "root_cause",
            "confidence",
            "osi_layer",
            "issue_type",
            "severity",
            "evidence",
            "next_command",
            "fix_steps",
            "verification_steps",
            "human_review_required"
          ],
          properties: {
            root_cause: {
              type: Type.STRING,
              description: "Clear and precise explanation of the underlying network defect."
            },
            confidence: {
              type: Type.STRING,
              enum: ["low", "medium", "high"]
            },
            osi_layer: {
              type: Type.STRING,
              description: "Relevant OSI Layer (e.g., Layer 2, Layer 3, Layer 4, Layer 7)"
            },
            issue_type: {
              type: Type.STRING,
              description: "Concept category such as VLAN, Default Gateway, DHCP, DNS, Routing, OSPF, ACL, NAT, Wireless"
            },
            severity: {
              type: Type.STRING,
              enum: ["low", "medium", "high", "critical"]
            },
            evidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Direct quotations or references to the provided inputs"
            },
            missing_evidence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Additional outputs needed to verify unproven causes"
            },
            next_command: {
              type: Type.STRING,
              description: "The single best Cisco command to run next"
            },
            fix_steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Sequential CLI configuration commands to fix the fault"
            },
            verification_steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Show commands or ping tests to verify the fix"
            },
            human_review_required: {
              type: Type.BOOLEAN,
              description: "Must always be true"
            }
          }
        }
      }
    });

    let aiDiagnosis: AIDiagnosis;
    try {
      aiDiagnosis = JSON.parse(geminiResponse.text?.trim() || "{}");
      aiDiagnosis.human_review_required = true;
      aiDiagnosis.generated_at = new Date().toISOString();
      aiDiagnosis.model = "gemini-3.1-flash-lite";
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON:", geminiResponse.text);
      aiDiagnosis = {
        root_cause: "Unable to parse diagnostic response cleanly. Please inspect manually.",
        confidence: "low",
        osi_layer: "Layer 3",
        issue_type: "General Network Fault",
        severity: "medium",
        evidence: [symptom],
        next_command: "show ip interface brief",
        fix_steps: ["Inspect interface and routing table"],
        verification_steps: ["ping test"],
        human_review_required: true,
        model: "gemini-3.1-flash-lite",
        generated_at: new Date().toISOString()
      };
    }

    res.json({
      ai_diagnosis: aiDiagnosis,
      deterministic_rules: ruleResult,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Diagnosis error:", error);
    // Even on error, run deterministic check so user still receives diagnostic findings
    const { symptom = "", topology_note = "", show_output = "", config_snippet = "" } = req.body || {};
    const fallbackRules = runDeterministicRuleCheck(symptom, topology_note, show_output, config_snippet);
    const firstViolation = fallbackRules.violations[0];
    
    res.status(200).json({
      ai_diagnosis: {
        root_cause: firstViolation ? firstViolation.description : (fallbackRules.summary || "Network diagnostic service fallback mode. Inspect deterministic rule findings."),
        confidence: fallbackRules.has_violations ? "high" : "low",
        osi_layer: firstViolation?.category === 'MISSING_VLAN' ? "Layer 2" : "Layer 3",
        issue_type: firstViolation?.category || "Network Diagnostics",
        severity: firstViolation?.severity || "medium",
        evidence: firstViolation ? [firstViolation.matched_evidence] : (symptom ? [symptom] : []),
        next_command: firstViolation?.recommendation || "show ip interface brief",
        fix_steps: firstViolation ? [firstViolation.recommendation] : ["Inspect interface statuses and IP configuration"],
        verification_steps: ["ping test", "show ip interface brief"],
        human_review_required: true,
        model: "gemini-3.1-flash-lite (deterministic fallback)",
        generated_at: new Date().toISOString()
      },
      deterministic_rules: fallbackRules,
      timestamp: new Date().toISOString(),
      warning: error.message || "AI model fallback triggered"
    });
  }
});

// 6. Get All Human Reviews
app.get("/api/reviews", (req, res) => {
  res.json(reviewsStore);
});

// 7. Submit or Update a Human Review
app.post("/api/reviews", (req, res) => {
  const {
    case_id,
    ai_diagnosis,
    deterministic_rules,
    human_decision,
    human_correction = "",
    review_reason = "",
    reviewer_name = "NetOps Engineer",
    is_responsible_ai_example = false
  } = req.body;

  if (!case_id || !human_decision) {
    return res.status(400).json({ error: "case_id and human_decision ('Accepted' | 'Edited' | 'Rejected') are required." });
  }

  const reviewRecord: HumanReviewRecord = {
    case_id,
    ai_diagnosis,
    deterministic_rules,
    human_decision,
    human_correction,
    review_reason,
    reviewed_at: new Date().toISOString(),
    reviewer_name,
    is_responsible_ai_example
  };

  // Replace or append
  const existingIdx = reviewsStore.findIndex(r => r.case_id.toLowerCase() === case_id.toLowerCase());
  if (existingIdx >= 0) {
    reviewsStore[existingIdx] = reviewRecord;
  } else {
    reviewsStore.unshift(reviewRecord);
  }

  // If marked as responsible AI example or edited/rejected with correction, sync with responsible AI store
  if (is_responsible_ai_example || human_decision === 'Edited' || human_decision === 'Rejected') {
    const existingRaiIdx = responsibleAIStore.findIndex(r => r.case_id.toLowerCase() === case_id.toLowerCase());
    const raiEntry: ResponsibleAICase = {
      id: `RAI-${Date.now().toString().slice(-4)}`,
      case_id,
      title: `Review Override for ${case_id}`,
      scenario: `Human Reviewer logged decision: ${human_decision}.`,
      initial_ai_diagnosis: {
        root_cause: ai_diagnosis?.root_cause || "Initial AI Diagnosis",
        confidence: ai_diagnosis?.confidence || "medium",
        flaw_type: human_decision === 'Edited' ? 'Premature Certainty' : 'Hallucination',
        ai_output_summary: ai_diagnosis?.root_cause || "AI Output"
      },
      human_correction: {
        actual_root_cause: human_correction || "Human verified root cause",
        decision: human_decision === 'Accepted' ? 'Edited' : human_decision,
        why_ai_failed: review_reason || "AI lacked full diagnostic context",
        correct_remediation: ai_diagnosis?.fix_steps?.join('; ') || "Manual CLI fix",
        lesson_learned: "Human oversight ensures safety before changes are deployed."
      }
    };
    if (existingRaiIdx >= 0) {
      responsibleAIStore[existingRaiIdx] = raiEntry;
    } else {
      responsibleAIStore.unshift(raiEntry);
    }
  }

  res.status(201).json({ success: true, record: reviewRecord });
});

// 8. Responsible AI Cases
app.get("/api/responsible-ai", (req, res) => {
  res.json(responsibleAIStore);
});

// 9. Aggregated Dashboard Metrics
app.get("/api/metrics", (req, res) => {
  const totalCases = casesStore.length;
  const totalReviewed = reviewsStore.length;
  const acceptedCount = reviewsStore.filter(r => r.human_decision === 'Accepted').length;
  const editedCount = reviewsStore.filter(r => r.human_decision === 'Edited').length;
  const rejectedCount = reviewsStore.filter(r => r.human_decision === 'Rejected').length;
  const agreementRate = totalReviewed > 0 ? Math.round((acceptedCount / totalReviewed) * 100) : 0;

  const severityDistribution: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  const issueTypeDistribution: Record<string, number> = {};
  const osiLayerDistribution: Record<string, number> = {};

  casesStore.forEach(c => {
    const sev = (c.severity || 'medium').toLowerCase();
    severityDistribution[sev] = (severityDistribution[sev] || 0) + 1;

    const concept = c.concept || 'Other';
    issueTypeDistribution[concept] = (issueTypeDistribution[concept] || 0) + 1;

    const osi = c.osi_layer || 'Layer 3';
    osiLayerDistribution[osi] = (osiLayerDistribution[osi] || 0) + 1;
  });

  const metrics: DashboardMetrics = {
    total_cases: totalCases,
    total_reviewed: totalReviewed,
    accepted_count: acceptedCount,
    edited_count: editedCount,
    rejected_count: rejectedCount,
    agreement_rate: agreementRate,
    severity_distribution: severityDistribution as any,
    issue_type_distribution: issueTypeDistribution,
    osi_layer_distribution: osiLayerDistribution,
    responsible_ai_corrections_count: responsibleAIStore.length,
    ai_accuracy_rate: totalReviewed > 0 ? Math.round((acceptedCount / totalReviewed) * 100) : 85
  };

  res.json(metrics);
});

// 10. Fallback 404 handler for unmatched API routes (ensures JSON is always returned, never HTML)
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Production and Development Server Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NetSage AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
