"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

// Oura API v2 — Personal Access Token flow
// User gets their token from: https://cloud.ouraring.com/personal-access-tokens

interface OuraSleepData {
  day: string;
  score: number;
  deep_sleep_duration: number;   // seconds
  rem_sleep_duration: number;    // seconds
  total_sleep_duration: number;  // seconds
}

interface OuraReadinessData {
  day: string;
  score: number;
  hrv_balance_score: number;
  resting_heart_rate: number;
}

interface OuraActivityData {
  day: string;
  score: number;
  steps: number;
}

export interface NormalizedBiometrics {
  date: string;
  sleepScore: number;
  deepSleepMin: number;
  remSleepMin: number;
  readinessScore: number;
  hrvMs: number;
  rhrBpm: number;
  activityScore: number;
  steps: number;
  source: "oura";
}

const OURA_BASE = "https://api.ouraring.com/v2/usercollection";

async function ouraFetch<T>(endpoint: string, token: string, params: Record<string, string> = {}): Promise<T | null> {
  try {
    const url = new URL(`${OURA_BASE}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error("Token 已過期或無效");
      throw new Error(`Oura API 錯誤 (${res.status})`);
    }

    return res.json();
  } catch (err) {
    console.error(`Oura ${endpoint} fetch failed:`, err);
    return null;
  }
}

export function useOuraRing() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NormalizedBiometrics[]>([]);
  const [connected, setConnected] = useState(false);

  const fetchData = useCallback(async (token: string, days: number = 7) => {
    setLoading(true);

    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
    const params = { start_date: startDate, end_date: endDate };

    try {
      const [sleepRes, readinessRes, activityRes] = await Promise.all([
        ouraFetch<{ data: OuraSleepData[] }>("daily_sleep", token, params),
        ouraFetch<{ data: OuraReadinessData[] }>("daily_readiness", token, params),
        ouraFetch<{ data: OuraActivityData[] }>("daily_activity", token, params),
      ]);

      // Build lookup maps
      const readinessMap = new Map(
        (readinessRes?.data || []).map((r) => [r.day, r])
      );
      const activityMap = new Map(
        (activityRes?.data || []).map((a) => [a.day, a])
      );

      // Merge into normalized format
      const merged: NormalizedBiometrics[] = (sleepRes?.data || []).map((s) => {
        const r = readinessMap.get(s.day);
        const a = activityMap.get(s.day);

        return {
          date: s.day,
          sleepScore: s.score || 0,
          deepSleepMin: Math.round((s.deep_sleep_duration || 0) / 60),
          remSleepMin: Math.round((s.rem_sleep_duration || 0) / 60),
          readinessScore: r?.score || 0,
          hrvMs: r?.hrv_balance_score || 0,
          rhrBpm: r?.resting_heart_rate || 0,
          activityScore: a?.score || 0,
          steps: a?.steps || 0,
          source: "oura" as const,
        };
      });

      setData(merged);
      setConnected(true);
      toast.success(`💍 Oura Ring 已同步 ${merged.length} 天數據`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "連線失敗";
      toast.error(`💍 Oura 同步失敗: ${msg}`);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setData([]);
    setConnected(false);
    localStorage.removeItem("vitrion-oura-token");
    toast.success("💍 已斷開 Oura Ring 連接");
  }, []);

  return { data, loading, connected, fetchData, disconnect };
}
