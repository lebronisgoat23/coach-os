import { NextResponse } from "next/server";
import { anonymizeGrowthEvent } from "@/lib/growth/anonymize-event";
import { parseGrowthEventPayload } from "@/lib/growth/event-schema";
import { errorMessage, logStructured } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const startedAt = performance.now();

  try {
    const body = await request.json();
    const parsed = parseGrowthEventPayload(body);
    const latencyMs = Math.round(performance.now() - startedAt);

    if (!parsed.ok) {
      logStructured("WARNING", "growth_event_rejected", {
        eventFamily: "growth",
        reason: parsed.error,
        latencyMs,
      });
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    logStructured("INFO", "growth_event_received", {
      eventFamily: "growth",
      event: anonymizeGrowthEvent(parsed.event),
      latencyMs,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logStructured("ERROR", "growth_event_failed", {
      eventFamily: "growth",
      error: errorMessage(error),
      latencyMs: Math.round(performance.now() - startedAt),
    });
    return NextResponse.json({ ok: false, error: "invalid event payload" }, { status: 400 });
  }
}
