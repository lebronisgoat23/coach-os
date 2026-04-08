"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import type { DailyQuest, BuffType } from "@/lib/types";
import { Plus, X, ChevronDown } from "lucide-react";

// ============================================================
// Supplement template catalog
// ============================================================
interface SupplementTemplate {
  name: string;
  emoji: string;
  defaultDose: string;
  defaultBuff: BuffType;
  defaultBuffValue: number;
  defaultXp: number;
  category: string;
  dosageRange: string;
  source: string;
  brand?: string;
}

const SUPPLEMENT_CATALOG: SupplementTemplate[] = [
  { name: "魚油",             emoji: "🐟", defaultDose: "1000mg × 2", defaultBuff: "VIT", defaultBuffValue: 5, defaultXp: 15, category: "基礎", dosageRange: "1000-3000mg EPA+DHA/天", source: "NIH ODS" },
  { name: "維生素 D3",         emoji: "☀️", defaultDose: "2000 IU",    defaultBuff: "VIT", defaultBuffValue: 3, defaultXp: 10, category: "基礎", dosageRange: "1000-4000 IU/天", source: "NIH ODS" },
  { name: "鎂",               emoji: "🌙", defaultDose: "400mg",      defaultBuff: "AGI", defaultBuffValue: 4, defaultXp: 12, category: "基礎", dosageRange: "200-400mg/天", source: "NIH ODS" },
  { name: "肌酸",             emoji: "💪", defaultDose: "5g",         defaultBuff: "STR", defaultBuffValue: 6, defaultXp: 15, category: "體能", dosageRange: "3-5g/天", source: "ISSN" },
  { name: "益生菌",           emoji: "🦠", defaultDose: "1 顆",      defaultBuff: "VIT", defaultBuffValue: 3, defaultXp: 10, category: "消化", dosageRange: "10-100億 CFU/天", source: "WGO" },
  { name: "鋅",               emoji: "⚡", defaultDose: "15mg",       defaultBuff: "STR", defaultBuffValue: 3, defaultXp: 10, category: "免疫", dosageRange: "8-40mg/天", source: "NIH ODS" },
  { name: "B群",              emoji: "🧠", defaultDose: "1 錠",      defaultBuff: "AGI", defaultBuffValue: 5, defaultXp: 12, category: "認知", dosageRange: "依 B群成分而異", source: "NIH ODS" },
  { name: "膠原蛋白",         emoji: "✨", defaultDose: "10g",        defaultBuff: "VIT", defaultBuffValue: 2, defaultXp: 8,  category: "修復", dosageRange: "5-15g/天", source: "Examine" },
  { name: "左旋肉鹼",         emoji: "🔥", defaultDose: "500mg",      defaultBuff: "STR", defaultBuffValue: 4, defaultXp: 12, category: "體能", dosageRange: "500-2000mg/天", source: "Examine" },
  { name: "NAC",              emoji: "🛡️", defaultDose: "600mg",      defaultBuff: "VIT", defaultBuffValue: 4, defaultXp: 12, category: "抗氧化", dosageRange: "600-1200mg/天", source: "Examine" },
  { name: "薑黃素",           emoji: "🟡", defaultDose: "500mg",      defaultBuff: "VIT", defaultBuffValue: 3, defaultXp: 10, category: "抗氧化", dosageRange: "500-1500mg/天", source: "Examine" },
  { name: "南非醉茄",         emoji: "🌿", defaultDose: "300mg",      defaultBuff: "AGI", defaultBuffValue: 5, defaultXp: 12, category: "適應原", dosageRange: "300-600mg/天", source: "Examine" },
];

