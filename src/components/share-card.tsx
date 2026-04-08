"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ShareCardProps {
  userName: string;
  level: number;
  title: string;
  str: number;
  vit: number;
  agi: number;
  streak: number;
  achievementCount: number;
}

export function ShareCard({
  userName,
  level,
  title,
  str,
  vit,
  agi,
  streak,
  achievementCount,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName} 的 Vitrion 冒險者卡片`,
          text: `🧬 Lv.${level} ${title}\n⚔️ STR ${str} | 💚 VIT ${vit} | ⚡ AGI ${agi}\n🔥 連續打卡 ${streak} 天 | 🏆 ${achievementCount} 成就\n\n加入 Vitrion，開始你的營養冒險！`,
          url: window.location.origin,
        });
        toast.success("🔗 已分享！");
        return;
      } catch {
        // User cancelled or API failed, fallback to clipboard
      }
    }

    // Fallback: copy text to clipboard
    const text = `🧬 ${userName} — Vitrion 冒險者卡片\nLv.${level} ${title}\n⚔️ STR ${str} | 💚 VIT ${vit} | ⚡ AGI ${agi}\n🔥 連續打卡 ${streak} 天 | 🏆 ${achievementCount} 成就\n\n${window.location.origin}`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success("📋 卡片資訊已複製到剪貼簿");
    } catch {
      toast.error("複製失敗，請手動複製");
    }
  }, [userName, level, title, str, vit, agi, streak, achievementCount]);

  return (
    <div className="space-y-3">
      {/* Card Preview */}
      <div
        ref={cardRef}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1025] via-[#0d1117] to-[#0a1628] p-5 border border-purple-500/20"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px]" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[50px]" />

        {/* Header */}
        <div className="relative flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 flex items-center justify-center text-xl shadow-lg">
            🧬
          </div>
          <div>
            <p className="text-sm font-bold text-white">{userName}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                Lv. {level}
              </span>
              <span className="text-[10px] text-zinc-400">{title}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-2 mb-4">
          <StatBar label="STR" value={str} color="from-red-500 to-orange-400" />
          <StatBar label="VIT" value={vit} color="from-emerald-500 to-green-400" />
          <StatBar label="AGI" value={agi} color="from-blue-500 to-cyan-400" />
        </div>

        {/* Footer stats */}
        <div className="relative flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-400">
              🔥 <span className="text-orange-400 font-bold">{streak}</span> 天
            </span>
            <span className="text-[11px] text-zinc-400">
              🏆 <span className="text-amber-400 font-bold">{achievementCount}</span> 成就
            </span>
          </div>
          <span className="text-[9px] text-zinc-600 font-medium">
            VITRION
          </span>
        </div>
      </div>

      {/* Share Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleShare}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-emerald-500 text-white text-sm font-bold"
      >
        📤 分享冒險者卡片
      </motion.button>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 font-medium">{label}</span>
        <span className="text-[10px] text-white font-bold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
}
