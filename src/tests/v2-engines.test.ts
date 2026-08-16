import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { detectV2Issues } from "../lib/v2/detection-engine";
import { expandMetricRangesToObservations, type MetricRange } from "../lib/v2/demo-data";
import { computeV2Features } from "../lib/v2/feature-engine";
import type { IssueKind } from "../lib/v2/types";

interface GoldenCase {
  id: string;
  description: string;
  userId: string;
  now: string;
  ranges: MetricRange[];
  expectedPrimaryIssue: IssueKind | null;
  expectedIssues: IssueKind[];
  absentIssues: IssueKind[];
}

interface GoldenFile {
  schemaVersion: string;
  cases: GoldenCase[];
}

const goldenCases = JSON.parse(
  readFileSync(path.join(process.cwd(), "evals", "golden_cases.json"), "utf8")
) as GoldenFile;

describe("V2 golden cases", () => {
  it("keeps at least twenty representative cases", () => {
    expect(goldenCases.cases.length).toBeGreaterThanOrEqual(20);
  });

  for (const testCase of goldenCases.cases) {
    it(`${testCase.id}: ${testCase.description}`, () => {
      const observations = expandMetricRangesToObservations({
        userId: testCase.userId,
        now: testCase.now,
        ranges: testCase.ranges,
      });
      const featureResult = computeV2Features({
        userId: testCase.userId,
        observations,
        now: testCase.now,
      });
      const detectionResult = detectV2Issues({
        userId: testCase.userId,
        metrics: featureResult.metrics,
        now: testCase.now,
      });
      const issueKinds = detectionResult.issues.map((issue) => issue.kind);

      expect(issueKinds[0] ?? null).toBe(testCase.expectedPrimaryIssue);
      for (const expectedIssue of testCase.expectedIssues) {
        expect(issueKinds).toContain(expectedIssue);
      }
      for (const absentIssue of testCase.absentIssues) {
        expect(issueKinds).not.toContain(absentIssue);
      }
    });
  }

  it("prioritizes activity recovery before calorie reduction when plateau and steps drop coexist", () => {
    const testCase = goldenCases.cases.find((candidate) => candidate.id === "plateau_activity_drop_prioritized");
    expect(testCase).toBeDefined();

    const observations = expandMetricRangesToObservations({
      userId: testCase!.userId,
      now: testCase!.now,
      ranges: testCase!.ranges,
    });
    const featureResult = computeV2Features({
      userId: testCase!.userId,
      observations,
      now: testCase!.now,
    });
    const detectionResult = detectV2Issues({
      userId: testCase!.userId,
      metrics: featureResult.metrics,
      now: testCase!.now,
    });

    expect(detectionResult.issues.map((issue) => issue.kind)).toEqual(["activity_drop", "weight_plateau"]);
  });
});
