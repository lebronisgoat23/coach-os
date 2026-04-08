"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StatTrendChart } from "@/components/vitrion/stat-trend-chart";
import { StreakCounter } from "@/components/vitrion/streak-counter";
import { ActionTodoList } from "@/components/vitrion/action-todo-list";
import { useDailyCheckIn } from "@/hooks/use-daily-checkin";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sun, Moon, Lock } from "lucide-react";
import { useTheme } from "next-themes";

export default function Dashboard() {
  const router = useRouter();
  const { profile, checkins, hasCheckedInToday } = useDailyCheckIn();
  const [streak] = useState({ current: checkins.length || 0, longest: checkins.length || 0 });

  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.replace("/login");
    } else if (profile !== null && !profile.hasCompletedOnboarding) {
      router.replace("/onboarding");
    }
  }, [user, profile, loading, router]);

  const currentDays = checkins.length;
  const TOTAL_DAYS = 14;
  const isCompleted = currentDays >= TOTAL_DAYS;

  return (
    <div className="relative min-h-[100dvh] bg-background overflow-x-hidden">

      {/* Header */}
      <header className="relative z-20 border-b border-border/30 bg-background/95 backdrop-blur-3xl sticky top-0">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border-2 border-foreground flex items-center justify-center font-mono font-bold text-sm">
                V
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Vitrion</h1>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                  健康分析輔助系統
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <StreakCounter currentStreak={streak.current} longestStreak={streak.longest} />
              <ThemeToggleClean />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-2xl px-4 py-8 space-y-12 pb-24">
        
        {/* The One Button Check-in */}
        <section className="flex flex-col items-center justify-center min-h-[25vh]">
           {!hasCheckedInToday ? (
             <Link href="/checkin" className="w-full">
               <motion.div
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 className="relative w-full aspect-[2.5/1] max-w-md mx-auto bg-foreground text-background flex flex-col items-center justify-center border-4 border-foreground overflow-hidden cursor-pointer shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
               >
                 <motion.div 
                   animate={{ opacity: [0.5, 1, 0.5] }} 
                   transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                   className="absolute inset-0 bg-background/10 mix-blend-overlay"
                 />
                 <h2 className="text-2xl font-bold tracking-wider relative z-10">記錄今日身心狀態</h2>
                 <p className="text-xs font-mono opacity-70 mt-2 relative z-10">DAILY CHECK-IN</p>
               </motion.div>
             </Link>
           ) : (
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full aspect-[2.5/1] max-w-md mx-auto border border-border bg-foreground/[0.02] flex flex-col items-center justify-center text-center px-4"
             >
                <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center mb-3">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 className="text-lg font-bold">今日記錄已完成</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  進度 {currentDays}/{TOTAL_DAYS}，數據持續收集中
                </p>
             </motion.div>
           )}
        </section>

        {/* The Blurred Locked Section containing previously requested features */}
        <section className="relative mt-8">
           {/* If not completed, show the blur overlay lock */}
           {!isCompleted && (
             <div className="absolute inset-0 z-20 backdrop-blur-md bg-background/40 flex flex-col items-center justify-center border border-border/50">
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-background border-2 border-foreground p-6 max-w-xs text-center shadow-2xl space-y-4"
                >
                   <Lock className="w-8 h-8 mx-auto" />
                   <h3 className="font-bold text-lg">系統鎖定中</h3>
                   <p className="text-xs text-muted-foreground leading-relaxed">
                     系統需要至少 {TOTAL_DAYS} 天的基準資料。<br/>
                     您目前已完成 {currentDays} 天。<br/><br/>
                     請完成 14 天的基礎紀錄<br/>來解鎖分析報告與進階控制台。
                   </p>
                   {/* Progress bar inside the lock */}
                   <div className="w-full h-1.5 bg-border/40 overflow-hidden mt-4">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${(currentDays / TOTAL_DAYS) * 100}%` }}
                       className="h-full bg-foreground"
                     />
                   </div>
                </motion.div>
             </div>
           )}

           {/* The content that gets blurred & locked */}
           <div className={`space-y-12 transition-all ${!isCompleted ? "opacity-30 pointer-events-none select-none filter blur-sm" : ""}`}>
              
              {/* Alpha Predict Report Headline */}
              <div className="border-b-2 border-border pb-4">
                 <h2 className="text-2xl font-bold">專屬預測報告</h2>
                 <p className="text-xs text-muted-foreground font-mono mt-1">GENERATED BY VITRION</p>
              </div>

              {/* Action items that were previously built */}
              <div className="space-y-4">
                 <h3 className="text-sm font-bold text-muted-foreground">進階控制面板</h3>
                 <ActionTodoList />
              </div>

              {/* Trend Chart */}
              <div className="space-y-4">
                 <h3 className="text-sm font-bold text-muted-foreground">身心狀態趨勢</h3>
                 <StatTrendChart />
              </div>
           </div>
        </section>

      </main>
    </div>
  );
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
