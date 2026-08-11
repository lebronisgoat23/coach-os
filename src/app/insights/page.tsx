"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatTrendChart } from "@/components/vitrion/stat-trend-chart";
import { useAlphaEngine } from "@/hooks/use-alpha-engine";
import {
  useSupplementReminders,
  TIME_PRESETS,
  type ReminderTime,
} from "@/hooks/use-supplement-reminders";
import { TrendingUp, Bell, Clock, ClipboardCheck, Users } from "lucide-react";

export default function InsightsPage() {
  const { topInsights } = useAlphaEngine();
  const {
    remindersByTime,
    enabledCount,
    nextReminder,
    toggleReminder,
    updateReminderTime,
    testReminder,
  } = useSupplementReminders();

  return (
    <div className="relative min-h-screen bg-background">

      <header className="relative z-10 border-b border-border/30 bg-background/95 backdrop-blur-xl sticky top-0">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <h1 className="text-lg font-bold">分析</h1>
          <p className="text-xs text-muted-foreground">身體趨勢、營養品關聯與 V2 決策層</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-6 space-y-6 pb-28">
        <Card className="border-foreground bg-foreground text-background">
          <CardContent className="grid gap-4 py-5">
            <div>
              <Badge variant="outline" className="border-background/30 text-background">
                V2 Decision Layer
              </Badge>
              <h2 className="mt-3 text-xl font-black">先判斷問題，再決定動作</h2>
              <p className="mt-2 text-sm leading-6 text-background/75">
                新版分析不只看營養品 buff，而是把 observations 轉成步數偏離、睡眠偏離、體重趨勢、執行率與 coach attention queue。
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link href="/v2/checkin" className="flex items-center justify-center gap-2 bg-background px-4 py-3 text-sm font-bold text-foreground">
                <ClipboardCheck size={16} /> 今日回報
              </Link>
              <Link href="/v2/coach-attention" className="flex items-center justify-center gap-2 border border-background/40 px-4 py-3 text-sm font-bold">
                <Users size={16} /> 教練工作台
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Trend chart */}
        <StatTrendChart />

        {/* Correlation Insights */}
        <Card className="border-border/40 bg-card/80 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-muted-foreground" />
              <div>
                <h2 className="text-base font-bold">發現</h2>
                <p className="text-xs text-muted-foreground">
                  你的紀錄和營養品之間的關聯
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topInsights.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                資料還不夠多，持續記錄後就會自動分析。
              </p>
            ) : (
              topInsights.map((insight, i) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className={`p-3 rounded-lg ${insight.bgColor} border ${insight.borderColor}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-sm font-bold ${insight.color}`}>
                          {insight.title}
                        </h3>
                        {insight.buffValue && (
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${insight.color} border-current/20`}>
                            {insight.buffValue}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground border-border/30">
                          {insight.confidence}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        <Separator className="opacity-20" />

        {/* Supplement Reminders */}
        <Card className="border-border/40 bg-card/80 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-muted-foreground" />
                <div>
                  <h2 className="text-base font-bold">營養品提醒</h2>
                  <p className="text-xs text-muted-foreground">
                    {enabledCount} 個提醒已開啟
                    {nextReminder && (
                      <span className="ml-1">
                        · 下一個 {String(nextReminder.hour).padStart(2, "0")}:
                        {String(nextReminder.minute).padStart(2, "0")}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["morning", "afternoon", "evening", "bedtime"] as ReminderTime[]).map(
              (timeSlot) => {
                const items = remindersByTime[timeSlot];
                if (!items || items.length === 0) return null;
                const preset = TIME_PRESETS[timeSlot];

                return (
                  <div key={timeSlot}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={14} className="text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground">
                        {preset.label}
                        <span className="ml-1 font-normal">
                          ({String(preset.hour).padStart(2, "0")}:
                          {String(preset.minute).padStart(2, "0")})
                        </span>
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {items.map((rem) => (
                        <div
                          key={rem.id}
                          className={`flex items-center justify-between p-2.5 transition-all ${
                            rem.enabled ? "bg-foreground/[0.03]" : "opacity-40"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div>
                              <p className="text-xs font-medium">{rem.supplementName}</p>
                              <div className="flex gap-1 mt-0.5">
                                {(["morning", "afternoon", "evening", "bedtime"] as ReminderTime[]).map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => updateReminderTime(rem.id, t)}
                                    className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${
                                      rem.time === t
                                        ? "bg-foreground/10 text-foreground"
                                        : "text-muted-foreground/40 hover:text-muted-foreground"
                                    }`}
                                  >
                                    {TIME_PRESETS[t].label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => testReminder(rem.id)}
                              className="text-[9px] px-2 py-1 bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              測試
                            </button>
                            <button
                              onClick={() => toggleReminder(rem.id)}
                              className={`relative w-9 h-5 rounded-full transition-colors ${
                                rem.enabled ? "bg-foreground" : "bg-border"
                              }`}
                            >
                              <motion.div
                                animate={{ x: rem.enabled ? 16 : 2 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute top-0.5 w-4 h-4 rounded-full bg-background shadow-sm"
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground/40 text-center max-w-sm mx-auto">
          以上結果是根據你的自我紀錄做的關聯分析，不構成醫療建議。
        </p>
      </main>
    </div>
  );
}
