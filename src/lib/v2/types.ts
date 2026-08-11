export type ISODateString = string;
export type ISODateTimeString = string;

export type ObservationSource =
  | "manual_checkin"
  | "wearable"
  | "coach_entry"
  | "lab"
  | "import"
  | "computed";

export type ObservationType =
  | "weight"
  | "steps"
  | "sleep_duration"
  | "fatigue"
  | "hunger"
  | "training_completed"
  | "nutrition_adherence"
  | "note";

export type ObservationUnit =
  | "kg"
  | "count"
  | "hour"
  | "score_1_10"
  | "boolean"
  | "text"
  | "percent"
  | "none";

export type ObservationValue = number | boolean | string;

export interface Observation {
  id?: string;
  userId: string;
  type: ObservationType;
  value: ObservationValue;
  unit: ObservationUnit;
  source: ObservationSource;
  measuredAt: ISODateTimeString;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface V2CheckInInput {
  userId: string;
  measuredAt: ISODateTimeString;
  weightKg?: number;
  sleepDurationHours?: number;
  steps?: number;
  fatigue?: number;
  hunger?: number;
  trainingCompleted?: boolean;
  nutritionAdherence?: number;
  note?: string;
}

export type DerivedMetricKey =
  | "avg_steps_7d"
  | "avg_steps_baseline_28d"
  | "steps_deviation_pct"
  | "avg_sleep_7d"
  | "avg_sleep_baseline_28d"
  | "sleep_deviation_pct"
  | "weight_trend_kg_7d"
  | "checkin_adherence_7d"
  | "training_adherence_7d"
  | "nutrition_adherence_avg_7d"
  | "fatigue_avg_7d"
  | "hunger_avg_7d";

export interface DerivedMetric {
  key: DerivedMetricKey;
  value: number;
  unit: ObservationUnit;
  windowDays: number;
  baselineWindowDays?: number;
  periodStart: ISODateTimeString;
  periodEnd: ISODateTimeString;
  sampleSize: number;
  engineVersion: string;
  explanation: string;
  metadata?: Record<string, unknown>;
}

export type IssueKind =
  | "activity_drop"
  | "sleep_drop"
  | "weight_plateau"
  | "low_adherence"
  | "recovery_warning"
  | "rapid_weight_change";

export type IssueSeverity = "low" | "medium" | "high";

export interface IssueEvidence {
  metricKey: DerivedMetricKey;
  value: number;
  unit: ObservationUnit;
  explanation: string;
}

export interface DetectedIssue {
  id: string;
  userId: string;
  kind: IssueKind;
  severity: IssueSeverity;
  title: string;
  summary: string;
  evidence: IssueEvidence[];
  ruleVersion: string;
  detectedAt: ISODateTimeString;
}

export type RecommendationActionType =
  | "coach_review"
  | "reduce_friction"
  | "adjust_activity"
  | "protect_recovery"
  | "maintain_plan"
  | "medical_review";

export interface Recommendation {
  id: string;
  userId: string;
  issueIds: string[];
  actionType: RecommendationActionType;
  title: string;
  summary: string;
  rationale: string;
  confidence: number;
  modelProvider: string;
  modelName: string;
  promptVersion: string;
  createdAt: ISODateTimeString;
  metadata?: Record<string, unknown>;
}

export type DecisionAction = "approve" | "edit" | "reject";

export interface Decision {
  id: string;
  recommendationId: string;
  coachId: string;
  action: DecisionAction;
  finalContent?: string;
  reason?: string;
  createdAt: ISODateTimeString;
}

export interface CoachAttentionClient {
  userId: string;
  displayName: string;
  goal: string;
  metrics: DerivedMetric[];
  issues: DetectedIssue[];
  recommendation: Recommendation;
}
