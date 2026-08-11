import { describe, expect, it } from "vitest";
import { DETECTION_ENGINE_VERSION } from "../lib/v2/detection-engine";
import { FEATURE_ENGINE_VERSION } from "../lib/v2/feature-engine";
import type { DetectedIssue } from "../lib/v2/types";
import { createAIRecommendation, type AIProvider } from "../services/ai/gateway";
import { AI_RECOMMENDATION_SCHEMA_VERSION, parseAIRecommendationOutput } from "../services/ai/schemas";

function issue(kind: DetectedIssue["kind"], severity: DetectedIssue["severity"] = "high"): DetectedIssue {
  return {
    id: `issue-${kind}`,
    userId: "user-ai-test",
    kind,
    severity,
    title: kind,
    summary: `summary for ${kind}`,
    evidence: [],
    ruleVersion: DETECTION_ENGINE_VERSION,
    detectedAt: "2026-08-11T12:00:00.000Z",
  };
}

describe("AI recommendation schema", () => {
  it("rejects invalid confidence", () => {
    expect(() =>
      parseAIRecommendationOutput({
        schemaVersion: AI_RECOMMENDATION_SCHEMA_VERSION,
        title: "Invalid",
        summary: "Invalid",
        rationale: "Invalid",
        actionType: "maintain_plan",
        confidence: 1.2,
        sourceIssueKinds: [],
        nextCheckInPrompt: "Prompt",
        safety: {
          requiresCoachReview: true,
          requiresClinicianReview: false,
          disclaimer: "Decision support only.",
        },
      })
    ).toThrow("confidence");
  });
});

describe("AI gateway", () => {
  it("maps rapid weight change to medical review safety posture", async () => {
    const result = await createAIRecommendation({
      userId: "user-ai-test",
      goal: "Avoid unsafe weight-loss adjustments.",
      metrics: [],
      issues: [issue("rapid_weight_change")],
      featureEngineVersion: FEATURE_ENGINE_VERSION,
      detectionEngineVersion: DETECTION_ENGINE_VERSION,
      generatedAt: "2026-08-11T12:00:00.000Z",
    });

    expect(result.recommendation.actionType).toBe("medical_review");
    expect(result.output.safety.requiresClinicianReview).toBe(true);
    expect(result.aiRun.inputHash).toMatch(/^[a-f0-9]{8}$/);
  });

  it("fails closed when a provider returns malformed output", async () => {
    const badProvider: AIProvider = {
      name: "bad-provider",
      model: "bad-model",
      async completeRecommendation() {
        return { title: "missing schema fields" };
      },
    };

    await expect(
      createAIRecommendation(
        {
          userId: "user-ai-test",
          goal: "Maintain plan.",
          metrics: [],
          issues: [],
          featureEngineVersion: FEATURE_ENGINE_VERSION,
          detectionEngineVersion: DETECTION_ENGINE_VERSION,
          generatedAt: "2026-08-11T12:00:00.000Z",
        },
        badProvider
      )
    ).rejects.toThrow("safety");
  });
});
