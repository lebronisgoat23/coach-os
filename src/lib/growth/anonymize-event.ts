import { createHash } from "node:crypto";
import type { GrowthEventPayload } from "./event-schema";

function hashIdentifier(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const salt = process.env.ANALYTICS_EVENT_SALT ?? "local-development-salt";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 24);
}

export function anonymizeGrowthEvent(event: GrowthEventPayload) {
  return {
    eventName: event.eventName,
    sessionIdHash: hashIdentifier(event.sessionId),
    userIdHash: hashIdentifier(event.userId),
    route: event.route,
    source: event.source,
    occurredAt: event.occurredAt,
    properties: event.properties,
  };
}

