import { IS_SUPABASE_CONFIGURED, supabase } from "@/lib/supabase";
import type { Decision, DecisionAction } from "./types";

interface SupabaseLike {
  from: (table: string) => {
    insert: (payload: Record<string, unknown>) => {
      select: (columns?: string) => {
        single: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
      };
    };
  };
}

export interface DecisionInput {
  recommendationId: string;
  coachId: string;
  action: DecisionAction;
  finalContent?: string;
  reason?: string;
}

export function createLocalDecision(input: DecisionInput, now = new Date()): Decision {
  return {
    id: `decision_${input.recommendationId}_${now.toISOString()}`,
    recommendationId: input.recommendationId,
    coachId: input.coachId,
    action: input.action,
    finalContent: input.finalContent,
    reason: input.reason,
    createdAt: now.toISOString(),
  };
}

export async function persistDecision(input: DecisionInput): Promise<Decision> {
  if (!IS_SUPABASE_CONFIGURED) {
    throw new Error("Supabase is not configured for this environment.");
  }

  const db = supabase as unknown as SupabaseLike;
  const { data, error } = await db
    .from("decisions")
    .insert({
      recommendation_id: input.recommendationId,
      coach_id: input.coachId,
      action: input.action,
      final_content: input.finalContent,
      reason: input.reason,
    })
    .select("id,recommendation_id,coach_id,action,final_content,reason,created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: String(data?.id ?? ""),
    recommendationId: String(data?.recommendation_id ?? ""),
    coachId: String(data?.coach_id ?? ""),
    action: data?.action as DecisionAction,
    finalContent: typeof data?.final_content === "string" ? data.final_content : undefined,
    reason: typeof data?.reason === "string" ? data.reason : undefined,
    createdAt: String(data?.created_at ?? new Date().toISOString()),
  };
}
