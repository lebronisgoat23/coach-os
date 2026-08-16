"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { trackGrowthEvent } from "@/lib/growth/tracker";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "未知錯誤";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"IDLE" | "LOADING" | "SENT">("IDLE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    trackGrowthEvent("signup_intent", {
      method: "email_otp",
      hasEmail: true,
    });
    setState("LOADING");
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setState("SENT");
    } catch (error) {
      alert("發送登入信件失敗：" + getErrorMessage(error));
      setState("IDLE");
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-12">
        
        {/* Logo */}
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 mx-auto border-2 border-foreground flex items-center justify-center">
            <span className="font-mono text-xl font-bold">V</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vitrion</h1>
            <p className="text-xs text-muted-foreground mt-1">追蹤你的營養品到底有沒有效</p>
          </div>
        </div>

        {state === "SENT" ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-14 h-14 border-2 border-foreground mx-auto flex items-center justify-center font-mono text-xl">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold">登入連結已寄出</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                去信箱點連結就可以登入了，不需要密碼。
              </p>
            </div>
            
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="你的 Email"
                required
                className="w-full bg-transparent border-b border-border py-4 px-1 text-center text-lg outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40 font-light"
              />

              <button
                type="submit"
                disabled={state === "LOADING" || !email}
                className="w-full py-4 bg-foreground text-background text-sm font-bold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-30 mt-4"
              >
                {state === "LOADING" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                    登入中...
                  </span>
                ) : (
                  "用 Email 登入"
                )}
              </button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-4 text-muted-foreground">或</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-4 border border-border text-foreground text-sm font-bold tracking-wide transition-colors hover:bg-foreground/5 flex items-center justify-center gap-2"
            >
              用 Google 帳號登入
            </button>
            
            <button 
              type="button"
              onClick={async () => {
                trackGrowthEvent("signup_intent", {
                  method: "anonymous_demo",
                  hasEmail: false,
                });
                try {
                  const { supabase } = await import("@/lib/supabase");
                  const { data, error } = await supabase.auth.signInAnonymously();
                  
                  if (error || !data.session) {
                     alert(
                       '⚠️ 測試登入被阻擋了！\n\n' +
                       '要求：到 Supabase -> Authentication -> Providers 打開「Anonymous」'
                     );
                     return;
                  }
                  
                  router.push("/onboarding");
                } catch (error) {
                  alert("登入失敗：" + getErrorMessage(error));
                }
              }} 
              className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              （開發用）點此生成測試帳號並跳到設定 →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
