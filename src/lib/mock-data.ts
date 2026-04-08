import type { UserStatus, DailyQuest, ActiveBuff } from "./types";

// ============================================================
// Mock User Status — Demo RPG Stats
// ============================================================
export const MOCK_USER_STATUS: UserStatus = {
  userId: "demo-user-001",
  currentStr: 72,
  currentVit: 85,
  currentAgi: 63,
  level: 7,
  xp: 340,
  xpToNext: 500,
  title: "健康探索者",
};

// ============================================================
// Mock Daily Quests — Today's Supplement Stack
// ============================================================
export const MOCK_DAILY_QUESTS: DailyQuest[] = [
  {
    id: "q1",
    userId: "demo-user-001",
    questDate: new Date().toISOString().split("T")[0],
    itemName: "魚油",
    itemEmoji: "🐟",
    dose: "1000mg × 2",
    isCompleted: false,
    completedAt: null,
    xpReward: 15,
    buffType: "VIT",
    buffValue: 5,
  },
  {
    id: "q2",
    userId: "demo-user-001",
    questDate: new Date().toISOString().split("T")[0],
    itemName: "維生素 D3",
    itemEmoji: "☀️",
    dose: "2000 IU",
    isCompleted: false,
    completedAt: null,
    xpReward: 10,
    buffType: "VIT",
    buffValue: 3,
  },
  {
    id: "q3",
    userId: "demo-user-001",
    questDate: new Date().toISOString().split("T")[0],
    itemName: "鎂",
    itemEmoji: "🌙",
    dose: "400mg",
    isCompleted: false,
    completedAt: null,
    xpReward: 12,
    buffType: "AGI",
    buffValue: 4,
  },
  {
    id: "q4",
    userId: "demo-user-001",
    questDate: new Date().toISOString().split("T")[0],
    itemName: "肌酸",
    itemEmoji: "💪",
    dose: "5g",
    isCompleted: false,
    completedAt: null,
    xpReward: 15,
    buffType: "STR",
    buffValue: 6,
  },
  {
    id: "q5",
    userId: "demo-user-001",
    questDate: new Date().toISOString().split("T")[0],
    itemName: "益生菌",
    itemEmoji: "🦠",
    dose: "1 顆",
    isCompleted: false,
    completedAt: null,
    xpReward: 10,
    buffType: "VIT",
    buffValue: 3,
  },
];

// ============================================================
// Mock Active Buffs — From completed supplement correlations
// Compliance: Uses "增益 Buff" language, NEVER medical terms
// ============================================================
export const MOCK_ACTIVE_BUFFS: ActiveBuff[] = [
  {
    id: "buff-1",
    sourceName: "魚油",
    sourceEmoji: "🐟",
    statType: "VIT",
    percentage: 5,
    displayText: "魚油可能有助於改善體力恢復",
  },
  {
    id: "buff-2",
    sourceName: "肌酸",
    sourceEmoji: "💪",
    statType: "STR",
    percentage: 8,
    displayText: "肌酸可能有助於提升力量表現",
  },
];
