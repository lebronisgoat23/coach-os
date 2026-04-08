"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  ACHIEVEMENTS_CATALOG,
  RARITY_CONFIG,
  type Achievement,
} from "@/lib/achievements";

const STORAGE_KEY = "vitrion-achievements";

// Load unlocked achievements from localStorage
function loadUnlocked(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

// Save unlocked achievements to localStorage
function saveUnlocked(data: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [justUnlocked, setJustUnlocked] = useState<Achievement | null>(null);

  // Initialize from catalog + localStorage
  useEffect(() => {
    const unlocked = loadUnlocked();
    const merged = ACHIEVEMENTS_CATALOG.map((a) => ({
      ...a,
      unlockedAt: unlocked[a.id] || null,
    }));
    setAchievements(merged);
  }, []);

  // Unlock an achievement by ID
  const unlock = useCallback((id: string) => {
    setAchievements((prev) => {
      const existing = prev.find((a) => a.id === id);
      if (!existing || existing.unlockedAt) return prev; // already unlocked

      const now = new Date().toISOString();
      const unlocked = loadUnlocked();
      unlocked[id] = now;
      saveUnlocked(unlocked);

      const rarity = RARITY_CONFIG[existing.rarity];

      // Toast celebration
      toast.success(`🏆 成就解鎖：${existing.emoji} ${existing.name}`, {
        description: `${existing.description} (+${existing.xpReward} XP) · ${rarity.label}`,
        duration: 5000,
      });

      setJustUnlocked({ ...existing, unlockedAt: now });
      setTimeout(() => setJustUnlocked(null), 5000);

      return prev.map((a) =>
        a.id === id ? { ...a, unlockedAt: now } : a
      );
    });
  }, []);

  // Check and auto-unlock based on conditions
  const checkAndUnlock = useCallback(
    (context: {
      streak?: number;
      totalCheckins?: number;
      level?: number;
      stackCount?: number;
      str?: number;
      vit?: number;
      agi?: number;
      allQuestsCompletedToday?: boolean;
      wearableConnected?: boolean;
      exportedCsv?: boolean;
      themeToggled?: boolean;
      hasActiveBuff?: boolean;
    }) => {
      const checks: Record<string, boolean> = {
        "streak-3": (context.streak ?? 0) >= 3,
        "streak-7": (context.streak ?? 0) >= 7,
        "streak-14": (context.streak ?? 0) >= 14,
        "streak-30": (context.streak ?? 0) >= 30,
        "streak-100": (context.streak ?? 0) >= 100,
        "first-checkin": (context.totalCheckins ?? 0) >= 1,
        "checkins-50": (context.totalCheckins ?? 0) >= 50,
        "checkins-200": (context.totalCheckins ?? 0) >= 200,
        "level-5": (context.level ?? 0) >= 5,
        "level-10": (context.level ?? 0) >= 10,
        "stack-5": (context.stackCount ?? 0) >= 5,
        "wearable-connect": context.wearableConnected ?? false,
        "csv-export": context.exportedCsv ?? false,
        "dark-mode-toggle": context.themeToggled ?? false,
        "all-stats-70":
          (context.str ?? 0) >= 70 &&
          (context.vit ?? 0) >= 70 &&
          (context.agi ?? 0) >= 70,
        "perfect-day": context.allQuestsCompletedToday ?? false,
        "alpha-buff": context.hasActiveBuff ?? false,
      };

      Object.entries(checks).forEach(([id, met]) => {
        if (met) unlock(id);
      });
    },
    [unlock]
  );

  // Dismiss the just-unlocked popup
  const dismissUnlocked = useCallback(() => {
    setJustUnlocked(null);
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;
  const totalCount = achievements.length;
  const completionPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return {
    achievements,
    justUnlocked,
    dismissUnlocked,
    unlock,
    checkAndUnlock,
    unlockedCount,
    totalCount,
    completionPct,
  };
}
