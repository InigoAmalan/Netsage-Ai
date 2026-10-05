export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type HumanDecision = 'Accepted' | 'Edited' | 'Rejected';

export interface TroubleshootingCase {
  case_id: string;
  symptom: string;
  topology_note: string;
  show_output: string;
  expected_fault: string;
  osi_layer: string;
  concept: string;
  severity: SeverityLevel;
  config_snippet?: string;
}

export interface AIDiagnosis {
  root_cause: string;
  confidence: ConfidenceLevel;
  osi_layer: string;
  issue_type: string;
  severity: SeverityLevel;
  evidence: string[];
  missing_evidence?: string[];
  next_command: string;
  fix_steps: string[];
  verification_steps: string[];
  human_review_required: boolean;
  generated_at?: string;
  model?: string;
}

export interface RuleViolation {
  rule_id: string;
  name: string;
  category: 'DUPLICATE_IP' | 'SUBNET_MASK' | 'GATEWAY_MISMATCH' | 'INTERFACE_DOWN' | 'MISSING_VLAN' | 'MISSING_ROUTE' | 'ACL_SYNTAX' | 'NAT_CONFIG' | 'OTHER';
  severity: SeverityLevel;
  description: string;
  matched_evidence: string;
  recommendation: string;
}

export interface DeterministicCheckResult {
  has_violations: boolean;
  violations: RuleViolation[];
  checked_at: string;
  summary: string;
}

export interface HumanReviewRecord {
  case_id: string;
  ai_diagnosis: AIDiagnosis;
  deterministic_rules?: DeterministicCheckResult;
  human_decision: HumanDecision;
  human_correction?: string;
  review_reason: string;
  reviewed_at: string;
  reviewer_name?: string;
  is_responsible_ai_example?: boolean;
}

export interface ResponsibleAICase {
  id: string;
  case_id: string;
  title: string;
  scenario: string;
  initial_ai_diagnosis: {
    root_cause: string;
    confidence: ConfidenceLevel;
    flaw_type: 'Hallucination' | 'Premature Certainty' | 'Missing Evidence' | 'Wrong Layer' | 'Overlooked Syntax';
    ai_output_summary: string;
  };
  human_correction: {
    actual_root_cause: string;
    decision: 'Edited' | 'Rejected';
    why_ai_failed: string;
    correct_remediation: string;
    lesson_learned: string;
  };
}

export interface DashboardMetrics {
  total_cases: number;
  total_reviewed: number;
  accepted_count: number;
  edited_count: number;
  rejected_count: number;
  agreement_rate: number; // percentage of accepted / (accepted + edited + rejected)
  severity_distribution: Record<SeverityLevel, number>;
  issue_type_distribution: Record<string, number>;
  osi_layer_distribution: Record<string, number>;
  responsible_ai_corrections_count: number;
  ai_accuracy_rate: number;
}
