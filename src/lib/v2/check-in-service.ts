import { IS_SUPABASE_CONFIGURED, supabase } from "@/lib/supabase";
import type { Observation, V2CheckInInput } from "./types";

interface SupabaseLike {
  from: (table: string) => {
    upsert: (
      payload: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => {
      select: (columns?: string) => {
        single: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
      };
    };
    insert: (
      payload: Record<string, unknown> | Record<string, unknown>[]
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
  };
}

export interface PersistedV2CheckIn {
  checkInId: string;
  observationCount: number;
}

function clampScore(value: number): number {
  return Math.max(1, Math.min(10, value));
}

export function buildObservationsFromCheckIn(input: V2CheckInInput): Observation[] {
  const common = {
    userId: input.userId,
    source: "manual_checkin" as const,
    measuredAt: input.measuredAt,
    confidence: 1,
  };

  const observations: Observation[] = [];
  if (typeof input.weightKg === "number") {
    observations.push({ ...common, type: "weight", value: input.weightKg, unit: "kg" });
  }
  if (typeof input.sleepDurationHours === "number") {
    observations.push({ ...common, type: "sleep_duration", value: input.sleepDurationHours, unit: "hour" });
  }
  if (typeof input.steps === "number") {
    observations.push({ ...common, type: "steps", value: input.steps, unit: "count" });
  }
  if (typeof input.fatigue === "number") {
    observations.push({ ...common, type: "fatigue", value: clampScore(input.fatigue), unit: "score_1_10" });
  }
  if (typeof input.hunger === "number") {
    observations.push({ ...common, type: "hunger", value: clampScore(input.hunger), unit: "score_1_10" });
  }
  if (typeof input.trainingCompleted === "boolean") {
    observations.push({ ...common, type: "training_completed", value: input.trainingCompleted, unit: "boolean" });
  }
  if (typeof input.nutritionAdherence === "number") {
    observations.push({
      ...common,
      type: "nutrition_adherence",
      value: clampScore(input.nutritionAdherence),
      unit: "score_1_10",
    });
  }
  if (input.note && input.note.trim().length > 0) {
    observations.push({ ...common, type: "note", value: input.note.trim(), unit: "text" });
  }

  return observations;
}

export async function persistV2CheckIn(input: V2CheckInInput): Promise<PersistedV2CheckIn> {
  if (!IS_SUPABASE_CONFIGURED) {
    throw new Error("Supabase is not configured for this environment.");
  }

  const db = supabase as unknown as SupabaseLike;
  const observations = buildObservationsFromCheckIn(input);
  const measuredAt = new Date(input.measuredAt);
  const checkInDate = measuredAt.toISOString().slice(0, 10);

  const { data: checkIn, error: checkInError } = await db
    .from("check_ins")
    .upsert(
      {
        user_id: input.userId,
        check_in_date: checkInDate,
        submitted_at: measuredAt.toISOString(),
        payload: {
          weightKg: input.weightKg,
          sleepDurationHours: input.sleepDurationHours,
          steps: input.steps,
          fatigue: input.fatigue,
          hunger: input.hunger,
          trainingCompleted: input.trainingCompleted,
          nutritionAdherence: input.nutritionAdherence,
          note: input.note,
        },
      },
      { onConflict: "user_id,check_in_date" }
    )
    .select("id")
    .single();

  if (checkInError) {
    throw new Error(checkInError.message);
  }

  const checkInId = String(checkIn?.id ?? "");
  if (!checkInId) {
    throw new Error("V2 check-in did not return an id.");
  }

  const observationRows = observations.map((observation) => ({
    user_id: observation.userId,
    check_in_id: checkInId,
    type: observation.type,
    value: observation.value,
    unit: observation.unit,
    source: observation.source,
    measured_at: observation.measuredAt,
    confidence: observation.confidence,
    metadata: observation.metadata ?? {},
  }));

  const { error: observationError } = await db.from("observations").insert(observationRows);
  if (observationError) {
    throw new Error(observationError.message);
  }

  return {
    checkInId,
    observationCount: observationRows.length,
  };
}
