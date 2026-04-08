"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary/50 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-sm hover:bg-secondary transition-colors overflow-hidden"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.span
        key={theme}
        initial={{ y: -20, opacity: 0, rotate: -90 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 20, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? "🌙" : "☀️"}
      </motion.span>
    </motion.button>
  );
}
