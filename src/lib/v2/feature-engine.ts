import type {
  DerivedMetric,
  DerivedMetricKey,
  ISODateTimeString,
  Observation,
  ObservationType,
  ObservationUnit,
} from "./types";

export const FEATURE_ENGINE_VERSION = "v2-feature-engine-0.1.0";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface FeatureEngineInput {
  userId: string;
  observations: Observation[];
  now?: Date | string;
}

export interface FeatureEngineResult {
  userId: string;
  engineVersion: string;
  metrics: DerivedMetric[];
  computedAt: ISODateTimeString;
}

interface NumericPoint {
  value: number;
  measuredAt: Date;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function asIso(date: Date): ISODateTimeString {
  return date.toISOString();
}

function numericValue(value: Observation["value"]): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  return null;
}

function pointsInWindow(
  observations: Observation[],
  type: ObservationType,
  start: Date,
  end: Date
): NumericPoint[] {
  return observations
    .filter((observation) => observation.type === type)
    .map((observation) => {
      const value = numericValue(observation.value);
      if (value === null) return null;

      const measuredAt = new Date(observation.measuredAt);
      if (Number.isNaN(measuredAt.getTime())) return null;
      if (measuredAt < start || measuredAt >= end) return null;

      return { value, measuredAt };
    })
    .filter((point): point is NumericPoint => point !== null)
    .sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());
}

