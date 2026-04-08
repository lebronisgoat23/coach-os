"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useDailyCheckIn } from "@/hooks/use-daily-checkin";
import { CHECKIN_DIMENSIONS } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function CheckInPage() {
  const router = useRouter();
  const { hasCheckedInToday, todayCheckin, submitCheckIn } = useDailyCheckIn();

  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>(() => {
    if (todayCheckin) {
      return {
        sleepQuality: todayCheckin.sleepQuality,
        energyLevel: todayCheckin.energyLevel,
        focusLevel: todayCheckin.focusLevel,
        stressLevel: todayCheckin.stressLevel,
        bodyFeeling: todayCheckin.bodyFeeling,
        mood: todayCheckin.mood,
      } as Record<string, number>;
    }
    return {} as Record<string, number>;
  });
  const [note, setNote] = useState(todayCheckin?.note || "");
  const [submitted, setSubmitted] = useState(false);

  const currentDim = step < CHECKIN_DIMENSIONS.length ? CHECKIN_DIMENSIONS[step] : null;
  const totalSteps = CHECKIN_DIMENSIONS.length + 1;

  const handleScore = (value: number) => {
    if (!currentDim) return;
    setScores((prev) => ({ ...prev, [currentDim.key]: value }));
    setTimeout(() => setStep((s) => s + 1), 300);
  };

  const handleSubmit = () => {
    submitCheckIn({
      sleepQuality: scores.sleepQuality ?? 3,
      energyLevel: scores.energyLevel ?? 3,
      focusLevel: scores.focusLevel ?? 3,
      stressLevel: scores.stressLevel ?? 3,
      bodyFeeling: scores.bodyFeeling ?? 3,
      mood: scores.mood ?? 3,
      note: note.trim() || null,
    });
    setSubmitted(true);
  };

  // Success screen
  if (submitted) {
    return (
      <div className="relative min-h-[100dvh] flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-8 text-center"
        >
          <div className="w-14 h-14 border-2 border-foreground mx-auto flex items-center justify-center font-mono text-lg">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">紀錄完成！</h2>
            <p className="text-sm text-muted-foreground">
              今天的感受已經記下來了，持續追蹤才看得出變化。
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              className="w-full py-4 bg-foreground text-background text-sm font-bold tracking-wide transition-opacity hover:opacity-90"
            >
              回到首頁
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/insights")}
              className="w-full py-4 text-foreground text-sm font-medium border border-border hover:border-foreground transition-colors"
            >
              看看趨勢分析
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <main className="relative z-10 mx-auto max-w-md px-4 py-8 space-y-6 pb-24">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-lg font-bold">
            {hasCheckedInToday ? "更新今天的紀錄" : "今天感覺怎樣？"}
          </h1>
          <p className="text-xs text-muted-foreground">
            不用穿戴裝置，30 秒就好
          </p>
        </div>

        {/* Progress bar - thicker and more visible */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 overflow-hidden bg-border/60 rounded-full"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }}
                className="h-full bg-foreground rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {currentDim ? (
            <motion.div
              key={currentDim.key}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-border bg-card/80 backdrop-blur-xl shadow-none">
                <CardContent className="pt-10 pb-8 text-center space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">{currentDim.label}</h2>
                    <p className="text-sm text-muted-foreground">
                      {currentDim.description}
                    </p>
                  </div>

                  {/* Rating buttons - bigger touch targets */}
                  <div className="flex justify-between gap-2 px-2">
                    {[1, 2, 3, 4, 5].map((v) => {
                      const isSelected = scores[currentDim.key] === v;
                      return (
                        <motion.button
                          key={v}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleScore(v)}
                          className={`w-14 h-14 flex items-center justify-center border-2 font-bold text-lg transition-all ${
                            isSelected
                              ? "bg-foreground text-background border-foreground"
                              : "bg-transparent hover:bg-foreground/5 border-border text-foreground"
                          }`}
                        >
                          {v}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Low/High labels */}
                  <div className="flex justify-between px-4">
                    <span className="text-xs text-muted-foreground">{currentDim.lowLabel}</span>
                    <span className="text-xs text-muted-foreground">{currentDim.highLabel}</span>
                  </div>
                </CardContent>
              </Card>

              <p className="text-center text-xs text-muted-foreground mt-4">
                {step + 1} / {totalSteps}
              </p>
            </motion.div>
          ) : (
            /* Note step */
            <motion.div
              key="note"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-border bg-card/80 backdrop-blur-xl shadow-none">
                <CardContent className="pt-8 pb-6 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold">還有什麼想記的？</h2>
                    <p className="text-xs text-muted-foreground">
                      選填，例如昨晚失眠、喝了咖啡、有運動...
                    </p>
                  </div>

                  <Textarea
                    placeholder="寫下任何你覺得可能影響身體狀態的事..."
                    value={note}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                    className="min-h-[100px] bg-background border-border resize-none px-4 py-3 text-sm focus-visible:ring-1 focus-visible:ring-foreground"
                    maxLength={200}
                  />

                  <p className="text-[10px] text-muted-foreground text-right">
                    {note.length}/200
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="w-full py-4 bg-foreground text-background text-sm font-bold tracking-wide transition-all"
                  >
                    {hasCheckedInToday ? "更新紀錄" : "完成紀錄"}
                  </motion.button>
                </CardContent>
              </Card>

              <p className="text-center text-xs text-muted-foreground mt-4">
                {totalSteps} / {totalSteps}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        {step > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setStep((s) => s - 1)}
            className="mx-auto block text-xs text-muted-foreground hover:text-foreground transition-colors mt-4"
          >
            ← 上一題
          </motion.button>
        )}
      </main>
    </div>
  );
}
