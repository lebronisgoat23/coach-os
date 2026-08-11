import { DETECTION_ENGINE_VERSION, detectV2Issues } from "./detection-engine";
import { FEATURE_ENGINE_VERSION, computeV2Features } from "./feature-engine";
import { buildObservationsFromCheckIn } from "./check-in-service";
import { createAIRecommendation } from "@/services/ai/gateway";
import type { CoachAttentionClient, Observation, V2CheckInInput } from "./types";

export interface MetricRange {
  fromOffset: number;
  toOffset: number;
  metrics: {
    steps?: number;
    sleepDurationHours?: number;
    weightKgStart?: number;
    weightKgDailyDelta?: number;
    fatigue?: number;
    hunger?: number;
    trainingCompleted?: boolean;
    nutritionAdherence?: number;
  };
}

export interface DemoCase {
  userId: string;
  displayName: string;
  goal: string;
  now: string;
  ranges: MetricRange[];
}

function dayAtOffset(now: string, offset: number): string {
  const base = new Date(now);
  const day = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + offset, 12));
  return day.toISOString();
}

export function expandMetricRangesToObservations(params: {
  userId: string;
  now: string;
  ranges: MetricRange[];
}): Observation[] {
  return params.ranges.flatMap((range) => {
    const observations: Observation[] = [];

    for (let offset = range.fromOffset; offset <= range.toOffset; offset += 1) {
      const dayIndex = offset - range.fromOffset;
      const metrics = range.metrics;
      const checkIn: V2CheckInInput = {
        userId: params.userId,
        measuredAt: dayAtOffset(params.now, offset),
        steps: metrics.steps,
        sleepDurationHours: metrics.sleepDurationHours,
        fatigue: metrics.fatigue,
        hunger: metrics.hunger,
        trainingCompleted: metrics.trainingCompleted,
        nutritionAdherence: metrics.nutritionAdherence,
        weightKg:
          typeof metrics.weightKgStart === "number"
            ? metrics.weightKgStart + (metrics.weightKgDailyDelta ?? 0) * dayIndex
            : undefined,
      };

      observations.push(...buildObservationsFromCheckIn(checkIn));
    }

    return observations;
  });
}

const DEMO_CASES: DemoCase[] = [
  {
    userId: "00000000-0000-4000-8000-000000000101",
    displayName: "Mina Chen",
    goal: "GLP-1 減重中，想避免體重停滯後直接加碼節食。",
    now: "2026-08-11T12:00:00.000Z",
    ranges: [
      {
        fromOffset: -34,
        toOffset: -7,
        metrics: {
          steps: 10500,
          sleepDurationHours: 7.4,
          weightKgStart: 94,
          weightKgDailyDelta: -0.05,
          fatigue: 4,
          hunger: 4,
          trainingCompleted: true,
          nutritionAdherence: 8,
        },
      },
      {
        fromOffset: -6,
        toOffset: 0,
        metrics: {
          steps: 4300,
          sleepDurationHours: 7.3,
          weightKgStart: 92.6,
          weightKgDailyDelta: 0,
          fatigue: 5,
          hunger: 4,
          trainingCompleted: true,
          nutritionAdherence: 8,
        },
      },
    ],
  },
  {
    userId: "00000000-0000-4000-8000-000000000102",
    displayName: "Kevin Lin",
    goal: "工作壓力大，希望用最少紀錄維持減脂節奏。",
    now: "2026-08-11T12:00:00.000Z",
    ranges: [
      {
        fromOffset: -34,
        toOffset: -7,
        metrics: {
          steps: 8500,
          sleepDurationHours: 7.1,
          weightKgStart: 70,
          weightKgDailyDelta: -0.03,
          fatigue: 4,
          hunger: 4,
          trainingCompleted: true,
          nutritionAdherence: 7,
        },
      },
      {
        fromOffset: -1,
        toOffset: 0,
        metrics: {
          steps: 8200,
          sleepDurationHours: 7,
          weightKgStart: 69.2,
          weightKgDailyDelta: 0,
          fatigue: 5,
          hunger: 4,
          trainingCompleted: true,
          nutritionAdherence: 7,
        },
      },
    ],
  },
  {
    userId: "00000000-0000-4000-8000-000000000103",
    displayName: "Rae Huang",
    goal: "穩定下降，不想被頻繁改計畫。",
    now: "2026-08-11T12:00:00.000Z",
    ranges: [
      {
        fromOffset: -34,
        toOffset: 0,
        metrics: {
          steps: 9000,
          sleepDurationHours: 7.4,
          weightKgStart: 78,
          weightKgDailyDelta: -0.06,
          fatigue: 4,
          hunger: 4,
          trainingCompleted: true,
          nutritionAdherence: 8,
        },
      },
    ],
  },
];

export async function buildCoachAttentionDemoClients(): Promise<CoachAttentionClient[]> {
  const clients = await Promise.all(
    DEMO_CASES.map(async (demoCase) => {
      const observations = expandMetricRangesToObservations({
        userId: demoCase.userId,
        now: demoCase.now,
        ranges: demoCase.ranges,
      });
      const featureResult = computeV2Features({
        userId: demoCase.userId,
        observations,
        now: demoCase.now,
      });
      const detectionResult = detectV2Issues({
        userId: demoCase.userId,
        metrics: featureResult.metrics,
        now: demoCase.now,
      });
      const aiResult = await createAIRecommendation({
        userId: demoCase.userId,
        goal: demoCase.goal,
        metrics: featureResult.metrics,
        issues: detectionResult.issues,
        featureEngineVersion: FEATURE_ENGINE_VERSION,
        detectionEngineVersion: DETECTION_ENGINE_VERSION,
        generatedAt: demoCase.now,
      });

      return {
        userId: demoCase.userId,
        displayName: demoCase.displayName,
        goal: demoCase.goal,
        metrics: featureResult.metrics,
        issues: detectionResult.issues,
        recommendation: aiResult.recommendation,
      };
    })
  );

  return clients.sort((a, b) => b.issues.length - a.issues.length);
}
