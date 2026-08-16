import Link from "next/link";
import { Activity, BarChart3, Cloud, GitBranch, ShieldCheck, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpsTelemetry } from "@/components/ops-telemetry";

const liveDemoUrl = "https://coach-os-msbcm3zj7q-de.a.run.app";
const githubUrl = "https://github.com/lebronisgoat23/coach-os";

const proofMetrics = [
  { label: "Structured health signals", value: "7", detail: "weight, sleep, steps, fatigue, hunger, training, nutrition adherence" },
  { label: "Daily check-in target", value: "<30 sec", detail: "低摩擦回報，目標是 activation 而非複雜表單" },
  { label: "Golden test cases", value: "20", detail: "用 regression cases 鎖住 detection engine 行為" },
  { label: "Core workflows", value: "5", detail: "signup, onboarding, check-in, recommendation, coach decision" },
  { label: "Ops endpoints", value: "2", detail: "/healthz and /api/events" },
  { label: "Cloud delivery", value: "CI/CD", detail: "GitHub trigger -> Cloud Build -> Cloud Run" },
];

const funnelEvents = [
  ["Signup", "signup_intent", "看有多少人願意留下 email 或進 demo"],
  ["Onboarding completed", "onboarding_completed", "衡量新手是否完成目標與補充品設定"],
  ["First check-in", "checkin_submitted", "核心 activation，代表使用者開始交資料"],
  ["First recommendation", "recommendation_viewed", "產品第一次產生決策價值"],
  ["Coach decision", "recommendation_decision", "未來計算 recommendation acceptance rate"],
  ["Return visit", "return_visit", "D1 / D7 retention 的基礎訊號"],
];

const cloudStack = [
  "Cloud Run: runs the standalone Next.js container",
  "Docker: reproducible image build for Next.js 16",
  "Artifact Registry: stores versioned container images",
  "Cloud Build: builds, pushes, and deploys from GitHub",
  "IAM: scoped service account permissions for build/deploy",
  "Cloud Logging: receives structured growth and ops events",
];

export default function OpsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_5%,rgba(45,212,191,0.24),transparent_30%),radial-gradient(circle_at_90%_0%,rgba(251,191,36,0.18),transparent_26%),linear-gradient(135deg,#071312_0%,#111827_48%,#18120a_100%)] px-4 py-6 pb-24 text-slate-50">
      <OpsTelemetry />
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-teal-300 text-slate-950">Portfolio proof</Badge>
            <Badge variant="outline" className="border-white/20 text-slate-200">
              Product + Growth + GCP
            </Badge>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                Vitrion Ops Cockpit
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                這頁是給 Sales / Solution 面試看的：它把一個健康決策產品原型，包成可 demo、可部署、可觀測、可分析 funnel 的雲端案例。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={liveDemoUrl}
                  className="rounded-full bg-teal-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-200"
                >
                  Open live demo
                </a>
                <a
                  href={githubUrl}
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-slate-100 hover:bg-white/10"
                >
                  View GitHub
                </a>
                <Link
                  href="/healthz"
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-slate-100 hover:bg-white/10"
                >
                  Check /healthz
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-teal-200/20 bg-black/25 p-5">
              <div className="flex items-center gap-2 text-teal-100">
                <ShieldCheck size={18} />
                <span className="text-sm font-semibold">Positioning</span>
              </div>
              <p className="mt-4 text-2xl font-semibold leading-snug">
                不靠「AI 直接給答案」，而是用 deterministic evidence 讓 coach 可以審核決策。
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                對雲端業務來說，這展示的是把產品、資料、AI、安全邊界和部署流程整合成客戶可理解的 solution。
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {proofMetrics.map((metric) => (
            <Card key={metric.label} className="border-white/10 bg-slate-950/70 text-slate-50">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-400">{metric.label}</CardDescription>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-slate-300">{metric.detail}</CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-white/10 bg-slate-950/75 text-slate-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Workflow size={18} className="text-teal-200" />
                <CardTitle>Outcome OS Architecture</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                產品不是 chatbot，而是可回測、可審核、可交付的決策管線。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {[
                "Daily check-in -> canonical observations",
                "Feature engine -> 7d trend + 28d baseline",
                "Detection engine -> deterministic issue ranking",
                "AI gateway -> coach-reviewable recommendation",
                "Coach decision log -> approve / edit / reject",
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-300 text-xs font-black text-slate-950">
                    {index + 1}
                  </div>
                  <div className="leading-6 text-slate-200">{item}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/75 text-slate-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cloud size={18} className="text-amber-200" />
                <CardTitle>GCP Delivery Stack</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                展示真正上線會遇到的 build、deploy、IAM、logging。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {cloudStack.map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/10 bg-slate-950/75 text-slate-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-teal-200" />
                <CardTitle>Growth / MarTech Funnel</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                事件先進 Cloud Logging，之後用 sink 匯入 BigQuery，再接 Looker Studio。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {funnelEvents.map(([label, eventName, reason]) => (
                <div key={eventName} className="grid gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{label}</span>
                    <code className="rounded bg-black/30 px-2 py-1 text-xs text-teal-100">{eventName}</code>
                  </div>
                  <p className="text-xs leading-5 text-slate-400">{reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/75 text-slate-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-amber-200" />
                <CardTitle>What Makes It Stand Out</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                如果要讓產品更令人耳目一新，重點是把它做成「coach operating system」，不是一般健康 app。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-6 text-slate-300">
              <p>
                <span className="font-semibold text-slate-100">1. Evidence-first AI：</span>
                AI 只能根據 observations、metrics、issues 產生建議，不能憑空醫療判斷。
              </p>
              <p>
                <span className="font-semibold text-slate-100">2. Human approval loop：</span>
                recommendation 必須經 coach approve/edit/reject，未來可量化 acceptance rate。
              </p>
              <p>
                <span className="font-semibold text-slate-100">3. Growth instrumentation：</span>
                每個核心轉換點都有 event，能和 iKala / MarTech 場景連起來談 funnel。
              </p>
              <p>
                <span className="font-semibold text-slate-100">4. Cloud-native proof：</span>
                不是截圖 demo，而是 live URL、GitHub、CI/CD、health check、structured logs。
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="flex items-center gap-2">
            <GitBranch size={18} className="text-teal-200" />
            <h2 className="text-lg font-semibold">Interview Story</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            我把 Vitrion 從產品假設做到可上線 demo：Next.js app、Docker image、Cloud Build、Artifact Registry、Cloud Run、IAM、GitHub trigger、
            /healthz、structured growth events。這讓我能跟客戶談 AI app 的商業價值，也能跟 solution architect 溝通部署與維運細節。
          </p>
        </section>
      </div>
    </main>
  );
}

