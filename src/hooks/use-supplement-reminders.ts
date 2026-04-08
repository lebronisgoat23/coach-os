"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ============================================================
// Supplement Reminder System
// ============================================================

export type ReminderTime = "morning" | "afternoon" | "evening" | "bedtime";

export interface SupplementReminder {
  id: string;
  supplementName: string;
  supplementEmoji: string;
  time: ReminderTime;
  hour: number;   // 0-23
  minute: number;  // 0-59
  enabled: boolean;
  days: number[];  // 0=Sun, 1=Mon, ..., 6=Sat (empty = every day)
}

const STORAGE_KEY = "vitrion-reminders";

const TIME_PRESETS: Record<ReminderTime, { label: string; hour: number; minute: number; emoji: string }> = {
  morning:   { label: "早上", hour: 8,  minute: 0,  emoji: "🌅" },
  afternoon: { label: "午餐後", hour: 13, minute: 0, emoji: "☀️" },
  evening:   { label: "晚餐後", hour: 19, minute: 0, emoji: "🌆" },
  bedtime:   { label: "睡前", hour: 22, minute: 0,  emoji: "🌙" },
};

export { TIME_PRESETS };

// Default reminders based on typical supplement schedule
const DEFAULT_REMINDERS: SupplementReminder[] = [
  {
    id: "rem-1",
    supplementName: "魚油 Omega-3",
    supplementEmoji: "🐟",
    time: "morning",
    hour: 8,
    minute: 0,
    enabled: true,
    days: [],
  },
  {
    id: "rem-2",
    supplementName: "維生素 D3",
    supplementEmoji: "☀️",
    time: "morning",
    hour: 8,
    minute: 0,
    enabled: true,
    days: [],
  },
  {
    id: "rem-3",
    supplementName: "鎂 Magnesium",
    supplementEmoji: "🌙",
    time: "bedtime",
    hour: 22,
    minute: 0,
    enabled: true,
    days: [],
  },
  {
    id: "rem-4",
    supplementName: "肌酸 Creatine",
    supplementEmoji: "💪",
    time: "morning",
    hour: 8,
    minute: 30,
    enabled: true,
    days: [],
  },
  {
    id: "rem-5",
    supplementName: "益生菌 Probiotic",
    supplementEmoji: "🦠",
    time: "morning",
    hour: 7,
    minute: 30,
    enabled: true,
    days: [],
  },
];

function loadReminders(): SupplementReminder[] {
  if (typeof window === "undefined") return DEFAULT_REMINDERS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_REMINDERS;
  } catch {
    return DEFAULT_REMINDERS;
  }
}

function saveReminders(data: SupplementReminder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useSupplementReminders() {
  const [reminders, setReminders] = useState<SupplementReminder[]>([]);
  const [scheduledTimers, setScheduledTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Load reminders
  useEffect(() => {
    setReminders(loadReminders());
  }, []);

  // Schedule/reschedule timers when reminders change
  useEffect(() => {
    // Clear all existing timers
    scheduledTimers.forEach((timer) => clearTimeout(timer));
    const newTimers = new Map<string, NodeJS.Timeout>();

    const now = new Date();

    reminders.filter((r) => r.enabled).forEach((reminder) => {
      // Check if today is an active day
      const today = now.getDay();
      if (reminder.days.length > 0 && !reminder.days.includes(today)) return;

      // Calculate next trigger time
      const target = new Date();
      target.setHours(reminder.hour, reminder.minute, 0, 0);

      // If time already passed today, don't schedule
      if (target <= now) return;

      const ms = target.getTime() - now.getTime();

      const timer = setTimeout(() => {
        triggerReminder(reminder);
      }, ms);

      newTimers.set(reminder.id, timer);
    });

    setScheduledTimers(newTimers);

    return () => {
      newTimers.forEach((timer) => clearTimeout(timer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  // Trigger a reminder notification
  const triggerReminder = useCallback((reminder: SupplementReminder) => {
    // In-app toast
    toast(`${reminder.supplementEmoji} 該吃 ${reminder.supplementName} 了！`, {
      description: `⏰ ${TIME_PRESETS[reminder.time].emoji} ${TIME_PRESETS[reminder.time].label}提醒`,
      duration: 10000,
      action: {
        label: "已服用 ✅",
        onClick: () => {
          toast.success(`${reminder.supplementEmoji} 已記錄！`);
        },
      },
    });

    // Try browser Notification API
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      const notif = new Notification(`${reminder.supplementEmoji} ${reminder.supplementName}`, {
        body: `${TIME_PRESETS[reminder.time].label}提醒 — 該吃補給品了！`,
        icon: "/icon-192.png",
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    }
  }, []);

  // Toggle a reminder on/off
  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      );
      saveReminders(updated);
      const target = updated.find((r) => r.id === id);
      if (target) {
        toast.info(
          target.enabled
            ? `🔔 ${target.supplementEmoji} ${target.supplementName} 提醒已開啟`
            : `🔕 ${target.supplementEmoji} ${target.supplementName} 提醒已關閉`
        );
      }
      return updated;
    });
  }, []);

  // Update a reminder's time
  const updateReminderTime = useCallback((id: string, time: ReminderTime) => {
    setReminders((prev) => {
      const preset = TIME_PRESETS[time];
      const updated = prev.map((r) =>
        r.id === id ? { ...r, time, hour: preset.hour, minute: preset.minute } : r
      );
      saveReminders(updated);
      return updated;
    });
  }, []);

  // Add a new reminder
  const addReminder = useCallback((name: string, emoji: string, time: ReminderTime) => {
    const preset = TIME_PRESETS[time];
    const newReminder: SupplementReminder = {
      id: `rem-${Date.now()}`,
      supplementName: name,
      supplementEmoji: emoji,
      time,
      hour: preset.hour,
      minute: preset.minute,
      enabled: true,
      days: [],
    };

    setReminders((prev) => {
      const updated = [...prev, newReminder];
      saveReminders(updated);
      return updated;
    });

    toast.success(`🔔 已新增 ${emoji} ${name} 提醒（${preset.label}）`);
  }, []);

  // Remove a reminder
  const removeReminder = useCallback((id: string) => {
    setReminders((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveReminders(updated);
      return updated;
    });
  }, []);

  // Test fire a reminder
  const testReminder = useCallback((id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) {
      triggerReminder(reminder);
    }
  }, [reminders, triggerReminder]);

  // Group by time slot
  const remindersByTime = reminders.reduce((acc, r) => {
    if (!acc[r.time]) acc[r.time] = [];
    acc[r.time].push(r);
    return acc;
  }, {} as Record<ReminderTime, SupplementReminder[]>);

  const enabledCount = reminders.filter((r) => r.enabled).length;
  const nextReminder = getNextReminder(reminders);

  return {
    reminders,
    remindersByTime,
    enabledCount,
    nextReminder,
    toggleReminder,
    updateReminderTime,
    addReminder,
    removeReminder,
    testReminder,
  };
}

function getNextReminder(reminders: SupplementReminder[]): SupplementReminder | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const upcoming = reminders
    .filter((r) => r.enabled)
    .filter((r) => r.hour * 60 + r.minute > currentMinutes)
    .sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));

  return upcoming[0] || null;
}
