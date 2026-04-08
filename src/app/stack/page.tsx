"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { StackEditor, type SupplementTemplate } from "@/components/vitrion/stack-editor";
import { MOCK_DAILY_QUESTS } from "@/lib/mock-data";
import type { DailyQuest } from "@/lib/types";

export default function StackPage() {
  const [quests, setQuests] = useState<DailyQuest[]>(MOCK_DAILY_QUESTS);
  const counter = useRef(200);

  const handleAdd = useCallback((template: SupplementTemplate) => {
    counter.current += 1;
    const q: DailyQuest = {
      id: `stack-${counter.current}`,
      userId: "user-001",
      questDate: new Date().toISOString().split("T")[0],
      itemName: template.name,
      itemEmoji: template.emoji,
      dose: template.defaultDose,
      isCompleted: false,
      completedAt: null,
      xpReward: template.defaultXp,
      buffType: template.defaultBuff,
      buffValue: template.defaultBuffValue,
    };
    setQuests((prev) => [...prev, q]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  }, []);

  return (
    <div className="relative min-h-screen bg-background">
      <header className="relative z-10 border-b border-border/30 bg-background/95 backdrop-blur-xl sticky top-0">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <h1 className="text-lg font-bold">我的營養品</h1>
          <p className="text-xs text-muted-foreground">管理你目前在吃的營養品</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-6 space-y-6 pb-28">
        <StackEditor
          currentStack={quests}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 border border-border text-center space-y-1">
            <span className="text-2xl font-bold">{quests.length}</span>
            <p className="text-xs text-muted-foreground">正在吃的</p>
          </div>
          <div className="p-4 border border-border text-center space-y-1">
            <span className="text-2xl font-bold">{quests.filter(q => q.isCompleted).length}</span>
            <p className="text-xs text-muted-foreground">今天已服用</p>
          </div>
        </div>
      </main>
    </div>
  );
}
