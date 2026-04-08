"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// Particle — Single floating particle for celebration effect
// ============================================================
function Particle({ delay, emoji }: { delay: number; emoji: string }) {
  const randomX = Math.random() * 200 - 100;
  const randomRotate = Math.random() * 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, x: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -80, -160, -220],
        x: [0, randomX * 0.5, randomX, randomX * 0.8],
        scale: [0, 1.2, 1, 0.6],
        rotate: [0, randomRotate],
      }}
      transition={{
        duration: 2.5,
        delay,
        ease: "easeOut",
      }}
      className="absolute text-2xl pointer-events-none"
    >
      {emoji}
    </motion.div>
  );
}

const CELEBRATION_EMOJIS = ["✨", "⭐", "🌟", "💫", "🎉", "🎊", "🏆", "⚡", "💪", "🔥"];

// ============================================================
// Level Up Modal — Full-screen celebration overlay
// ============================================================
export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  newTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newTitle: string;
}) {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowParticles(true);
      const timer = setTimeout(() => onClose(), 4500);
      return () => clearTimeout(timer);
    }
    setShowParticles(false);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -30 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            className="relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Particles */}
            {showParticles && (
              <div className="absolute inset-0 flex items-center justify-center">
                {CELEBRATION_EMOJIS.map((emoji, i) => (
                  <Particle key={i} delay={i * 0.1} emoji={emoji} />
                ))}
                {CELEBRATION_EMOJIS.map((emoji, i) => (
                  <Particle key={`b-${i}`} delay={0.5 + i * 0.08} emoji={emoji} />
                ))}
              </div>
            )}

            {/* Glow ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 1.2],
                opacity: [0, 0.8, 0.4],
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-amber-400/30 via-yellow-400/20 to-orange-400/30 blur-xl"
            />

            {/* Level badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.3,
              }}
              className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/40"
            >
              <div className="w-24 h-24 rounded-full bg-background flex flex-col items-center justify-center">
                <span className="text-[10px] text-amber-400 font-bold tracking-widest">
                  LV.
                </span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 400 }}
                  className="text-3xl font-black text-amber-400 tabular-nums"
                >
                  {newLevel}
                </motion.span>
              </div>
            </motion.div>

            {/* LEVEL UP text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 mt-6 text-center"
            >
              <h2 className="text-2xl font-black tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                LEVEL UP!
              </h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-muted-foreground mt-2"
              >
                恭喜！你已達到
              </motion.p>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="text-lg font-bold text-amber-400 mt-1"
              >
                「{newTitle}」
              </motion.p>
            </motion.div>

            {/* Dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 2.5 }}
              className="relative z-10 text-[10px] text-muted-foreground mt-8"
            >
              點擊任意處繼續
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
