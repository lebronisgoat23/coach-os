"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCoachAttentionDemoClients } from "@/lib/v2/demo-data";
import { createLocalDecision, persistDecision } from "@/lib/v2/decision-service";
import { trackGrowthEvent } from "@/lib/growth/tracker";
import type {
  CoachAttentionClient,
  Decision,
  DecisionAction,
  DerivedMetricKey,
  IssueSeverity,
} from "@/lib/v2/types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function severityClass(severity: IssueSeverity): string {
  if (severity === "high") return "bg-red-500/15 text-red-100 border-red-300/20";
  if (severity === "medium") return "bg-amber-400/15 text-amber-100 border-amber-300/20";
  return "bg-slate-400/15 text-slate-100 border-slate-300/20";
}

function metricValue(client: CoachAttentionClient, key: DerivedMetricKey): string {
  const metric = client.metrics.find((candidate) => candidate.key === key);
  if (!metric) return "n/a";
  if (metric.key === "checkin_adherence_7d" || metric.key === "training_adherence_7d") {
    return `${Math.round(metric.value * 100)}%`;
  }
  if (metric.unit === "percent") return `${Math.round(metric.value)}%`;
  if (metric.unit === "kg") return `${metric.value.toFixed(2)} kg`;
  if (metric.unit === "hour") return `${metric.value.toFixed(1)} h`;
  return `${Math.round(metric.value)}`;
}

export default function CoachAttentionPage() {
  const { user, isDemo } = useAuth();
  const [clients, setClients] = useState<CoachAttentionClient[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    buildCoachAttentionDemoClients()
      .then((result) => {
        if (isMounted) setClients(result);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading || clients.length === 0) return;

    trackGrowthEvent("recommendation_viewed", {
      clientCount: clients.length,
      issueCount: clients.reduce((total, client) => total + client.issues.length, 0),
      highSeverityIssueCount: clients.reduce(
        (total, client) => total + client.issues.filter((issue) => issue.severity === "high").length,
        0
      ),
      mode: isDemo ? "demo" : "authenticated",
    });
  }, [clients, isDemo, loading]);

  async function handleDecision(client: CoachAttentionClient, action: DecisionAction) {
    const coachId = user?.id ?? "demo-coach";
    const input = {
      recommendationId: client.recommendation.id,
      coachId,
      action,
      finalContent:
        action === "approve"
          ? client.recommendation.summary
          : action === "edit"
            ? `${client.recommendation.summary}\n\nCoach edit required before sending.`
            : undefined,
      reason: action === "reject" ? "Coach rejected the generated recommendation." : undefined,
    };

    const canPersist = Boolean(user && !isDemo && UUID_PATTERN.test(client.recommendation.id));

    try {
      const decision = canPersist ? await persistDecision(input) : createLocalDecision(input);
      setDecisions((current) => [decision, ...current]);
      trackGrowthEvent("recommendation_decision", {
        action,
        mode: canPersist ? "persisted" : "demo",
        issueCount: client.issues.length,
        recommendationActionType: client.recommendation.actionType,
      });
      toast.success(canPersist ? "Decision 已寫入資料庫" : "Demo decision 已記錄於本機");
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知錯誤";
      toast.error("Decision 寫入失敗", { description: message });
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#10131f_0%,#15211d_48%,#221d15_100%)] px-4 py-6 pb-24 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-amber-300/15 text-amber-100">
                Coach attention
              </Badge>
              <Badge variant="outline" className="border-white/15 text-slate-200">
                Deterministic issues + AI gateway
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">先處理最該處理的人</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              這不是聊天列表，而是 attention queue：規則引擎先產生 evidence，AI gateway 只把 evidence 包成 coach 可審核的建議。
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            <div className="font-medium text-slate-100">Persistence status</div>
            <p className="mt-2 leading-6">
              目前 cards 是 deterministic demo。真實 recommendation 使用 UUID 且已落庫時，Approve/Edit/Reject 會寫入
              `decisions`；demo recommendation 沒有 FK，因此只建立本地 decision log。
            </p>
          </div>
        </section>

        {loading ? (
          <Card className="border-white/10 bg-slate-950/70 text-slate-50">
            <CardContent className="py-8 text-slate-300">載入 demo queue...</CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4">
              {clients.map((client) => (
                <Card key={client.userId} className="border-white/10 bg-slate-950/75 text-slate-50">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle>{client.displayName}</CardTitle>
                        <CardDescription className="mt-1 text-slate-400">{client.goal}</CardDescription>
                      </div>
                      <Badge
                        variant={client.issues.length > 0 ? "secondary" : "outline"}
                        className={client.issues.length > 0 ? "bg-red-400/15 text-red-100" : "border-white/15 text-slate-300"}
                      >
                        {client.issues.length > 0 ? `${client.issues.length} issues` : "stable"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2 sm:grid-cols-4">
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="text-xs text-slate-400">步數偏離</div>
                        <div className="mt-1 text-lg font-semibold">{metricValue(client, "steps_deviation_pct")}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="text-xs text-slate-400">睡眠偏離</div>
                        <div className="mt-1 text-lg font-semibold">{metricValue(client, "sleep_deviation_pct")}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="text-xs text-slate-400">體重 7d</div>
                        <div className="mt-1 text-lg font-semibold">{metricValue(client, "weight_trend_kg_7d")}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="text-xs text-slate-400">check-in</div>
                        <div className="mt-1 text-lg font-semibold">{metricValue(client, "checkin_adherence_7d")}</div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      {client.issues.length === 0 ? (
                        <div className="rounded-xl border border-white/10 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                          沒有觸發 issue。系統建議維持計畫，不製造噪音。
                        </div>
                      ) : (
                        client.issues.map((issue) => (
                          <div key={issue.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={severityClass(issue.severity)}>
                                {issue.severity}
                              </Badge>
                              <span className="font-medium">{issue.title}</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{issue.summary}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="rounded-2xl border border-teal-200/15 bg-teal-300/10 p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-teal-100/70">Recommendation</div>
                      <div className="mt-2 text-lg font-semibold text-teal-50">{client.recommendation.title}</div>
                      <p className="mt-2 text-sm leading-6 text-teal-50/80">{client.recommendation.summary}</p>
                      <p className="mt-2 text-xs leading-5 text-teal-50/60">{client.recommendation.rationale}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="bg-teal-300 text-slate-950 hover:bg-teal-200"
                          onClick={() => handleDecision(client, "approve")}
                        >
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDecision(client, "edit")}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDecision(client, "reject")}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <aside className="grid h-fit gap-4">
              <Card className="border-white/10 bg-slate-950/75 text-slate-50">
                <CardHeader>
                  <CardTitle>Decision log</CardTitle>
                  <CardDescription className="text-slate-400">每次 coach 動作都產生 decision event。</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {decisions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
                      尚無 decision。
                    </div>
                  ) : (
                    decisions.map((decision) => (
                      <div key={decision.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm">
                        <div className="font-medium">{decision.action}</div>
                        <div className="mt-1 break-all text-xs text-slate-400">{decision.recommendationId}</div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
