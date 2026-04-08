"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { exportStatusHistory } from "@/lib/export-csv";
import { MOCK_USER_STATUS, MOCK_DAILY_QUESTS } from "@/lib/mock-data";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Sun, Moon, Bell, Download, Watch, Cloud, BookOpen, HelpCircle, Shield, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

function SettingsItem({ icon: Icon, title, description, action, onClick }: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-foreground/[0.03] transition-colors text-left"
    >
      <Icon size={18} className="text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      {action || <span className="text-muted-foreground/40 text-xs">›</span>}
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { subscribed, subscribe, unsubscribe, loading: pushLoading } = usePushNotifications();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleExport = () => {
    exportStatusHistory(
      MOCK_USER_STATUS as unknown as Record<string, string | number | boolean | null>,
      MOCK_DAILY_QUESTS as unknown as Record<string, string | number | boolean | null>[],
      []
    );
    toast.success("數據已匯出為 CSV");
  };

  return (
    <div className="relative min-h-screen bg-background">

      <header className="relative z-10 border-b border-border/30 bg-background/95 backdrop-blur-xl sticky top-0">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <h1 className="text-lg font-bold">設定</h1>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-4 py-6 space-y-5 pb-28">
        
        {/* 一般 */}
        <Card className="border-border/40 bg-card/80">
          <CardHeader className="pb-1">
            <h3 className="text-xs font-bold text-muted-foreground">一般</h3>
          </CardHeader>
          <CardContent className="space-y-0.5">
            <SettingsItem
              icon={mounted && theme === "dark" ? Sun : Moon}
              title="外觀"
              description={mounted ? (theme === "dark" ? "深色模式" : "淺色模式") : "載入中..."}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
            <SettingsItem
              icon={Bell}
              title="每日提醒"
              description={subscribed ? "已開啟" : "提醒你每天記錄"}
              onClick={async () => {
                if (pushLoading) return;
                if (subscribed) await unsubscribe();
                else await subscribe();
              }}
              action={
                <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                  subscribed ? "bg-foreground" : "bg-border"
                }`}>
                  <motion.div
                    layout
                    className="w-4 h-4 rounded-full bg-background shadow-sm"
                    style={{ marginLeft: subscribed ? "auto" : 0 }}
                  />
                </div>
              }
            />
            <SettingsItem icon={Globe} title="語言" description="繁體中文" />
          </CardContent>
        </Card>

        {/* 資料 */}
        <Card className="border-border/40 bg-card/80">
          <CardHeader className="pb-1">
            <h3 className="text-xs font-bold text-muted-foreground">資料管理</h3>
          </CardHeader>
          <CardContent className="space-y-0.5">
            <SettingsItem icon={Download} title="匯出紀錄" description="下載 CSV 格式的完整資料" onClick={handleExport} />
            <SettingsItem icon={Watch} title="連結穿戴裝置" description="Apple Watch、Oura Ring" onClick={() => router.push("/wearables")} />
            <SettingsItem icon={Cloud} title="雲端同步" description="尚未設定" onClick={() => toast.info("請先設定 Supabase")} />
          </CardContent>
        </Card>

        {/* 關於 */}
        <Card className="border-border/40 bg-card/80">
          <CardHeader className="pb-1">
            <h3 className="text-xs font-bold text-muted-foreground">關於</h3>
          </CardHeader>
          <CardContent className="space-y-0.5">
            <SettingsItem icon={BookOpen} title="重新設定目標" description="回到第一步，重新選擇你的目標" onClick={() => router.push("/onboarding")} />
            <SettingsItem icon={HelpCircle} title="常見問題" description="使用說明" onClick={() => toast.info("FAQ 即將上線")} />
            <SettingsItem icon={Shield} title="隱私政策" description="資料使用與安全" onClick={() => toast.info("隱私政策即將上線")} />
            <Separator className="my-2 opacity-20" />
            <div className="text-center py-2">
              <p className="text-[10px] text-muted-foreground/50">Vitrion v0.1.0</p>
            </div>
          </CardContent>
        </Card>

        {/* 登出 */}
        <button
          onClick={async () => {
            await signOut();
            toast.success("已登出");
            router.push("/landing");
          }}
          className="w-full py-3 text-sm font-medium text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors border border-red-500/10"
        >
          登出帳號
        </button>
      </main>
    </div>
  );
}
