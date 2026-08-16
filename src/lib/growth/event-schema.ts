export const GROWTH_EVENT_NAMES = [
  "page_view",
  "return_visit",
  "signup_intent",
  "onboarding_started",
  "onboarding_goal_selected",
  "onboarding_completed",
  "checkin_started",
  "checkin_submitted",
  "recommendation_viewed",
  "recommendation_decision",
  "ops_page_viewed",
] as const;

export type GrowthEventName = (typeof GROWTH_EVENT_NAMES)[number];

export type GrowthEventProperty = string | number | boolean | null;

export interface GrowthEventPayload {
  eventName: GrowthEventName;
  sessionId: string;
  userId?: string;
  route?: string;
  source: "web" | "server" | "demo";
  occurredAt: string;
  properties: Record<string, GrowthEventProperty>;
}

export type GrowthEventParseResult =
  | { ok: true; event: GrowthEventPayload }
  | { ok: false; error: string };

const EVENT_NAME_SET = new Set<string>(GROWTH_EVENT_NAMES);
const MAX_STRING_LENGTH = 240;
const MAX_PROPERTY_COUNT = 40;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, MAX_STRING_LENGTH);
}

function isGrowthEventName(value: unknown): value is GrowthEventName {
  return typeof value === "string" && EVENT_NAME_SET.has(value);
}

function cleanProperties(input: unknown): Record<string, GrowthEventProperty> {
  if (!isRecord(input)) return {};

  const entries = Object.entries(input).slice(0, MAX_PROPERTY_COUNT);
  return entries.reduce<Record<string, GrowthEventProperty>>((properties, [rawKey, rawValue]) => {
    const key = rawKey.trim().slice(0, 80);
    if (!key) return properties;

    if (typeof rawValue === "string") {
      properties[key] = rawValue.slice(0, MAX_STRING_LENGTH);
    } else if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      properties[key] = rawValue;
    } else if (typeof rawValue === "boolean" || rawValue === null) {
      properties[key] = rawValue;
    }

    return properties;
  }, {});
}

export function parseGrowthEventPayload(input: unknown): GrowthEventParseResult {
  if (!isRecord(input)) return { ok: false, error: "event payload must be an object" };
  if (!isGrowthEventName(input.eventName)) return { ok: false, error: "unknown growth event name" };

  const sessionId = cleanString(input.sessionId);
  if (!sessionId) return { ok: false, error: "sessionId is required" };

  const occurredAt = cleanString(input.occurredAt, new Date().toISOString());
  const parsedDate = new Date(occurredAt);
  if (Number.isNaN(parsedDate.getTime())) return { ok: false, error: "occurredAt must be an ISO date" };

  const rawSource = cleanString(input.source, "web");
  const source = rawSource === "server" || rawSource === "demo" ? rawSource : "web";

  return {
    ok: true,
    event: {
      eventName: input.eventName,
      sessionId,
      userId: cleanString(input.userId) || undefined,
      route: cleanString(input.route) || undefined,
      source,
      occurredAt: parsedDate.toISOString(),
      properties: cleanProperties(input.properties),
    },
  };
}

