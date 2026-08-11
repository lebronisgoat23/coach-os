"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useDailyCheckIn, type UserProfile } from "@/hooks/use-daily-checkin";

type Task = {
  id: string;
  title: string;
  subtitle?: string;
  hint?: string;
};

function getTodayStorageKey(): string {
  return `vitrion_todos_${new Date().toISOString().split("T")[0]}`;
}

function loadCheckedTasks(): Record<string, boolean> {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem(getTodayStorageKey()) || "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
}

function buildTasks(profile: UserProfile | null): Task[] {
  if (!profile) return [];

  const tasks: Task[] = [];
  const supps = profile.currentSupplements?.filter((supplement) => supplement !== "none") || [];

  if (supps.length > 0) {
    tasks.push({
      id: "supplements",
      title: "攝取營養品",
      subtitle: supps.map(getSupplementLabel).join("、"),
      hint: "💡 盡量每天固定時間服用，對追蹤效果最好",
    });
  }

  if (profile.primaryGoal === "WEIGHT") {
    tasks.push({
      id: "goal_weight",
      title: "今天完成 10 分鐘低壓活動",
      hint: "💡 先修復 NEAT 和日常活動，比直接少吃更穩",
    });
  } else if (profile.primaryGoal === "SLEEP") {
    tasks.push({
      id: "goal_sleep",
      title: "睡前 1 小時避免看螢幕",
      hint: "💡 藍光會抑制褪黑激素分泌",
    });
  } else if (profile.primaryGoal === "ENERGY") {
    tasks.push({
      id: "goal_energy",
      title: "今天喝滿 2000cc 水分",
      hint: "💡 輕微缺水就會導致疲勞",
    });
  } else if (profile.primaryGoal === "FOCUS") {
    tasks.push({
      id: "goal_focus",
      title: "完成一次 25 分鐘專注",
      hint: "💡 番茄鐘工作法有助於保持節奏",
    });
  } else if (profile.primaryGoal === "STRESS") {
    tasks.push({
      id: "goal_stress",
      title: "花 3 分鐘做深呼吸放鬆",
      hint: "💡 腹式呼吸能有效降低皮質醇",
    });
  }

  return tasks;
}

export function ActionTodoList() {
  const { hasCheckedInToday, todayCheckin, profile } = useDailyCheckIn();
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>(loadCheckedTasks);
  const tasks = buildTasks(profile).map((task) => ({
    ...task,
    checked: Boolean(checkedTasks[task.id]),
  }));

  const toggleTask = (id: string) => {
    setCheckedTasks((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) delete next[id];
      localStorage.setItem(getTodayStorageKey(), JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-2">
      <Link href="/v2/checkin" className="block">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className={`p-4 border transition-all ${
            hasCheckedInToday
              ? "border-border bg-foreground/[0.02]"
              : "border-foreground bg-background shadow-[2px_2px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_rgba(255,255,255,1)]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-6 h-6 shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${
                hasCheckedInToday ? "border-foreground bg-foreground text-background" : "border-foreground/50"
              }`}
            >
              {hasCheckedInToday && <Check size={14} strokeWidth={3} />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${hasCheckedInToday ? "line-through opacity-50" : ""}`}>
                提交今日 V2 身體回報
              </p>
              {hasCheckedInToday ? (
                <p className="text-xs text-muted-foreground mt-0.5">
                  舊版紀錄：睡眠 {todayCheckin?.sleepQuality} · 精力 {todayCheckin?.energyLevel} · 專注{" "}
                  {todayCheckin?.focusLevel}
                </p>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-foreground font-medium bg-foreground/10 px-2 py-0.5 rounded-sm w-fit">
                    30 秒
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    轉成 observations，供規則引擎與教練工作台使用
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </Link>

      {tasks.map((task) => (
        <motion.div
          key={task.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => toggleTask(task.id)}
          className={`p-4 border transition-all cursor-pointer ${
            task.checked
              ? "border-border bg-foreground/[0.02]"
              : "border-border hover:border-foreground/40 bg-background"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-6 h-6 shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${
                task.checked ? "border-foreground bg-foreground text-background" : "border-border"
              }`}
            >
              {task.checked && <Check size={14} strokeWidth={3} />}
            </div>
            <div className={`flex-1 transition-opacity ${task.checked ? "opacity-50 line-through" : ""}`}>
              <p className="text-sm font-bold">{task.title}</p>
              {task.subtitle && <p className="text-xs text-foreground/80 mt-0.5">{task.subtitle}</p>}
              {!task.checked && task.hint && <p className="text-[10px] text-muted-foreground mt-1.5">{task.hint}</p>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function getSupplementLabel(id: string): string {
  const map: Record<string, string> = {
    omega3: "魚油",
    bcomplex: "B群",
    d3: "維生素 D3",
    magnesium: "鎂",
    maca: "瑪卡",
    probiotic: "益生菌",
    melatonin: "褪黑激素",
    collagen: "膠原蛋白",
    vitc: "維生素 C",
    zinc: "鋅",
  };
  return map[id] || id;
}
