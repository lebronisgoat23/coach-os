"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, IS_SUPABASE_CONFIGURED } from "@/lib/supabase";
import {
  MOCK_USER_STATUS,
  MOCK_DAILY_QUESTS,
  MOCK_ACTIVE_BUFFS,
} from "@/lib/mock-data";
import type { UserStatus, DailyQuest, ActiveBuff, StatType } from "@/lib/types";

// Use mock data when Supabase is not configured
const USE_MOCK = !IS_SUPABASE_CONFIGURED;

// ============================================================
// useUserStatus — Fetch / update user level, stats, XP
// ============================================================
export function useUserStatus(userId: string = "user-001") {
  const [status, setStatus] = useState<UserStatus>(MOCK_USER_STATUS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        const d = data as Record<string, unknown>;
        setStatus({
          userId: d.id as string,
          currentStr: (d.current_str as number) ?? 50,
          currentVit: (d.current_vit as number) ?? 50,
          currentAgi: (d.current_agi as number) ?? 50,
          level: (d.level as number) ?? 1,
          xp: (d.xp as number) ?? 0,
          xpToNext: (d.xp_to_next as number) ?? 100,
          title: (d.title as string) ?? "新手探索者",
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  const updateStatus = useCallback(async (partial: Partial<UserStatus>) => {
    setStatus((prev) => ({ ...prev, ...partial }));

    if (USE_MOCK) return;

    const update: Record<string, unknown> = {};
    if (partial.currentStr !== undefined) update.current_str = partial.currentStr;
    if (partial.currentVit !== undefined) update.current_vit = partial.currentVit;
    if (partial.currentAgi !== undefined) update.current_agi = partial.currentAgi;
    if (partial.level !== undefined) update.level = partial.level;
    if (partial.xp !== undefined) update.xp = partial.xp;
    if (partial.xpToNext !== undefined) update.xp_to_next = partial.xpToNext;
    if (partial.title !== undefined) update.title = partial.title;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("profiles")
      .update(update)
      .eq("id", userId);
  }, [userId]);

  return { status, setStatus, updateStatus, loading };
}

// ============================================================
// useDailyQuests — CRUD for supplement check-in quests
// ============================================================
export function useDailyQuests(userId: string = "user-001") {
  const [quests, setQuests] = useState<DailyQuest[]>(MOCK_DAILY_QUESTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("daily_quests")
        .select("*")
        .eq("user_id", userId)
        .eq("quest_date", today)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setQuests(
          (data as Record<string, unknown>[]).map((d) => ({
            id: d.id as string,
            userId: d.user_id as string,
            questDate: d.quest_date as string,
            itemName: d.item_name as string,
            itemEmoji: d.item_emoji as string,
            dose: d.dose as string,
            isCompleted: d.is_completed as boolean,
            completedAt: d.completed_at as string | null,
            xpReward: (d.xp_reward as number) ?? 10,
            buffType: (d.buff_type as StatType) ?? null,
            buffValue: (d.buff_value as number) ?? 0,
          }))
        );
      }
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  const completeQuest = useCallback(async (questId: string) => {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? { ...q, isCompleted: true, completedAt: new Date().toISOString() }
          : q
      )
    );

    if (USE_MOCK) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("daily_quests")
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq("id", questId);
  }, []);

  return { quests, setQuests, completeQuest, loading };
}

// ============================================================
// useActiveBuffs — Fetch active buff effects
// ============================================================
export function useActiveBuffs(userId: string = "user-001") {
  const [buffs, setBuffs] = useState<ActiveBuff[]>(MOCK_ACTIVE_BUFFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await globalThis.fetch(`${apiUrl}/api/correlate/active-buffs/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setBuffs(data.buffs || []);
        }
      } catch {
        // Fallback to mock
      }
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  return { buffs, setBuffs, loading };
}
