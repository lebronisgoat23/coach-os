"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InsightsPage() {
  const router = useRouter();

  const handleShare = () => {
    // Uses native Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: "Vitrion 健康分析報告",
        text: "我目前的狀態評級：[極佳] 狀態絕佳！",
        url: window.location.origin
      }).catch(console.error);
    } else {
      alert("截圖就可以分享囉！");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <header className="p-6 flex items-center justify-between border-b border-border/30">
        <button onClick={() => router.back()} className="text-muted-foreground flex items-center gap-1">
          <ChevronLeft size={16} /> <span className="text-sm font-bold">返回</span>
        </button>
        <div className="font-mono text-xs tracking-widest uppercase">
          Vitrion Report
        </div>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        
        {/* The Share Card Component */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="relative w-full max-w-sm aspect-[3/4] bg-foreground text-background overflow-hidden p-8 flex flex-col justify-between shadow-2xl"
          id="vitrion-share-card"
        >
          {/* Background Watermark */}
          <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
            <div className="w-[300px] h-[300px] border-[40px] border-background rounded-full" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg tracking-widest">VITRION</h3>
                <p className="text-[10px] uppercase font-mono opacity-60 mt-1">個人化狀態分析</p>
              </div>
              <div className="border border-background/20 px-2 py-1 text-xs font-mono">
                CYCLE #01
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider opacity-80 mb-2">當前身心健康分數</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold font-mono">87</span>
                <span className="text-xl font-bold opacity-50">/100</span>
              </div>
            </div>

            <div className="pt-4 border-t border-background/20 space-y-4">
              <div>
                 <p className="text-[10px] uppercase opacity-60 font-bold mb-1">整體狀態評級</p>
                 <p className="text-2xl font-bold">[穩定] 狀態極佳</p>
              </div>
              
              <div className="bg-background/10 p-3">
                 <p className="text-xs font-medium leading-relaxed">
                   🌟 您的恢復力與專注表現，已經超越了同年齡層 <span className="font-bold underline decoration-wavy underline-offset-2">95%</span> 的使用者，請繼續保持！
                 </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-background/20 pt-4 mt-8 flex justify-between items-end">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span>恢復力</span>
                <span>85%</span>
              </div>
              <div className="w-full h-1 bg-background/20 rounded-full overflow-hidden">
                <div className="h-full bg-background w-[85%]" />
              </div>

              <div className="flex justify-between text-[10px] font-mono mt-2">
                <span>壓力值</span>
                <span>40%</span>
              </div>
              <div className="w-full h-1 bg-background/20 rounded-full overflow-hidden">
                <div className="h-full border border-background shadow-[0_0_5px_rgba(255,255,255,0.5)] w-[40%]" />
              </div>
            </div>
            
            <div className="text-[10px] opacity-60 font-mono text-right">
              vitrion.app<br/>
              SCAN TO JOIN
            </div>
          </div>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="mt-12 flex items-center gap-2 px-8 py-4 bg-foreground text-background font-bold text-sm"
        >
          <Share2 size={16} />
          截圖並分享
        </motion.button>
      </main>
    </div>
  );
}
