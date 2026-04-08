"use client";

import { motion } from "framer-motion";
import { useDailyCheckIn } from "@/hooks/use-daily-checkin";

export function StreakCounter({
  currentStreak,
  longestStreak,
}: {
  currentStreak: number;
  longestStreak: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-4 py-3"
    >
      <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center">
        <span className="text-lg font-bold font-mono">{currentStreak}</span>
      </div>
      <div>
        <p className="text-sm font-bold">連續 {currentStreak} 天</p>
        <p className="text-xs text-muted-foreground">
          最高紀錄 {longestStreak} 天
        </p>
      </div>
    </motion.div>
  );
}
