import { NextResponse } from "next/server";
import { IS_SUPABASE_CONFIGURED } from "@/lib/supabase";
import { logStructured } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const body = {
    status: "ok",
    service: process.env.K_SERVICE ?? "vitrion-web",
    revision: process.env.K_REVISION ?? "local",
    environment: process.env.NODE_ENV ?? "development",
    checks: {
      app: "ok",
      supabaseConfigured: IS_SUPABASE_CONFIGURED,
    },
    timestamp: new Date().toISOString(),
  };

  logStructured("INFO", "healthz_checked", {
    eventFamily: "ops",
    status: body.status,
    revision: body.revision,
  });

  return NextResponse.json(body, {
    headers: {
      "cache-control": "no-store",
    },
  });
}

