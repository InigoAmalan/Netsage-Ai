import { AIDiagnosis, DashboardMetrics, DeterministicCheckResult, HumanReviewRecord, ResponsibleAICase, TroubleshootingCase } from '../types/network';


export interface DiagnosisResponse {
  ai_diagnosis: AIDiagnosis;
  deterministic_rules: DeterministicCheckResult;
  timestamp: string;
}

export const api = {
  async getCases(): Promise<TroubleshootingCase[]> {
    const res = await fetch('/api/cases');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch cases');
    }
    return res.json();
  },

  async getCaseById(id: string): Promise<TroubleshootingCase> {
    const res = await fetch(`/api/cases/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch case ${id}`);
    return res.json();
  },

  async runRuleCheck(data: {
    symptom: string;
    topology_note: string;
    show_output: string;
    config_snippet?: string;
  }): Promise<DeterministicCheckResult> {
    const res = await fetch('/api/rule-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to run deterministic rule check');
    return res.json();
  },

  async runDiagnosis(data: {
    symptom: string;
    topology_note: string;
    show_output: string;
    config_snippet?: string;
    case_id?: string;
  }): Promise<DiagnosisResponse> {
    const res = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate diagnosis');
    }
    return res.json();
  },

  async getReviews(): Promise<HumanReviewRecord[]> {
    const res = await fetch('/api/reviews');
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async submitReview(review: {
    case_id: string;
    ai_diagnosis: AIDiagnosis;
    deterministic_rules?: DeterministicCheckResult;
    human_decision: 'Accepted' | 'Edited' | 'Rejected';
    human_correction?: string;
    review_reason: string;
    reviewer_name?: string;
    is_responsible_ai_example?: boolean;
  }): Promise<{ success: boolean; record: HumanReviewRecord }> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) throw new Error('Failed to submit human review');
    return res.json();
  },

  async getResponsibleAICases(): Promise<ResponsibleAICase[]> {
    const res = await fetch('/api/responsible-ai');
    if (!res.ok) throw new Error('Failed to fetch responsible AI log');
    return res.json();
  },

  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch('/api/metrics');
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  async parsePacketTracerFile(data: {
    fileContent: string;
    fileName?: string;
    fileSize?: number;
  }) {
    const res = await fetch('/api/parse-packet-tracer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to parse Packet Tracer file');
    }
    return res.json();
  },

  async getSamplePacketTracerLabs() {
    const res = await fetch('/api/sample-pkt-labs');
    if (!res.ok) throw new Error('Failed to fetch sample packet tracer labs');
    return res.json();
  }
};
