import { describe, expect, it } from "vitest";
import { parseGrowthEventPayload } from "../lib/growth/event-schema";

describe("growth event schema", () => {
  it("accepts a known funnel event", () => {
    const result = parseGrowthEventPayload({
      eventName: "checkin_submitted",
      sessionId: "session-1",
      route: "/v2/checkin",
      source: "web",
      occurredAt: "2026-08-16T00:00:00.000Z",
      properties: {
        observationCount: 7,
        mode: "demo",
        hasNote: false,
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.eventName).toBe("checkin_submitted");
      expect(result.event.properties.observationCount).toBe(7);
    }
  });

  it("rejects unknown event names", () => {
    const result = parseGrowthEventPayload({
      eventName: "random_event",
      sessionId: "session-1",
      occurredAt: "2026-08-16T00:00:00.000Z",
    });

    expect(result.ok).toBe(false);
  });

  it("drops nested properties to keep Cloud Logging events queryable", () => {
    const result = parseGrowthEventPayload({
      eventName: "onboarding_completed",
      sessionId: "session-1",
      occurredAt: "2026-08-16T00:00:00.000Z",
      properties: {
        primaryGoal: "WEIGHT",
        nested: { unsafe: true },
        tags: ["a", "b"],
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.properties.primaryGoal).toBe("WEIGHT");
      expect(result.event.properties.nested).toBeUndefined();
      expect(result.event.properties.tags).toBeUndefined();
    }
  });
});