function average(points: NumericPoint[]): number | null {
  if (points.length === 0) return null;
  return points.reduce((sum, point) => sum + point.value, 0) / points.length;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function makeMetric(params: {
  key: DerivedMetricKey;
  value: number;
  unit: ObservationUnit;
  windowDays: number;
  baselineWindowDays?: number;
  periodStart: Date;
  periodEnd: Date;
  sampleSize: number;
  explanation: string;
  metadata?: Record<string, unknown>;
}): DerivedMetric {
  return {
    key: params.key,
    value: round(params.value),
    unit: params.unit,
    windowDays: params.windowDays,
    baselineWindowDays: params.baselineWindowDays,
    periodStart: asIso(params.periodStart),
    periodEnd: asIso(params.periodEnd),
    sampleSize: params.sampleSize,
    engineVersion: FEATURE_ENGINE_VERSION,
    explanation: params.explanation,
    metadata: params.metadata,
  };
}

function addAverageMetric(
  metrics: DerivedMetric[],
  params: {
    key: DerivedMetricKey;
    points: NumericPoint[];
    unit: ObservationUnit;
    windowDays: number;
    periodStart: Date;
    periodEnd: Date;
    explanation: string;
  }
): number | null {
  const value = average(params.points);
  if (value === null) return null;

  metrics.push(
    makeMetric({
      key: params.key,
      value,
      unit: params.unit,
      windowDays: params.windowDays,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      sampleSize: params.points.length,
      explanation: params.explanation,
    })
  );

  return value;
}

function addDeviationMetric(
  metrics: DerivedMetric[],
  params: {
    key: DerivedMetricKey;
    currentValue: number | null;
    baselineValue: number | null;
    currentSampleSize: number;
    baselineSampleSize: number;
    periodStart: Date;
    periodEnd: Date;
    explanation: string;
  }
) {
  if (params.currentValue === null || params.baselineValue === null || params.baselineValue === 0) {
    return;
  }

  const deviationPct = ((params.currentValue - params.baselineValue) / params.baselineValue) * 100;

  metrics.push(
    makeMetric({
      key: params.key,
      value: deviationPct,
      unit: "percent",
      windowDays: 7,
      baselineWindowDays: 28,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      sampleSize: params.currentSampleSize + params.baselineSampleSize,
      explanation: params.explanation,
      metadata: {
        currentValue: round(params.currentValue),
        baselineValue: round(params.baselineValue),
      },
    })
  );
}

function addWeightTrendMetric(
  metrics: DerivedMetric[],
  weightPoints: NumericPoint[],
  periodStart: Date,
  periodEnd: Date
) {
  if (weightPoints.length < 2) return;

  const first = weightPoints[0];
  const last = weightPoints[weightPoints.length - 1];
  const elapsedDays = Math.max((last.measuredAt.getTime() - first.measuredAt.getTime()) / DAY_MS, 1);
  const normalizedSevenDayChange = ((last.value - first.value) / elapsedDays) * 7;

  metrics.push(
    makeMetric({
      key: "weight_trend_kg_7d",
      value: normalizedSevenDayChange,
      unit: "kg",
      windowDays: 7,
      periodStart,
      periodEnd,
      sampleSize: weightPoints.length,
      explanation: "Normalized weight change across the latest 7 day window.",
      metadata: {
        firstWeightKg: round(first.value),
        lastWeightKg: round(last.value),
        elapsedDays: round(elapsedDays),
      },
    })
  );
}

function uniqueDayCount(points: NumericPoint[]): number {
  return new Set(points.map((point) => point.measuredAt.toISOString().slice(0, 10))).size;
}

export function computeV2Features(input: FeatureEngineInput): FeatureEngineResult {
  const now = toDate(input.now ?? new Date());
  const periodEnd = addDays(startOfUtcDay(now), 1);
  const currentStart = addDays(periodEnd, -7);
  const baselineStart = addDays(currentStart, -28);
  const baselineEnd = currentStart;
  const metrics: DerivedMetric[] = [];

  const currentSteps = pointsInWindow(input.observations, "steps", currentStart, periodEnd);
  const baselineSteps = pointsInWindow(input.observations, "steps", baselineStart, baselineEnd);
  const avgSteps7d = addAverageMetric(metrics, {
    key: "avg_steps_7d",
    points: currentSteps,
    unit: "count",
    windowDays: 7,
    periodStart: currentStart,
    periodEnd,
    explanation: "Average daily steps from the latest 7 day window.",
  });
  const avgStepsBaseline28d = addAverageMetric(metrics, {
    key: "avg_steps_baseline_28d",
    points: baselineSteps,
    unit: "count",
    windowDays: 28,
    periodStart: baselineStart,
    periodEnd: baselineEnd,
    explanation: "Average daily steps from the 28 days before the latest 7 day window.",
  });
  addDeviationMetric(metrics, {
    key: "steps_deviation_pct",
    currentValue: avgSteps7d,
    baselineValue: avgStepsBaseline28d,
    currentSampleSize: currentSteps.length,
    baselineSampleSize: baselineSteps.length,
    periodStart: currentStart,
    periodEnd,
    explanation: "Percent difference between latest 7 day steps and prior 28 day baseline.",
  });

  const currentSleep = pointsInWindow(input.observations, "sleep_duration", currentStart, periodEnd);
  const baselineSleep = pointsInWindow(input.observations, "sleep_duration", baselineStart, baselineEnd);
  const avgSleep7d = addAverageMetric(metrics, {
    key: "avg_sleep_7d",
    points: currentSleep,
    unit: "hour",
    windowDays: 7,
    periodStart: currentStart,
    periodEnd,
    explanation: "Average sleep duration from the latest 7 day window.",
  });
  const avgSleepBaseline28d = addAverageMetric(metrics, {
    key: "avg_sleep_baseline_28d",
    points: baselineSleep,
    unit: "hour",
    windowDays: 28,
    periodStart: baselineStart,
    periodEnd: baselineEnd,
    explanation: "Average sleep duration from the 28 days before the latest 7 day window.",
  });
  addDeviationMetric(metrics, {
    key: "sleep_deviation_pct",
    currentValue: avgSleep7d,
    baselineValue: avgSleepBaseline28d,
    currentSampleSize: currentSleep.length,
    baselineSampleSize: baselineSleep.length,
    periodStart: currentStart,
    periodEnd,
    explanation: "Percent difference between latest 7 day sleep and prior 28 day baseline.",
  });

  addWeightTrendMetric(
    metrics,
    pointsInWindow(input.observations, "weight", currentStart, periodEnd),
    currentStart,
    periodEnd
  );

  const checkInSignals = input.observations
    .flatMap((observation) => {
      if (
        observation.type !== "weight" &&
        observation.type !== "sleep_duration" &&
        observation.type !== "fatigue" &&
        observation.type !== "hunger" &&
        observation.type !== "nutrition_adherence"
      ) {
        return [];
      }
      const measuredAt = new Date(observation.measuredAt);
      if (Number.isNaN(measuredAt.getTime()) || measuredAt < currentStart || measuredAt >= periodEnd) return [];
      return [{ value: 1, measuredAt }];
    })
    .sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());

  metrics.push(
    makeMetric({
      key: "checkin_adherence_7d",
      value: uniqueDayCount(checkInSignals) / 7,
      unit: "percent",
      windowDays: 7,
      periodStart: currentStart,
      periodEnd,
      sampleSize: uniqueDayCount(checkInSignals),
      explanation: "Share of the latest 7 days with at least one manual check-in signal.",
    })
  );

  addAverageMetric(metrics, {
    key: "training_adherence_7d",
    points: pointsInWindow(input.observations, "training_completed", currentStart, periodEnd),
    unit: "percent",
    windowDays: 7,
    periodStart: currentStart,
    periodEnd,
    explanation: "Average completion rate from training_completed check-ins in the latest 7 day window.",
  });

  addAverageMetric(metrics, {
    key: "nutrition_adherence_avg_7d",
    points: pointsInWindow(input.observations, "nutrition_adherence", currentStart, periodEnd),
    unit: "score_1_10",
    windowDays: 7,
    periodStart: currentStart,
    periodEnd,
    explanation: "Average self-reported nutrition adherence from the latest 7 day window.",
  });

  addAverageMetric(metrics, {
    key: "fatigue_avg_7d",
    points: pointsInWindow(input.observations, "fatigue", currentStart, periodEnd),
    unit: "score_1_10",
    windowDays: 7,
    periodStart: currentStart,
    periodEnd,
    explanation: "Average self-reported fatigue from the latest 7 day window.",
  });

  addAverageMetric(metrics, {
    key: "hunger_avg_7d",
    points: pointsInWindow(input.observations, "hunger", currentStart, periodEnd),
    unit: "score_1_10",
    windowDays: 7,
    periodStart: currentStart,
    periodEnd,
    explanation: "Average self-reported hunger from the latest 7 day window.",
  });

  return {
    userId: input.userId,
    engineVersion: FEATURE_ENGINE_VERSION,
    metrics,
    computedAt: asIso(now),
  };
}
