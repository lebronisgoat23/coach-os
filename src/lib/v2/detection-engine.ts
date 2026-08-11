import type {
  DerivedMetric,
  DerivedMetricKey,
  DetectedIssue,
  IssueEvidence,
  IssueKind,
  IssueSeverity,
} from "./types";

export const DETECTION_ENGINE_VERSION = "v2-detection-engine-0.1.0";

export interface DetectionEngineInput {
  userId: string;
  metrics: DerivedMetric[];
  now?: Date | string;
}

export interface DetectionEngineResult {
  userId: string;
  ruleVersion: string;
  issues: DetectedIssue[];
  detectedAt: string;
}

const ISSUE_PRIORITY: IssueKind[] = [
  "rapid_weight_change",
  "low_adherence",
  "activity_drop",
  "sleep_drop",
  "recovery_warning",
  "weight_plateau",
];

const SEVERITY_RANK: Record<IssueSeverity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function metric(metrics: DerivedMetric[], key: DerivedMetricKey): DerivedMetric | undefined {
  return metrics.find((candidate) => candidate.key === key);
}

function evidence(source: DerivedMetric, explanation?: string): IssueEvidence {
  return {
    metricKey: source.key,
    value: source.value,
    unit: source.unit,
    explanation: explanation ?? source.explanation,
  };
}

function issueId(userId: string, kind: IssueKind, detectedAt: string): string {
  return `${userId}:${kind}:${detectedAt.slice(0, 10)}`;
}

function createIssue(params: {
  userId: string;
  kind: IssueKind;
  severity: IssueSeverity;
  title: string;
  summary: string;
  evidence: IssueEvidence[];
  detectedAt: string;
}): DetectedIssue {
  return {
    id: issueId(params.userId, params.kind, params.detectedAt),
    userId: params.userId,
    kind: params.kind,
    severity: params.severity,
    title: params.title,
    summary: params.summary,
    evidence: params.evidence,
    ruleVersion: DETECTION_ENGINE_VERSION,
    detectedAt: params.detectedAt,
  };
}

function sortIssues(issues: DetectedIssue[]): DetectedIssue[] {
  return [...issues].sort((a, b) => {
    const severityDelta = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (severityDelta !== 0) return severityDelta;
    return ISSUE_PRIORITY.indexOf(a.kind) - ISSUE_PRIORITY.indexOf(b.kind);
  });
}

export function detectV2Issues(input: DetectionEngineInput): DetectionEngineResult {
  const detectedAt = (input.now instanceof Date ? input.now : new Date(input.now ?? new Date())).toISOString();
  const metrics = input.metrics;
  const issues: DetectedIssue[] = [];

  const stepsDeviation = metric(metrics, "steps_deviation_pct");
  const avgSteps = metric(metrics, "avg_steps_7d");
  const baselineSteps = metric(metrics, "avg_steps_baseline_28d");
  if (stepsDeviation && stepsDeviation.value <= -15) {
    issues.push(
      createIssue({
        userId: input.userId,
        kind: "activity_drop",
        severity: stepsDeviation.value <= -25 ? "high" : "medium",
        title: "活動量明顯下滑",
        summary:
          "最近 7 天步數低於個人 baseline。若同時出現體重停滯，應先修復活動量與日常節奏，再考慮降低熱量。",
        evidence: [
          evidence(stepsDeviation, "Latest 7 day steps are below the prior 28 day baseline."),
          ...(avgSteps ? [evidence(avgSteps)] : []),
          ...(baselineSteps ? [evidence(baselineSteps)] : []),
        ],
        detectedAt,
      })
    );
  }

  const avgSleep = metric(metrics, "avg_sleep_7d");
  const sleepDeviation = metric(metrics, "sleep_deviation_pct");
  if ((avgSleep && avgSleep.value < 6) || (sleepDeviation && sleepDeviation.value <= -15)) {
    const severity = (avgSleep && avgSleep.value < 5.5) || (sleepDeviation && sleepDeviation.value <= -25) ? "high" : "medium";
    issues.push(
      createIssue({
        userId: input.userId,
        kind: "sleep_drop",
        severity,
        title: "睡眠恢復不足",
        summary: "睡眠時數或相對 baseline 下滑，短期內不適合只用更高強度或更低熱量解決卡關。",
        evidence: [
          ...(avgSleep ? [evidence(avgSleep)] : []),
          ...(sleepDeviation ? [evidence(sleepDeviation)] : []),
        ],
        detectedAt,
      })
    );
  }

  const checkinAdherence = metric(metrics, "checkin_adherence_7d");
  const nutritionAdherence = metric(metrics, "nutrition_adherence_avg_7d");
  if ((checkinAdherence && checkinAdherence.value < 0.5) || (nutritionAdherence && nutritionAdherence.value < 5)) {
    issues.push(
      createIssue({
        userId: input.userId,
        kind: "low_adherence",
        severity: checkinAdherence && checkinAdherence.value < 0.3 ? "high" : "medium",
        title: "資料或飲食執行率不足",
        summary: "目前資料可信度不足，coach 應先降低回報摩擦或重設更容易執行的任務。",
        evidence: [
          ...(checkinAdherence ? [evidence(checkinAdherence, "Check-in coverage is below the minimum threshold.")] : []),
          ...(nutritionAdherence ? [evidence(nutritionAdherence)] : []),
        ],
        detectedAt,
      })
    );
  }

  const fatigue = metric(metrics, "fatigue_avg_7d");
  if ((fatigue && fatigue.value >= 8) || (fatigue && fatigue.value >= 7 && avgSleep && avgSleep.value < 6.5)) {
    issues.push(
      createIssue({
        userId: input.userId,
        kind: "recovery_warning",
        severity: fatigue && fatigue.value >= 8.5 ? "high" : "medium",
        title: "疲勞累積警訊",
        summary: "疲勞偏高，下一步應優先確認睡眠、訓練量、壓力與飲食可執行性。",
        evidence: [
          ...(fatigue ? [evidence(fatigue)] : []),
          ...(avgSleep ? [evidence(avgSleep)] : []),
        ],
        detectedAt,
      })
    );
  }

  const weightTrend = metric(metrics, "weight_trend_kg_7d");
  if (weightTrend && Math.abs(weightTrend.value) >= 1.5) {
    issues.push(
      createIssue({
        userId: input.userId,
        kind: "rapid_weight_change",
        severity: "high",
        title: "體重變化過快",
        summary: "7 天標準化體重變化過大。這可能是水分、紀錄誤差、用藥或身體狀況變化，需要人工確認。",
        evidence: [evidence(weightTrend)],
        detectedAt,
      })
    );
  }

  if (
    weightTrend &&
    Math.abs(weightTrend.value) < 0.2 &&
    nutritionAdherence &&
    nutritionAdherence.value >= 7 &&
    checkinAdherence &&
    checkinAdherence.value >= 0.7
  ) {
    issues.push(
      createIssue({
        userId: input.userId,
        kind: "weight_plateau",
        severity: "medium",
        title: "高執行率下體重停滯",
        summary:
          "體重趨勢接近持平且飲食回報良好。若活動量或睡眠也下降，應先處理那些根因；否則再由 coach 調整計畫。",
        evidence: [evidence(weightTrend), evidence(nutritionAdherence), evidence(checkinAdherence)],
        detectedAt,
      })
    );
  }

  return {
    userId: input.userId,
    ruleVersion: DETECTION_ENGINE_VERSION,
    issues: sortIssues(issues),
    detectedAt,
  };
}
