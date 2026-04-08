"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDailyCheckIn } from "@/hooks/use-daily-checkin";

export default function OnboardingPage() {
  const router = useRouter();
  const { saveProfile } = useDailyCheckIn();
  const [step, setStep] = useState(0);

  // Form states
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");

  const handleAnswer = (questionIndex: number, answer: string) => {
    if (questionIndex === 0) setQ1(answer);
    if (questionIndex === 1) setQ2(answer);
    if (questionIndex === 2) {
      setQ3(answer);
      // Move to diagnosis loading
      setStep(3);
      setTimeout(() => setStep(4), 2500); // Wait 2.5s to show analysis fake loader
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleSelectStack = (stackType: 'focus' | 'reset' | 'baseline') => {
    let primaryGoal = "";
    let supplements: string[] = [];
    let challengeName = "";

    if (stackType === 'focus') {
      primaryGoal = "FOCUS";
      supplements = ["caffeine", "theanine"];
      challengeName = "提升專注計畫";
    } else if (stackType === 'reset') {
      primaryGoal = "SLEEP";
      supplements = ["magnesium", "zinc", "melatonin"];
      challengeName = "深層放鬆計畫";
    } else {
      primaryGoal = "ENERGY";
      supplements = ["none"];
      challengeName = "每日基礎追蹤";
    }

    saveProfile({
      hasCompletedOnboarding: true,
      primaryGoal,
      currentSupplements: supplements,
      challengeName
    });

    router.push("/");
  };

  const slideVariants = {
    enter: { x: 80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-6 max-w-md mx-auto bg-background relative overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* Q1: Caffeine */}
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
            <div className="space-y-4 mb-12">
              <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Assessment 1/3</p>
              <h1 className="text-3xl font-bold leading-snug">
                你今天需要多少咖啡因，<br/>才能讓大腦開始轉動？
              </h1>
            </div>
            <div className="space-y-4">
              <AnswerCard onClick={() => handleAnswer(0, 'none')} title="完全不需要" desc="我靠自然力量就能滿血" />
              <AnswerCard onClick={() => handleAnswer(0, '1cup')} title="1 杯咖啡" desc="剛好的啟動劑" />
              <AnswerCard onClick={() => handleAnswer(0, '2cups+')} title="2 杯以上或靠意志力" desc="不然我會覺得自己像殭屍" />
            </div>
          </motion.div>
        )}

        {/* Q2: Morning */}
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
            <div className="space-y-4 mb-12">
              <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Assessment 2/3</p>
              <h1 className="text-3xl font-bold leading-snug">
                早上鬧鐘響起的瞬間，<br/>你的大腦第一個念頭是？
              </h1>
            </div>
            <div className="space-y-4">
              <AnswerCard onClick={() => handleAnswer(1, 'good')} title="充滿幹勁，滿血復活" desc="準備迎接新的一天" />
              <AnswerCard onClick={() => handleAnswer(1, 'snooze')} title="再讓我睡 5 分鐘" desc="身體還不想醒來" />
              <AnswerCard onClick={() => handleAnswer(1, 'heavy')} title="感覺異常沈重" desc="為什麼要起床面對這個世界" />
            </div>
          </motion.div>
        )}

        {/* Q3: Brain fog */}
        {step === 2 && (
          <motion.div
            key="q3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-[100dvh] flex flex-col justify-center pb-20"
          >
            <button onClick={() => setStep(1)} className="absolute top-12 left-0 text-muted-foreground">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="space-y-4 mb-12">
              <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Assessment 3/3</p>
              <h1 className="text-3xl font-bold leading-snug">
                下午 2-4 點，是否經常<br/>經歷「腦霧當機」的斷電期？
              </h1>
            </div>
            <div className="space-y-4">
              <AnswerCard onClick={() => handleAnswer(2, 'none')} title="不太會" desc="專注力通常能維持" />
              <AnswerCard onClick={() => handleAnswer(2, 'sometimes')} title="偶爾發生" desc="取決於前一晚的睡眠品質" />
              <AnswerCard onClick={() => handleAnswer(2, 'always')} title="每天準時斷電" desc="需要立刻塞糖分或咖啡因" />
            </div>
          </motion.div>
        )}

        {/* Step 3: Analyzing Loading */}
        {step === 3 && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-[100dvh] flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative w-24 h-24 flex items-center justify-center">
               <div className="absolute inset-0 border-2 border-border border-t-foreground rounded-full animate-spin" />
               <span className="font-mono text-xs font-bold animate-pulse">ALPHA</span>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-bold">正在為您建立專屬計畫...</p>
              <p className="text-xs text-muted-foreground">分析您的生活作息與壓力指數...</p>
            </div>
          </motion.div>
        )}

        {/* Step 4: Diagnosis & Stack Selection */}
        {step === 4 && (
          <motion.div
            key="diagnosis"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col pt-16 pb-20 justify-start space-y-8"
          >
            {/* Diagnosis Report Card */}
            <div className="relative p-6 border border-border bg-foreground/[0.02] overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-20"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
               <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-4">Initial Assessment</p>
               <h2 className="text-xl font-bold mb-3">身心狀態評估報告</h2>
               <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                 根據剛才的問卷，您似乎累積了些許疲勞。
                 <br/><br/>
                 這不是您的錯，現代生活的快節奏很容易讓人透支。讓我們透過接下來的 14 天追蹤，幫您找回原本的好狀態吧！
               </p>

               {/* Fake HRV visual replaced by abstract positive visual */}
               <div className="h-12 w-full flex items-end gap-1 opacity-50">
                 {[40, 35, 20, 15, 25, 10, 5].map((h, i) => (
                   <div key={i} className="flex-1 bg-foreground" style={{ height: `${h}%` }}></div>
                 ))}
               </div>
               <p className="text-[10px] text-right mt-2 font-mono text-muted-foreground">ENERGY TREND</p>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-bold mt-2">選擇您的 14 天改善計畫：</h3>
               
               <StackBtn onClick={() => handleSelectStack('focus')} title="[提升專注計畫]" desc="追蹤：咖啡因 + L-茶氨酸" />
               <StackBtn onClick={() => handleSelectStack('reset')} title="[深層放鬆計畫]" desc="追蹤：鎂 + 鋅 + 幫助睡眠元素" />
               <StackBtn onClick={() => handleSelectStack('baseline')} title="[每日基礎追蹤]" desc="單純記錄每天狀態，不特別改變飲食" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helpers

function AnswerCard({ title, desc, onClick }: { title: string, desc: string, onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full p-6 text-left border border-border bg-background hover:border-foreground/30 hover:bg-foreground/[0.02] transition-colors"
    >
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </motion.button>
  );
}

function StackBtn({ title, desc, onClick }: { title: string, desc: string, onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full text-left p-5 border border-foreground bg-foreground text-background flex flex-col hover:opacity-90 transition-opacity"
    >
      <span className="font-bold text-base mb-1">{title}</span>
      <span className="text-xs opacity-80">{desc}</span>
    </motion.button>
  );
}
