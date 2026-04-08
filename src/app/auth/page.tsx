"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  IS_SUPABASE_CONFIGURED,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
} from "@/lib/supabase";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!IS_SUPABASE_CONFIGURED) {
        // Demo mode
        await new Promise((r) => setTimeout(r, 800));
        localStorage.setItem("vitrion-demo-mode", "true");
        toast.success(mode === "login" ? "🎮 Demo 模式登入成功" : "🎉 Demo 角色已建立");
        router.push("/");
        return;
      }

      if (mode === "signup") {
        const { error: err } = await signUpWithEmail(email, password, displayName);
        if (err) throw new Error(err.message);
        toast.success("📧 驗證信已寄出，請查收信箱");
      } else {
        const { error: err } = await signInWithEmail(email, password);
        if (err) throw new Error(err.message);
        toast.success("🎮 登入成功！");
        router.push("/");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知錯誤";
      setError(mode === "login" ? `登入失敗: ${msg}` : `註冊失敗: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!IS_SUPABASE_CONFIGURED) {
      localStorage.setItem("vitrion-demo-mode", "true");
      toast.success("🎮 Demo 模式（Google）");
      router.push("/");
      return;
    }
    const { error: err } = await signInWithGoogle();
    if (err) toast.error(`Google 登入失敗: ${err.message}`);
  };

  const handleAppleLogin = async () => {
    if (!IS_SUPABASE_CONFIGURED) {
      localStorage.setItem("vitrion-demo-mode", "true");
      toast.success("🎮 Demo 模式（Apple）");
      router.push("/");
      return;
    }
    const { error: err } = await signInWithApple();
    if (err) toast.error(`Apple 登入失敗: ${err.message}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/[0.04] blur-[120px]" />
        <div className="absolute top-[50%] left-[50%] w-[40%] h-[40%] rounded-full bg-emerald-500/[0.03] blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="text-5xl mb-3"
          >
            🧬
          </motion.div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Vitrion
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            AI 個人化營養與狀態管家
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-border/40 bg-card/80 backdrop-blur-xl overflow-hidden">
          {/* Mode tabs */}
          <div className="flex border-b border-border/30">
            {(["login", "signup"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`
                  flex-1 py-3 text-sm font-semibold transition-all relative
                  ${mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}
                `}
              >
                {m === "login" ? "登入" : "註冊"}
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-xs">冒險者名稱</Label>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="你的角色名稱"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="bg-secondary/50"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs">電子信箱</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-secondary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs">密碼</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={mode === "signup" ? "至少 8 位字元" : "輸入密碼"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={mode === "signup" ? 8 : undefined}
                      className="bg-secondary/50"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-400 text-center"
                  >
                    ⚠️ {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`
                  w-full py-3 rounded-xl text-sm font-bold transition-all
                  bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500
                  text-white shadow-lg shadow-purple-500/20
                  hover:shadow-xl hover:shadow-purple-500/30
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.span>
                ) : mode === "login" ? (
                  "開始冒險 →"
                ) : (
                  "創建角色 →"
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-[10px] text-muted-foreground">或使用</span>
              <div className="flex-1 h-px bg-border/30" />
            </div>

            {/* Social login */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex-1 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>G</span> Google
              </button>
              <button
                type="button"
                onClick={handleAppleLogin}
                className="flex-1 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>🍎</span> Apple
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-[9px] text-muted-foreground/50 text-center mt-6 leading-relaxed">
          登入即表示你同意我們的服務條款與隱私政策
          <br />
          本系統不構成任何形式的醫療診斷或治療建議
        </p>
      </motion.div>
    </div>
  );
}
