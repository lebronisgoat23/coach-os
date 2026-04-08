"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    const lastDismissed = localStorage.getItem("vitrion-pwa-dismiss");
    if (lastDismissed) {
      const diff = Date.now() - parseInt(lastDismissed, 10);
      if (diff < 7 * 86400000) return; // Don't show for 7 days
    }

    // Check if already installed as PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay showing banner for better UX
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("vitrion-pwa-dismiss", Date.now().toString());
  };

  // iOS Safari hint (no beforeinstallprompt)
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    const isStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
    if (ios && !isStandalone) {
      const iosDismissed = localStorage.getItem("vitrion-pwa-dismiss-ios");
      if (!iosDismissed || Date.now() - parseInt(iosDismissed, 10) > 7 * 86400000) {
        setTimeout(() => setIsIOS(true), 5000);
      }
    }
  }, []);

  if (dismissed) return null;

  return (
    <>
      {/* Android / Desktop install banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md"
          >
            <div className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center text-lg flex-shrink-0">
                  🧬
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">安裝 Vitrion App</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    加入主畫面，享受更好的離線體驗
                  </p>
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleInstall}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-emerald-500 text-white text-xs font-bold"
                    >
                      安裝 ✨
                    </motion.button>
                    <button
                      onClick={handleDismiss}
                      className="px-3 py-2 rounded-xl bg-secondary/50 text-xs text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      稍後
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Safari hint */}
      <AnimatePresence>
        {isIOS && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md"
          >
            <div className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center text-lg flex-shrink-0">
                  🧬
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">加入主畫面</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    點擊 Safari 底部的{" "}
                    <span className="inline-flex items-center gap-0.5 text-blue-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7-7 7 7" />
                      </svg>
                      分享
                    </span>
                    {" "}→ 「加入主畫面」
                  </p>
                  <button
                    onClick={() => {
                      setIsIOS(false);
                      localStorage.setItem("vitrion-pwa-dismiss-ios", Date.now().toString());
                    }}
                    className="mt-2 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    我知道了
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
