"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConfounderTag } from "@/lib/types";

// ============================================================
// Debuff tag definitions with RPG-flavored display
// ============================================================
interface DebuffOption {
  tag: ConfounderTag;
  emoji: string;
  label: string;
  labelEn: string;
  color: string; // text color for the tag
  description: string;
}

const DEBUFF_OPTIONS: DebuffOption[] = [
  { tag: "SICK",         emoji: "🤒", label: "生病",   labelEn: "Sick",        color: "text-red-400",    description: "感冒、發燒、身體不適" },
  { tag: "ALCOHOL",      emoji: "🍺", label: "飲酒",   labelEn: "Alcohol",     color: "text-amber-400",  description: "飲酒後的恢復期" },
  { tag: "ALL_NIGHTER",  emoji: "🦉", label: "熬夜",   labelEn: "All-nighter", color: "text-purple-400", description: "睡眠不足或通宵" },
  { tag: "JET_LAG",      emoji: "✈️", label: "時差",   labelEn: "Jet Lag",     color: "text-blue-400",   description: "跨時區旅行中" },
  { tag: "MEDICATION",   emoji: "💊", label: "用藥",   labelEn: "Medication",  color: "text-cyan-400",   description: "重大藥物使用中" },
  { tag: "HIGH_STRESS",  emoji: "😰", label: "高壓",   labelEn: "Stress",      color: "text-orange-400", description: "工作或生活壓力極大" },
  { tag: "INJURY",       emoji: "🩹", label: "受傷",   labelEn: "Injury",      color: "text-rose-400",   description: "身體受傷恢復中" },
  { tag: "MENSTRUAL",    emoji: "🌸", label: "生理期", labelEn: "Menstrual",   color: "text-pink-400",   description: "生理期間" },
  { tag: "FASTING",      emoji: "🍽️", label: "斷食",   labelEn: "Fasting",     color: "text-yellow-400", description: "間歇性斷食中" },
  { tag: "TRAVEL",       emoji: "🧳", label: "旅行",   labelEn: "Travel",      color: "text-teal-400",   description: "旅行中日常作息改變" },
];

// ============================================================
// Active Debuff Item — Shows a removable debuff tag
// ============================================================
function ActiveDebuff({
  option,
  severity,
  onRemove,
}: {
  option: DebuffOption;
  severity: number;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 10 }}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50
        border border-red-500/10
      `}
    >
      <span className="text-lg">{option.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${option.color}`}>{option.label}</p>
        <p className="text-[10px] text-muted-foreground">
          嚴重度 {"▮".repeat(severity)}{"▯".repeat(5 - severity)}
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
        onClick={onRemove}
        className="w-6 h-6 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 text-xs transition-colors"
        aria-label={`Remove ${option.label} debuff`}
      >
        ✕
      </motion.button>
    </motion.div>
  );
}

// ============================================================
// Debuff Panel — Confounder tagging interface
// ============================================================
export interface ActiveConfounder {
  tag: ConfounderTag;
  severity: number; // 1-5
}

export function DebuffPanel({
  activeDebuffs,
  onToggle,
  onRemove,
}: {
  activeDebuffs: ActiveConfounder[];
  onToggle: (tag: ConfounderTag) => void;
  onRemove: (tag: ConfounderTag) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeTags = new Set(activeDebuffs.map((d) => d.tag));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
    >
      <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-xl">
        {/* Red warning gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-rose-400 to-orange-500 opacity-60" />

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                狀態異常
                {activeDebuffs.length > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-red-400 border-red-400/30">
                    {activeDebuffs.length} Debuff
                  </Badge>
                )}
              </h2>
              <p className="text-xs text-muted-foreground">Debuffs & Confounders</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-muted-foreground"
            >
              {isExpanded ? "收合" : "＋ 標記"}
            </motion.button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Active debuffs list */}
          <AnimatePresence mode="popLayout">
            {activeDebuffs.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground/60 text-center py-2"
              >
                ✨ 目前無異常狀態 — 最佳分析條件
              </motion.p>
            ) : (
              activeDebuffs.map((debuff) => {
                const option = DEBUFF_OPTIONS.find((o) => o.tag === debuff.tag)!;
                return (
                  <ActiveDebuff
                    key={debuff.tag}
                    option={option}
                    severity={debuff.severity}
                    onRemove={() => onRemove(debuff.tag)}
                  />
                );
              })
            )}
          </AnimatePresence>

          {/* Debuff selector grid */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border/30 pt-3 mt-2">
                  <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">
                    點擊標記今日異常狀態
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {DEBUFF_OPTIONS.map((option) => {
                      const isActive = activeTags.has(option.tag);
                      return (
                        <motion.button
                          key={option.tag}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => onToggle(option.tag)}
                          className={`
                            flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all
                            ${isActive
                              ? "bg-red-500/15 border border-red-500/30 shadow-sm"
                              : "bg-secondary/30 hover:bg-secondary/60 border border-transparent"
                            }
                          `}
                          title={option.description}
                        >
                          <span className="text-xl">{option.emoji}</span>
                          <span className={`text-[9px] font-medium ${isActive ? option.color : "text-muted-foreground"}`}>
                            {option.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
