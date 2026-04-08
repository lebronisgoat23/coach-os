"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StatTrendChart } from "@/components/vitrion/stat-trend-chart";
import { StreakCounter } from "@/components/vitrion/streak-counter";
import { useDailyCheckIn } from "@/hooks/use-daily-checkin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sun, Moon, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";

export default function Dashboard() {
  const router = useRouter();
  const { profile, checkins } = useDailyCheckIn();
  const [streak] = useState({ current: 12, longest: 28 });

  useEffect(() => {
    if (profile !== null && !profile.hasCompletedOnboarding) {
      router.push("/onboarding");
    }
  }, [profile, router]);

  const currentDays = checkins.length;
  const TOTAL_DAYS = 14;
  const isCompleted = currentDays >= TOTAL_DAYS;
  const daysLeft = Math.max(0, TOTAL_DAYS - currentDays);

  return (
    <div className="relative min-h-screen bg-background">

      {/* Header */}
      <header className="relative z-10 border-b border-border/30 bg-background/95 backdrop-blur-3xl sticky top-0">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border-2 border-foreground flex items-center justify-center font-mono font-bold text-sm">
                V
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Vitrion</h1>
                <p className="text-[10px] text-muted-foreground">你的營養追蹤助手</p>
              </div>
            </div>
            <ThemeToggleClean />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-2xl px-4 py-6 space-y-5 pb-24">
        
        {/* ─── Section 1: 今天的任務 ─── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-muted-foreground">今天</h2>
            <StreakCounter currentStreak={streak.current} longestStreak={streak.longest} />
          </div>
          <CheckInCTA />
        </section>

        {/* ─── Section 2: 挑戰進度 ─── */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground">進行中的挑戰</h2>
          <ChallengeBanner 
            challengeName={profile?.challengeName} 
            currentDays={currentDays}
            totalDays={TOTAL_DAYS}
            isCompleted={isCompleted}
            daysLeft={daysLeft}
          />
        </section>

        {/* ─── Section 3: 趨勢 ─── */}
        {currentDays >= 3 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-muted-foreground">你的變化</h2>
            <StatTrendChart />
          </section>
        )}

        {/* If less than 3 days of data, show encouragement instead of chart */}
        {currentDays < 3 && (
          <section className="p-6 border border-dashed border-border text-center space-y-2">
            <p className="text-sm font-medium">還差 {3 - currentDays} 天就能看到趨勢圖</p>
            <p className="text-xs text-muted-foreground">持續記錄，才能發現你的身體有什麼變化</p>
          </section>
        )}

        {/* ─── Section 4: 你的營養品 ─── */}
        {profile?.currentSupplements && profile.currentSupplements.length > 0 && profile.currentSupplements[0] !== "none" && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-muted-foreground">你的營養品</h2>
              <Link href="/stack" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
                管理 <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.currentSupplements.map((supp: string) => (
                <div key={supp} className="px-3 py-1.5 border border-border text-xs font-medium">
                  {getSupplementLabel(supp)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center pt-4"
        >
          <p className="text-[10px] text-muted-foreground/40 max-w-xs mx-auto">
            Vitrion 的分析是基於你的自我紀錄，不構成醫療建議。
          </p>
        </motion.footer>
      </main>
    </div>
  );
}

// ---- Helpers ----

function getSupplementLabel(id: string): string {
  const map: Record<string, string> = {
    omega3: "魚油",
    bcomplex: "B群",
    d3: "維生素 D3",
    magnesium: "鎂",
    maca: "瑪卡",
    probiotic: "益生菌",
    melatonin: "褪黑激素",
    collagen: "膠原蛋白",
    vitc: "維生素 C",
    zinc: "鋅",
  };
  return map[id] || id;
}

// ---- Sub-components ----

function ThemeToggleClean() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8 bg-border/30 animate-pulse" />;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      aria-label={isDark ? "切換到亮色模式" : "切換到暗色模式"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function CheckInCTA() {
  const { hasCheckedInToday, todayCheckin } = useDailyCheckIn();

  return (
    <Link href="/checkin">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        className={`p-5 border transition-all cursor-pointer flex items-center justify-between ${
          hasCheckedInToday
            ? "border-border bg-foreground/[0.03]"
            : "border-foreground bg-foreground text-background"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-lg">
            {hasCheckedInToday ? "✓" : "→"}
          </div>
          <div>
            <p className="text-sm font-bold">
              {hasCheckedInToday ? "今天已經記錄了" : "記錄今天的感受"}
            </p>
            <p className={`text-xs mt-0.5 ${hasCheckedInToday ? "text-muted-foreground" : "opacity-70"}`}>
              {hasCheckedInToday
                ? `睡眠 ${todayCheckin?.sleepQuality} · 精力 ${todayCheckin?.energyLevel} · 專注 ${todayCheckin?.focusLevel}`
                : "30 秒，6 個問題"}
            </p>
          </div>
        </div>
        {!hasCheckedInToday && (
          <motion.div 
            animate={{ x: [0, 4, 0] }} 
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-lg"
          >
            →
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
}

function ChallengeBanner({ 
  challengeName, 
  currentDays, 
  totalDays, 
  isCompleted, 
  daysLeft 
}: { 
  challengeName?: string;
  currentDays: number;
  totalDays: number;
  isCompleted: boolean;
  daysLeft: number;
}) {
  const progressPercent = Math.min((currentDays / totalDays) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-5 border border-border relative overflow-hidden"
    >
      {!isCompleted && (
        <div 
          className="absolute top-0 left-0 bottom-0 bg-foreground/[0.04] pointer-events-none transition-all duration-1000" 
          style={{ width: `${progressPercent}%` }} 
        />
      )}

      <div className="relative z-10 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold">
              {challengeName || "14 天基礎追蹤"}
            </h3>
            {isCompleted ? (
              <p className="text-xs text-muted-foreground">
                恭喜！挑戰完成了，可以看看分析結果
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                已經記錄 {currentDays} 天，還剩 {daysLeft} 天
              </p>
            )}
          </div>
          
          <div className={`px-2.5 py-1 text-xs font-bold border flex-shrink-0 ${
            isCompleted 
              ? "bg-foreground text-background border-foreground" 
              : "border-border text-muted-foreground"
          }`}>
            {isCompleted ? "完成" : `${currentDays}/${totalDays}`}
          </div>
        </div>

        {/* Progress bar */}
        {!isCompleted && (
          <div className="w-full h-1.5 bg-border/40 overflow-hidden rounded-full">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-foreground rounded-full"
            />
          </div>
        )}

        {/* What happens after completion */}
        {!isCompleted && (
          <p className="text-[10px] text-muted-foreground/60">
            完成後 Vitrion 會告訴你，你吃的營養品對身體有沒有明顯幫助
          </p>
        )}

        {isCompleted && (
          <Link href="/insights">
            <button className="w-full py-3 bg-foreground text-background text-sm font-bold tracking-wide transition-all mt-1">
              查看分析報告 →
            </button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
