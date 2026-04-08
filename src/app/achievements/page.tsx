"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAchievements } from "@/hooks/use-achievements";
import {
  RARITY_CONFIG,
  type AchievementCategory,
  type Achievement,
} from "@/lib/achievements";

const CATEGORIES: { key: AchievementCategory | "all"; label: string; emoji: string }[] = [
  { key: "all", label: "全部", emoji: "🏆" },
  { key: "streak", label: "連續", emoji: "🔥" },
  { key: "milestone", label: "里程碑", emoji: "⭐" },
  { key: "explorer", label: "探索", emoji: "🧭" },
  { key: "mastery", label: "精通", emoji: "👑" },
];

export default function AchievementsPage() {
  const { achievements, unlockedCount, totalCount, completionPct } = useAchievements();
  const [filter, setFilter] = useState<AchievementCategory | "all">("all");

  const filtered = filter === "all"
    ? achievements
    : achievements.filter((a) => a.category === filter);

  // Sort: unlocked first (most recent), then locked
  const sorted = [...filtered].sort((a, b) => {
    if (a.unlockedAt && !b.unlockedAt) return -1;
    if (!a.unlockedAt && b.unlockedAt) return 1;
    if (a.unlockedAt && b.unlockedAt) {
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    }
    return 0;
  });

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/[0.03] blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/[0.03] blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-8 space-y-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="text-5xl"
          >
            🏆
          </motion.div>
          <h1 className="text-xl font-bold">成就殿堂</h1>
          <p className="text-xs text-muted-foreground">
            收集榮耀，見證你的成長之路
          </p>
        </motion.div>

        {/* Progress Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-border/40 bg-card/80 backdrop-blur-xl overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                {/* SVG Ring */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-secondary"
                    />
                    <motion.circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="url(#achieveGrad)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${completionPct * 2.64} 264`}
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{ strokeDasharray: `${completionPct * 2.64} 264` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="achieveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{completionPct}%</span>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {unlockedCount} / {totalCount} 成就已解鎖
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {unlockedCount === 0
                      ? "開始你的冒險吧！"
                      : unlockedCount < totalCount / 2
                      ? "繼續努力，更多成就等著你！"
                      : unlockedCount < totalCount
                      ? "你已經是資深冒險者了！"
                      : "🎉 所有成就達成！你是傳說！"}
                  </p>

                  {/* Rarity breakdown */}
                  <div className="flex gap-3 mt-2">
                    {(["common", "rare", "epic", "legendary"] as const).map((r) => {
                      const count = achievements.filter(
                        (a) => a.rarity === r && a.unlockedAt
                      ).length;
                      const total = achievements.filter((a) => a.rarity === r).length;
                      const cfg = RARITY_CONFIG[r];
                      return (
                        <div key={r} className="text-center">
                          <p className={`text-xs font-bold ${cfg.textColor}`}>
                            {count}/{total}
                          </p>
                          <p className="text-[9px] text-muted-foreground">{cfg.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {CATEGORIES.map((c) => (
            <motion.button
              key={c.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(c.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === c.key
                  ? "bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {sorted.map((a, i) => (
              <AchievementCard key={a.id} achievement={a} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function AchievementCard({ achievement: a, index }: { achievement: Achievement; index: number }) {
  const isLocked = !a.unlockedAt;
  const rarity = RARITY_CONFIG[a.rarity];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <Card
        className={`border-border/40 bg-card/80 backdrop-blur-xl overflow-hidden transition-all ${
          isLocked
            ? "opacity-50 grayscale"
            : `${rarity.border} ${rarity.glow ? `shadow-lg ${rarity.glow}` : ""}`
        }`}
      >
        <CardHeader className="pb-1 pt-4 px-4">
          <div className="flex items-start justify-between">
            <motion.span
              className="text-3xl"
              animate={isLocked ? {} : { scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            >
              {isLocked ? "🔒" : a.emoji}
            </motion.span>
            <Badge
              className={`text-[9px] px-1.5 py-0 h-4 ${
                isLocked
                  ? "bg-secondary text-muted-foreground"
                  : `bg-gradient-to-r ${rarity.gradient} text-white border-0`
              }`}
            >
              {rarity.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-sm font-bold leading-tight">{isLocked ? "???" : a.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
            {a.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] text-amber-400 font-medium">
              +{a.xpReward} XP
            </span>
            {a.unlockedAt && (
              <span className="text-[8px] text-muted-foreground/50">
                {new Date(a.unlockedAt).toLocaleDateString("zh-TW")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
