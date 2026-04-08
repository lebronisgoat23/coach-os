"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import type { DailyCheckIn } from "@/lib/types";

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  primaryGoal: string;
  currentSupplements: string[];
  challengeName: string;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function useDailyCheckIn() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<DailyCheckIn[]>([]);
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckIn | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Load from Supabase
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // 1. Load Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileData) {
        setProfile({
          hasCompletedOnboarding: profileData.has_completed_onboarding ?? false,
          primaryGoal: profileData.primary_goal ?? "",
          challengeName: profileData.challenge_name ?? "",
          currentSupplements: profileData.current_supplements ?? [],
        });
      }

      // 2. Load Checkins
      const { data: checkinsData } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (checkinsData) {
        // Map database snake_case to frontend camelCase
        const formatted: DailyCheckIn[] = checkinsData.map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          date: c.date,
          sleepQuality: c.sleep_quality,
          energyLevel: c.energy_level,
          focusLevel: c.focus_level,
          stressLevel: c.stress_level,
          bodyFeeling: c.body_feeling,
          mood: c.mood,
          note: c.note,
          createdAt: c.created_at,
        }));
        
        setCheckins(formatted);
        const today = formatted.find(c => c.date === getToday());
        setTodayCheckin(today || null);
      }
    };

    loadData();
  }, [user]);

  // Save profile
  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        primary_goal: newProfile.primaryGoal,
        challenge_name: newProfile.challengeName,
        current_supplements: newProfile.currentSupplements,
        has_completed_onboarding: newProfile.hasCompletedOnboarding,
      });
      
    if (error) {
      console.error("Failed to save profile:", error);
      toast.error("儲存設定失敗");
    }
  }, [user]);

  // Submit today's check-in
  const submitCheckIn = useCallback(
    async (data: {
      sleepQuality: number;
      energyLevel: number;
      focusLevel: number;
      stressLevel: number;
      bodyFeeling: number;
      mood: number;
      note: string | null;
    }) => {
      if (!user) {
        toast.error("請先登入");
        return null;
      }

      const today = getToday();
      
      // Optimistic update
      const tempCheckin: DailyCheckIn = {
        id: `temp-${Date.now()}`,
        userId: user.id,
        date: today,
        ...data,
        createdAt: new Date().toISOString(),
      };
      
      const filtered = checkins.filter((c) => c.date !== today);
      const updated = [tempCheckin, ...filtered];
      setCheckins(updated);
      setTodayCheckin(tempCheckin);

      // Save to Supabase
      const { data: savedData, error } = await supabase
        .from("daily_checkins")
        .upsert({
          user_id: user.id,
          date: today,
          sleep_quality: data.sleepQuality,
          energy_level: data.energyLevel,
          focus_level: data.focusLevel,
          stress_level: data.stressLevel,
          body_feeling: data.bodyFeeling,
          mood: data.mood,
          note: data.note,
        })
        .select()
        .single();

      if (error) {
        console.error("Check-in error:", error);
        toast.error("儲存失敗，請重試");
        // Revert optimistic update
        setCheckins(checkins);
        setTodayCheckin(checkins.find(c => c.date === today) || null);
        return null;
      }

      toast.success("✅ 今日身體狀態已記錄！", {
        description: "Alpha 引擎將分析你的數據趨勢",
      });

      return tempCheckin;
    },
    [user, checkins]
  );

  // Get average scores for last N days
  const getAverages = useCallback(
    (days: number = 7) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().split("T")[0];

      const recent = checkins.filter((c) => c.date >= cutoffStr);
      if (recent.length === 0) return null;

      const avg = (key: keyof Pick<DailyCheckIn, "sleepQuality" | "energyLevel" | "focusLevel" | "stressLevel" | "bodyFeeling" | "mood">) =>
        Math.round((recent.reduce((sum, c) => sum + c[key], 0) / recent.length) * 10) / 10;

      return {
        sleepQuality: avg("sleepQuality"),
        energyLevel: avg("energyLevel"),
        focusLevel: avg("focusLevel"),
        stressLevel: avg("stressLevel"),
        bodyFeeling: avg("bodyFeeling"),
        mood: avg("mood"),
        days: recent.length,
      };
    },
    [checkins]
  );

  // Get trend (latest 14 days for charting)
  const getTrend = useCallback(
    () => {
      return [...checkins]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14);
    },
    [checkins]
  );

  const hasCheckedInToday = todayCheckin !== null;
  const totalCheckins = checkins.length;
  const streak = calculateStreak(checkins);

  return {
    checkins,
    todayCheckin,
    hasCheckedInToday,
    totalCheckins,
    streak,
    profile,
    saveProfile,
    submitCheckIn,
    getAverages,
    getTrend,
  };
}

// Calculate consecutive check-in streak
function calculateStreak(checkins: DailyCheckIn[]): number {
  if (checkins.length === 0) return 0;

  const dates = new Set(checkins.map((c) => c.date));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    if (dates.has(dateStr)) {
      streak++;
    } else if (i === 0) {
      // Today not checked in yet, still count yesterday's streak
      continue;
    } else {
      break;
    }
  }

  return streak;
}
