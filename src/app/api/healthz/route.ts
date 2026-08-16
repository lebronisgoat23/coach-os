import { GET as getHealth } from "@/app/healthz/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = getHealth;
