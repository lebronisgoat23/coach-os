"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const FEATURES = [
  {
    emoji: "📋",
    title: "30 秒記錄你的感受",
    description: "不需要穿戴裝置。每天記錄睡眠、精力、專注力等 6 個維度，App 幫你追蹤趨勢",
  },
  {
    emoji: "🧬",
    title: "自動分析哪些補給品有效",
    description: "連續記錄 7 天，Alpha 引擎自動比對：吃魚油的日子，你的精力真的比較好嗎？",
  },
  {
    emoji: "🔔",
    title: "不會忘記吃",
    description: "早上、午餐後、睡前 — 設定提醒，到時間 App 提醒你該吃什麼補給品",
  },
  {
    emoji: "🏆",
    title: "養成習慣像打遊戲",
    description: "打卡升級、成就解鎖、連續天數排行 — 不知不覺就堅持 30 天了",
  },
];

const STATS = [
  { value: "30 秒", label: "每日記錄" },
  { value: "7 天", label: "看到趨勢" },
  { value: "$0", label: "完全免費" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-purple-500/[0.06] blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-blue-500/[0.06] blur-[150px] animate-pulse" />
        <div className="absolute top-[30%] left-[40%] w-[50%] h-[50%] rounded-full bg-emerald-500/[0.04] blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
          className="text-7xl mb-6"
        >
          🧬
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent"
        >
          Vitrion
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg text-muted-foreground mt-3 max-w-md"
        >
          AI 個人化營養與狀態管家
          <br />
          <span className="text-sm">你吃的保健品，真的有效嗎？讓數據告訴你答案</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 mt-10"
        >
          <Link
            href="/auth"
            className="px-8 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            開始冒險 →
          </Link>
          <Link
            href="/"
            className="px-8 py-3.5 rounded-2xl text-sm font-semibold bg-secondary/50 hover:bg-secondary border border-border/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            體驗 Demo
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, y: [0, 8, 0] }}
          transition={{ delay: 2, duration: 2, repeat: Infinity }}
          className="absolute bottom-8 text-muted-foreground text-xs"
        >
          ↓ 了解更多
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-y border-border/30 bg-card/50 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-8 flex justify-around">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tabular-nums">
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-2xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-black">不再瞎猜，用數據說話</h2>
          <p className="text-sm text-muted-foreground mt-2">
            台灣人每年花 1400 億買保健品 — 但你知道哪些真的適合你嗎？
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-card/60 border border-border/30 backdrop-blur-xl hover:border-border/60 transition-colors group"
            >
              <span className="text-3xl group-hover:scale-110 inline-block transition-transform">
                {feature.emoji}
              </span>
              <h3 className="text-sm font-bold mt-3">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-2xl px-4 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-black">三步開始</h2>
        </motion.div>

        <div className="flex flex-col gap-6">
          {[
            { step: "01", title: "選補給品", desc: "從 12 種常見保健品中，勾選你正在吃的" },
            { step: "02", title: "每天記錄", desc: "30 秒記錄身體感受 + 吃完打勾，就這樣" },
            { step: "03", title: "看結果", desc: "7 天後 Alpha 引擎自動告訴你：哪些有效、哪些沒感覺" },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex items-start gap-4"
            >
              <span className="text-3xl font-black bg-gradient-to-b from-purple-400 to-blue-400 bg-clip-text text-transparent tabular-nums shrink-0 w-12">
                {item.step}
              </span>
              <div>
                <h3 className="text-sm font-bold">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-2xl px-4 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-emerald-500/10 border border-border/30"
        >
          <h2 className="text-xl font-black">準備好了嗎？</h2>
          <p className="text-sm text-muted-foreground mt-2">
            免費開始，你的營養冒險
          </p>
          <Link
            href="/auth"
            className="inline-block mt-6 px-10 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            創建角色 →
          </Link>
        </motion.div>

        <p className="text-[9px] text-muted-foreground/40 mt-8 leading-relaxed">
          ⚠️ 本系統呈現的數據為「狀態增益」與「數據相關性」分析結果，
          不構成任何形式的醫療診斷或治療建議。
        </p>
      </section>
    </div>
  );
}
