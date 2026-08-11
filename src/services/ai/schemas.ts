import type {
  DerivedMetric,
  DetectedIssue,
  IssueKind,
  RecommendationActionType,
} from "@/lib/v2/types";

export const AI_RECOMMENDATION_SCHEMA_VERSION = "v2-ai-recommendation-schema-0.1.0";

export interface AIRecommendationInput {
  userId: string;
  goal: string;
  metrics: DerivedMetric[];
  issues: DetectedIssue[];
  featureEngineVersion: string;
  detectionEngineVersion: string;
  generatedAt: string;
}

export interface AIRecommendationOutput {
  schemaVersion: string;
  title: string;
  summary: string;
  rationale: string;
  actionType: RecommendationActionType;
  confidence: number;
  sourceIssueKinds: IssueKind[];
  nextCheckInPrompt: string;
  safety: {
    requiresCoachReview: boolean;
    requiresClinicianReview: boolean;
    disclaimer: string;
  };
}

const ACTION_TYPES: RecommendationActionType[] = [
  "coach_review",
  "reduce_friction",
  "adjust_activity",
  "protect_recovery",
  "maintain_plan",
  "medical_review",
];

const ISSUE_KINDS: IssueKind[] = [
  "activity_drop",
  "sleep_drop",
  "weight_plateau",
  "low_adherence",
  "recovery_warning",
  "rapid_weight_change",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isActionType(value: unknown): value is RecommendationActionType {
  return typeof value === "string" && ACTION_TYPES.includes(value as RecommendationActionType);
}

function isIssueKind(value: unknown): value is IssueKind {
  return typeof value === "string" && ISSUE_KINDS.includes(value as IssueKind);
}

export function parseAIRecommendationOutput(value: unknown): AIRecommendationOutput {
  if (!isRecord(value)) {
    throw new Error("AI recommendation output must be an object.");
  }

  const safety = value.safety;
  if (!isRecord(safety)) {
    throw new Error("AI recommendation output safety field must be an object.");
  }

  if (!isString(value.schemaVersion)) throw new Error("AI output schemaVersion is required.");
  if (!isString(value.title)) throw new Error("AI output title is required.");
  if (!isString(value.summary)) throw new Error("AI output summary is required.");
  if (!isString(value.rationale)) throw new Error("AI output rationale is required.");
  if (!isActionType(value.actionType)) throw new Error("AI output actionType is invalid.");
  if (typeof value.confidence !== "number" || value.confidence < 0 || value.confidence > 1) {
    throw new Error("AI output confidence must be a number between 0 and 1.");
  }
  if (!Array.isArray(value.sourceIssueKinds) || !value.sourceIssueKinds.every(isIssueKind)) {
    throw new Error("AI output sourceIssueKinds is invalid.");
  }
  if (!isString(value.nextCheckInPrompt)) throw new Error("AI output nextCheckInPrompt is required.");
  if (typeof safety.requiresCoachReview !== "boolean") {
    throw new Error("AI output safety.requiresCoachReview must be boolean.");
  }
  if (typeof safety.requiresClinicianReview !== "boolean") {
    throw new Error("AI output safety.requiresClinicianReview must be boolean.");
  }
  if (!isString(safety.disclaimer)) throw new Error("AI output safety.disclaimer is required.");

  return {
    schemaVersion: value.schemaVersion,
    title: value.title,
    summary: value.summary,
    rationale: value.rationale,
    actionType: value.actionType,
    confidence: value.confidence,
    sourceIssueKinds: value.sourceIssueKinds,
    nextCheckInPrompt: value.nextCheckInPrompt,
    safety: {
      requiresCoachReview: safety.requiresCoachReview,
      requiresClinicianReview: safety.requiresClinicianReview,
      disclaimer: safety.disclaimer,
    },
  };
}
