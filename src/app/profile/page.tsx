"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShareCard } from "@/components/share-card";
import { useAchievements } from "@/hooks/use-achievements";
import { MOCK_USER_STATUS } from "@/lib/mock-data";
import { RARITY_CONFIG } from "@/lib/achievements";
import Link from "next/link";

export default function ProfilePage() {
  const { achievements, unlockedCount, totalCount, completionPct } = useAchievements();
  const status = MOCK_USER_STATUS;

  // Recent unlocked (last 5)
  const recentUnlocked = achievements
    .filter((a) => a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 5);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/[0.03] blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/[0.03] blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-8 space-y-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <h1 className="text-xl font-bold">冒險者檔案</h1>
          <p className="text-xs text-muted-foreground">你的成長之路一覽</p>
        </motion.div>

        {/* Share Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ShareCard
            userName="冒險者"
            level={status.level}
            title="健康探索者"
            str={status.currentStr}
            vit={status.currentVit}
            agi={status.currentAgi}
            streak={12}
            achievementCount={unlockedCount}
          />
        </motion.div>

        {/* Achievement Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  成就摘要
                </h3>
                <Link
                  href="/achievements"
                  className="text-[10px] text-purple-400 hover:underline"
                >
                  查看全部 →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress bar */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    完成進度
                  </span>
                  <span className="text-xs font-bold">
                    {unlockedCount}/{totalCount} ({completionPct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-purple-500"
                  />
                </div>
              </div>

              {/* Recent unlocked */}
              {recentUnlocked.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-medium">
                    最近解鎖
                  </p>
                  {recentUnlocked.map((a) => {
                    const rarity = RARITY_CONFIG[a.rarity];
                    return (
                      <div
                        key={a.id}
                        className="flex items-center gap-2.5 py-1.5"
                      >
                        <span className="text-lg">{a.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{a.name}</p>
                          <p className="text-[9px] text-muted-foreground">{a.description}</p>
                        </div>
                        <Badge
                          className={`text-[8px] px-1 py-0 h-3.5 bg-gradient-to-r ${rarity.gradient} text-white border-0`}
                        >
                          {rarity.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/60 text-center py-4">
                  還沒有解鎖任何成就，開始打卡吧！🎯
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="border-border/40 bg-card/80 backdrop-blur-xl text-center py-4">
            <p className="text-2xl font-bold text-amber-400">{status.level}</p>
            <p className="text-[9px] text-muted-foreground">等級</p>
          </Card>
          <Card className="border-border/40 bg-card/80 backdrop-blur-xl text-center py-4">
            <p className="text-2xl font-bold text-orange-400">12</p>
            <p className="text-[9px] text-muted-foreground">連續天數</p>
          </Card>
          <Card className="border-border/40 bg-card/80 backdrop-blur-xl text-center py-4">
            <p className="text-2xl font-bold text-purple-400">{unlockedCount}</p>
            <p className="text-[9px] text-muted-foreground">成就</p>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
