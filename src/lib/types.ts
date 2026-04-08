// ============================================================
// Vitrion Core Type Definitions
// ============================================================

export type StatType = "STR" | "VIT" | "AGI";
export type BuffType = StatType;

export interface UserStatus {
  userId: string;
  currentStr: number;
  currentVit: number;
  currentAgi: number;
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
}

export interface DailyQuest {
  id: string;
  userId: string;
  questDate: string; // ISO date string YYYY-MM-DD
  itemName: string;
  itemEmoji: string;
  dose: string;
  isCompleted: boolean;
  completedAt: string | null;
  xpReward: number;
  buffType: BuffType | null;
  buffValue: number;
}

export interface BiometricRaw {
  id: string;
  userId: string;
  recordedAt: string; // ISO timestamp
  metricType: MetricType;
  value: number;
  source: string;
}

export type MetricType =
  | "HRV"
  | "RESTING_HR"
  | "SLEEP_SCORE"
  | "DEEP_SLEEP_MIN"
  | "REM_SLEEP_MIN"
  | "READINESS_SCORE"
  | "ACTIVITY_SCORE"
  | "STRESS_LEVEL"
  | "SPO2"
  | "BODY_TEMP_DELTA"
  | "STEPS"
  | "CALORIES_ACTIVE";

export type ConfounderTag =
  | "SICK"
  | "ALCOHOL"
  | "ALL_NIGHTER"
  | "JET_LAG"
  | "MEDICATION"
  | "HIGH_STRESS"
  | "INJURY"
  | "MENSTRUAL"
  | "FASTING"
  | "TRAVEL";

export interface Confounder {
  id: string;
  userId: string;
  recordedAt: string;
  tag: ConfounderTag;
  severity: number; // 1-5
  note: string | null;
  durationH: number | null;
}

// ============================================================
// Stat Display Config — maps StatType to visual properties
// ============================================================
export interface StatConfig {
  key: StatType;
  label: string;
  labelEn: string;
  icon: string;
  description: string;
  colorFrom: string; // gradient start (Tailwind class)
  colorTo: string;   // gradient end
  colorText: string;
}

export const STAT_CONFIGS: Record<StatType, StatConfig> = {
  STR: {
    key: "STR",
    label: "力量",
    labelEn: "STR",
    icon: "⚔️",
    description: "訓練表現與肌肉恢復",
    colorFrom: "from-red-500",
    colorTo: "to-orange-400",
    colorText: "text-red-400",
  },
  VIT: {
    key: "VIT",
    label: "體力",
    labelEn: "VIT",
    icon: "💚",
    description: "深度睡眠與身體恢復力",
    colorFrom: "from-emerald-500",
    colorTo: "to-green-400",
    colorText: "text-emerald-400",
  },
  AGI: {
    key: "AGI",
    label: "敏捷",
    labelEn: "AGI",
    icon: "⚡",
    description: "專注力與認知清晰度",
    colorFrom: "from-blue-500",
    colorTo: "to-cyan-400",
    colorText: "text-blue-400",
  },
};

// ============================================================
// Active Buff — displayed when supplement has proven correlation
// ============================================================
export interface ActiveBuff {
  id: string;
  sourceName: string;  // e.g. "魚油"
  sourceEmoji: string;
  statType: BuffType;
  percentage: number;  // e.g. 5 means +5%
  // Compliance: NEVER use medical terms. Always "增益" not "治療"
  displayText: string; // e.g. "VIT (體力恢復) 獲得 +5% 增益"
}

// ============================================================
// Daily Check-In — subjective self-reported data (no wearable needed)
// ============================================================
export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string;           // YYYY-MM-DD
  sleepQuality: number;   // 1-5 (很差 → 很好)
  energyLevel: number;    // 1-5
  focusLevel: number;     // 1-5
  stressLevel: number;    // 1-5 (低壓 → 高壓, inverted for health)
  bodyFeeling: number;    // 1-5 (很差 → 很好)
  mood: number;           // 1-5
  note: string | null;    // 簡短備註
  createdAt: string;      // ISO timestamp
}

export type CheckInDimension = {
  key: keyof Pick<DailyCheckIn, "sleepQuality" | "energyLevel" | "focusLevel" | "stressLevel" | "bodyFeeling" | "mood">;
  label: string;
  emoji: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  statType: StatType;     // which RPG stat it feeds into
};

export const CHECKIN_DIMENSIONS: CheckInDimension[] = [
  {
    key: "sleepQuality",
    label: "睡眠",
    emoji: "",
    description: "昨晚睡得好嗎？",
    lowLabel: "很差",
    highLabel: "很好",
    statType: "VIT",
  },
  {
    key: "energyLevel",
    label: "精力",
    emoji: "",
    description: "今天有精神嗎？",
    lowLabel: "很累",
    highLabel: "滿滿的",
    statType: "STR",
  },
  {
    key: "focusLevel",
    label: "專注力",
    emoji: "",
    description: "能不能集中注意力？",
    lowLabel: "很分散",
    highLabel: "很專注",
    statType: "AGI",
  },
  {
    key: "stressLevel",
    label: "壓力",
    emoji: "",
    description: "今天壓力大嗎？",
    lowLabel: "很放鬆",
    highLabel: "壓力很大",
    statType: "VIT",
  },
  {
    key: "bodyFeeling",
    label: "身體",
    emoji: "",
    description: "身體有沒有哪裡不舒服？",
    lowLabel: "不太舒服",
    highLabel: "很舒服",
    statType: "STR",
  },
  {
    key: "mood",
    label: "心情",
    emoji: "",
    description: "今天心情怎樣？",
    lowLabel: "不太好",
    highLabel: "很好",
    statType: "AGI",
  },
];
