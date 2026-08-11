import type { IssueKind, Recommendation, RecommendationActionType } from "@/lib/v2/types";
import {
  AI_RECOMMENDATION_SCHEMA_VERSION,
  type AIRecommendationInput,
  type AIRecommendationOutput,
  parseAIRecommendationOutput,
} from "./schemas";

export const AI_GATEWAY_VERSION = "v2-ai-gateway-0.1.0";
export const AI_PROMPT_VERSION = "v2-coach-recommendation-prompt-0.1.0";

export interface AIPromptEnvelope {
  system: string;
  user: AIRecommendationInput;
  outputSchemaVersion: string;
}

export interface AIProvider {
  name: string;
  model: string;
  completeRecommendation: (envelope: AIPromptEnvelope) => Promise<unknown>;
}

export interface AIRunAudit {
  id: string;
  userId: string;
  provider: string;
  model: string;
  promptVersion: string;
  gatewayVersion: string;
  inputHash: string;
  latencyMs: number;
  rawOutput: unknown;
  createdAt: string;
}

export interface AIRecommendationResult {
  recommendation: Recommendation;
  aiRun: AIRunAudit;
  output: AIRecommendationOutput;
}

function stableHash(value: string): string {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function recommendationId(inputHash: string, createdAt: string): string {
  return `rec_${inputHash}_${createdAt.slice(0, 10)}`;
}

function runId(inputHash: string, createdAt: string): string {
  return `airun_${inputHash}_${createdAt.slice(0, 10)}`;
}

export function buildAIPromptEnvelope(input: AIRecommendationInput): AIPromptEnvelope {
  return {
    system: [
      "You are a coaching decision-support assistant for Vitrion V2.",
      "You must not diagnose, prescribe medication, or override a licensed clinician.",
      "Use detected issues and metric evidence as source of truth.",
      "Return only the contracted JSON shape. Every recommendation must be coach-reviewable.",
    ].join(" "),
    user: input,
    outputSchemaVersion: AI_RECOMMENDATION_SCHEMA_VERSION,
  };
}

function outputForIssue(kind: IssueKind | undefined): {
  title: string;
  summary: string;
  rationale: string;
  actionType: RecommendationActionType;
  prompt: string;
  requiresClinicianReview: boolean;
} {
  switch (kind) {
    case "rapid_weight_change":
      return {
        title: "先人工確認體重快速變化",
        summary: "體重短期變化過快，請 coach 先確認量測、水分、用藥與不適症狀。",
        rationale: "快速變化可能不是脂肪變化，直接調整飲食或訓練風險較高。",
        actionType: "medical_review",
        prompt: "今天體重、浮腫、腸胃、用藥或身體不適有明顯改變嗎？",
        requiresClinicianReview: true,
      };
    case "low_adherence":
      return {
        title: "先降低紀錄與執行摩擦",
        summary: "資料或飲食執行率不足，下一步應把任務縮小到可每天完成。",
        rationale: "低執行率時，演算法無法可靠判斷計畫是否有效。",
        actionType: "reduce_friction",
        prompt: "今天最卡住你完成紀錄或飲食計畫的是什麼？",
        requiresClinicianReview: false,
      };
    case "activity_drop":
      return {
        title: "先修復活動量下滑",
        summary: "步數低於個人 baseline，若體重停滯，優先恢復日常活動再調低熱量。",
        rationale: "活動量下降會讓熱量缺口縮小，直接少吃可能增加疲勞與流失率。",
        actionType: "adjust_activity",
        prompt: "今天可以增加哪一段 10 分鐘走路或站立時間？",
        requiresClinicianReview: false,
      };
    case "sleep_drop":
    case "recovery_warning":
      return {
        title: "先保護恢復能力",
        summary: "睡眠或疲勞警訊偏高，本週應降低壓力源並檢查訓練負荷。",
        rationale: "恢復不足會放大飢餓、降低 NEAT，讓減重計畫更難持續。",
        actionType: "protect_recovery",
        prompt: "今晚最有把握提前 30 分鐘睡或降低刺激物的做法是什麼？",
        requiresClinicianReview: false,
      };
    case "weight_plateau":
      return {
        title: "由 coach 審核是否調整計畫",
        summary: "高執行率下體重停滯，需先排除活動量與睡眠問題，再微調飲食或訓練。",
        rationale: "停滯本身不是唯一原因；系統應把證據交給 coach，而不是自動加碼限制。",
        actionType: "coach_review",
        prompt: "過去一週有沒有外食、經期、壓力或量測時間改變？",
        requiresClinicianReview: false,
      };
    default:
      return {
        title: "維持目前計畫",
        summary: "目前沒有觸發高優先級問題，維持計畫並繼續收集資料。",
        rationale: "沒有足夠證據支持大幅調整，保持穩定比頻繁修改更可靠。",
        actionType: "maintain_plan",
        prompt: "今天哪個行為最值得保持？",
        requiresClinicianReview: false,
      };
  }
}

export const deterministicFallbackProvider: AIProvider = {
  name: "deterministic_fallback",
  model: "rules-v0",
  async completeRecommendation(envelope) {
    const primaryIssue = envelope.user.issues[0];
    const template = outputForIssue(primaryIssue?.kind);

    return {
      schemaVersion: AI_RECOMMENDATION_SCHEMA_VERSION,
      title: template.title,
      summary: template.summary,
      rationale: template.rationale,
      actionType: template.actionType,
      confidence: primaryIssue ? 0.76 : 0.6,
      sourceIssueKinds: envelope.user.issues.map((issue) => issue.kind),
      nextCheckInPrompt: template.prompt,
      safety: {
        requiresCoachReview: true,
        requiresClinicianReview: template.requiresClinicianReview,
        disclaimer: "Decision support only. Coaches must review before user-facing guidance.",
      },
    } satisfies AIRecommendationOutput;
  },
};

export async function createAIRecommendation(
  input: AIRecommendationInput,
  provider: AIProvider = deterministicFallbackProvider
): Promise<AIRecommendationResult> {
  const createdAt = new Date(input.generatedAt).toISOString();
  const envelope = buildAIPromptEnvelope(input);
  const inputHash = stableHash(JSON.stringify(envelope));
  const startedAt = Date.now();
  const rawOutput = await provider.completeRecommendation(envelope);
  const latencyMs = Date.now() - startedAt;
  const output = parseAIRecommendationOutput(rawOutput);

  return {
    output,
    recommendation: {
      id: recommendationId(inputHash, createdAt),
      userId: input.userId,
      issueIds: input.issues.map((issue) => issue.id),
      actionType: output.actionType,
      title: output.title,
      summary: output.summary,
      rationale: output.rationale,
      confidence: output.confidence,
      modelProvider: provider.name,
      modelName: provider.model,
      promptVersion: AI_PROMPT_VERSION,
      createdAt,
      metadata: {
        sourceIssueKinds: output.sourceIssueKinds,
        nextCheckInPrompt: output.nextCheckInPrompt,
        safety: output.safety,
      },
    },
    aiRun: {
      id: runId(inputHash, createdAt),
      userId: input.userId,
      provider: provider.name,
      model: provider.model,
      promptVersion: AI_PROMPT_VERSION,
      gatewayVersion: AI_GATEWAY_VERSION,
      inputHash,
      latencyMs,
      rawOutput,
      createdAt,
    },
  };
}
