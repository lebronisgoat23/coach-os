"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { STAT_CONFIGS, type DailyQuest, type BuffType } from "@/lib/types";

// ============================================================
// XP Popup — Floating "+15 XP" animation on quest complete
// ============================================================
function XpPopup({ xp, buffType, buffValue }: { xp: number; buffType: BuffType | null; buffValue: number }) {
  const config = buffType ? STAT_CONFIGS[buffType] : null;

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -40, scale: 1.2 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="absolute -top-2 right-4 pointer-events-none z-10 flex flex-col items-end gap-0.5"
    >
      <span className="text-sm font-black text-amber-400 drop-shadow-lg">
        +{xp} XP
      </span>
      {config && buffValue > 0 && (
        <span className={`text-[11px] font-bold ${config.colorText} drop-shadow-lg`}>
          {config.icon} {config.labelEn} +{buffValue}%
        </span>
      )}
    </motion.div>
  );
}

// ============================================================
// Quest Item — Single supplement quest row
// ============================================================
function QuestItem({
  quest,
  onComplete,
  index,
}: {
  quest: DailyQuest;
  onComplete: (id: string) => void;
  index: number;
}) {
  const [showXp, setShowXp] = useState(false);
  const config = quest.buffType ? STAT_CONFIGS[quest.buffType] : null;

  const handleClick = useCallback(() => {
    if (quest.isCompleted) return;
    setShowXp(true);
    onComplete(quest.id);
    setTimeout(() => setShowXp(false), 1300);
  }, [quest.id, quest.isCompleted, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="relative"
    >
      {/* XP Popup */}
      <AnimatePresence>
        {showXp && (
          <XpPopup xp={quest.xpReward} buffType={quest.buffType} buffValue={quest.buffValue} />
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        disabled={quest.isCompleted}
        whileTap={quest.isCompleted ? {} : { scale: 0.97 }}
        className={`
          w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300
          ${quest.isCompleted
            ? "bg-secondary/30 opacity-60"
            : "bg-secondary/50 hover:bg-secondary/80 hover:shadow-md cursor-pointer active:bg-secondary"
          }
        `}
      >
        {/* Checkbox circle */}
        <motion.div
          animate={quest.isCompleted ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`
            flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors
            ${quest.isCompleted
              ? "bg-gradient-to-br from-emerald-400 to-green-500 border-emerald-400"
              : "border-muted-foreground/30 hover:border-muted-foreground/60"
            }
          `}
        >
          <AnimatePresence>
            {quest.isCompleted && (
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-3.5 h-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Emoji */}
        <span className="text-xl flex-shrink-0">{quest.itemEmoji}</span>

        {/* Name & dose */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${quest.isCompleted ? "line-through text-muted-foreground" : ""}`}>
            {quest.itemName}
          </p>
          <p className="text-[11px] text-muted-foreground">{quest.dose}</p>
        </div>

        {/* Reward badges */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 tabular-nums text-amber-500 border-amber-500/30">
            +{quest.xpReward} XP
          </Badge>
          {config && quest.buffValue > 0 && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-5 tabular-nums ${config.colorText} border-current/20`}
            >
              {config.labelEn} +{quest.buffValue}%
            </Badge>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
}

// ============================================================
// Daily Quests Panel — Full quest list with progress
// ============================================================
export function DailyQuests({
  initialQuests,
  onQuestComplete,
}: {
  initialQuests: DailyQuest[];
  onQuestComplete?: (questId: string, xpGained: number) => void;
}) {
  const [quests, setQuests] = useState<DailyQuest[]>(initialQuests);

  const completed = quests.filter((q) => q.isCompleted).length;
  const total = quests.length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;
  const totalXpEarned = quests
    .filter((q) => q.isCompleted)
    .reduce((sum, q) => sum + q.xpReward, 0);
  const allDone = completed === total && total > 0;

  const handleComplete = useCallback(
    (id: string) => {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === id
            ? { ...q, isCompleted: true, completedAt: new Date().toISOString() }
            : q
        )
      );
      const quest = quests.find((q) => q.id === id);
      if (quest) {
        onQuestComplete?.(id, quest.xpReward);
      }
    },
    [quests, onQuestComplete]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
    >
      <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-xl">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 opacity-60" />

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                每日補給任務
                {allDone && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    🎉
                  </motion.span>
                )}
              </h2>
              <p className="text-xs text-muted-foreground">Daily Quests & Stack</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono tabular-nums text-muted-foreground">
                {completed} / {total}
              </p>
              {totalXpEarned > 0 && (
                <motion.p
                  key={totalXpEarned}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-xs font-bold text-amber-500 tabular-nums"
                >
                  +{totalXpEarned} XP
                </motion.p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 space-y-1">
            <div className="relative h-2 w-full rounded-full bg-secondary/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`absolute inset-y-0 left-0 rounded-full ${
                  allDone
                    ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-green-400"
                    : "bg-gradient-to-r from-amber-500 to-yellow-400"
                }`}
              />
            </div>
            {allDone && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-emerald-500 font-semibold text-center"
              >
                ✨ 今日補給任務全數完成！狀態已更新
              </motion.p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {quests.map((quest, idx) => (
            <QuestItem
              key={quest.id}
              quest={quest}
              onComplete={handleComplete}
              index={idx}
            />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
