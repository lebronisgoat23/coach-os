"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyCheckIn } from "@/hooks/use-daily-checkin";

export default function OnboardingPage() {
  const router = useRouter();
  const { saveProfile } = useDailyCheckIn();
  const [step, setStep] = useState(0);

  const [primaryGoal, setPrimaryGoal] = useState("");
  const [supplements, setSupplements] = useState<string[]>([]);
  const [finalChallengeName, setFinalChallengeName] = useState("");
  
  const GOALS = [
    { id: "WEIGHT", title: "減重卡關", desc: "追蹤體重、活動量、睡眠與飲食執行率" },
    { id: "SLEEP", title: "想睡得更好", desc: "改善睡眠品質，起床更有精神" },
    { id: "ENERGY", title: "常常沒精神", desc: "提升日常體力，不想一直累" },
    { id: "STRESS", title: "壓力太大", desc: "容易緊繃焦慮，想放鬆一點" },
  ];

  const SUPPS = [
    { id: "omega3", name: "魚油 Omega-3" },
    { id: "bcomplex", name: "B群" },
    { id: "d3", name: "維生素 D3" },
    { id: "magnesium", name: "鎂" },
    { id: "maca", name: "瑪卡" },
    { id: "probiotic", name: "益生菌" },
    { id: "melatonin", name: "褪黑激素" },
    { id: "collagen", name: "膠原蛋白" },
    { id: "vitc", name: "維生素 C" },
    { id: "zinc", name: "鋅" },
    { id: "none", name: "目前沒有在吃" },
  ];

  const handleGoalSelect = (id: string) => {
    setPrimaryGoal(id);
    setTimeout(() => setStep(1), 350);
  };

  const handleSuppToggle = (id: string) => {
    if (id === "none") {
      setSupplements(["none"]);
      return;
    }
    setSupplements(prev => {
      const filtered = prev.filter(s => s !== "none");
      if (filtered.includes(id)) return filtered.filter(s => s !== id);
      return [...filtered, id];
    });
  };

  const submitProfile = () => {
    setStep(2);
    
    setTimeout(() => {
      let challengeName = "14 天身體觀察";
      if (primaryGoal === "WEIGHT") challengeName = "14 天減重基準線挑戰";
      if (primaryGoal === "SLEEP") challengeName = "14 天睡眠改善挑戰";
      if (primaryGoal === "ENERGY") challengeName = "14 天精力提升挑戰";
      if (primaryGoal === "STRESS") challengeName = "14 天減壓修復挑戰";

      setFinalChallengeName(challengeName);

      saveProfile({
        hasCompletedOnboarding: true,
        primaryGoal,
        currentSupplements: supplements,
        challengeName
      });
      
      setStep(3);
    }, 2000);
  };

  const slideVariants = {
    enter: { x: 80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-6 max-w-md mx-auto bg-background relative">
      <AnimatePresence mode="wait">
        
        {/* Step 0: 你想改善什麼？ */}
        {step === 0 && (
          <motion.div
            key="goal"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full flex flex-col pt-16 pb-12"
          >
            <div className="space-y-3 mb-10">
              <p className="text-xs text-muted-foreground tracking-wider">1 / 2</p>
              <h1 className="text-3xl font-bold leading-snug">
                你最想改善<br />什麼？
              </h1>
              <p className="text-muted-foreground text-sm">
                選一個最在意的，我們會幫你安排對應的追蹤計畫。
              </p>
            </div>

            <div className="space-y-3">
              {GOALS.map((goal) => (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`w-full text-left px-5 py-5 border transition-all ${ 
                    primaryGoal === goal.id 
                      ? "border-foreground bg-foreground text-background" 
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <div className="text-base font-bold">{goal.title}</div>
                  <div className={`text-xs mt-1 ${primaryGoal === goal.id ? "text-background/60" : "text-muted-foreground"}`}>
                    {goal.desc}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: 平常有在吃什麼？ */}
        {step === 1 && (
          <motion.div
            key="supps"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full flex flex-col pt-12 pb-32"
          >
            <div className="space-y-3 mb-8">
              <button onClick={() => setStep(0)} className="text-muted-foreground mb-2 block">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <p className="text-xs text-muted-foreground tracking-wider">2 / 2</p>
              <h1 className="text-3xl font-bold leading-snug">
                你目前有追蹤<br />哪些補充品？
              </h1>
              <p className="text-muted-foreground text-sm">
                選你目前正在吃或想觀察的項目，之後可以再調整。這不會產生醫療建議。
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pb-4">
              {SUPPS.map((supp) => (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={supp.id}
                  onClick={() => handleSuppToggle(supp.id)}
                  className={`w-full px-5 py-4 text-left border transition-all flex items-center justify-between ${
                    supplements.includes(supp.id)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <span className="font-medium">{supp.name}</span>
                  {supplements.includes(supp.id) && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border/30">
              <div className="max-w-md mx-auto">
                <motion.button
                  disabled={supplements.length === 0}
                  onClick={submitProfile}
                  whileTap={supplements.length > 0 ? { scale: 0.98 } : {}}
                  className="w-full py-4 bg-foreground text-background text-sm font-bold tracking-wide disabled:opacity-20 transition-all"
                >
                  開始我的挑戰
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Loading */}
        {step === 2 && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full min-h-[100dvh] flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-10 h-10 border-2 border-border border-t-foreground rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">正在建立你的計畫...</p>
              <p className="text-xs text-muted-foreground">建立可回測的身體 baseline</p>
            </div>
          </motion.div>
        )}

        {/* Step 3: Challenge Assigned */}
        {step === 3 && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full min-h-[100dvh] flex flex-col justify-center space-y-8 py-12"
          >
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground tracking-wider">準備好了</p>
              <h1 className="text-3xl font-bold leading-snug">
                你的專屬挑戰
              </h1>
            </div>

            <div className="p-6 border border-foreground space-y-4">
               <h3 className="text-xl font-bold">
                 {finalChallengeName}
               </h3>
               <p className="text-sm text-muted-foreground leading-relaxed">
                 接下來 14 天，每天花 30 秒建立你的身體 baseline。
               </p>
            </div>

            {/* How it works - 3 steps */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium">接下來會怎麼做</p>
              {[
                { num: "1", title: "每天回報", desc: "體重、睡眠、活動、疲勞與飲食執行率，30 秒搞定" },
                { num: "2", title: "建立 baseline", desc: "系統會判斷步數、睡眠與體重趨勢是否偏離你的個人基準" },
                { num: "3", title: "決定下一步", desc: "把問題排序給你或 coach 審核，而不是直接亂改計畫" },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3.5 py-2">
                  <div className="w-6 h-6 border border-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {item.num}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              className="w-full py-4 bg-foreground text-background text-sm font-bold tracking-wide transition-all"
            >
              開始挑戰
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
