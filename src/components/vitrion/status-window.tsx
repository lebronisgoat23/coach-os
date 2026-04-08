"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { STAT_CONFIGS, type UserStatus, type ActiveBuff, type StatType } from "@/lib/types";

// ============================================================
// Stat Bar — Single animated RPG stat with gradient fill
// ============================================================
function StatBar({ statKey, value, maxValue = 100 }: { statKey: StatType; value: number; maxValue?: number }) {
  const config = STAT_CONFIGS[statKey];
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="group relative">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className={`font-bold text-sm tracking-wider ${config.colorText}`}>
            {config.labelEn}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {config.label}
          </span>
        </div>
        <motion.span
          key={value}
          initial={{ scale: 1.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`font-mono font-bold text-sm tabular-nums ${config.colorText}`}
        >
          {value}
        </motion.span>
      </div>

      {/* Custom gradient progress bar */}
      <div className="relative h-3 w-full rounded-full bg-secondary/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${config.colorFrom} ${config.colorTo}`}
        />
        {/* Shine effect */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatDelay: 4 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>

      {/* Hover description */}
      <p className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {config.description}
      </p>
    </div>
  );
}

// ============================================================
// Level Badge — Animated level display with XP ring
// ============================================================
function LevelBadge({ level, xp, xpToNext, title }: Pick<UserStatus, "level" | "xp" | "xpToNext" | "title">) {
  const xpPercentage = (xp / xpToNext) * 100;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (xpPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Circular XP Ring */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-secondary/30"
          />
          {/* XP progress ring */}
          <motion.circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="url(#xpGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          />
          <defs>
            <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Level number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Lv.</span>
          <motion.span
            key={level}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-2xl font-black bg-gradient-to-b from-purple-400 to-blue-400 bg-clip-text text-transparent"
          >
            {level}
          </motion.span>
        </div>
      </div>

      {/* Title badge */}
      <Badge variant="secondary" className="text-xs px-3 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        {title}
      </Badge>

      {/* XP text */}
      <p className="text-[10px] text-muted-foreground tabular-nums">
        XP: {xp} / {xpToNext}
      </p>
    </div>
  );
}

// ============================================================
// Buff List — Active supplement buffs
// ============================================================
function BuffList({ buffs }: { buffs: ActiveBuff[] }) {
  if (buffs.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        活躍增益 Active Buffs
      </h3>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {buffs.map((buff) => {
            const config = STAT_CONFIGS[buff.statType];
            return (
              <Tooltip key={buff.id}>
                <TooltipTrigger
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    bg-gradient-to-r ${config.colorFrom}/10 ${config.colorTo}/10
                    border border-current/10 ${config.colorText}
                    cursor-default select-none transition-transform hover:scale-105
                  `}
                >
                  <span>{buff.sourceEmoji}</span>
                  <span>{config.labelEn}</span>
                  <span className="font-bold">+{buff.percentage}%</span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs">{buff.displayText}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// Status Window — Main RPG Status Panel
// ============================================================
export function StatusWindow({
  status,
  buffs = [],
}: {
  status: UserStatus;
  buffs?: ActiveBuff[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-xl">
        {/* Decorative top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-emerald-500 to-blue-500 opacity-60" />

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">角色狀態</h2>
              <p className="text-xs text-muted-foreground">Status Window</p>
            </div>
            <div className="text-[10px] text-muted-foreground tabular-nums">
              {new Date().toLocaleDateString("zh-TW", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Top section: Level + Stats */}
          <div className="flex gap-6 items-start">
            {/* Level ring on the left */}
            <LevelBadge
              level={status.level}
              xp={status.xp}
              xpToNext={status.xpToNext}
              title={status.title}
            />

            {/* Stats on the right */}
            <div className="flex-1 space-y-4 pt-1">
              <StatBar statKey="STR" value={status.currentStr} />
              <StatBar statKey="VIT" value={status.currentVit} />
              <StatBar statKey="AGI" value={status.currentAgi} />
            </div>
          </div>

          {/* Active Buffs */}
          <BuffList buffs={buffs} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
