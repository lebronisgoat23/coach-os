"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RARITY_CONFIG, type Achievement } from "@/lib/achievements";

interface Props {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementUnlockOverlay({ achievement, onDismiss }: Props) {
  if (!achievement) return null;

  const rarity = RARITY_CONFIG[achievement.rarity];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-72 rounded-3xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden"
        >
          {/* Rarity gradient header */}
          <div className={`h-2 bg-gradient-to-r ${rarity.gradient}`} />

          <div className="p-6 text-center space-y-3">
            {/* Particle bg animation */}
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 0.6 }}
                className="text-6xl"
              >
                {achievement.emoji}
              </motion.div>

              {/* Sparkle particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i / 6) * Math.PI * 2) * 60,
                    y: Math.sin((i / 6) * Math.PI * 2) * 60,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.3 + i * 0.1,
                    ease: "easeOut",
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-amber-400"
                />
              ))}
            </div>

            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[11px] text-amber-400 font-medium uppercase tracking-wider"
              >
                🏆 成就解鎖
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold mt-1"
              >
                {achievement.name}
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground"
            >
              {achievement.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-3"
            >
              <span className={`text-xs font-bold bg-gradient-to-r ${rarity.gradient} bg-clip-text text-transparent`}>
                {rarity.label}
              </span>
              <span className="text-xs text-amber-400 font-bold">
                +{achievement.xpReward} XP
              </span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDismiss}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-500 text-white text-sm font-bold mt-2"
            >
              太棒了！ 🎉
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
