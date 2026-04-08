"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useDailyCheckIn } from "@/hooks/use-daily-checkin";

export function ActionTodoList() {
  const { hasCheckedInToday, todayCheckin, profile } = useDailyCheckIn();
  
  // Custom interactive tasks
  const [tasks, setTasks] = useState<{ id: string; checked: boolean; title: string; subtitle?: string; hint?: string }[]>([]);

  useEffect(() => {
    if (!profile) return;
    
    // Base Check-in Task (controlled entirely by DB state)
    // We don't put it in the local state array because it's derived from `hasCheckedInToday`.
    
    // Generate dynamic tasks based on profile
    const generatedTasks = [];
    
    // Supplements Task
    const supps = profile.currentSupplements?.filter(s => s !== "none") || [];
    if (supps.length > 0) {
      generatedTasks.push({
        id: "supplements",
        checked: false,
        title: `攝取營養品`,
        subtitle: supps.map(getSupplementLabel).join("、"),
        hint: "💡 盡量每天固定時間服用，對追蹤效果最好"
      });
    }

    // Goal-oriented Task
    if (profile.primaryGoal === "SLEEP") {
      generatedTasks.push({ id: "goal_sleep", checked: false, title: "睡前 1 小時避免看螢幕", hint: "💡 藍光會抑制褪黑激素分泌" });
    } else if (profile.primaryGoal === "ENERGY") {
      generatedTasks.push({ id: "goal_energy", checked: false, title: "今天喝滿 2000cc 水分", hint: "💡 輕微缺水就會導致疲勞" });
    } else if (profile.primaryGoal === "FOCUS") {
      generatedTasks.push({ id: "goal_focus", checked: false, title: "完成一次 25 分鐘專注", hint: "💡 番茄鐘工作法有助於保持節奏" });
    } else if (profile.primaryGoal === "STRESS") {
      generatedTasks.push({ id: "goal_stress", checked: false, title: "花 3 分鐘做深呼吸放鬆", hint: "💡 腹式呼吸能有效降低皮質醇" });
    }

    // Try to load state from localStorage for today
    const dateStr = new Date().toISOString().split("T")[0];
    const storageKey = `vitrion_todos_${dateStr}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge checked states
        generatedTasks.forEach(task => {
          if (parsed[task.id]) {
            task.checked = true;
          }
        });
      } catch (e) {}
    }
    
    setTasks(generatedTasks);
  }, [profile]);

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t);
      
      // Save to localStorage
      const dateStr = new Date().toISOString().split("T")[0];
      const storageKey = `vitrion_todos_${dateStr}`;
      
      const stateToSave = next.reduce((acc, t) => {
        if (t.checked) acc[t.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {/* 1. Database-driven Check-in Task */}
      <Link href="/checkin" className="block">
        <motion.div
           whileTap={{ scale: 0.98 }}
           className={`p-4 border transition-all ${
             hasCheckedInToday
               ? "border-border bg-foreground/[0.02]"
               : "border-foreground bg-background shadow-[2px_2px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_rgba(255,255,255,1)]"
           }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${
              hasCheckedInToday ? "border-foreground bg-foreground text-background" : "border-foreground/50"
            }`}>
              {hasCheckedInToday && <Check size={14} strokeWidth={3} />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${hasCheckedInToday ? "line-through opacity-50" : ""}`}>
                記錄今天的身體狀態
              </p>
              {hasCheckedInToday ? (
                <p className="text-xs text-muted-foreground mt-0.5">
                  睡眠 {todayCheckin?.sleepQuality} · 精力 {todayCheckin?.energyLevel} · 專注 {todayCheckin?.focusLevel}
                </p>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-xs text-foreground font-medium bg-foreground/10 px-2 py-0.5 rounded-sm w-fit">
                     30 秒
                   </p>
                   <p className="text-[10px] text-muted-foreground">點擊前往打卡</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </Link>

      {/* 2. Interactive Local Tasks */}
      {tasks.map(task => (
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
            <div className={`w-6 h-6 shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${
              task.checked ? "border-foreground bg-foreground text-background" : "border-border"
            }`}>
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
    caffeine: "咖啡因",
    theanine: "L-茶氨酸",
  };
  return map[id] || id;
}