export function StackEditor({
  currentStack,
  onAdd,
  onRemove,
}: {
  currentStack: DailyQuest[];
  onAdd: (template: SupplementTemplate) => void;
  onRemove: (questId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const [customName, setCustomName] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [customDose, setCustomDose] = useState("");
  const [customBuff] = useState<BuffType>("VIT");

  const currentNames = new Set(currentStack.map((q) => q.itemName));
  const categories = ["all", ...new Set(SUPPLEMENT_CATALOG.map((s) => s.category))];

  const filteredCatalog = SUPPLEMENT_CATALOG.filter(
    (s) => filter === "all" || s.category === filter
  );

  const handleCustomAdd = useCallback(() => {
    if (!customName.trim()) {
      toast.error("請輸入名稱");
      return;
    }
    if (!customDose.trim()) {
      toast.error("請輸入劑量");
      return;
    }

    const displayName = customBrand.trim()
      ? `${customName.trim()} (${customBrand.trim()})`
      : customName.trim();

    const template: SupplementTemplate = {
      name: displayName,
      emoji: "💊",
      defaultDose: customDose.trim(),
      defaultBuff: customBuff,
      defaultBuffValue: 3,
      defaultXp: 10,
      category: "自訂",
      dosageRange: "自訂劑量",
      source: "自行輸入",
      brand: customBrand.trim() || undefined,
    };

    onAdd(template);
    toast.success(`已加入「${displayName}」`);

    setCustomName("");
    setCustomBrand("");
    setCustomDose("");
    setShowCustomForm(false);
  }, [customName, customBrand, customDose, customBuff, onAdd]);

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold">正在吃的營養品</h2>
          <p className="text-xs text-muted-foreground">共 {currentStack.length} 項</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowCustomForm(!showCustomForm); setIsOpen(false); }}
            className="text-xs font-medium px-3 py-1.5 border border-border hover:border-foreground transition-colors flex items-center gap-1"
          >
            <Plus size={14} />
            自訂
          </button>
          <button
            onClick={() => { setIsOpen(!isOpen); setShowCustomForm(false); }}
            className="text-xs font-medium px-3 py-1.5 border border-foreground bg-foreground text-background transition-colors flex items-center gap-1"
          >
            常見品項
            <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Current stack list */}
      <div className="space-y-0">
        <AnimatePresence mode="popLayout">
          {currentStack.map((quest) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center justify-between py-3 border-b border-border/40"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{quest.itemName}</p>
                <p className="text-xs text-muted-foreground">{quest.dose}</p>
              </div>
              
              <button
                onClick={() => onRemove(quest.id)}
                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                aria-label={`移除 ${quest.itemName}`}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Custom supplement form */}
      <AnimatePresence>
        {showCustomForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border border-border p-4 space-y-3">
              <p className="text-xs font-bold">加入自訂營養品</p>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">名稱</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="例：葉黃素、CoQ10、蝦紅素..."
                    className="w-full px-3 py-2 bg-foreground/[0.03] border border-border text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">
                    品牌 <span className="text-muted-foreground/40">(選填)</span>
                  </label>
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="例：NOW Foods、大研生醫、DHC..."
                    className="w-full px-3 py-2 bg-foreground/[0.03] border border-border text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">劑量</label>
                  <input
                    type="text"
                    value={customDose}
                    onChange={(e) => setCustomDose(e.target.value)}
                    placeholder="例：500mg、1 顆..."
                    className="w-full px-3 py-2 bg-foreground/[0.03] border border-border text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <button
                onClick={handleCustomAdd}
                className="w-full py-2.5 bg-foreground text-background text-xs font-bold transition-all"
              >
                加入
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catalog selector */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border border-border p-4 space-y-3">
              <p className="text-xs font-bold">常見營養品</p>

              {/* Category filter */}
              <div className="flex gap-1.5 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`text-[10px] px-2.5 py-1 font-medium transition-all ${
                      filter === cat
                        ? "bg-foreground text-background"
                        : "bg-foreground/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat === "all" ? "全部" : cat}
                  </button>
                ))}
              </div>

              {/* Supplement grid */}
              <div className="grid grid-cols-1 gap-1">
                {filteredCatalog.map((supp) => {
                  const isAdded = currentNames.has(supp.name);
                  return (
                    <button
                      key={supp.name}
                      onClick={() => !isAdded && onAdd(supp)}
                      disabled={isAdded}
                      className={`flex items-center justify-between p-3 text-left transition-all ${
                        isAdded
                          ? "opacity-30 cursor-not-allowed"
                          : "hover:bg-foreground/[0.03] cursor-pointer"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium">{supp.name}</p>
                        <p className="text-[10px] text-muted-foreground">{supp.defaultDose} · {supp.dosageRange}</p>
                      </div>
                      {isAdded ? (
                        <span className="text-[10px] text-muted-foreground">已加入</span>
                      ) : (
                        <Plus size={14} className="text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type { SupplementTemplate };
