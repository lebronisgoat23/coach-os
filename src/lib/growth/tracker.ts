import type { GrowthEventName, GrowthEventProperty } from "./event-schema";

const SESSION_STORAGE_KEY = "vitrion.growth.session_id";

function randomSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const sessionId = randomSessionId();
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
  } catch {
    return randomSessionId();
  }
}

export function trackGrowthEvent(
  eventName: GrowthEventName,
  properties: Record<string, GrowthEventProperty> = {}
) {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      eventName,
      sessionId: getSessionId(),
      route: window.location.pathname,
      source: "web",
      occurredAt: new Date().toISOString(),
      properties,
    };
    const body = JSON.stringify(payload);

    if ("sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
      return;
    }

    fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Analytics must never break product flows.
    });
  } catch {
    // Analytics must never break product flows.
  }
}
