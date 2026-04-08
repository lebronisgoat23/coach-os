// ============================================================
// Vitrion Achievement System
// ============================================================

export type AchievementCategory = "streak" | "milestone" | "explorer" | "mastery";
export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  condition: string;          // human-readable unlock condition
  xpReward: number;
  unlockedAt: string | null;  // ISO timestamp, null = locked
}

// Rarity visual config
export const RARITY_CONFIG: Record<AchievementRarity, {
  label: string;
  gradient: string;
  border: string;
  glow: string;
  textColor: string;
}> = {
  common: {
    label: "普通",
    gradient: "from-zinc-400 to-zinc-500",
    border: "border-zinc-400/30",
    glow: "",
    textColor: "text-zinc-400",
  },
  rare: {
    label: "稀有",
    gradient: "from-blue-400 to-cyan-400",
    border: "border-blue-400/30",
    glow: "shadow-blue-500/20",
    textColor: "text-blue-400",
  },
  epic: {
    label: "史詩",
    gradient: "from-purple-400 to-pink-400",
    border: "border-purple-400/30",
    glow: "shadow-purple-500/20",
    textColor: "text-purple-400",
  },
  legendary: {
    label: "傳說",
    gradient: "from-amber-400 to-orange-400",
    border: "border-amber-400/30",
    glow: "shadow-amber-500/30",
    textColor: "text-amber-400",
  },
};

// All achievements catalog
export const ACHIEVEMENTS_CATALOG: Omit<Achievement, "unlockedAt">[] = [
  // ── Streak ────────────────────────────
  {
    id: "streak-3",
    name: "初心者",
    description: "連續打卡 3 天",
    emoji: "🌱",
    category: "streak",
    rarity: "common",
    condition: "streak >= 3",
    xpReward: 30,
  },
  {
    id: "streak-7",
    name: "持之以恆",
    description: "連續打卡 7 天",
    emoji: "🔥",
    category: "streak",
    rarity: "common",
    condition: "streak >= 7",
    xpReward: 50,
  },
  {
    id: "streak-14",
    name: "兩週戰士",
    description: "連續打卡 14 天",
    emoji: "⚔️",
    category: "streak",
    rarity: "rare",
    condition: "streak >= 14",
    xpReward: 100,
  },
  {
    id: "streak-30",
    name: "鐵壁守護",
    description: "連續打卡 30 天",
    emoji: "🛡️",
    category: "streak",
    rarity: "epic",
    condition: "streak >= 30",
    xpReward: 200,
  },
  {
    id: "streak-100",
    name: "不滅傳說",
    description: "連續打卡 100 天",
    emoji: "👑",
    category: "streak",
    rarity: "legendary",
    condition: "streak >= 100",
    xpReward: 500,
  },

  // ── Milestone ─────────────────────────
  {
    id: "first-checkin",
    name: "冒險開始",
    description: "完成第一次補給品打卡",
    emoji: "🎯",
    category: "milestone",
    rarity: "common",
    condition: "total_checkins >= 1",
    xpReward: 20,
  },
  {
    id: "checkins-50",
    name: "半百之路",
    description: "累計完成 50 次打卡",
    emoji: "🏅",
    category: "milestone",
    rarity: "rare",
    condition: "total_checkins >= 50",
    xpReward: 80,
  },
  {
    id: "checkins-200",
    name: "堅毅冒險者",
    description: "累計完成 200 次打卡",
    emoji: "🏆",
    category: "milestone",
    rarity: "epic",
    condition: "total_checkins >= 200",
    xpReward: 150,
  },
  {
    id: "level-5",
    name: "嶄露頭角",
    description: "達到等級 5",
    emoji: "⭐",
    category: "milestone",
    rarity: "common",
    condition: "level >= 5",
    xpReward: 40,
  },
  {
    id: "level-10",
    name: "十全十美",
    description: "達到等級 10",
    emoji: "🌟",
    category: "milestone",
    rarity: "rare",
    condition: "level >= 10",
    xpReward: 100,
  },

  // ── Explorer ──────────────────────────
  {
    id: "stack-5",
    name: "收藏家",
    description: "裝備欄添加 5 種補給品",
    emoji: "💊",
    category: "explorer",
    rarity: "common",
    condition: "stack_count >= 5",
    xpReward: 30,
  },
  {
    id: "wearable-connect",
    name: "科技先驅",
    description: "連接穿戴裝置",
    emoji: "⌚",
    category: "explorer",
    rarity: "rare",
    condition: "wearable_connected",
    xpReward: 60,
  },
  {
    id: "csv-export",
    name: "數據分析師",
    description: "匯出 CSV 數據報告",
    emoji: "📊",
    category: "explorer",
    rarity: "common",
    condition: "exported_csv",
    xpReward: 25,
  },
  {
    id: "dark-mode-toggle",
    name: "暗影行者",
    description: "切換到暗色模式",
    emoji: "🌙",
    category: "explorer",
    rarity: "common",
    condition: "theme_toggled",
    xpReward: 15,
  },

  // ── Mastery ───────────────────────────
  {
    id: "all-stats-70",
    name: "均衡發展",
    description: "三項屬性皆達到 70",
    emoji: "⚖️",
    category: "mastery",
    rarity: "epic",
    condition: "str >= 70 && vit >= 70 && agi >= 70",
    xpReward: 200,
  },
  {
    id: "perfect-day",
    name: "完美一天",
    description: "單日完成所有補給品打卡",
    emoji: "✨",
    category: "mastery",
    rarity: "rare",
    condition: "all_quests_completed_today",
    xpReward: 80,
  },
  {
    id: "alpha-buff",
    name: "Alpha 覺醒",
    description: "獲得第一個 Alpha 增益效果",
    emoji: "🧬",
    category: "mastery",
    rarity: "epic",
    condition: "has_active_buff",
    xpReward: 120,
  },
];
