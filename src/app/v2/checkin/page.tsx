"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildObservationsFromCheckIn, persistV2CheckIn } from "@/lib/v2/check-in-service";
import type { V2CheckInInput } from "@/lib/v2/types";

type SaveState =
  | { status: "idle"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

interface FormState {
  weightKg: string;
  sleepDurationHours: string;
  steps: string;
  fatigue: string;
  hunger: string;
  trainingCompleted: boolean;
  nutritionAdherence: string;
  note: string;
}

const INITIAL_FORM: FormState = {
  weightKg: "",
  sleepDurationHours: "",
  steps: "",
  fatigue: "5",
  hunger: "5",
  trainingCompleted: false,
  nutritionAdherence: "7",
  note: "",
};

function numberOrUndefined(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toCheckInInput(userId: string, form: FormState): V2CheckInInput {
  return {
    userId,
    measuredAt: new Date().toISOString(),
    weightKg: numberOrUndefined(form.weightKg),
    sleepDurationHours: numberOrUndefined(form.sleepDurationHours),
    steps: numberOrUndefined(form.steps),
    fatigue: numberOrUndefined(form.fatigue),
    hunger: numberOrUndefined(form.hunger),
    trainingCompleted: form.trainingCompleted,
    nutritionAdherence: numberOrUndefined(form.nutritionAdherence),
    note: form.note.trim() || undefined,
  };
}

export default function V2CheckInPage() {
  const { user, loading, isDemo } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({
    status: "idle",
    message: "尚未送出。送出後會轉成 canonical observations。",
  });

  const effectiveUserId = user?.id ?? (isDemo ? "demo-user" : null);
  const preview = effectiveUserId ? buildObservationsFromCheckIn(toCheckInInput(effectiveUserId, form)) : [];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!effectiveUserId) {
      setSaveState({ status: "error", message: "請先登入，才能建立 V2 check-in。" });
      return;
    }

    const input = toCheckInInput(effectiveUserId, form);
    const observations = buildObservationsFromCheckIn(input);
    if (observations.length === 0) {
      setSaveState({ status: "error", message: "至少需要一個有效欄位。" });
      return;
    }

    setSaving(true);
    try {
      if (isDemo || !user) {
        setSaveState({
          status: "success",
          message: `Demo mode：已建立 ${observations.length} 筆 observation 預覽，未寫入資料庫。`,
        });
        toast.success("V2 check-in 已建立本地預覽");
        return;
      }

      const result = await persistV2CheckIn(input);
      setSaveState({
        status: "success",
        message: `已寫入 check_ins:${result.checkInId}，observations:${result.observationCount}。`,
      });
      toast.success("V2 check-in 已寫入 canonical tables");
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知錯誤";
      setSaveState({ status: "error", message });
      toast.error("V2 check-in 儲存失敗", { description: message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.18),transparent_32%),linear-gradient(180deg,#071312_0%,#0b0f14_48%,#0f1115_100%)] px-4 py-6 pb-24 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-teal-300/15 text-teal-100">
              V2 alpha
            </Badge>
            <Badge variant="outline" className="border-white/15 text-slate-200">
              Canonical observations
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">30 秒身體回報</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            這版不是聊天表單。每個欄位都會轉成可回測、可審計、可被 coach review 的 observation，後續規則與 AI 只讀這些資料。
          </p>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/10 bg-slate-950/70 text-slate-50">
            <CardHeader>
              <CardTitle>今日 check-in</CardTitle>
              <CardDescription className="text-slate-400">
                先收最少欄位：體重、睡眠、步數、疲勞、飢餓、訓練、飲食執行率。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="weightKg">體重 kg</Label>
                    <Input
                      id="weightKg"
                      inputMode="decimal"
                      value={form.weightKg}
                      onChange={(event) => setForm({ ...form, weightKg: event.target.value })}
                      placeholder="例如 82.4"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sleepDurationHours">睡眠小時</Label>
                    <Input
                      id="sleepDurationHours"
                      inputMode="decimal"
                      value={form.sleepDurationHours}
                      onChange={(event) => setForm({ ...form, sleepDurationHours: event.target.value })}
                      placeholder="例如 6.5"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="steps">步數</Label>
                    <Input
                      id="steps"
                      inputMode="numeric"
                      value={form.steps}
                      onChange={(event) => setForm({ ...form, steps: event.target.value })}
                      placeholder="例如 7800"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="fatigue">疲勞 1-10</Label>
                    <Input
                      id="fatigue"
                      type="number"
                      min={1}
                      max={10}
                      value={form.fatigue}
                      onChange={(event) => setForm({ ...form, fatigue: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hunger">飢餓 1-10</Label>
                    <Input
                      id="hunger"
                      type="number"
                      min={1}
                      max={10}
                      value={form.hunger}
                      onChange={(event) => setForm({ ...form, hunger: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nutritionAdherence">飲食執行 1-10</Label>
                    <Input
                      id="nutritionAdherence"
                      type="number"
                      min={1}
                      max={10}
                      value={form.nutritionAdherence}
                      onChange={(event) => setForm({ ...form, nutritionAdherence: event.target.value })}
                    />
                  </div>
                </div>

                <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm">
                  <span>
                    <span className="block font-medium">今天完成訓練</span>
                    <span className="text-slate-400">用於判斷 adherence，不直接當成好壞評分。</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.trainingCompleted}
                    onChange={(event) => setForm({ ...form, trainingCompleted: event.target.checked })}
                    className="h-5 w-5 accent-teal-300"
                  />
                </label>

                <div className="grid gap-2">
                  <Label htmlFor="note">補充狀況</Label>
                  <Textarea
                    id="note"
                    value={form.note}
                    onChange={(event) => setForm({ ...form, note: event.target.value })}
                    placeholder="例如：昨晚聚餐、今天胃口很差、換了注射日..."
                  />
                </div>

                <Button disabled={saving || loading} className="h-10 bg-teal-300 text-slate-950 hover:bg-teal-200">
                  {saving ? "儲存中..." : "送出 V2 check-in"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <aside className="grid gap-5">
            <Card className="border-white/10 bg-slate-950/70 text-slate-50">
              <CardHeader>
                <CardTitle>Observation preview</CardTitle>
                <CardDescription className="text-slate-400">
                  送出前先看資料會如何被標準化。這是之後回測與 AI 審計的最小單位。
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                  <div className="text-slate-400">狀態</div>
                  <div
                    className={
                      saveState.status === "error"
                        ? "mt-1 text-red-200"
                        : saveState.status === "success"
                          ? "mt-1 text-teal-100"
                          : "mt-1 text-slate-200"
                    }
                  >
                    {saveState.message}
                  </div>
                </div>

                <div className="grid gap-2">
                  {preview.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
                      輸入欄位後會出現 observation。
                    </div>
                  ) : (
                    preview.map((observation) => (
                      <div
                        key={`${observation.type}-${observation.unit}`}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{observation.type}</span>
                        <span className="text-slate-300">
                          {String(observation.value)} {observation.unit}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
