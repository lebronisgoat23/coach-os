"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyCheckIn } from "@/hooks/use-daily-checkin";

export default function CheckInPage() {
  const router = useRouter();
  const { hasCheckedInToday, submitCheckIn, profile } = useDailyCheckIn();

  const [step, setStep] = useState(0);
  const [recoveryScore, setRecoveryScore] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  // When step 0 finishes, we proceed to step 1
  const handleScoreConfirm = () => {
    setStep(1);
  };

  // Step 1 finishes Check-in
  const handleStackConfirm = (tookStack: boolean) => {
    const stackStatus = tookStack ? "[服用狀態：Yes]" : "[服用狀態：No]";

    submitCheckIn({
      sleepQuality: recoveryScore, // Store 0-100 here 
      energyLevel: recoveryScore,   // For backwards compatibility metrics
      focusLevel: recoveryScore,
      stressLevel: 3,
      bodyFeeling: 3,
      mood: 3,
      note: stackStatus,
    });
    setSubmitted(true);
  };

  // Success screen
  if (submitted) {
    return (
      <div className="relative min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background overflow-hidden">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ type: "spring", bounce: 0.5 }}
           className="z-10 text-center space-y-6"
        >
           <h2 className="text-6xl font-bold font-mono">1/14</h2>
           <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
             CALIBRATION SUCCESS
           </p>
           <p className="text-xl">進度更新完成，明日再戰</p>
           <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/")}
              className="mt-8 px-12 py-4 bg-foreground text-background text-sm font-bold tracking-wide transition-all"
           >
              返回大廳
           </motion.button>
        </motion.div>
        
        {/* Background visual flair */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
           <div className="w-[500px] h-[500px] rounded-full border-[40px] border-foreground animate-pulse" />
        </div>
      </div>
    );
  }

  const slideVariants = {
    enter: { x: 80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-6 max-w-md mx-auto bg-background relative overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* Q1: Recovery Score */}
        {step === 0 && (
          <motion.div
            key="q1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-[100dvh] flex flex-col justify-center pb-20"
          >
            <div className="space-y-4 mb-20 text-center">
              <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">CHECK-IN 1/2</p>
              <h1 className="text-3xl font-bold leading-snug">
                昨晚的整體恢復狀態<br/>感覺如何？
              </h1>
            </div>
            
            <div className="space-y-12">
               <div className="flex flex-col items-center">
                  <span className="text-7xl font-mono font-bold mb-4">{recoveryScore}</span>
                  <input 
                     type="range" 
                     min="0" max="100" 
                     value={recoveryScore}
                     onChange={(e) => setRecoveryScore(Number(e.target.value))}
                     className="w-full h-2 bg-foreground/10 rounded-full appearance-none cursor-pointer focus:outline-none"
                     style={{ accentColor: "black" }} // specific styling for slider
                  />
                  <div className="w-full flex justify-between mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                     <span>0 (死亡狀態)</span>
                     <span>100 (超頻中)</span>
                  </div>
               </div>

               <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScoreConfirm}
                  className="w-full py-5 bg-foreground text-background text-sm font-bold tracking-wide transition-all"
               >
                  下一步
               </motion.button>
            </div>
          </motion.div>
        )}

        {/* Q2: Yes/No Stack */}
        {step === 1 && (
          <motion.div
            key="q2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-[100dvh] flex flex-col justify-center pb-20"
          >
            <button onClick={() => setStep(0)} className="absolute top-12 left-0 text-muted-foreground">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="space-y-4 mb-16 text-center">
              <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">CHECK-IN 2/2</p>
              <h1 className="text-3xl font-bold leading-snug">
                你今天有照計畫執行<br/>「{profile?.challengeName || "指定協議"}」嗎？
              </h1>
            </div>
            
            <div className="flex gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStackConfirm(false)}
                className="flex-1 py-12 border border-border bg-background hover:bg-foreground/5 transition-colors flex flex-col items-center justify-center gap-3"
              >
                <span className="text-3xl">✖</span>
                <span className="font-bold">沒有</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStackConfirm(true)}
                className="flex-1 py-12 border border-foreground bg-foreground text-background hover:opacity-90 transition-opacity flex flex-col items-center justify-center gap-3"
              >
                <span className="text-3xl">✔</span>
                <span className="font-bold">有</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
